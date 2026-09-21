const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const {pathToFileURL} = require("node:url");
const {createContext, loadScript, root} = require("./test-helpers");

test("converts a PBN file into valid board JSON", () => {
	const context = createContext({
		g_fullInfo: false,
		g_hands: {boards: []},
		g_title: "",
	});
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/pbn.mjs");
	const pbn = fs.readFileSync(`${root}/test/fixtures/sample-traveller.pbn`, "utf8");
	const result = JSON.parse(context.pbnToJson(pbn));

	assert.ok(result.boards.length > 0);
	assert.equal(result.boards[0].Deal.length, 4);
	assert.equal(result.boards[0].Deal.join(".").replace(/\./g, "").length, 52);
	assert.equal(context.validateBoard(result.boards[0]), 1);
});

test("converts PBN auctions with alert notes", () => {
	const context = createContext({
		g_fullInfo: false,
		g_hands: {boards: []},
		g_title: "",
	});
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/pbn.mjs");
	const pbn = fs.readFileSync(`${root}/hands/test2.pbn`, "utf8");
	const result = JSON.parse(context.pbnToJson(pbn));

	assert.ok(result.boards.length > 0);
	assert.ok(result.boards.some((board) => (board.Bids || []).some((bid) => bid.includes("|"))));
});

test("preserves original PBN play order for export", () => {
	let savedPbn = "";
	const context = createContext({
		g_fullInfo: false,
		g_hands: {boards: []},
		g_title: "",
		g_lastBindex: 0,
		downloadFile: (data) => {
			savedPbn = data;
		},
		log: () => {},
	});
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/play.mjs");
	loadScript(context, "js/pbn.mjs");
	const pbn = [
		'[Event "Play order"]',
		'[Board "1"]',
		'[Dealer "N"]',
		'[Vulnerable "None"]',
		'[Deal "N:863.KQT93.A5.KJ5 KJT.854.KQJ2.864 AQ74.A.T986.A932 952.J762.743.QT7"]',
		'[Contract "1NT"]',
		'[Declarer "N"]',
		'[Result "7"]',
		'[Play "E"]',
		"SK SA S9 S8",
		"DK DT D3 DA",
		"",
	].join("\r\n");
	const board = JSON.parse(context.pbnToJson(pbn)).boards[0];

	assert.deepEqual(
		Array.from(board.OriginalPlayed),
		["SK", "SA", "S9", "S8", "DK", "DT", "D3", "DA"],
	);
	assert.equal(board.OriginalPlayLeader, "E");
	assert.deepEqual(
		Array.from(board.Played),
		["SK", "SA", "S9", "S8", "DT", "D3", "DA", "DK"],
	);
	assert.deepEqual(
		Array.from(context.getPlaySequenceForPBN(board, "E")),
		Array.from(board.OriginalPlayed),
	);
	assert.deepEqual(
		Array.from(context.getPlaySequenceForPBN({
			Contract: board.Contract,
			Played: board.Played,
		}, "E")),
		Array.from(board.OriginalPlayed),
	);

	board.Bids = [];
	context.g_hands = {boards: [board]};
	context.generatePBN(true);
	assert.match(savedPbn, /\[Play "E"\]\r\nSK SA S9 S8\r\nDK DT D3 DA\r\n/);
});

test("keeps the Traveller JSON fixture available", () => {
	const traveller = JSON.parse(
		fs.readFileSync(`${root}/test/fixtures/sample-traveller.json`, "utf8")
	);

	assert.equal(traveller.event.board.length, 26);
});

test("converts a LIN board into valid board JSON", () => {
	let savedPbn = "";
	const context = createContext({
		g_accTrans: {},
		g_hands: {},
		g_title: "",
		g_lastBindex: 0,
		downloadFile: (data) => {
			savedPbn = data;
		},
		log: () => {},
	});
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/play.mjs");
	loadScript(context, "js/pbn.mjs");
	loadScript(context, "js/import.mjs");
	const lin = fs.readFileSync(`${root}/hands/4399982054.lin`, "utf8");
	const result = JSON.parse(context.linToJson(lin));

	assert.ok(result.boards.length > 0);
	assert.ok(result.boards[0].board);
	assert.ok(result.boards[0].Vulnerable);
	assert.equal(result.boards[0].Deal.length, 4);

	const originalPlayed = Array.from(result.boards[0].Played);
	context.g_hands = {boards: [result.boards[0]]};
	context.generatePBN(true);
	assert.ok(savedPbn.includes("[Play "));

	const roundTripped = JSON.parse(context.pbnToJson(savedPbn));
	assert.deepEqual(Array.from(roundTripped.boards[0].Played), originalPlayed);
});

test("converts a DLM file into valid board JSON", () => {
	const context = createContext({g_fullInfo: false});
	loadScript(context, "js/import.mjs");
	const dlm = fs.readFileSync(`${root}/test/fixtures/Team2024.dlm`, "utf8");
	const result = JSON.parse(context.dlmToJson(dlm));

	assert.ok(result.boards.length > 0);
	assert.equal(result.boards[0].Deal.length, 4);
	assert.ok(result.boards[0].Dealer);
	assert.ok(result.boards[0].Vulnerable);
});

test("validates contracts and converts honour-card alphabets", () => {
	const context = createContext({g_sectionHeight: 400});
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/pbn.mjs");

	assert.equal(context.validateContract("4S"), true);
	assert.equal(context.validateContract("8S"), false);
	assert.equal(context.identifyHonourCardSet("AKQJ"), "english");
	assert.equal(context.convertToJQKA("AVD.R", "french"), "AJQ.K");
	assert.match(context.substituteSuitSymbol("4C"), /4.*club\.gif/);
	assert.match(context.substituteSuitSymbol("3DX"), /3.*diamond\.gif.*X/);
});

test("parses supported URL parameters into board and traveller settings", () => {
	const context = createContext({
		window: {location: {search: "?file=hands%2Fsample.pbn&xml=traveller.json&board=7&dealer=E&vul=NS"}},
		changeLanguage: () => {},
	});
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/pbn.mjs");
	loadScript(context, "js/bootstrap.mjs");
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
	loadScript(context, "js/bootstrap.mjs");
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
	loadScript(context, "js/localization.mjs");

	context.changeLanguage("de");
	assert.equal(labels.loadFile1.value, "Datei auswählen");
	assert.equal(labels.bsession.textContent, "Ergebnisanalyse");

	context.changeLanguage("en");
	assert.equal(labels.loadFile1.value, "Open file");
	assert.equal(labels.bsession.textContent, "Results Analysis");
});

test("positions pair-name popups near the hovered cell", () => {
	const context = createContext();
	loadScript(context, "js/ui-popups.mjs");

	const above = context.calculateNearbyPopupPosition(
		{left: 200, right: 240, top: 300, width: 40, height: 20},
		160, 30, 800, 600,
	);
	assert.equal(above.left, 140);
	assert.equal(above.top, 264);

	const right = context.calculateNearbyPopupPosition(
		{left: 20, right: 60, top: 10, width: 40, height: 20},
		160, 30, 800, 600,
	);
	assert.equal(right.left, 66);
	assert.equal(right.top, 5);
});

test("calculates representative bridge scores", () => {
	const context = createContext();
	loadScript(context, "js/scoring.mjs");

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

test("builds accuracy cache keys and counts trick concessions", () => {
	const context = createContext();
	loadScript(context, "js/accuracy.mjs");

	const board = {
		PlayerNames: ["South", "West", "North", "East"],
		Deal: ["AKQ.JT9.876.54", "2.345.9.AKQJT", "987.654.32.987", "JT65.2.AKQJT.3"],
		Contract: "3NT",
		Played: ["C2", "C3", "CK", "CA"],
	};

	assert.equal(context.makeAccKey(board), JSON.stringify({
		names: board.PlayerNames,
		deal: board.Deal,
		trumps: "N",
		cards: board.Played,
	}));
	assert.deepEqual(Array.from(context.tricksConceded({
		tricksConceded: [0, 1, 0, 2, 1],
		cardDirection: [0, 1, 2, 3, 1],
	})), [0, 2, 0, 1]);
});

test("handles accuracy worker responses with explicit context", async () => {
	const previous = {
		document: globalThis.document,
		$: globalThis.$,
		DOMPurify: globalThis.DOMPurify,
		g_timeout: globalThis.g_timeout,
		g_timeoutID: globalThis.g_timeoutID,
		language: globalThis.language,
	};
	const popup = {style: {}, innerHTML: ""};

	try {
		globalThis.document = {
			getElementById: (id) => id=="popup_box" ? popup : {style: {}},
		};
		globalThis.$ = () => ({finish: () => {}, show: () => {}, hide: () => {}});
		globalThis.DOMPurify = {sanitize: (value) => value};
		globalThis.g_timeout = "";
		globalThis.g_timeoutID = "";
		globalThis.language = "en";

		const accuracyUrl = pathToFileURL(`${root}/js/accuracy.mjs`).href + `?worker-load=${Date.now()}`;
		const {load} = await import(accuracyUrl);
		load(JSON.stringify({
			sess: {
				tricksConceded: [0, 1, 2],
				cardDirection: [0, 1, 3],
				declErr: 1,
				deltaElapsed: 2,
			}
		}), null, null, {
			names: ["South", "West", "North", "East"],
			declarer: "N",
			dest: 1,
		});

		assert.match(popup.innerHTML, /Accuracy of Play/);
	} finally {
		globalThis.document = previous.document;
		globalThis.$ = previous.$;
		globalThis.DOMPurify = previous.DOMPurify;
		globalThis.g_timeout = previous.g_timeout;
		globalThis.g_timeoutID = previous.g_timeoutID;
		globalThis.language = previous.language;
	}
});

test("does not set g_defaultContract when board has no replayable play data", () => {
	const elements = {};
	const createCell = () => ({innerHTML: "", style: {}, textContent: ""});
	const createRow = () => ({cells: [createCell(), createCell(), createCell(), createCell(), createCell()]});
	const getEl = (id) => {
		if (elements[id]) return elements[id];
		const el = {
			style: {},
			classList: {add: () => {}, remove: () => {}},
			rows: [createRow(), createRow(), createRow(), createRow(), createRow(), createRow(), createRow()],
			innerHTML: "",
			textContent: "",
			replaceChildren: () => {},
			deleteRow: () => { el.rows.pop(); }
		};
		return (elements[id] = el);
	};
	const context = createContext({
		document: {
			getElementById: getEl,
		},
		$: () => ({show: () => {}, hide: () => {}, finish: () => {}}),
		g_lastBindex: 0,
		g_file: "",
		g_test: 0,
		g_xml: "",
		g_hands: {
			boards: [{
				Contract: "3NT",
				Declarer: "N",
				Played: ["C2"], // only opening lead, no play sequence
				Bids: [],
				Deal: ["AK.QJ.T9.8765", "23.45.67.89TJQ", "45.67.89.AKQJT", "98.76.54.32"],
			}]
		},
		g_travellers: null,
		g_session: 0,
		g_credits: "credits",
		g_urqButtonHeight: "20px",
		g_urqButtFontSize: "12px",
		g_scoreFontSize: "12px",
		language: "de",
		appState: {},
		validContract: (c) => typeof c === "string" && c.length >= 2,
		setMode: () => {},
		setLastBoardIndex: (i) => { context.g_lastBindex = i; },
		hideMenuItems: () => {},
		showMainMenuItems: () => {},
		show: () => {},
		hide: () => {},
		callddd: () => {},
		setSession: () => {},
		clearCardData: () => {},
		createHandString: () => ({text: "", pts: 0, points: 0}),
		createCentreString: () => "",
		makeBoardNameString: () => "",
		setDealerChar: () => {},
		redrawMCTable: () => {},
		updateUpperLeftQuadrant: () => {},
		edit: () => {},
		calculateTricks: () => 0,
		showBidding: () => "",
		displayVulnerability: () => {},
		showMakeableContracts: () => {},
		showCredits: () => {},
		displayTraveller: () => {},
		hideAllPopups: () => {},
		hideRanking: () => {},
		displayErrorAbsPosition: () => {},
		setButtonColor: () => {},
		getPlayerInfo: () => null,
		played: () => true,
		drawBar: () => "",
		drawBoxedBar: () => "",
	});

	loadScript(context, "js/state.mjs");
	context.appState = context.window.appState;
	loadScript(context, "js/traveller.mjs");

	const passedNavigation = context.passedOutNavigationHTML("");
	assert.match(passedNavigation, /id=prevrow/);
	assert.match(passedNavigation, /id=nextrow/);
	assert.match(passedNavigation, /Durchgepasst/);
	assert.match(passedNavigation, /id=linPlay[^>]*disabled/);

	context.setupTraveller(0, true);

	context.setCurrentTrickCards(new Array(4));
	assert.ok(context.window.g_currentTrickCards);

	assert.equal(context.g_defaultContract, 0);
	assert.equal(context.g_defaultContractIndex, -1);

	// When play data exists, default contract should be set
	context.g_hands.boards[0].Played = ["C2", "C3", "CK", "CA"];
	context.setupTraveller(0, true);

	assert.equal(context.g_defaultContract, 1);
	assert.equal(context.g_defaultContractIndex, 4); // Declarer N (0 * 5) + suit NT (4) = 4

	// Verify showComparison runs without throwing ESM this-binding errors
	context.g_hands.boards[0].OptimumScore = "N 3NT;+400";
	assert.doesNotThrow(() => {
		context.showComparison();
	});

	// Verify computeTravellerStatistics executes without strict-mode undeclared variable errors
	context.g_currentTraveller = {
		traveller_line: [
			{ contract: "3NT", played_by: "N", ns_match_points: 100, ew_match_points: 0, crossImpsNS: 5, crossImpsEW: -5 }
		]
	};
	const mockTable = {
		deleteRow: () => {},
		insertRow: () => {},
		rows: [{ cells: [{}, {}, {}, { textContent: "" }] }]
	};
	mockTable.rows.push({
		insertCell: () => {},
		cells: Array.from({ length: 6 }, () => ({ style: {} }))
	});
	context.document.getElementById = (id) => (id === "contractTable" ? mockTable : { style: {}, replaceChildren: () => {} });

	assert.doesNotThrow(() => {
		context.computeTravellerStatistics(1);
	});
});

test("calculates ranking info from traveller data", async () => {
	const traveller = JSON.parse(
		fs.readFileSync(`${root}/test/fixtures/sample-traveller.json`, "utf8")
	);
	const previous = {
		g_travellers: globalThis.g_travellers,
		g_sessInfo: globalThis.g_sessInfo,
		g_eventType: globalThis.g_eventType,
		g_scoring: globalThis.g_scoring,
		g_validPercentageFields: globalThis.g_validPercentageFields,
		g_rankInfo: globalThis.g_rankInfo,
		g_maxImps: globalThis.g_maxImps,
		g_title: globalThis.g_title,
		g_uniquePairNumbers: globalThis.g_uniquePairNumbers,
	};

	try {
		globalThis.g_travellers = traveller;
		globalThis.g_sessInfo = null;
		globalThis.g_rankInfo = null;
		globalThis.g_uniquePairNumbers = "";
		globalThis.g_eventType = "Paarturnier";
		globalThis.g_scoring = "MatchPoints";
		globalThis.g_validPercentageFields = true;
		globalThis.g_maxImps = 0;

		const rankingUrl = pathToFileURL(`${root}/js/ranking.mjs`).href + `?test=${Date.now()}`;
		const { getRankingInfo } = await import(rankingUrl);
		const rankInfo = getRankingInfo();

		assert.ok(rankInfo.rankNS.length > 0);
		assert.equal(rankInfo.sessInfo.singleWinner, true);
	} finally {
		Object.assign(globalThis, previous);
	}
});

test("renders bidding table with dealer offset without error", () => {
	const createCell = () => ({innerHTML: "", style: {}, textContent: ""});
	const createTable = () => {
		const rows = [];
		return {
			style: {},
			rows,
			insertRow: () => {
				const cells = [];
				const r = {
					style: {},
					cells,
					insertCell: () => {
						const c = createCell();
						cells.push(c);
						return c;
					}
				};
				rows.push(r);
				return r;
			}
		};
	};
	const createDiv = () => {
		let children = [];
		return {
			style: {},
			appendChild: (child) => { children.push(child); },
			get innerHTML() {
				return children.map((c) => `<table id="${c.id || ''}">${c.rows ? c.rows.map(r => `<tr>${r.cells.map(cell => `<td>${cell.innerHTML}</td>`).join('')}</tr>`).join('') : ''}</table>`).join('');
			}
		};
	};
	const context = createContext({
		document: {
			createElement: (tag) => {
				if (tag === "table") return createTable();
				if (tag === "div") return createDiv();
				return {style: {}, appendChild: () => {}};
			},
		},
		g_lastBindex: 0,
		g_hands: {
			boards: [{
				Dealer: "E", // dealerIndex = 2 (W, N, E, S) -> 2 dashes inserted
				Vulnerable: "None",
				Bids: ["1H", "Pass", "2H", "Pass", "Pass", "Pass"],
			}]
		},
		g_bidFontSize: "14px",
		g_sectionHeight: 300,
	});

	loadScript(context, "js/board-renderer.mjs");
	const html = context.showBidding();
	assert.ok(typeof html === "string");
	assert.ok(html.includes("biddingHeader"));
	assert.ok(html.includes("biddingContent"));
});
