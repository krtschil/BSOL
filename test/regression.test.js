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
	const pbn = fs.readFileSync(`${root}/test/fixtures/sample-traveller.pbn`, "utf8");
	const result = JSON.parse(context.pbnToJson(pbn));

	assert.ok(result.boards.length > 0);
	assert.equal(result.boards[0].Deal.length, 4);
	assert.equal(result.boards[0].Deal.join(".").replace(/\./g, "").length, 52);
	assert.equal(context.validateBoard(result.boards[0]), 1);
});

test("keeps the Traveller JSON fixture available", () => {
	const traveller = JSON.parse(
		fs.readFileSync(`${root}/test/fixtures/sample-traveller.json`, "utf8")
	);

	assert.equal(traveller.event.board.length, 26);
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

test("converts a DLM file into valid board JSON", () => {
	const context = createContext({g_fullInfo: false});
	loadScript(context, "js/import.js");
	const dlm = fs.readFileSync(`${root}/test/fixtures/Team2024.dlm`, "utf8");
	const result = JSON.parse(context.dlmToJson(dlm));

	assert.ok(result.boards.length > 0);
	assert.equal(result.boards[0].Deal.length, 4);
	assert.ok(result.boards[0].Dealer);
	assert.ok(result.boards[0].Vulnerable);
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

test("resets import and Traveller state when building a new page", () => {
	const context = createContext({
		g_file: "old.pbn",
		g_handstr: "old data",
		g_handstrType: "pbn",
		g_xml: "old.xml",
		g_xmlstr: "old traveller",
		g_loaded: true,
		g_travellers: {event: {}},
		g_currentTraveller: {board: 1},
		g_sessInfo: {event: "old"},
		g_rankInfo: {pairs: []},
		largeSpinner: () => {},
		hideSpinner: () => {},
		webAssemblySupported: () => false,
		workerSupported: () => false,
		reportBSOLNotSupported: () => {},
	});
	loadScript(context, "js/bootstrap.js");
	context.buildPage({}, "{}");

	assert.equal(context.g_file, "");
	assert.equal(context.g_handstr, "");
	assert.equal(context.g_handstrType, "");
	assert.equal(context.g_xml, "");
	assert.equal(context.g_xmlstr, "");
	assert.equal(context.g_loaded, false);
	assert.equal(context.g_travellers, null);
	assert.equal(context.g_currentTraveller, null);
	assert.equal(context.g_sessInfo, null);
	assert.equal(context.g_rankInfo, null);
});

test("switches localization labels between German and English", () => {
	const labels = {
		loadFile1: {value: ""},
		blankInput: {textContent: ""},
		bsession: {textContent: ""},
		clipboard: {textContent: ""},
	};
	const context = createContext({
		document: {
			getElementById: (id) => labels[id] || {style: {}, textContent: "", value: "", innerHTML: ""},
		},
	});
	loadScript(context, "js/localization.js");

	context.changeLanguage("de");
	assert.equal(labels.loadFile1.value, "Datei auswählen");
	assert.equal(labels.bsession.textContent, "Ergebnisanalyse");

	context.changeLanguage("en");
	assert.equal(labels.loadFile1.value, "Open file");
	assert.equal(labels.bsession.textContent, "Results Analysis");
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
