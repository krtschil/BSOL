#!/usr/bin/env python3
"""Convert a BBO Extractor CSV export to BSOL Traveller JSON."""

import argparse
import csv
import json
import re
from collections import defaultdict
from pathlib import Path


REQUIRED_TRAVELLER_FIELDS = {
    "#Board",
    "North",
    "South",
    "East",
    "West",
    "Contract",
    "Declarer",
    "Tricks",
    "Lead",
    "Score",
    "nsMpts",
    "ewMpts",
    "nsPair",
    "ewPair",
    "playdata",
}


def number(value):
    text = str(value).strip().removesuffix("%")
    if not text:
        return ""
    try:
        parsed = float(text)
    except ValueError:
        return text
    return int(parsed) if parsed.is_integer() else parsed


def normalize_contract(value):
    text = str(value).strip().upper()
    if text in ("PASS", "PASSED"):
        return "Passed"
    match = re.fullmatch(r"([1-7])(NT|N|[SHDC])(X{0,2})", text)
    if not match:
        raise ValueError(f"Unsupported BBO contract: {value!r}")
    level, denomination, doubling = match.groups()
    if denomination == "N":
        denomination = "NT"
    return f"{level}{denomination}{doubling}"


def rows_as_dicts(header, rows):
    width = len(header)
    result = []
    for row in rows:
        if not row or not any(value.strip() for value in row):
            continue
        while len(row) > width and not row[-1].strip():
            row.pop()
        if len(row) != width:
            raise ValueError(
                f"Expected {width} CSV fields, found {len(row)} in row {row!r}"
            )
        result.append(dict(zip(header, row)))
    return result


def parse_export(path):
    with Path(path).open(encoding="utf-8-sig", newline="") as source:
        rows = list(csv.reader(source))

    metadata = {}
    ranking_header = None
    ranking_rows = []
    traveller_header = None
    traveller_rows = []
    section = "metadata"

    for row in rows:
        if not row or not any(value.strip() for value in row):
            continue
        first = row[0].strip()
        if first == "#Rank":
            ranking_header = row
            section = "ranking"
            continue
        if first == "#TravellerLines":
            section = "traveller_header"
            continue
        if section == "traveller_header":
            traveller_header = row
            section = "traveller"
            continue
        if first.startswith("#"):
            if section == "metadata":
                metadata[first[1:]] = row[1:]
            elif section == "traveller":
                break
            continue
        if section == "ranking":
            ranking_rows.append(row)
        elif section == "traveller":
            traveller_rows.append(row)

    if ranking_header is None:
        raise ValueError("BBO CSV has no #Rank section")
    if traveller_header is None:
        raise ValueError("BBO CSV has no #TravellerLines section")

    missing = REQUIRED_TRAVELLER_FIELDS.difference(traveller_header)
    if missing:
        raise ValueError(
            "BBO Traveller header is missing: " + ", ".join(sorted(missing))
        )

    return (
        metadata,
        rows_as_dicts(ranking_header, ranking_rows),
        rows_as_dicts(traveller_header, traveller_rows),
    )


def participant_names(traveller_rows):
    names = {}
    for row in traveller_rows:
        ns_pair = str(row["nsPair"]).strip()
        ew_pair = str(row["ewPair"]).strip()
        names.setdefault(ns_pair, (row["North"].strip(), row["South"].strip()))
        names.setdefault(ew_pair, (row["East"].strip(), row["West"].strip()))
    return names


def participants(ranking_rows, traveller_rows):
    names_by_pair = participant_names(traveller_rows)
    result = []
    for row in ranking_rows:
        pair = str(row.get("pair", "")).strip()
        if not pair:
            continue
        names = names_by_pair.get(pair)
        if names is None:
            combined = str(row.get("Name", "")).strip()
            names = tuple(combined.split("+", 1))
            if len(names) == 1:
                names = (names[0], "")
        score = number(row.get("Score", ""))
        result.append({
            "pair_number": number(pair),
            "place": str(number(row.get("#Rank", ""))),
            "total_score": str(score),
            "percentage": str(score),
            "direction": "N",
            "player": [
                {"player_name": names[0]},
                {"player_name": names[1]},
            ],
        })
    return result


def traveller_line(row):
    score = number(row["Score"])
    adjustment = re.fullmatch(r"A(\d{2})(\d{2})", str(score).upper())
    if adjustment:
        ns_percentage, ew_percentage = adjustment.groups()
        return {
            "ns_pair_number": str(row["nsPair"]).strip(),
            "ew_pair_number": str(row["ewPair"]).strip(),
            "contract": "NP",
            "played_by": "",
            "lead": "",
            "tricks": "",
            "score": str(score).upper(),
            "ns_score": f"{number(ns_percentage)}%",
            "ew_score": f"{number(ew_percentage)}%",
            "ns_match_points": number(row["nsMpts"]),
            "ew_match_points": number(row["ewMpts"]),
            "lindata": row["playdata"].strip() or None,
        }

    contract = normalize_contract(row["Contract"])
    passed = contract == "Passed"
    return {
        "ns_pair_number": str(row["nsPair"]).strip(),
        "ew_pair_number": str(row["ewPair"]).strip(),
        "contract": contract,
        "played_by": "" if passed else row["Declarer"].strip().upper(),
        "lead": "" if passed else row["Lead"].strip().upper(),
        "tricks": "" if passed else number(row["Tricks"]),
        "score": score,
        "ns_score": score,
        "ew_score": -score,
        "ns_match_points": number(row["nsMpts"]),
        "ew_match_points": number(row["ewMpts"]),
        "lindata": row["playdata"].strip() or None,
    }


def convert(path):
    metadata, ranking_rows, traveller_rows = parse_export(path)
    grouped = defaultdict(list)
    for row in traveller_rows:
        board = number(row["#Board"])
        if not isinstance(board, int) or board < 1:
            raise ValueError(f"Invalid board number: {row['#Board']!r}")
        grouped[board].append(traveller_line(row))

    expected_boards = number((metadata.get("BoardCount") or [""])[0])
    if expected_boards and len(grouped) != expected_boards:
        raise ValueError(
            f"CSV declares {expected_boards} boards but contains {len(grouped)}"
        )

    return {
        "event": {
            "match_scoring_method": "IMPS",
            "event_type": "PAIRS",
            "board_scoring_method": (
                metadata.get("ScoringType") or ["MATCH_POINTS"]
            )[0],
            "winner_type": 1,
            "participants": {
                "pair": participants(ranking_rows, traveller_rows),
            },
            "board": [
                {
                    "board_no": board,
                    "traveller_line": grouped[board],
                }
                for board in sorted(grouped)
            ],
        }
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", required=True, help="BBO Extractor CSV file")
    parser.add_argument("-o", "--output", required=True, help="Output JSON file")
    args = parser.parse_args()

    result = convert(args.csv)
    Path(args.output).write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"wrote {args.output}: {len(result['event']['board'])} boards, "
        f"{len(result['event']['participants']['pair'])} pairs"
    )


if __name__ == "__main__":
    main()
