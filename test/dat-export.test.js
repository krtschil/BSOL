const assert = require("node:assert/strict");
const {spawnSync} = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const {createContext, loadScript} = require("./test-helpers");

test("combined DAT export converts all embedded tables and rejects malformed input", () => {
	const script = path.resolve(__dirname, "../scripts/dbf-traveller-to-json.py");
	const result = spawnSync("python3", ["-B", "-c", `
import copy, importlib.util, json, struct, sys, tempfile
from pathlib import Path
import xml.etree.ElementTree as ET
sys.path.insert(0, ${JSON.stringify(path.dirname(script))})
spec = importlib.util.spec_from_file_location("conv", ${JSON.stringify(script)})
conv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(conv)

def dbf(fields, rows):
    header = 32 + 32 * len(fields) + 1 + 263
    length = 1 + sum(size for _, _, size in fields)
    data = bytearray(header)
    data[0] = 0x30
    struct.pack_into("<IHH", data, 4, len(rows), header, length)
    position = 1
    for index, (name, kind, size) in enumerate(fields):
        offset = 32 + 32 * index
        data[offset:offset+len(name)] = name.encode("ascii")
        data[offset+11] = ord(kind)
        struct.pack_into("<I", data, offset+12, position)
        data[offset+16] = size
        position += size
    data[32 + 32 * len(fields)] = 13
    for row in rows:
        data += b" "
        for name, kind, size in fields:
            value = row.get(name, "")
            data += (struct.pack("<i", value or 0) if kind == "I"
                else (b"T" if value else b"F") if kind == "L"
                else str(value).encode("cp1252").ljust(size, b" "))
    return bytes(data) + b"\\x1a"

u = dbf([("ID","I",4),("DATUM","D",8),("WERTUNG","N",1)],
        [{"ID":2271,"DATUM":"20261029","WERTUNG":0}])
t = dbf([("P_NUMMER","N",2),("NAME1","C",20),("NAME2","C",20),("NS","L",1)],
        [{"P_NUMMER":1,"NAME1":"Müller","NAME2":"Süd","NS":True},
         {"P_NUMMER":2,"NAME1":"Ost","NAME2":"West","NS":False}])
p = dbf([("PAARNR","I",4),("PLATZ","N",2),("PUNKTE","N",5),("PROZENT","N",5)],
        [{"PAARNR":1,"PLATZ":1,"PUNKTE":2,"PROZENT":60},
         {"PAARNR":2,"PLATZ":2,"PUNKTE":0,"PROZENT":40}])
r_fields = [("BOARD","I",4),("PAIRNS","I",4),("PAIREW","I",4),("CONTRACT","C",7),
         ("RESULT","C",5),("NS_EW","C",1),("RESVAL_NS","N",5),("RESVAL_EW","N",5),
         ("MPS_NS","N",5),("MPS_EW","N",5),("LEADCARD","C",3)]
r_rows = [{"BOARD":1,"PAIRNS":1,"PAIREW":2,"CONTRACT":"1 SA","RESULT":"=",
          "NS_EW":"N","RESVAL_NS":90,"RESVAL_EW":-90,"MPS_NS":2,"MPS_EW":0,"LEADCARD":"P8"}]
r = dbf(r_fields, r_rows)
deal = "QJ984.6.J93.A983;AT.A954.Q864.K42;32.KJ73.AK52.JT6;K765.QT82.T7.Q75"
b = dbf([("BOARD","N",3),("DEAL","C",67)],
        [{"BOARD":17,"DEAL":deal},{"BOARD":1,"DEAL":deal}])
tables = dict(zip("utprb", [u,t,p,r,b]))
def bundle(tables):
    return b"".join(data + b"###;" + key.encode() + b"**" for key,data in tables.items())

with tempfile.TemporaryDirectory() as directory:
    directory = Path(directory)
    source = directory / "exportid2271.dat"
    source.write_bytes(bundle(tables))
    parsed = conv.convert_export(source)
    event = parsed["event"]
    assert event["date"] == "2026-10-29"
    assert event["participants"]["pair"][0]["player"][0]["player_name"] == "Müller"
    line = event["board"][0]["traveller_line"][0]
    assert line["score"] == 90 and line["contract"] == "1NT"
    assert line["lead"] == "8S" and line["tricks"] == 7
    for key in "tpr":
        (directory / (key+".dbf")).write_bytes(tables[key])
    old = conv.convert(directory/"r.dbf",directory/"t.dbf",directory/"p.dbf")
    assert {k:v for k,v in event.items() if k != "date"} == old["event"]
    output = directory / "results.json"
    import subprocess
    cli = subprocess.run([sys.executable,"-B",${JSON.stringify(script)},
        "--export-dat",str(source),"--output",str(output)], capture_output=True, text=True)
    assert cli.returncode == 0, cli.stderr
    assert not cli.stderr, cli.stderr
    assert json.loads(output.read_text()) == parsed
    xml = ET.parse(output.with_suffix(".xml"))
    assert xml.findtext(".//DATE") == "29/10/2026"
    assert xml.findtext(".//TRAVELLER_LINE/SCORE") == "90"
    pbn = output.with_suffix(".pbn").read_text()
    assert '[Deal "N:' + deal.replace(";", " ") + '"]' in pbn
    assert '[Date "2026.10.29"]' in pbn
    assert '[Board "1"]' in pbn
    assert '[Board "17"]' not in pbn
    assert pbn.count('[Board ') == 1
    assert pbn.count('[Dealer "N"]') == 1
    assert pbn.count('[Vulnerable "None"]') == 1
    rows = [{"BOARD":i,"DEAL":deal} for i in range(1,17)]
    cycle = conv.deals_to_pbn(rows)
    assert cycle.count('[Dealer "E"]') == 4
    assert cycle.count('[Dealer "S"]') == 4
    assert cycle.count('[Dealer "W"]') == 4
    assert cycle.count('[Vulnerable "NS"]') == 4
    assert '[Date ' not in cycle
    for bad_rows in [
        [], [{"BOARD":0,"DEAL":deal}],
        [{"BOARD":1,"DEAL":deal},{"BOARD":1,"DEAL":deal}],
        [{"BOARD":1,"DEAL":"cards"}],
        [{"BOARD":1,"DEAL":deal.replace("QJ984","QJ98")}],
        [{"BOARD":1,"DEAL":deal.replace("QJ984","QJ98A")}],
        [{"BOARD":1,"DEAL":deal.replace("QJ984","QJ98X")}],
    ]:
        try:
            conv.deals_to_pbn(bad_rows)
        except ValueError:
            pass
        else:
            raise AssertionError("Invalid deals were accepted")
    assert len(conv.read_dbf(source)) == 1
    # A marker-looking value inside a record must not split a table.
    marker_table = dbf([("TEXT","C",10)],[{"TEXT":"###;t**"}])
    assert len(conv.export_tables(source)) == 5
    for bad in [
        b"", bundle(tables)[:-1], bundle(tables)[:100],
        bundle({k:v for k,v in tables.items() if k != "p"}),
        bundle(tables) + u + b"###;u**",
        bundle(tables).replace(b"###;r**", b"###;x**"),
    ]:
        source.write_bytes(bad)
        try:
            conv.convert_export(source)
        except ValueError:
            pass
        else:
            raise AssertionError("Invalid export was accepted")
    for change in [
        {"DATUM":"20260230","WERTUNG":0},
        {"DATUM":"bad","WERTUNG":0},
        {"DATUM":"20261029","WERTUNG":2},
    ]:
        altered = dict(tables)
        altered["u"] = dbf([("DATUM","D",8),("WERTUNG","N",1)],[change])
        source.write_bytes(bundle(altered))
        try:
            conv.convert_export(source)
        except ValueError:
            pass
        else:
            raise AssertionError("Invalid metadata was accepted")
    for scoring in (0, 1):
        altered = dict(tables)
        altered["u"] = dbf([("DATUM","D",8),("WERTUNG","N",1)],
                           [{"DATUM":"20261029","WERTUNG":scoring}])
        source.write_bytes(bundle(altered))
        converted = conv.convert_export(source)
        assert converted["event"]["board_scoring_method"] == "MATCH_POINTS"
        assert converted["event"]["board"] == event["board"]
        assert converted["event"]["winner_type"] == scoring + 1
        if scoring:
            assert converted["event"]["ranking_method"] == "MATCH_POINTS"
        assert [pair["direction"] for pair in converted["event"]["participants"]["pair"]] == (
            ["N", "E"] if scoring else ["N", "N"])
        cli = subprocess.run([sys.executable,"-B",${JSON.stringify(script)},
            "--export-dat",str(source),"--output",str(output)], capture_output=True, text=True)
        assert cli.returncode == 0, cli.stderr
        assert json.loads(output.read_text()) == converted
        xml = ET.parse(output.with_suffix(".xml"))
        assert xml.findtext(".//BOARD_SCORING_METHOD") == "MATCH_POINTS"
        assert xml.findtext(".//WINNER_TYPE") == str(scoring + 1)
        assert [pair.findtext("DIRECTION") for pair in xml.findall(".//PARTICIPANTS/PAIR")] == (
            ["NS", "EW"] if scoring else ["NS", "NS"])
        assert output.with_suffix(".pbn").read_text() == pbn
    # Two-winner exports may contain only one direction's official ranking.
    altered["p"] = dbf([("PAARNR","I",4),("PLATZ","N",2),("PUNKTE","N",5),("PROZENT","N",5)],
                       [{"PAARNR":1,"PLATZ":1,"PUNKTE":2,"PROZENT":60}])
    altered["u"] = dbf([("WERTUNG","N",1),("RUNDEN","N",2),("BPR","N",2),("MAXMPS","N",2)],
                       [{"WERTUNG":1,"RUNDEN":2,"BPR":1,"MAXMPS":2}])
    altered["r"] = dbf(r_fields, r_rows + [
        {"BOARD":2,"PAIRNS":1,"PAIREW":2,"MPS_NS":1,"MPS_EW":1}])
    source.write_bytes(bundle(altered))
    pairs = conv.convert_export(source)["event"]["participants"]["pair"]
    assert pairs[0]["place"] == "1" and pairs[0]["total_score"] == "2"
    assert pairs[1]["direction"] == "E"
    assert pairs[1]["place"] == "1"
    assert pairs[1]["total_score"] == "1"
    assert pairs[1]["percentage"] == "25.0000"
    cli = subprocess.run([sys.executable,"-B",${JSON.stringify(script)},
        "--export-dat",str(source),"--output",str(output)], capture_output=True, text=True)
    assert cli.returncode == 0, cli.stderr
    assert not cli.stderr, cli.stderr
    assert json.loads(output.read_text())["event"]["participants"]["pair"] == pairs
    ew = ET.parse(output.with_suffix(".xml")).findall(".//PARTICIPANTS/PAIR")[1]
    assert ew.findtext("DIRECTION") == "EW"
    assert ew.findtext("PLACE") == ew.findtext("TOTAL_SCORE") == "1"
    assert ew.findtext("PERCENTAGE") == "25.0000"
    assert "MATCH_POINTS" in ET.parse(output.with_suffix(".xml")).findtext(".//EVENT/NOTES")
    assert output.with_suffix(".pbn").read_text().count('[Board ') == 1
    converted = json.loads(output.read_text())["event"]
    assert len(converted["board"][1]["traveller_line"]) == 0
    for bad_u, bad_r in [
        (dbf([("WERTUNG","N",1)],[{"WERTUNG":1}]), altered["r"]),
        (altered["u"], r),
        (altered["u"], dbf(r_fields, r_rows + r_rows)),
    ]:
        bad = dict(altered, u=bad_u, r=bad_r)
        source.write_bytes(bundle(bad))
        try:
            conv.convert_export(source)
        except ValueError:
            pass
        else:
            raise AssertionError("Incomplete or duplicate ranking awards were accepted")
    altered["t"] = dbf([("P_NUMMER","N",2),("NAME1","C",20),("NAME2","C",20)],
                       [{"P_NUMMER":1,"NAME1":"North","NAME2":"South"}])
    source.write_bytes(bundle(altered))
    try:
        conv.convert_export(source)
    except ValueError as error:
        assert "NS direction" in str(error)
    else:
        raise AssertionError("Missing two-winner directions were accepted")
    ranking_event = {"participants":{"pair":[
        {"pair_number":1,"direction":"N","place":"1","total_score":"9","percentage":"45"},
        *[{"pair_number":n,"direction":"E","place":"","total_score":"","percentage":""}
          for n in (101,102,103,104)],
    ]}}
    awards = [
        {"BOARD":board,"PAIREW":pair,"MPS_EW":score}
        for pair,first in [(101,"2.25"),(102,"2.245"),(103,"2.25"),(104,"0")]
        for board,score in [(1,first),(2,"1")]
    ]
    metadata = {"RUNDEN":"2","BPR":"1","MAXMPS":10}
    complete = copy.deepcopy(ranking_event)
    conv.complete_pair_rankings(complete,metadata,awards)
    ranked = complete["participants"]["pair"]
    assert ranked[0] == ranking_event["participants"]["pair"][0]
    assert [p["place"] for p in ranked[1:]] == ["1","3","1","4"]
    assert [p["percentage"] for p in ranked[1:]] == ["16.5000","16.0000","16.5000","5.0000"]
    assert ranked[1]["total_score"] == "3.25"
    bad_award_sets = [awards[:-1], awards + [awards[0]]]
    bad_award_sets += [[dict(awards[0],MPS_EW=value)] + awards[1:]
                      for value in ("", "NaN", "Infinity", "-1", "11")]
    bad_award_sets += [[dict(awards[0],PENAL_EW="1")] + awards[1:]]
    for bad_awards in bad_award_sets:
        try:
            conv.complete_pair_rankings(copy.deepcopy(ranking_event),metadata,bad_awards)
        except ValueError:
            pass
        else:
            raise AssertionError("Invalid ranking awards were accepted")
    partial = copy.deepcopy(ranking_event)
    partial["participants"]["pair"][1]["place"] = "1"
    try:
        conv.complete_pair_rankings(partial,metadata,awards)
    except ValueError as error:
        assert "partially populated EW" in str(error)
    else:
        raise AssertionError("Partial official ranking was overwritten")
    # A scrambled Mitchell retains WERTUNG=1 but has a single combined ranking.
    combined_tables = dict(tables)
    combined_tables["u"] = dbf([("WERTUNG","N",1),("SCRAM_NACH","N",2)],
                               [{"WERTUNG":1,"SCRAM_NACH":9}])
    combined_tables["r"] = dbf(r_fields, r_rows + [
        dict(r_rows[0],BOARD=17,PAIRNS=2,PAIREW=1)])
    source.write_bytes(bundle(combined_tables))
    combined = conv.convert_export(source)["event"]
    assert combined["winner_type"] == 1
    assert combined["ranking_method"] == "MATCH_POINTS"
    assert all(pair["direction"] == "N" for pair in combined["participants"]["pair"])
    assert combined["participants"] == event["participants"]
    assert len(combined["board"]) == 2
    cli = subprocess.run([sys.executable,"-B",${JSON.stringify(script)},
        "--export-dat",str(source),"--output",str(output)], capture_output=True, text=True)
    assert cli.returncode == 0, cli.stderr
    assert json.loads(output.read_text())["event"] == combined
    xml = ET.parse(output.with_suffix(".xml"))
    assert xml.findtext(".//WINNER_TYPE") == "1"
    assert all(pair.findtext("DIRECTION") == "NS" for pair in xml.findall(".//PARTICIPANTS/PAIR"))
    assert output.with_suffix(".pbn").read_text().count('[Board ') == 2
    individual_tables = dict(tables)
    individual_tables["u"] = dbf([("T_FORM","N",1),("WERTUNG","N",1)],
                                 [{"T_FORM":3,"WERTUNG":1}])
    individual_tables["t"] = dbf([("P_NUMMER","N",2),("NAME1","C",20),("NAME2","C",20)],
                                 [{"P_NUMMER":n,"NAME1":"Player "+str(n)} for n in range(1,5)])
    individual_tables["p"] = dbf([("PAARNR","I",4),("PLATZ","N",2),("PUNKTE","N",5),("PROZENT","N",5)],
        [{"PAARNR":n,"PLATZ":n,"PUNKTE":3,"PROZENT":50} for n in range(1,5)])
    individual_fields = r_fields + [(seat,"N",2) for seat in "NESW"] + [
        ("MPS_S","N",5),("MPS_W","N",5)]
    individual_rows = [
        dict(r_rows[0],N=1,E=2,S=3,W=4,MPS_NS=2,MPS_EW=0,MPS_S=1.5,MPS_W=0.5),
        dict(r_rows[0],BOARD=17,N=4,E=2,S=3,W=1,NS_EW="W",
             MPS_NS=0,MPS_EW=2,MPS_S=0.5,MPS_W=1.5),
    ]
    individual_tables["r"] = dbf(individual_fields,individual_rows)
    source.write_bytes(bundle(individual_tables))
    individual = conv.convert_export(source)["event"]
    assert individual["event_type"] == "INDIVIDUAL" and individual["winner_type"] == 1
    assert len(individual["participants"]["pair"]) == 4
    assert all(len(p["player"]) == 1 for p in individual["participants"]["pair"])
    assert individual["board"][0]["traveller_line"][0]["player_numbers"] == {"N":1,"E":2,"S":3,"W":4}
    assert individual["board"][1]["traveller_line"][0]["player_match_points"]["W"] == 1.5
    cli = subprocess.run([sys.executable,"-B",${JSON.stringify(script)},
        "--export-dat",str(source),"--mode","individual","--output",str(output)],
        capture_output=True,text=True)
    assert cli.returncode == 0, cli.stderr
    assert json.loads(output.read_text())["event"] == individual
    xml = ET.parse(output.with_suffix(".xml"))
    assert xml.find(".//EVENT").get("EVENT_TYPE") == "INDIVIDUAL"
    assert len(xml.findall(".//PARTICIPANTS/PLAYER")) == 4
    assert not xml.findall(".//PARTICIPANTS/PAIR")
    assert xml.findtext(".//TRAVELLER_LINE/N_PLAYER_NUMBER") == "1"
    assert xml.findtext(".//TRAVELLER_LINE/S_PLAYER_NUMBER") == "3"
    assert output.with_suffix(".pbn").read_text().count('[Board ') == 2
    for bad in [
        dict(individual_tables,r=dbf(individual_fields,[dict(individual_rows[0],N=99)])),
        dict(individual_tables,r=dbf(individual_fields,[dict(individual_rows[0],N=2)])),
        dict(individual_tables,r=r),
        dict(individual_tables,r=dbf(individual_fields,individual_rows + individual_rows)),
        dict(individual_tables,r=dbf(individual_fields,[dict(individual_rows[0],MPS_S=-1)])),
        dict(individual_tables,p=p),
        dict(individual_tables,u=dbf([("T_FORM","N",1),("WERTUNG","N",1)],[{"T_FORM":3,"WERTUNG":2}])),
    ]:
        source.write_bytes(bundle(bad))
        try:
            conv.convert_export(source)
        except ValueError:
            pass
        else:
            raise AssertionError("Invalid individual export was accepted")
    source.write_bytes(bundle(tables))
    try:
        conv.convert_export(source, "teams")
    except ValueError:
        pass
    else:
        raise AssertionError("Wrong tournament mode was accepted")
    # Embedded contents are not scanned for delimiters.
    altered = dict(tables)
    altered["b"] = marker_table
    source.write_bytes(bundle(altered))
    assert len(conv.export_tables(source)) == 5
    for inputs in [[], ["--export-dat",str(source),"--play-dbf","play.dbf"]]:
        cli = subprocess.run([sys.executable,"-B",${JSON.stringify(script)},
            *inputs,"--output",str(directory/"invalid.json")],capture_output=True)
        assert cli.returncode != 0
        assert not (directory/"invalid.json").exists()
print(json.dumps({"combined":combined,"individual":individual}))
`], {encoding: "utf8"});
	assert.equal(result.status, 0, result.stderr);
	const {combined: event, individual} = JSON.parse(result.stdout);
	const context = createContext({
		g_travellers: {event},
		g_hands: {boards: event.board.map(board => ({board: board.board_no}))},
		g_rankInfo: null, g_sessInfo: null,
		g_scoring: "MatchPoints", g_eventType: "Paarturnier",
		getMakeableTricksForContract: () => 8,
		comparePositions: (a, b) => a - b,
	});
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/ranking.mjs");
	const ranking = context.getRankingInfo();
	assert.equal(ranking.sessInfo.singleWinner, true);
	assert.equal(ranking.rankNS.length, 2);
	assert.equal(ranking.rankEW.length, 0);
	assert.doesNotThrow(() => context.ddComparisonAll());
	for (const pair of ranking.rankNS) {
		assert.equal(pair.boardsPlayed, 2);
		assert.equal(pair.dd.ddUnderH + pair.dd.ddOverH, 2);
	}
	const individualContext = createContext({
		g_travellers: {event:individual},
		g_hands: {boards:individual.board.map(board => ({board:board.board_no}))},
		g_currentTraveller: individual.board[1],
		g_sessInfo:null, g_rankInfo:null,
		getMakeableTricksForContract: () => 8,
		document: {getElementById: () => ({checked:true,selectedIndex:0})},
		getTravIndex: index => index,
	});
	loadScript(individualContext,"js/scoring.mjs");
	loadScript(individualContext,"js/ranking.mjs");
	loadScript(individualContext,"js/traveller.mjs");
	const resultRanking = individualContext.getRankingInfo();
	assert.equal(individualContext.g_eventType,"Individual");
	assert.equal(resultRanking.rankNS.length,4);
	assert.equal(resultRanking.rankEW.length,0);
	const totals = resultRanking.rankNS.map(entry => entry.plusMpts);
	assert.deepEqual(Array.from(totals),[3.5,2,2,0.5]);
	assert.doesNotThrow(() => individualContext.ddComparisonAll());
	for (const player of resultRanking.rankNS) assert.equal(player.boardsPlayed,2);
	for (let number=1;number<=4;number++) {
		assert.equal(individualContext.getRowFromTraveller(number,1),0);
		const info = individualContext.getPlayerInfo(number,1);
		assert.equal(info.player1,"Player "+number);
		assert.equal(info.player2,"");
		assert.ok(individualContext.getTlineForPair(0,info));
		assert.ok(individualContext.getPlayerAndRole(info,individual.board[0].traveller_line[0]).found);
	}
	const selected = individualContext.getPlayerInfo(1,1);
	const firstRole = individualContext.getPlayerAndRole(selected,individual.board[0].traveller_line[0]);
	const secondRole = individualContext.getPlayerAndRole(selected,individual.board[1].traveller_line[0]);
	assert.equal(firstRole.partner,3);
	assert.equal(secondRole.partner,2);
	assert.equal(firstRole.tdirection,1);
	assert.equal(secondRole.tdirection,2);
	assert.equal(firstRole.first,true);
	assert.equal(secondRole.first,true);
	const firstLine = individual.board[0].traveller_line[0];
	const leadRole = individualContext.getPlayerAndRole(individualContext.getPlayerInfo(2,1),firstLine);
	const dummyRole = individualContext.getPlayerAndRole(individualContext.getPlayerInfo(3,1),firstLine);
	const otherDefender = individualContext.getPlayerAndRole(individualContext.getPlayerInfo(4,1),firstLine);
	assert.equal(leadRole.declarer_pair,false);
	assert.equal(leadRole.first,true);
	assert.equal(dummyRole.declarer_pair,true);
	assert.equal(dummyRole.first,false);
	assert.equal(otherDefender.declarer_pair,false);
	assert.equal(otherDefender.first,false);
	const optimumCell = {textContent:"",style:{}};
	assert.doesNotThrow(() => individualContext.setIndividualPlayers(optimumCell,{},1));
});
