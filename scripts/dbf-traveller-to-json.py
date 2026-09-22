#!/usr/bin/env python3
"""Convert the DBF export of a bridge session to BSOL Traveller JSON.

The converter deliberately uses only the Python standard library.  It supports
the Visual FoxPro field types used by the supplied play, participant and result
tables, including little-endian binary integer fields.
"""

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path


SUITS = {"P": "S", "C": "H", "K": "D", "T": "C", "SA": "NT"}
DECLARER = {"O": "E"}

# Set these directories to the locations of the original export files.
INPUT_DIRECTORIES = {
    "play_dbf": Path("~/.wine/drive_c/users/Public/Topscore/turniere").expanduser(),
    "participants_dbf": Path("~/.wine/drive_c/users/Public/Topscore/turniere").expanduser(),
    "results_dbf": Path("~/.wine/drive_c/users/Public/Topscore/turniere").expanduser(),
}


def read_dbf(path):
    data = Path(path).read_bytes()
    header_length = int.from_bytes(data[8:10], "little")
    record_length = int.from_bytes(data[10:12], "little")
    fields = []
    for offset in range(32, header_length - 1, 32):
        descriptor = data[offset:offset + 32]
        if descriptor[0] == 0x0D:
            break
        name = descriptor[:11].split(b"\0", 1)[0].decode("ascii")
        fields.append((name, chr(descriptor[11]), descriptor[16]))

    records = []
    for offset in range(header_length, len(data), record_length):
        record = data[offset:offset + record_length]
        if len(record) != record_length or record[0:1] == b"*":
            continue
        position = 1
        values = {}
        for name, kind, length in fields:
            raw = record[position:position + length]
            position += length
            if kind == "I":
                value = int.from_bytes(raw, "little", signed=True)
            elif kind in ("N", "F"):
                value = raw.decode("cp1252").strip()
            elif kind == "L":
                value = raw.decode("ascii", "replace").upper() == "T"
            else:
                value = raw.decode("cp1252", "replace").rstrip("\0 ").strip()
            values[name] = value
        records.append(values)
    return records


def number(value):
    text = str(value).strip()
    if not text:
        return ""
    try:
        parsed = float(text)
    except ValueError:
        return text
    return int(parsed) if parsed.is_integer() else parsed


def normalize_contract(value):
    text = str(value).strip().upper()
    if not text or text in ("PASS", "PASSED"):
        return ""
    match = re.fullmatch(r"(\d)\s*(SA|[PCKT])\s*([X*]{0,2})", text)
    if not match:
        raise ValueError(f"Unsupported contract: {value!r}")
    level, suit, doubling = match.groups()
    return f"{level}{SUITS[suit]}{doubling.replace('*', 'X')}"


def tricks_from_result(contract, result):
    """Derive the number of tricks made from a normalized contract and the
    DBF RESULT field, which holds the result relative to the contract
    (e.g. "=", "+1", "-2")."""
    level_match = re.match(r"(\d)", str(contract))
    if not level_match:
        return ""
    level = int(level_match.group(1))
    text = str(result).strip().upper()
    if text == "=":
        return level + 6
    if re.fullmatch(r"[+-]\d+", text):
        return level + 6 + int(text)
    return ""


def declarer_from_direction(value):
    direction = str(value).strip().upper()
    return DECLARER.get(direction, direction)


def normalize_card(value):
    text = str(value).strip().upper()
    if not text:
        return ""
    suit, rank = text[0], text[1:]
    rank = {"10": "T", "D": "Q", "B": "J"}.get(rank, rank)
    suit = {"P": "S", "C": "H", "K": "D", "T": "C"}.get(suit, suit)
    return rank + suit


def participant_map(path):
    result = {}
    for row in read_dbf(path):
        pair = int(row.get("P_NUMMER") or 0)
        if pair and (row.get("NAME1") or row.get("NAME2")):
            result[pair] = {
                "pair_number": pair,
                "place": "",
                "total_score": "",
                "percentage": "",
                "direction": "N",
                "player": [
                    {"player_name": row["NAME1"]},
                    {"player_name": row["NAME2"]},
                ],
            }
    return result


def enrich_participants(participants, path):
    for row in read_dbf(path):
        pair = int(row.get("PAARNR") or 0)
        if pair not in participants:
            continue
        participants[pair].update({
            "place": str(number(row.get("PLATZ"))),
            "total_score": str(number(row.get("PUNKTE"))),
            "percentage": str(number(row.get("PROZLANG") or row.get("PROZENT"))),
        })


def play_line(row):
    ns = str(row.get("PAIRNS", "")).strip()
    ew = str(row.get("PAIREW", "")).strip()
    contract = normalize_contract(row.get("CONTRACT", ""))
    score = number(row.get("RESVAL_NS"))
    # Tricks and declarer are derived directly from the play DBF's CONTRACT,
    # RESULT and NS_EW fields.
    tricks = tricks_from_result(contract, row.get("RESULT", "")) if contract else ""
    played_by = declarer_from_direction(row.get("NS_EW", "")) if contract else ""
    result = {
        "ns_pair_number": ns,
        "ew_pair_number": ew,
        "contract": contract or "Passed" if not contract and not row.get("RESULT") else contract,
        "played_by": played_by,
        "lead": normalize_card(row.get("LEADCARD", "")),
        "tricks": tricks,
        "score": score,
        "ns_score": score,
        "ew_score": number(row.get("RESVAL_EW")),
        "ns_match_points": number(row.get("MPS_NS")),
        "ew_match_points": number(row.get("MPS_EW")),
        "lindata": None,
    }
    if result["contract"] == "Passed":
        result["played_by"] = ""
        result["lead"] = ""
        result["tricks"] = ""
    return result


def convert(play_path, participants_path, results_path):
    participants = participant_map(participants_path)
    enrich_participants(participants, results_path)
    all_boards = set()
    grouped = defaultdict(list)
    for row in read_dbf(play_path):
        board = int(row.get("BOARD") or 0)
        if not board:
            continue
        all_boards.add(board)
        if (row.get("PAIRNS") or row.get("PAIREW")) and (
            str(row.get("CONTRACT", "")).strip()
            or str(row.get("RESULT", "")).strip()
        ):
            grouped[board].append(row)

    boards = []
    for board_no in sorted(all_boards):
        lines = [play_line(row) for row in grouped.get(board_no, [])]
        boards.append({"board_no": board_no, "traveller_line": lines})

    return {
        "event": {
            "match_scoring_method": "IMPS",
            "event_type": "PAIRS",
            "board_scoring_method": "MATCH_POINTS",
            "winner_type": 1,
            "participants": {"pair": [
                participants[pair] for pair in sorted(participants)
            ]},
            "board": boards,
        }
    }


def team_participant_map(path):
    grouped = defaultdict(list)
    for row in read_dbf(path):
        team = number(row.get("P_NUMMER"))
        name1 = str(row.get("NAME1", "")).strip()
        name2 = str(row.get("NAME2", "")).strip()
        if team and (name1 or name2):
            grouped[int(team)].append(
                " / ".join(name for name in (name1, name2) if name)
            )
    return {
        team: {
            "pair_number": team,
            "place": "",
            "total_score": "",
            "percentage": "-",
            "direction": "N",
            "player": [
                {"player_name": names[0] if names else ""},
                {"player_name": names[1] if len(names) > 1 else ""},
            ],
        }
        for team, names in grouped.items()
    }


def enrich_teams(teams, path):
        for row in read_dbf(path):
            team = number(row.get("TEAM_NR"))
            if team not in teams:
                continue
            teams[team].update({
                "place": str(number(row.get("PLATZ"))),
                "total_score": str(number(row.get("PUNKTE"))),
                "team_points": str(number(row.get("PUNKTE"))),
            })


def team_play_line(row, suffix):
        ns = str(row.get(f"HOME_NS" if suffix == "H" else "VISIT_NS")).strip()
        ew = str(row.get(f"VISIT_EW" if suffix == "H" else "HOME_EW")).strip()
        contract = normalize_contract(row.get(f"CONTRACT_{suffix}", ""))
        score = number(row.get(f"RESVAL_{suffix}"))
        declarer = str(row.get(f"NS_EW_{suffix}", "")).strip()
        tricks = tricks_from_result(contract, row.get(f"RESULT_{suffix}", "")) if contract else ""
        return {
            "ns_pair_number": ns,
            "ew_pair_number": ew,
            "contract": contract or "Passed",
            "played_by": DECLARER.get(declarer, declarer),
            "lead": normalize_card(row.get(f"LC_{suffix}", "")),
            "tricks": tricks,
            "score": score,
            "ns_score": score if score >= 0 else "",
            "ew_score": -score if score < 0 else "",
            "ns_match_points": "",
            "ew_match_points": "",
            "lindata": None,
        }


def convert_teams(play_path, participants_path, results_path):
    teams = team_participant_map(participants_path)
    enrich_teams(teams, results_path)
    all_boards = set()
    grouped = defaultdict(list)
    for row in read_dbf(play_path):
        board = int(row.get("BOARD") or 0)
        if not board:
            continue
        all_boards.add(board)
        if str(row.get("CONTRACT_H", "")).strip().lower() not in ("", "ok"):
            grouped[board].append(row)

    boards = []
    for board_no in sorted(all_boards):
        lines = []
        for row in grouped.get(board_no, []):
            lines.append(team_play_line(row, "H"))
            lines.append(team_play_line(row, "V"))
        boards.append({"board_no": board_no, "traveller_line": lines})

    return {
        "event": {
            "match_scoring_method": "IMPS",
            "event_type": "TEAMS",
            "board_scoring_method": "IMPS",
            "winner_type": 1,
            "ranking_method": "VICTORY_POINTS",
            "participants": {"pair": [
                teams[team] for team in sorted(teams)
            ]},
            "board": boards,
        }
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--play-dbf", required=True, help="Traveller play DBF")
    parser.add_argument(
        "--participants-dbf", required=True, help="Participant/pair DBF"
    )
    parser.add_argument(
        "--results-dbf", required=True, help="Ranking/result DBF"
    )
    parser.add_argument(
        "--mode", choices=("pairs", "teams"), default="pairs",
        help="Tournament format (default: pairs)",
    )
    parser.add_argument("-o", "--output", required=True)
    args = parser.parse_args()
    converter = convert_teams if args.mode == "teams" else convert
    result = converter(
        INPUT_DIRECTORIES["play_dbf"] / args.play_dbf,
        INPUT_DIRECTORIES["participants_dbf"] / args.participants_dbf,
        INPUT_DIRECTORIES["results_dbf"] / args.results_dbf,
    )
    Path(args.output).write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {args.output}: {len(result['event']['board'])} boards, "
          f"{len(result['event']['participants']['pair'])} "
          f"{'teams' if args.mode == 'teams' else 'pairs'}")


if __name__ == "__main__":
    main()
