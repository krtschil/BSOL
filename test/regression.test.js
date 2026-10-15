const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const {pathToFileURL} = require("node:url");
const {createContext, loadScript, root} = require("./test-helpers");

test("parses only valid entries from OptimumScore", () => {
	const context = createContext();
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/traveller.mjs");

	assert.deepEqual(JSON.parse(JSON.stringify(context.parseOptimumScore(""))), []);
	assert.deepEqual(JSON.parse(JSON.stringify(context.parseOptimumScore("N 3N+1,; +430"))), [
		{direction: "N", contract: "3NT", score: "+430"},
	]);
	assert.deepEqual(JSON.parse(JSON.stringify(context.parseOptimumScore("N 3NT; +430"))), [
		{direction: "N", contract: "3NT", score: "+430"},
	]);
	assert.deepEqual(JSON.parse(JSON.stringify(context.parseOptimumScore("NS 4H,EW 3N; -420"))), [
		{direction: "NS", contract: "4H", score: "-420"},
		{direction: "EW", contract: "3NT", score: "-420"},
	]);
	assert.deepEqual(JSON.parse(JSON.stringify(context.parseOptimumScore("NS 3NT; +400<br>EW 3NT; -400"))), [
		{direction: "NS", contract: "3NT", score: "+400"},
		{direction: "EW", contract: "3NT", score: "-400"},
	]);
	assert.deepEqual(JSON.parse(JSON.stringify(context.parseOptimumScore("NS 4<span style='color:red'>&#9829;</span>x, NS 4&#9824;x; +500"))), [
		{direction: "NS", contract: "4H*", score: "+500"},
		{direction: "NS", contract: "4S*", score: "+500"},
	]);
	assert.deepEqual(JSON.parse(JSON.stringify(context.parseOptimumScore("NS 4H,NS 4S; +420<br>EW 3N; -400"))), [
		{direction: "NS", contract: "4H", score: "+420"},
		{direction: "NS", contract: "4S", score: "+420"},
		{direction: "EW", contract: "3NT", score: "-400"},
	]);
	assert.deepEqual(JSON.parse(JSON.stringify(context.parseOptimumScore("N/A; 0"))), []);
});

test("sorts optimal contracts together after played traveller rows", () => {
	const context = createContext({
		returnPoints: () => 0,
		comparePairNumbers: (a, b) => String(a).localeCompare(String(b)),
	});
	loadScript(context, "js/traveller.mjs");
	const playedOne = {ns_pair_number: "1", ew_pair_number: "2", contract: "4H", played_by: "N"};
	const optimumOne = {ns_pair_number: "", ew_pair_number: "", contract: "4S", played_by: "NS"};
	const playedTwo = {ns_pair_number: "3", ew_pair_number: "4", contract: "3NT", played_by: "E"};
	const optimumTwo = {ns_pair_number: "", ew_pair_number: "", contract: "4H", played_by: "NS"};
	const lines = [playedOne, optimumOne, playedTwo, optimumTwo];

	context.sortTravellerLines(lines, 1);

	assert.deepEqual(lines.slice(-2).map((line) => line.contract).sort(), ["4H", "4S"]);
	assert.ok(lines.slice(0, -2).every((line) => line.ns_pair_number!==""));
});

test("Board sorting puts optimal contracts first and orders scores from their direction", () => {
	const context = createContext({
		returnPoints: () => 0,
		comparePairNumbers: (a, b) => String(a).localeCompare(String(b)),
	});
	loadScript(context, "js/traveller.mjs");
	const playedRows = [
		{ns_pair_number: "1", ew_pair_number: "2", contract: "7NT", played_by: "N", score: "-100"},
		{ns_pair_number: "3", ew_pair_number: "4", contract: "1C", played_by: "S", score: "400"},
		{ns_pair_number: "5", ew_pair_number: "6", contract: "4H", played_by: "E", score: "140"},
		{ns_pair_number: "7", ew_pair_number: "8", contract: "NP", played_by: "", score: "60%"},
	];
	const optimum = [
		{ns_pair_number: "", ew_pair_number: "", contract: "4S", played_by: "NS", score: "420"},
		{ns_pair_number: "", ew_pair_number: "", contract: "4H", played_by: "NS", score: "420"},
	];
	for (const direction of [1, 2]) {
		const lines = [playedRows[0], optimum[0], ...playedRows.slice(1), optimum[1]];
		context.sortTravellerLines(lines, 3-direction, direction);
		assert.ok(lines.slice(0, 2).every((line) => line.ns_pair_number===""));
		assert.deepEqual(lines.slice(2).map((line) => line.score),
			direction===1 ? ["400", "140", "-100", "60%"] : ["-100", "140", "400", "60%"]);
	}
});

test("solver results preserve optimal contracts and directions for the Board view", () => {
	const context = createContext({
		g_hands: {boards: [{OptimumScore: ""}]},
		g_lastBindex: -1,
	});
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/board-renderer.mjs");
	loadScript(context, "js/traveller.mjs");

	context.updateParResults({
		contractsNS: "NS:NS 3C+1, NS 3D",
		contractsEW: "EW:EW 4H",
		scoreNS: "NS 130",
		scoreEW: "EW 420",
	}, 0);

	assert.deepEqual(JSON.parse(JSON.stringify(context.g_hands.boards[0].OptimumContracts)), [
		{direction: "NS", contract: "3C", score: "130"},
		{direction: "NS", contract: "3D", score: "130"},
		{direction: "EW", contract: "4H", score: "-420"},
	]);
	context.updateParResults({
		contractsNS: "NS:EW 3N",
		contractsEW: "EW:EW 3N",
		scoreNS: "NS -400",
		scoreEW: "EW 400",
	}, 0);
	assert.deepEqual(JSON.parse(JSON.stringify(context.g_hands.boards[0].OptimumContracts)), [
		{direction: "EW", contract: "3NT", score: "-400"},
	]);
	context.updateParResults({
		contractsNS: "NS:NS 5Hx, NS 5Cx",
		contractsEW: "EW:NS 5Hx, NS 5Cx",
		scoreNS: "NS -300",
		scoreEW: "EW 300",
	}, 0);
	assert.deepEqual(JSON.parse(JSON.stringify(context.g_hands.boards[0].OptimumContracts)), [
		{direction: "NS", contract: "5H*", score: "-300"},
		{direction: "NS", contract: "5C*", score: "-300"},
	]);
	assert.equal(JSON.parse(JSON.stringify(context.parseOptimumScore("3&#9827;; +130"))).length, 0);
});

test("pair ranking shows MP and one decimal percent without changing IMP or team columns", () => {
	function cell() {
		return {style: {}, textContent: "", innerHTML: "", colSpan: 1};
	}
	function row() {
		return {
			cells: [],
			insertCell(index) {
				const value = cell();
				this.cells.splice(index<0 ? this.cells.length : index, 0, value);
				return value;
			},
			deleteCell(index) { this.cells.splice(index, 1); },
			appendChild(value) { this.cells.push(value); },
			insertBefore(value, before) { this.cells.splice(this.cells.indexOf(before), 0, value); },
		};
	}
	const table = {
		rows: [row()],
		insertRow() {
			const value = row();
			this.rows.push(value);
			return value;
		},
		deleteRow(index) { this.rows.splice(index, 1); },
	};
	for (let i=0; i<5; i++) table.rows[0].insertCell(-1);
	const pairs = [
		{pair: 1, direction: 1, boardsPlayed: 12, percentage: "55.6789", percent: 55.6789, total_score: "123.5", plusMpts: 74.5,
			samePosition: "", position: 1, crossImpsBoardsPlayed: 24, crossImpsPerBoard: 1,
			dd: {ddOverH: 0, ddEqualsH: 0, ddUnderH: 0, ddUnknown: 12}},
		{pair: 2, direction: 2, boardsPlayed: 12, percentage: "50", percent: 50, total_score: "100", plusMpts: 60,
			samePosition: "", position: 2, crossImpsBoardsPlayed: 24, crossImpsPerBoard: 0,
			dd: {ddOverH: 0, ddEqualsH: 0, ddUnderH: 0, ddUnknown: 12}},
	];
	const context = createContext({
		g_hands: {pair_number: 1, direction: 1},
		g_eventType: "Paarturnier", g_scoring: "MatchPoints", g_validPercentageFields: true,
		g_travellers: {event: {participants: {pair: pairs}}},
		document: {
			getElementById: (id) => id==="rankingNS" ? table : null,
			createElement: () => cell(),
		},
		$: () => ({hide() {}, show() {}}),
	});
	loadScript(context, "js/ranking.mjs");
	Object.assign(context, {
		getSessionInfo: () => ({singleWinner: false}),
		getRankingInfo: () => ({rankNS: [pairs[0]], rankEW: [pairs[1]], rankCombined: pairs}),
		getPlayerInfo: () => ({pair_number: 1, direction: 1, player1: "A", player2: "B"}),
		ddComparisonAll() {}, setButtonColor() {}, hideAllPopups() {}, setCurrentTraveller() {},
		showRanking() {},
	});
	for (let i=0; i<2; i++) {
		context.setupRanking(true);
		assert.equal(table.rows[0].cells.length, 6);
		assert.equal(table.rows[0].cells[3].textContent, "MP");
		assert.equal(table.rows[0].cells[4].textContent, "%");
		assert.equal(table.rows[1].cells[0].colSpan, 7);
		assert.equal(table.rows[2].cells.length, 7);
		assert.equal(table.rows[2].cells[1].style.textAlign, "right");
		assert.equal(table.rows[2].cells[3].textContent, "74.5");
		assert.equal(table.rows[2].cells[4].textContent, "55.7");
		assert.equal(table.rows[3].cells[0].colSpan, 7);
		assert.equal(table.rows[4].cells[3].textContent, "60.0");
		assert.equal(table.rows[4].cells[4].textContent, "50.0");
		assert.match(table.rows[4].cells[6].innerHTML, /width:141px/);
	}
	context.g_validPercentageFields = false;
	context.g_scoring = "IMP";
	context.setupRanking(true);
	assert.equal(table.rows[0].cells.length, 5);
	assert.equal(table.rows[0].cells[3].textContent, "Points");
	assert.equal(table.rows[2].cells.length, 6);
	assert.equal(table.rows[2].cells[3].innerHTML, "123.50");
	context.g_eventType = "Teams";
	context.g_scoring = "VP";
	context.setupRanking(true);
	assert.equal(table.rows[0].cells.length, 7);
	assert.equal(table.rows[0].cells[3].textContent, "Victory points");
	assert.equal(table.rows[1].cells.length, 8);
	assert.equal(table.rows[1].cells[3].innerHTML, "123.50");
	context.g_eventType = "Paarturnier";
	context.g_scoring = "MatchPoints";
	context.g_validPercentageFields = true;
	context.setupRanking(true);
	assert.equal(table.rows[0].cells.length, 6);
	assert.equal(table.rows[0].cells[1].textContent, "Pair");
	assert.equal(table.rows[2].cells[4].textContent, "55.7");
});

test("pair board scorecard shows own score and matchpoints before percentage in both sort modes", () => {
	const scorecardHtml = fs.readFileSync(`${root}/html/overlays.html`, "utf8");
	assert.match(scorecardHtml, /<th id="scoring9">MP<\/th>/);
	assert.doesNotMatch(scorecardHtml, /<th id="scoring9" rowspan=/);
	assert.match(scorecardHtml, /<th id="scoring10">Anschrift<\/th>/);

	function createRow() {
		return {
			cells: [],
			style: {},
			insertCell() {
				const value = {style: {}, textContent: "", innerHTML: ""};
				this.cells.push(value);
				return value;
			},
		};
	}
	function createTable() {
		return {
			rows: [createRow(), createRow()],
			insertRow() {
				const value = createRow();
				this.rows.push(value);
				return value;
			},
			deleteRow(index) { this.rows.splice(index, 1); },
		};
	}
	const table = createTable();
	const stable = createTable();
	const matchPointsHeader = {style: {}};
	let barsColumn;
	const context = createContext({
		g_eventType: "Paarturnier",
		g_scoring: "MatchPoints",
		g_maxImps: 20,
		g_ofs: 1,
		g_currentTraveller: null,
		g_scorecardContext: [],
		g_hands: {direction: 2, boards: []},
		document: {
			getElementById: (id) => id==="scoring9" ? matchPointsHeader : null,
		},
	});
	loadScript(context, "js/ranking.mjs");
	Object.assign(context, {
		g_scorecardContext: [],
		setBars(cells, value, column) {
			barsColumn = column;
		},
		sortTravellerLines() {},
		getPlayerAndRole: () => ({found: true, tdirection: 2, declarer_pair: false, first: true, opp_pair: 2}),
		getPlayerInfo: () => ({player1: "Player One", player2: "Player Two"}),
		validContract: () => false,
		played: () => true,
		passed: () => false,
		addSummarySection() {},
		mergeScorecardRows() {},
	});
	const line = {
		ns_pair_number: 1, ew_pair_number: 2, ns_match_points: 6.567, ew_match_points: 3.433,
		score: 100, contract: "1NT", tricks: 7,
	};
	const info = {player1: "Player One", player2: "Player Two", pair_found: true};
	const session = {singleWinner: false};
	context.setupScorecard2(table, stable, [{board_no: 1, traveller_line: [line]}], info, session, 4, false);
	const roleSortedRow = table.rows.find((row) => row.cells[0] && String(row.cells[0].innerHTML)==="1");
	assert.ok(roleSortedRow);
	assert.equal(roleSortedRow.cells.length, 15);
	assert.equal(Number(roleSortedRow.cells[10].textContent), -100);
	assert.equal(roleSortedRow.cells[11].textContent, "3.4");
	assert.equal(roleSortedRow.cells[12].innerHTML, "34%");

	context.setupScorecard2(table, stable, [{board_no: 1, traveller_line: [line]}], info, session, 4, true);
	const resultRow = table.rows.find((row) => row.cells[0] && String(row.cells[0].innerHTML)==="1");
	assert.ok(resultRow);
	assert.equal(matchPointsHeader.style.display, "");
	assert.equal(resultRow.cells.length, 15);
	assert.equal(Number(resultRow.cells[10].textContent), -100);
	assert.equal(resultRow.cells[10].style.borderRight, "1px solid #aaa");
	assert.equal(resultRow.cells[11].textContent, "3.4");
	assert.equal(resultRow.cells[12].innerHTML, "34%");
	assert.equal(barsColumn, 13);

	context.g_scoring = "IMP";
	context.setupScorecard2(table, stable, [{board_no: 1, traveller_line: [line]}], info, session, 4, true);
	const impResultRow = table.rows.find((row) => row.cells[0] && String(row.cells[0].innerHTML)==="1");
	assert.equal(matchPointsHeader.style.display, "none");
	assert.equal(Number(impResultRow.cells[10].textContent), -100);
	assert.equal(impResultRow.cells[11].style.display, "none");
	assert.equal(Number(impResultRow.cells[12].innerHTML), 3.433);

	context.getPlayerAndRole = () => ({found: true, tdirection: 1, declarer_pair: false, first: true, opp_pair: 2});
	for (const score of [100, -400, 0, "", undefined, "60%"]) {
		line.score = score;
		context.setupScorecard2(table, stable, [{board_no: 1, traveller_line: [line]}], info, session, 4, true);
		const scoreRow = table.rows.find((row) => row.cells[0] && String(row.cells[0].innerHTML)==="1");
		assert.equal(String(scoreRow.cells[10].textContent), String(score ?? ""));
	}
});

test("team board results combine both tables and preserve rounds and Butler signs", () => {
	const context = createContext();
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/ranking.mjs");
	context.g_scoreToImps = [[0, 10, 0], [20, 40, 1], [50, 80, 2], [90, 120, 3], [130, 160, 4]];
	const event = {
		board: [
			{board_no: 2, butler_datum: 100, traveller_line: [
				{ns_pair_number: "1", ew_pair_number: "2", score: 110, round: 1},
				{ns_pair_number: "2", ew_pair_number: "1", score: -50, round: 1},
			]},
			{board_no: 1, butler_datum: 0, traveller_line: [
				{ns_pair_number: "1", ew_pair_number: "2", score: 50, round: 1},
				{ns_pair_number: "2", ew_pair_number: "1", score: 50, round: 1},
			]},
			{board_no: 3, traveller_line: [
				{ns_pair_number: "1", ew_pair_number: "2", score: 0, round: 2},
				{ns_pair_number: "2", ew_pair_number: "1", score: 0, round: 2},
			]},
		],
		team_matches: [{round: 1, home_team: 2, visiting_team: 1, home_imps: 0, visiting_imps: 4}],
	};
	const groups = context.getTeamBoardResults(event, "1");
	assert.equal(groups.length, 2);
	assert.equal(groups[0].boards[0].board, 1);
	assert.equal(groups[0].boards[1].difference, 160);
	assert.equal(groups[0].boards[1].imps, 4);
	assert.equal(groups[0].boards[1].butlerNS, 0);
	assert.equal(groups[0].boards[1].butlerEW, 4);
	assert.equal(groups[0].match.visiting_imps, 4);
	assert.equal(groups[1].boards[0].butlerNS, null);
	const reverse = context.getTeamBoardResults(event, 2);
	assert.equal(reverse[0].boards[1].difference, -160);
	assert.equal(reverse[0].boards[1].imps, -4);
});

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

test("rejects a CSV file masquerading as a PBN file", () => {
	const alerts = [];
	let spinnerHidden = false;
	const context = createContext({
		g_file: "invalid.pbn",
		g_fullInfo: false,
		g_hands: {boards: []},
		g_lastBindex: 0,
		alert: (message) => alerts.push(message),
		hideSpinner: () => {
			spinnerHidden = true;
		},
	});
	loadScript(context, "js/scoring.mjs");
	loadScript(context, "js/pbn.mjs");
	loadScript(context, "js/import.mjs");

	context.loadHands_1(
		"Board;Contract;Declarer;Result;NS;EW\n1;3NT;N;+1;430;0\n",
		"success",
		null,
		{}
	);

	assert.equal(spinnerHidden, true);
	assert.deepEqual(alerts, ["The file does not contain valid PBN, DLM, or LIN data."]);
	assert.deepEqual(context.g_hands.boards, []);
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

	const passedNavigation = context.passedOutNavigationHTML("", "73.33%");
	assert.match(passedNavigation, /id=prevrow/);
	assert.match(passedNavigation, /id=nextrow/);
	assert.match(passedNavigation, /Durchgepasst/);
	assert.match(passedNavigation, /id=linPlay[^>]*disabled/);
	assert.match(passedNavigation, /NS: 73\.33%.*EW: 26\.67%/);

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
