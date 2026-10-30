const assert = require("node:assert/strict");
const {spawnSync} = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

test("combined DAT export converts all embedded tables and rejects malformed input", () => {
	const script = path.resolve(__dirname, "../scripts/dbf-traveller-to-json.py");
	const result = spawnSync("python3", ["-B", "-c", `
import importlib.util, json, struct, sys, tempfile
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
                else str(value).encode("cp1252").ljust(size, b" "))
    return bytes(data) + b"\\x1a"

u = dbf([("ID","I",4),("DATUM","D",8),("WERTUNG","N",1)],
        [{"ID":2271,"DATUM":"20261029","WERTUNG":0}])
t = dbf([("P_NUMMER","N",2),("NAME1","C",20),("NAME2","C",20)],
        [{"P_NUMMER":1,"NAME1":"Müller","NAME2":"Süd"},
         {"P_NUMMER":2,"NAME1":"Ost","NAME2":"West"}])
p = dbf([("PAARNR","I",4),("PLATZ","N",2),("PUNKTE","N",5),("PROZENT","N",5)],
        [{"PAARNR":1,"PLATZ":1,"PUNKTE":2,"PROZENT":60},
         {"PAARNR":2,"PLATZ":2,"PUNKTE":0,"PROZENT":40}])
r = dbf([("BOARD","I",4),("PAIRNS","I",4),("PAIREW","I",4),("CONTRACT","C",7),
         ("RESULT","C",5),("NS_EW","C",1),("RESVAL_NS","N",5),("RESVAL_EW","N",5),
         ("MPS_NS","N",5),("MPS_EW","N",5),("LEADCARD","C",3)],
        [{"BOARD":1,"PAIRNS":1,"PAIREW":2,"CONTRACT":"1 SA","RESULT":"=",
          "NS_EW":"N","RESVAL_NS":90,"RESVAL_EW":-90,"MPS_NS":2,"MPS_EW":0,"LEADCARD":"P8"}])
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
        {"DATUM":"20261029","WERTUNG":1},
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
print("ok")
`], {encoding: "utf8"});
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.stdout.trim(), "ok");
});
