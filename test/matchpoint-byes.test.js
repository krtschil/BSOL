const assert = require("node:assert/strict");
const test = require("node:test");
const {createContext, loadScript} = require("./test-helpers");

function ranking(counts, singleWinner = true) {
	const participants = counts.map((count, i) => ({
		pair_number: singleWinner ? i + 1 : i % 2 + 1,
		direction: singleWinner || i < 2 ? "N" : "E",
		place: i + 1, total_score: "", percentage: "",
	}));
	const raw = [90, 36, 66, 78];
	const board = Array.from({length: 24}, (_, i) => ({
		board_no: i + 1,
		traveller_line: [[0, 1], [2, 3]].flatMap(([ns, ew]) => {
			if (i >= counts[ns] || i >= counts[ew]) return [];
			return [{
				ns_pair_number: singleWinner ? participants[ns].pair_number : ns / 2 + 1,
				ew_pair_number: singleWinner ? participants[ew].pair_number : ns / 2 + 1,
				contract: "1NT", score: 90, ns_score: 90, ew_score: "",
				ns_match_points: raw[ns] / counts[ns],
				ew_match_points: raw[ew] / counts[ew],
			}];
		}),
	}));
	const context = createContext({
		g_rankInfo: null, g_scoring: "MatchPoints", g_eventType: "Paarturnier",
		g_travellers: {event: {participants: {pair: participants}, board}},
	});
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/ranking.mjs");
	context.getSessionInfo = () => ({singleWinner});
	return {context, result: context.getRankingInfo()};
}

test("unequal board counts receive average MPs up to the most boards actually played", () => {
	const {context, result} = ranking([21, 21, 24, 24]);
	const entries = result.rankNS;
	assert.equal(result.maxPlayed, 24);
	assert.equal(entries[0].boardsPlayed, 21);
	assert.ok(Math.abs(entries[0].plusMpts - 102.9) < 1e-9);
	assert.ok(Math.abs(entries[1].plusMpts - 41.1) < 1e-9);
	assert.ok(Math.abs(entries[2].plusMpts - 66) < 1e-9);
	assert.ok(Math.abs(entries[0].percent - 71.43) < 1e-9);
	assert.equal(context.getRankingInfo(), result, "cached ranking must not add the compensation twice");
});

test("equal sit-outs leave all MP sums unchanged even when additional boards exist", () => {
	const {result} = ranking([21, 21, 21, 21]);
	assert.equal(result.maxPlayed, 21);
	for (const [i, expected] of [90, 36, 66, 78].entries())
		assert.ok(Math.abs(result.rankNS[i].plusMpts - expected) < 1e-9);
});

test("pairs without played boards receive no invented average", () => {
	const {result} = ranking([0, 0, 24, 24]);
	for (const entry of result.rankNS.filter(entry => entry.boardsPlayed === 0)) {
		assert.equal(entry.plusMpts, 0);
		assert.equal(entry.minusMpts, 0);
	}
});

test("two-winner rankings compensate both NS and EW without mixing pair numbers", () => {
	const {result} = ranking([21, 21, 24, 24], false);
	const ns = pair => result.rankNS.find(entry => entry.pair === pair);
	const ew = pair => result.rankEW.find(entry => entry.pair === pair);
	assert.equal(ns(1).boardsPlayed, 21);
	assert.equal(ew(1).boardsPlayed, 21);
	assert.ok(Math.abs(ns(1).plusMpts - 102.9) < 1e-9);
	assert.ok(Math.abs(ew(1).plusMpts - 41.1) < 1e-9);
	assert.ok(Math.abs(ns(2).plusMpts - 66) < 1e-9);
	assert.ok(Math.abs(ew(2).plusMpts - 78) < 1e-9);
});
