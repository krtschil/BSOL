const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const {createContext, loadScript, root} = require("./test-helpers");

test("converts a PBN file into valid board JSON", () => {
	const context = createContext({
		g_fullInfo: false,
		g_hands: {boards: []},
		g_title: "",
	});
	loadScript(context, "js/scoring.js");
	loadScript(context, "js/pbn.js");
	const pbn = fs.readFileSync(`${root}/hands/sample-traveller.pbn`, "utf8");
	const result = JSON.parse(context.pbnToJson(pbn));

	assert.ok(result.boards.length > 0);
	assert.equal(result.boards[0].Deal.length, 4);
	assert.equal(result.boards[0].Deal.join(".").replace(/\./g, "").length, 52);
	assert.equal(context.validateBoard(result.boards[0]), 1);
});

test("converts a LIN board into valid board JSON", () => {
	const context = createContext({
		g_accTrans: {},
		g_hands: {},
		g_title: "",
	});
	loadScript(context, "js/pbn.js");
	loadScript(context, "js/import.js");
	const lin = fs.readFileSync(`${root}/hands/4399982054.lin`, "utf8");
	const result = JSON.parse(context.linToJson(lin));

	assert.ok(result.boards.length > 0);
	assert.ok(result.boards[0].board);
	assert.ok(result.boards[0].Vulnerable);
	assert.equal(result.boards[0].Deal.length, 4);
});

test("validates contracts and converts honour-card alphabets", () => {
	const context = createContext();
	loadScript(context, "js/pbn.js");

	assert.equal(context.validateContract("4S"), true);
	assert.equal(context.validateContract("8S"), false);
	assert.equal(context.identifyHonourCardSet("AKQJ"), "english");
	assert.equal(context.convertToJQKA("AVD.R", "french"), "AJQ.K");
});

test("parses supported URL parameters into board and traveller settings", () => {
	const context = createContext({
		window: {location: {search: "?file=hands%2Fsample.pbn&xml=traveller.json&board=7&dealer=E&vul=NS"}},
		changeLanguage: () => {},
	});
	loadScript(context, "js/pbn.js");
	loadScript(context, "js/bootstrap.js");
	const result = context.extractParas();

	assert.equal(result.file, "hands/sample.pbn");
	assert.equal(result.xml, "traveller.json");
	assert.equal(result.boards[0].board, "7");
	assert.equal(result.boards[0].Dealer, "E");
	assert.equal(result.boards[0].Vulnerable, "NS");
});

test("calculates representative bridge scores", () => {
	const context = createContext();
	loadScript(context, "js/scoring.js");

	assert.equal(context.calculateBridgeScore({
		level: 4, suit: "H", doubled: "", declarerVulnerable: false, tricksTaken: 10
	}), 420);
	assert.equal(context.calculateBridgeScore({
		level: 3, suit: "N", doubled: "", declarerVulnerable: false, tricksTaken: 9
	}), 400);
	assert.equal(context.calculateBridgeScore({
		level: 4, suit: "S", doubled: "X", declarerVulnerable: false, tricksTaken: 8
	}), -300);
});
