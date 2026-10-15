const assert = require("node:assert/strict");
const test = require("node:test");
const {createContext, loadScript} = require("./test-helpers");

function context() {
	const result = createContext();
	loadScript(result, "js/board-statistics.mjs");
	return result;
}

const deal = ["AKQJT98765432...", ".AKQJT98765432..", "..AKQJT98765432.", "...AKQJT98765432"];

test("language switches refresh visible statistics without opening hidden statistics", () => {
	const elements = new Map();
	const calls = [];
	const ctx = createContext({
		document: {getElementById(id) {
			if (!elements.has(id)) elements.set(id, {style: {}});
			return elements.get(id);
		}},
		showBoardStatistics: language => calls.push(language),
	});
	loadScript(ctx, "js/localization.mjs");
	ctx.document.getElementById("boardStatistics").hidden = false;
	ctx.changeLanguage("en");
	assert.deepEqual(calls, ["en"]);
	assert.equal(elements.get("closeBoardStatistics").textContent, "Close");
	ctx.changeLanguage("de");
	assert.deepEqual(calls, ["en","de"]);
	assert.equal(elements.get("closeBoardStatistics").textContent, "Schließen");
	elements.get("boardStatistics").hidden = true;
	ctx.changeLanguage("en");
	assert.deepEqual(calls, ["en","de"]);
});

test("board statistics enumerate all shapes with normalized theoretical probabilities", () => {
	const stats = context().calculateBoardStatistics([]);
	assert.equal(stats.distributions.length, 39);
	assert.ok(Math.abs(stats.distributions.reduce((sum,row) => sum+row.theoretical,0)-100)<1e-10);
	assert.equal(stats.distributions[0].shape, "4-4-3-2");
	assert.ok(Math.abs(stats.distributions[0].theoretical-21.5512)<0.0001);
	assert.ok(Math.abs(stats.distributions.find(row => row.shape==="4-3-3-3").theoretical-10.5361)<0.0001);
	assert.ok(stats.distributions.every((row,i,rows) => i===0 || row.theoretical<=rows[i-1].theoretical));
	assert.equal(stats.hands, 0);
});

test("board statistics count four hands per board and total standard HCP by position", () => {
	const stats = context().calculateBoardStatistics(Array.from({length:11}, () => ({Deal:deal})));
	assert.equal(stats.validBoards, 11);
	assert.equal(stats.hands, 44);
	assert.equal(stats.distributions.find(row => row.shape==="13-0-0-0").count, 44);
	assert.equal(stats.distributions.find(row => row.shape==="13-0-0-0").observed, 100);
	assert.deepEqual(Array.from(stats.points), [110,110,110,110]);
	assert.equal(stats.nsPercent, 50);
	assert.equal(stats.ewPercent, 50);
	const uneven = context().calculateBoardStatistics([{Deal: [
		"KQJT98765432.2..", "A.AKQJT9876543..", deal[2], deal[3],
	]}]);
	assert.deepEqual(Array.from(uneven.points), [6,14,10,10]);
	assert.equal(uneven.nsPercent, 40);
	assert.equal(uneven.ewPercent, 60);
});

test("board statistics explicitly exclude missing, partial and duplicated cards", () => {
	const stats = context().calculateBoardStatistics([
		{Deal:deal}, {}, {Deal:["...","...","...","..."]},
		{Deal:[deal[0],deal[0],deal[2],deal[3]]},
		{Deal:["AKQJT9876543X...",...deal.slice(1)]},
	]);
	assert.equal(stats.validBoards, 1);
	assert.equal(stats.excludedBoards, 4);
	assert.equal(stats.hands, 4);
});

test("board statistics enforces the greater-than-ten threshold", () => {
	const panel = {hidden:true};
	const content = {replaceChildren() {}, appendChild() {}};
	const note = {};
	const ctx = createContext({
		language:"de",
		g_hands:{boards:Array.from({length:10}, () => ({Deal:deal}))},
		document:{
			getElementById: id => id==="boardStatistics" ? panel : content,
			createElement: () => note,
		},
	});

	loadScript(ctx, "js/board-statistics.mjs");
	ctx.showBoardStatistics();
	assert.equal(panel.hidden, false);
	assert.match(note.textContent, /mehr als 10/);
});

test("entering result analysis hides board statistics for every analysis view", () => {
	const panel = {hidden:false};
	const ctx = createContext({
		document: {getElementById: () => panel},
		log() {},
		getHands() {},
		setupRanking() {},
		setupScorecard() {},
		checkAllContracts() {},
		showComparison() {},
	});
	loadScript(ctx, "js/session.mjs");
	for (const mode of ["ranking","scorecard","check","traveller"]) {
		panel.hidden = false;
		ctx.g_sessionMode = mode;
		ctx.gotoSession();
		assert.equal(panel.hidden, true);
	}
});
