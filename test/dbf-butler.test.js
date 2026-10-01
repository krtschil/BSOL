const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const script = path.resolve(__dirname, "..", "scripts", "dbf-traveller-to-json.py");

function runPython(code) {
	const result = spawnSync("python3", ["-c", code], { encoding: "utf8" });
	assert.equal(result.status, 0, result.stderr);
	return JSON.parse(result.stdout);
}

const loader = `
import importlib.util, json, sys
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("conv", ${JSON.stringify(script)})
conv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(conv)
`;

test("Butler IMP scale and datum rounding", () => {
	const out = runPython(loader + `
print(json.dumps({
  "imps": [conv.imps(d) for d in (0, 10, 20, 50, -90, 420, 430, 4000, -5000)],
  "datum": [conv.butler_datum(s) for s in ([50, 110, 570, -100, 50, -100], [15, 0], [-15, 0], [-100, -120])],
}))`);
	assert.deepEqual(out.imps, [0, 0, 1, 2, -3, 9, 10, 24, -24]);
	assert.deepEqual(out.datum, [100, 10, -10, -110]);
});

test("Butler ranking credits NS and EW pairs of both tables", () => {
	const out = runPython(loader + `
rows = [
  {"BOARD": 1, "HOME_NS": 1, "VISIT_EW": 2, "VISIT_NS": 2, "HOME_EW": 1,
   "CONTRACT_H": "4 P", "RESVAL_H": 420, "CONTRACT_V": "3 P", "RESVAL_V": 170},
  {"BOARD": 2, "HOME_NS": 1, "VISIT_EW": 2, "VISIT_NS": 2, "HOME_EW": 1,
   "CONTRACT_H": "", "RESVAL_H": 0, "CONTRACT_V": "1 SA", "RESVAL_V": -90},
]
names = {(1, "NS"): ["A", "B"], (1, "EW"): ["C", "D"], (2, "NS"): ["E", "F"], (2, "EW"): ["G", "H"]}
butler, datums = conv.butler_results(rows, names)
print(json.dumps({"butler": butler, "datums": datums}))`);
	assert.deepEqual(out.datums, { 1: 300, 2: -90 });
	const byPair = Object.fromEntries(out.butler.pairs.map((p) => [`${p.team_number}${p.direction}`, p]));
	assert.equal(byPair["1NS"].imps, 3);
	assert.equal(byPair["2EW"].imps, -3);
	assert.equal(byPair["2NS"].imps, -4);
	assert.equal(byPair["2NS"].boards, 2);
	assert.equal(byPair["1EW"].imps, 4);
	assert.deepEqual(byPair["1NS"].player, [{ player_name: "A" }, { player_name: "B" }]);
	assert.equal(out.butler.pairs.reduce((sum, p) => sum + p.imps, 0), 0);
	assert.equal(out.butler.pairs[0].position, 1);
});
