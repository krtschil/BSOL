const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {spawnSync} = require("node:child_process");
const test = require("node:test");
const {createContext, loadScript, root} = require("./test-helpers");

function python(code, input = "") {
	const result = spawnSync("python3", ["-B", "-c", code], {input, encoding: "utf8"});
	assert.equal(result.status, 0, result.stderr);
	return result.stdout;
}

// Parse actual XML with the standard library, then expose the DOM operations
// used by the browser importer without adding a browser dependency.
class DOMParser {
	parseFromString(xml) {
		const tree = JSON.parse(python(`
import json, sys, xml.etree.ElementTree as ET
def node(e):
    return {"name": e.tag, "attributes": e.attrib, "text": e.text, "children": [node(c) for c in e]}
try:
    tree = node(ET.fromstring(sys.stdin.read()))
except ET.ParseError:
    tree = {"name": "parsererror", "attributes": {}, "text": "Invalid XML", "children": []}
print(json.dumps(tree))
`, xml));
		function dom(data, parentNode = null) {
			const node = {
				nodeName: data.name,
				parentNode,
				attributes: {getNamedItem: (name) => ({nodeValue: data.attributes[name] || ""})},
				childNodes: [],
				getElementsByTagName(name) {
					return this.childNodes.flatMap((child) => child.nodeName === "#text" ? [] :
						[...(child.nodeName === name ? [child] : []), ...child.getElementsByTagName(name)]);
				},
			};
			if (data.text)
				node.childNodes.push({nodeName: "#text", nodeValue: data.text, textContent: data.text});
			node.childNodes.push(...data.children.map((child) => dom(child, node)));
			node.textContent = node.childNodes.map((child) => child.textContent).join("");
			return node;
		}
		return dom({name: "#document", attributes: {}, children: [tree]});
	}
}

function importXml(xml) {
	const context = createContext({DOMParser});
	loadScript(context, "js/xml.mjs");
	return JSON.parse(context.convertXML(xml)).event;
}

for (const [fixture, scoring, pointsTag] of [
	["bbo-extractor-sample.csv", "MatchPoints", "NS_MATCH_POINTS"],
	["bbo-extractor-imps-sample.csv", "IMP", "NS_CROSS_IMP_POINTS"],
]) {
	test(`BBO creates sibling USEBIO XML and imports ${scoring} without losing results`, () => {
		const directory = fs.mkdtempSync(path.join(os.tmpdir(), "bsol-usebio-"));
		try {
			const output = path.join(directory, "traveller.json");
			const converted = spawnSync("python3", ["-B", path.join(root, "scripts/bbo-csv-to-json.py"),
				"--csv", path.join(root, "test/fixtures", fixture), "--output", output], {encoding: "utf8"});
			assert.equal(converted.status, 0, converted.stderr);
			const original = JSON.parse(fs.readFileSync(output, "utf8")).event;
			const xml = fs.readFileSync(path.join(directory, "traveller.xml"), "utf8");
			assert.match(xml, /<USEBIO Version="1.2">/);
			assert.match(xml, new RegExp(`<${pointsTag}>`));
			assert.match(xml, /<PLAYER>\s*<PLAYER_NAME>/);
			assert.doesNotMatch(xml, /<LIN_DATA>/);
			const restored = importXml(xml);
			assert.equal(restored.board_scoring_method, scoring);
			assert.deepEqual(restored.participants.pair,
				original.participants.pair.map((pair) => ({...pair, pair_number: String(pair.pair_number)})));
			assert.equal(restored.board.length, original.board.length);
			for (let i = 0; i < original.board.length; i++) {
				const before = original.board[i].traveller_line[0];
				const after = restored.board[i].traveller_line[0];
				for (const key of Object.keys(before))
					assert.equal(String(after[key]), String(before[key]), `${i}: ${key}`);
			}
		} finally {
			fs.rmSync(directory, {recursive: true});
		}
	});
}

const dbfLoader = `
import importlib.util, json, sys
sys.path.insert(0, ${JSON.stringify(path.join(root, "scripts"))})
spec = importlib.util.spec_from_file_location("conv", ${JSON.stringify(path.join(root, "scripts/dbf-traveller-to-json.py"))})
conv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(conv)
`;

for (const mode of ["pairs", "teams"]) {
	test(`DBF ${mode} writes JSON and XML retaining Unicode and BSOL analysis`, () => {
		const directory = fs.mkdtempSync(path.join(os.tmpdir(), "bsol-dbf-xml-"));
		try {
			const output = path.join(directory, "results.json");
			python(dbfLoader + `
participants = [
    {"P_NUMMER": 1, "NS": True, "NAME1": "Müller & <Nord>", "NAME2": "Süd"},
    {"P_NUMMER": 1, "NS": False, "NAME1": "Ost", "NAME2": "West"},
    {"P_NUMMER": 2, "NS": True, "NAME1": "Other N", "NAME2": "Other S"},
    {"P_NUMMER": 2, "NS": False, "NAME1": "Other E", "NAME2": "Other W"},
]
if ${JSON.stringify(mode)} == "pairs":
    participants = [p for p in participants if p["NS"]]
results = [
    {"TEAM_NR": 1, "PAARNR": 1, "PLATZ": 1, "PUNKTE": 12, "PROZENT": 60, "GEGNER1": 2, "PUNKTE1": 12},
    {"TEAM_NR": 2, "PAARNR": 2, "PLATZ": 2, "PUNKTE": 8, "PROZENT": 40, "GEGNER1": 1, "PUNKTE1": 8},
]
play = [
    {"BOARD": 1, "RUNDE": 3, "HOME_NS": 2, "HOME_EW": 2, "VISIT_NS": 1, "VISIT_EW": 1,
     "CONTRACT_H": "4 P", "CONTRACT_V": "3 P", "RESVAL_H": 420, "RESVAL_V": 170,
     "RESULT_H": "=", "RESULT_V": "=", "NS_EW_H": "N", "NS_EW_V": "S",
     "PAIRNS": 1, "PAIREW": 2, "CONTRACT": "4 P", "RESULT": "=", "NS_EW": "N",
     "RESVAL_NS": 420, "RESVAL_EW": -420, "MPS_NS": 6, "MPS_EW": 4},
    {"BOARD": 0, "RUNDE": 3, "HOME_NS": 2, "VISIT_EW": 1, "IMPS_H": 6, "IMPS_V": 0},
]
conv.read_dbf = lambda p: {"participants": participants, "results": results, "play": play}[p.name]
sys.argv = ["converter", "--mode", ${JSON.stringify(mode)}, "--play-dbf", "play",
    "--participants-dbf", "participants", "--results-dbf", "results", "--output", ${JSON.stringify(output)}]
conv.main()
`);
			const original = JSON.parse(fs.readFileSync(output, "utf8")).event;
			const xml = fs.readFileSync(path.join(directory, "results.xml"), "utf8");
			assert.match(xml, /&amp; &lt;Nord&gt;/);
			const restored = importXml(xml);
			assert.equal(restored.event_type, mode === "teams" ? "Teams" : "Pairs");
			assert.deepEqual(restored.participants.pair.map((pair) => pair.player),
				original.participants.pair.map((pair) => pair.player));
			for (let i = 0; i < original.board[0].traveller_line.length; i++) {
				for (const [key, value] of Object.entries(original.board[0].traveller_line[i]))
					assert.equal(String(restored.board[0].traveller_line[i][key]), String(value), key);
			}
			if (mode === "teams") {
				assert.match(xml, /<TEAM TEAM_ID="1">/);
				assert.match(xml, /<MATCH_SCORING_METHOD>VPS</);
				assert.match(xml, /<TEAM_SCORE>8</);
				assert.match(xml, /<OPPOSING_TEAM_SCORE>12</);
				assert.match(xml, /<IMPS>6</);
				assert.deepEqual(restored.cross_table, original.cross_table);
				assert.deepEqual(restored.team_matches, original.team_matches);
				assert.deepEqual(restored.butler, original.butler);
				assert.equal(restored.board[0].butler_datum, original.board[0].butler_datum);
				assert.equal(restored.ranking_method, original.ranking_method);
			}
		} finally {
			fs.rmSync(directory, {recursive: true});
		}
	});
}

test("legacy XML import and malformed XML handling", () => {
	const event = importXml(fs.readFileSync(path.join(root, "test/fixtures/sample-traveller.xml"), "utf8"));
	assert.equal(event.event_type, "Pairs");
	assert.equal(event.board[0].traveller_line[0].contract, "4S");
	assert.throws(() => importXml("<USEBIO>"), /Invalid USEBIO XML/);
	assert.throws(() => importXml("<USEBIO/>"), /contains no EVENT/);
	assert.throws(() => importXml('<EVENT><NOTES>BSOL:{broken}</NOTES></EVENT>'), /JSON/);
});

test("BBO tournament date is retained in JSON, USEBIO XML and XML import", () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "bsol-bbo-date-"));
	try {
		const input = path.join(directory, "input.csv");
		const output = path.join(directory, "output.json");
		const fixture = fs.readFileSync(path.join(root, "test/fixtures/bbo-extractor-sample.csv"), "utf8");
		for (const date of ["2026-10-14", "2024-02-29", "", "2026-02-30"]) {
			fs.writeFileSync(input, `#Date,${date},Date:${date}\n${fixture}`);
			const result = spawnSync("python3", ["-B", path.join(root, "scripts/bbo-csv-to-json.py"),
				"--csv", input, "--output", output], {encoding: "utf8"});
			if (date === "2026-02-30") {
				assert.notEqual(result.status, 0);
				assert.match(result.stderr, /ValueError/);
				continue;
			}
			assert.equal(result.status, 0, result.stderr);
			const event = JSON.parse(fs.readFileSync(output, "utf8")).event;
			const xml = fs.readFileSync(path.join(directory, "output.xml"), "utf8");
			assert.equal(event.date, date || undefined);
			assert.equal(importXml(xml).date, date || undefined);
			if (date)
				assert.ok(xml.includes(`<DATE>${date.split("-").reverse().join("/")}</DATE>`));
			else
				assert.doesNotMatch(xml, /<DATE>/);
		}
	} finally {
		fs.rmSync(directory, {recursive: true});
	}
});
