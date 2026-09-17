const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("BBO Extractor CSV converts to BSOL Traveller JSON", () => {
	const output = path.join(os.tmpdir(), `bsol-bbo-${process.pid}.json`);
	const result = spawnSync(
		"python3",
		[
			path.join(root, "scripts", "bbo-csv-to-json.py"),
			"--csv",
			path.join(root, "test", "fixtures", "bbo-extractor-sample.csv"),
			"--output",
			output,
		],
		{ encoding: "utf8" },
	);

	assert.equal(result.status, 0, result.stderr);
	const converted = JSON.parse(fs.readFileSync(output, "utf8"));
	fs.unlinkSync(output);

	const event = converted.event;
	assert.equal(event.event_type, "PAIRS");
	assert.equal(event.board_scoring_method, "MATCH_POINTS");
	assert.equal(event.participants.pair.length, 2);
	assert.deepEqual(event.participants.pair[0].player, [
		{ player_name: "North One" },
		{ player_name: "South One" },
	]);

	assert.equal(event.board.length, 3);
	const played = event.board[0].traveller_line[0];
	assert.equal(played.contract, "4S");
	assert.equal(played.played_by, "N");
	assert.equal(played.lead, "TC");
	assert.equal(played.tricks, 10);
	assert.equal(played.score, 420);
	assert.equal(played.ew_score, -420);
	assert.equal(played.lindata, "qx||ah|Board%201|");

	const passed = event.board[1].traveller_line[0];
	assert.equal(passed.contract, "Passed");
	assert.equal(passed.played_by, "");
	assert.equal(passed.lead, "");
	assert.equal(passed.tricks, "");

	const adjusted = event.board[2].traveller_line[0];
	assert.equal(adjusted.contract, "NP");
	assert.equal(adjusted.score, "A5050");
	assert.equal(adjusted.ns_score, "50%");
	assert.equal(adjusted.ew_score, "50%");
	assert.equal(adjusted.played_by, "");
});
