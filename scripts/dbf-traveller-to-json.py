#!/usr/bin/env python3
"""Convert the DBF/PBN export of a bridge session to BSOL Traveller JSON.

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


def normalize_pbn_contract(value):
    text = str(value).strip().upper()
    match = re.fullmatch(r"(\d)(NT|[SHDC])([X]{0,2})", text)
    return text if match else normalize_contract(text)


def normalize_card(value):
    text = str(value).strip().upper()
    if not text:
        return ""
    suit, rank = text[0], text[1:]
    rank = {"10": "T", "D": "Q", "B": "J"}.get(rank, rank)
    suit = {"P": "S", "C": "H", "K": "D", "T": "C"}.get(suit, suit)
    return rank + suit


def parse_pbn(path):
    boards = {}
    current = {}
    score_lines = False
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            score_lines = False
            continue
        tag = re.fullmatch(r"\[([^ ]+) \"(.*)\"\]", line)
        if tag:
            name, value = tag.groups()
            if name == "Board" and current.get("board_no") is not None:
                boards[current["board_no"]] = current
                current = {}
            if name == "Board":
                current["board_no"] = int(value)
            elif name == "Deal":
                current["deal"] = value
            elif name == "Dealer":
                current["dealer"] = value
            elif name == "Vulnerable":
                current["vulnerable"] = value
            elif name == "ScoreTable":
                score_lines = True
            continue
        if score_lines and current.get("board_no") is not None:
            parts = line.split()
            if len(parts) >= 8:
                contract, declarer, tricks, score, ns, ew, ns_mp, ew_mp = parts[:8]
                current.setdefault("scores", []).append({
                    "contract": normalize_pbn_contract(contract),
                    "played_by": DECLARER.get(declarer, declarer),
                    "tricks": number(tricks),
                    "score": number(score),
                    "ns_pair_number": str(ns),
                    "ew_pair_number": str(ew),
                    "ns_match_points": number(ns_mp),
                    "ew_match_points": number(ew_mp),
                })
    if current.get("board_no") is not None:
        boards[current["board_no"]] = current
    return boards


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


def play_line(row, pbn_scores):
    ns = str(row.get("PAIRNS", "")).strip()
    ew = str(row.get("PAIREW", "")).strip()
    contract = normalize_contract(row.get("CONTRACT", ""))
    score = number(row.get("RESVAL_NS"))
    candidates = [
        item for item in pbn_scores
        if item["ns_pair_number"] == ns
        and item["ew_pair_number"] == ew
        and item["contract"] == contract
        and item["score"] == score
    ]
    reference = candidates[0] if candidates else {}
    result = {
        "ns_pair_number": ns,
        "ew_pair_number": ew,
        "contract": contract or "Passed" if not contract and not row.get("RESULT") else contract,
        "played_by": reference.get("played_by", DECLARER.get(str(row.get("NS_EW", "")).strip(), str(row.get("NS_EW", "")).strip())),
        "lead": normalize_card(row.get("LEADCARD", "")),
        "tricks": reference.get("tricks", ""),
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


def convert(pbn_path, play_path, participants_path, results_path):
    pbn = parse_pbn(pbn_path)
    participants = participant_map(participants_path)
    enrich_participants(participants, results_path)
    grouped = defaultdict(list)
    for row in read_dbf(play_path):
        board = int(row.get("BOARD") or 0)
        if board and (row.get("PAIRNS") or row.get("PAIREW")) and (
            str(row.get("CONTRACT", "")).strip()
            or str(row.get("RESULT", "")).strip()
        ):
            grouped[board].append(row)

    boards = []
    for board_no in sorted(pbn):
        board = pbn[board_no]
        lines = [
            play_line(row, board.get("scores", []))
            for row in grouped.get(board_no, [])
        ]
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pbn", required=True, help="PBN board file")
    parser.add_argument("--play-dbf", required=True, help="Traveller play DBF")
    parser.add_argument(
        "--participants-dbf", required=True, help="Participant/pair DBF"
    )
    parser.add_argument(
        "--results-dbf", required=True, help="Ranking/result DBF"
    )
    parser.add_argument("-o", "--output", required=True)
    args = parser.parse_args()
    result = convert(
        args.pbn, args.play_dbf, args.participants_dbf, args.results_dbf
    )
    Path(args.output).write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {args.output}: {len(result['event']['board'])} boards, "
          f"{len(result['event']['participants']['pair'])} pairs")


if __name__ == "__main__":
    main()
