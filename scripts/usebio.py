"""Shared USEBIO 1.2 traveller export for the BSOL converters."""

import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
import xml.etree.ElementTree as ET


IMP_THRESHOLDS = (
    20, 50, 90, 130, 170, 220, 270, 320, 370, 430, 500, 600, 750, 900,
    1100, 1300, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000,
)


def imps(difference):
    sign = -1 if difference < 0 else 1
    return sign * sum(1 for limit in IMP_THRESHOLDS if abs(difference) >= limit)


def element(parent, name, value):
    node = ET.SubElement(parent, name)
    if value is not None:
        node.text = str(value)
    return node


def notes(parent, data, keys):
    extra = {key: data[key] for key in keys if key in data}
    if extra:
        element(parent, "NOTES", "BSOL:" + json.dumps(extra, ensure_ascii=False))


def traveller(parent, line, scoring, teams=False, direction=None):
    node = ET.SubElement(parent, "TRAVELLER_LINE")
    if teams:
        element(node, "DIRECTION", direction)
    else:
        for side in ("ns", "ew"):
            element(node, f"{side.upper()}_PAIR_NUMBER", line[f"{side}_pair_number"])
    for key in ("contract", "played_by", "lead", "tricks", "score"):
        element(node, key.upper(), line.get(key, ""))
    if line.get("lindata"):
        element(node, "LIN_DATA", line["lindata"])
    if not teams:
        suffix = {
            "MATCH_POINTS": "MATCH_POINTS",
            "CROSS_IMPS": "CROSS_IMP_POINTS",
            "BUTLER_IMPS": "BUTLER_POINTS",
            "IMPS": "BUTLER_POINTS",
        }[scoring]
        for side in ("ns", "ew"):
            element(node, f"{side.upper()}_{suffix}", line[f"{side}_match_points"])
    keys = ["lindata", "ns_score", "ew_score", "round"]
    if teams:
        keys += ["ns_pair_number", "ew_pair_number", "ns_match_points", "ew_match_points"]
    notes(node, line, keys)


def to_xml(result):
    event = result["event"]
    teams = event["event_type"] == "TEAMS"
    scoring = event["board_scoring_method"]
    root = ET.Element("USEBIO", Version="1.2")
    node = ET.SubElement(root, "EVENT", EVENT_TYPE=event["event_type"])
    element(node, "PROGRAM_NAME", "BSOL")
    element(node, "PROGRAM_VERSION", "1.0")
    if event.get("date"):
        element(node, "DATE", date.fromisoformat(event["date"]).strftime("%d/%m/%Y"))
    element(node, "BOARD_SCORING_METHOD", scoring)
    element(node, "WINNER_TYPE", event["winner_type"])
    counts = Counter()
    for board in event["board"]:
        participants = {
            str(line[f"{side}_pair_number"])
            for line in board["traveller_line"] for side in ("ns", "ew")
        }
        counts.update(participants)
    element(node, "BOARDS_PLAYED", max(counts.values(), default=0))
    if teams:
        method = "VPS" if event.get("ranking_method") == "VICTORY_POINTS" else "IMPS"
        element(node, "MATCH_SCORING_METHOD", method)
        element(node, "TEAM_PAIRING_AVAILABLE", "N")
    extras = {key: event[key] for key in (
        "ranking_method", "cross_table", "team_matches", "butler"
    ) if key in event}
    datums = {
        str(board["board_no"]): board["butler_datum"]
        for board in event["board"] if "butler_datum" in board
    }
    if datums:
        extras["board_datums"] = datums
    notes(node, extras, extras.keys())

    participants = ET.SubElement(node, "PARTICIPANTS")
    for pair in event["participants"]["pair"]:
        if teams:
            participant = ET.SubElement(participants, "TEAM", TEAM_ID=str(pair["pair_number"]))
        else:
            participant = ET.SubElement(participants, "PAIR")
            element(participant, "PAIR_NUMBER", pair["pair_number"])
            direction = {"N": "NS", "E": "EW"}.get(pair["direction"], pair["direction"])
            element(participant, "DIRECTION", direction)
        for key in ("place", "total_score", "percentage"):
            element(participant, key.upper(), pair[key])
        players = pair["player"]
        if teams:
            players = [
                player
                for entry in event.get("butler", {}).get("pairs", [])
                if str(entry["team_number"]) == str(pair["pair_number"])
                for player in entry["player"]
            ] or players
            notes(participant, pair, ("player", "team_points"))
        for player in players:
            element(ET.SubElement(participant, "PLAYER"), "PLAYER_NAME", player["player_name"])

    if not teams:
        for board in event["board"]:
            bnode = ET.SubElement(node, "BOARD")
            element(bnode, "BOARD_NUMBER", board["board_no"])
            for line in board["traveller_line"]:
                traveller(bnode, line, scoring)
    else:
        # A teams board belongs to a match, not to a flat event-wide traveller.
        matches = {}
        grouped = defaultdict(lambda: defaultdict(list))
        for match in event.get("team_matches", []):
            key = (match["round"], str(match["home_team"]), str(match["visiting_team"]))
            matches[key] = match
        for board in event["board"]:
            for line in board["traveller_line"]:
                ns, ew = str(line["ns_pair_number"]), str(line["ew_pair_number"])
                key = (line["round"], ns, ew)
                reverse = (line["round"], ew, ns)
                if key not in matches and (reverse in matches or reverse in grouped):
                    key = reverse
                grouped[key][board["board_no"]].append((board, line))
        for key in dict.fromkeys([*matches, *grouped]):
            round_no, home, away = key
            mnode = ET.SubElement(node, "MATCH")
            element(mnode, "ROUND_NUMBER", round_no)
            element(mnode, "TEAM", home)
            element(mnode, "OPPOSING_TEAM", away)
            match = matches.get(key)
            if match:
                # DBF match totals are IMPs; VPs are in the cross table.
                home_score, away_score = match["home_imps"], match["visiting_imps"]
                if event.get("ranking_method") == "VICTORY_POINTS":
                    home_score = away_score = ""
                    for entry in event.get("cross_table", {}).get("matches", []):
                        if (str(entry["team1"]), str(entry["team2"])) == (home, away):
                            home_score, away_score = entry["team1_points"], entry["team2_points"]
                            break
                        if (str(entry["team2"]), str(entry["team1"])) == (home, away):
                            home_score, away_score = entry["team2_points"], entry["team1_points"]
                            break
                element(mnode, "TEAM_SCORE", home_score)
                element(mnode, "OPPOSING_TEAM_SCORE", away_score)
            for board_no, entries in grouped[key].items():
                bnode = ET.SubElement(mnode, "BOARD")
                element(bnode, "BOARD_NUMBER", board_no)
                if len(entries) == 2 and all(isinstance(line["score"], (int, float)) for _, line in entries):
                    # Scores are NS-oriented at both tables.
                    ns_home = next(line for _, line in entries if str(line["ns_pair_number"]) == home)
                    ns_away = next(line for _, line in entries if str(line["ns_pair_number"]) != home)
                    element(bnode, "IMPS", imps(ns_home["score"] - ns_away["score"]))
                for _, line in entries:
                    direction = "NS" if str(line["ns_pair_number"]) == home else "EW"
                    traveller(bnode, line, scoring, teams=True, direction=direction)
        for board in event["board"]:
            if not board["traveller_line"]:
                bnode = ET.SubElement(node, "BOARD")
                element(bnode, "BOARD_NUMBER", board["board_no"])
    ET.indent(root, space="  ")
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<!DOCTYPE USEBIO SYSTEM "https://www.ebu.co.uk/usebio/usebio_v1_2_ext.dtd">\n'
        + ET.tostring(root, encoding="unicode") + "\n"
    )


def write_outputs(result, output):
    output = Path(output)
    xml_output = output.with_suffix(".xml")
    if output == xml_output:
        raise ValueError("--output must name the JSON file, not an .xml file")
    xml = to_xml(result)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    xml_output.write_text(xml, encoding="utf-8")
    return xml_output
