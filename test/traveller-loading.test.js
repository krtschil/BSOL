const assert = require("node:assert/strict");
const test = require("node:test");
const {createContext, loadScript} = require("./test-helpers");

function requestContext(overrides = {}) {
	const requests = [];
	const loaded = [];
	const alerts = [];
	let completed = 0;
	const context = createContext({
		g_file: "https://results.example/events/20261014.pbn",
		g_xml: "",
		g_test: 0,
		g_travellers: null,
		largeSpinner: () => {},
		hideSpinner: () => {},
		resetTimeout: () => {},
		clearTravellersLocalStorage: () => {},
		alert: message => alerts.push(message),
		...overrides,
	});
	loadScript(context, "js/traveller.mjs");
	context.loadTraveller = function(data) {
		loaded.push({source: context.g_xml, data});
		this.callback();
	};
	context.loadTraveller_1 = (data, status, xhr, caller) => {
		loaded.push({source: context.g_xml, data});
		caller.callback();
	};
	context.doRequestHTMLasync = (url, success, failure, caller) =>
		requests.push({url, success, failure, caller});
	const caller = {callback: () => completed++};
	return {context, requests, loaded, alerts, caller, completed: () => completed};
}

test("PBN companion URLs preserve the source directory, query and fragment", () => {
	const {context} = requestContext();
	for (const source of [
		"https://other.example/a/board.PBN?token=123#board",
		"hands/board.pbn?token=123#board",
		"/hands/board.pbn?token=123#board",
	]) {
		assert.deepEqual(Array.from(context.getAssociatedTravellerUrls(source)),
			["xml", "json"].map(ext => source.replace(/\.pbn/i, "." + ext)));
	}
	for (const source of [1, "", "board.lin", "board.dlm", "download?file=board.pbn"])
		assert.deepEqual(Array.from(context.getAssociatedTravellerUrls(source)), []);
});

test("automatic discovery prefers XML and loads it through the normal traveller path", () => {
	const state = requestContext();
	state.context.getTraveller(state.caller);
	assert.equal(state.requests.length, 1);
	assert.equal(state.requests[0].url, "https://results.example/events/20261014.xml");
	state.requests[0].success("<USEBIO />", "success", {});
	assert.deepEqual(state.loaded, [{
		source: "https://results.example/events/20261014.xml",
		data: "<USEBIO />",
	}]);
	assert.equal(state.requests.length, 1);
	assert.equal(state.completed(), 1);
});

test("automatic discovery falls back to JSON only when XML is absent", () => {
	for (const status of [404, 410]) {
		const state = requestContext();
		state.context.getTraveller(state.caller);
		state.requests[0].failure({status}, "error", "Not Found");
		assert.equal(state.requests[1].url, "https://results.example/events/20261014.json");
		state.requests[1].success('{"event":{}}', "success", {});
		assert.equal(state.loaded[0].source, state.requests[1].url);
		assert.equal(state.completed(), 1);
		assert.equal(state.alerts.length, 0);
	}
});

test("absent XML and JSON leave the PBN usable without an alert", () => {
	const state = requestContext();
	state.context.getTraveller(state.caller);
	state.requests[0].failure({status: 404}, "error", "Not Found");
	state.requests[1].failure({status: 404}, "error", "Not Found");
	assert.equal(state.context.g_xml, "");
	assert.equal(state.completed(), 1);
	assert.equal(state.alerts.length, 0);
	assert.equal(state.loaded.length, 0);
});

test("discovery reports network, CORS and server errors without pretending a file is absent", () => {
	for (const status of [0, 403, 500]) {
		const errors = [];
		const state = requestContext({console: {error: (...args) => errors.push(args)}});
		state.context.getTraveller(state.caller);
		state.requests[0].failure({status}, "error", "Failed");
		assert.equal(state.requests.length, 1);
		assert.equal(state.completed(), 1);
		assert.equal(state.alerts.length, 1);
		assert.equal(errors.length, 1);
		assert.equal(state.context.g_xml, "");
	}
});

test("an explicit traveller URL or literal disables discovery", () => {
	const url = requestContext({g_xml: "https://other.example/custom.json"});
	url.context.getTraveller(url.caller);
	assert.deepEqual(url.requests.map(request => request.url), ["https://other.example/custom.json"]);
	url.requests[0].failure.call(url.caller, {status: 404}, "error", "Not Found");
	assert.equal(url.requests.length, 1);
	assert.equal(url.completed(), 1);

	const literal = requestContext({g_xml: 1, g_xmlstr: "<USEBIO />"});
	literal.context.getTraveller(literal.caller);
	assert.equal(literal.requests.length, 0);
	assert.equal(literal.loaded[0].data, "<USEBIO />");
	assert.equal(literal.completed(), 1);
});

test("PBN URLs enter the traveller path, including query strings; local standalone files do not", () => {
	for (const source of ["https://example.com/board.PBN?token=123", "board.pbn", 1, "board.lin"]) {
		const travellerCalls = [];
		const parsed = [];
		let completed = 0;
		const context = createContext({
			g_file: source,
			g_xml: "",
			g_hands: {boards: [{board: "1"}]},
			g_lastBindex: 0,
			pbnToJson: text => {parsed.push(text); return '{"boards":[{"board":"1"}]}';},
			validateBoard: () => 1,
			getTindexByName: () => 0,
			setLastBoardIndex: () => {},
			setupTraveller: () => {},
			getTraveller: () => travellerCalls.push(true),
			enterPlayMode: () => {},
			hideSpinner: () => {},
			resetTimeout: () => {},
		});
		loadScript(context, "js/traveller.mjs");
		context.getTraveller = () => travellerCalls.push(true);
		context.setupTraveller = () => {};
		loadScript(context, "js/import.mjs");
		context.linToJson = () => '{"boards":[{"board":"1"}]}';
		context.loadHands_1(source === 1 ? '{"boards":[{"board":"1"}]}' : "hand content",
			"success", null, {callback: () => completed++});
		const isPbnUrl = typeof source === "string" && !source.endsWith(".lin");
		assert.equal(travellerCalls.length, isPbnUrl ? 1 : 0);
		assert.equal(completed, isPbnUrl ? 0 : 1);
		if (isPbnUrl)
			assert.deepEqual(parsed, ["hand content"]);
	}
});

function selectionContext() {
	const builds = [];
	const alerts = [];
	const reads = [];
	const labels = [];
	const context = createContext({
		alert: message => alerts.push(message),
		buildPage: data => builds.push(data),
		console: {error: () => {}},
		document: {getElementById: () => ({replaceChildren: text => labels.push(text)})},
		DOMPurify: {sanitize: text => text},
	});
	loadScript(context, "js/import.mjs");
	const file = (name, content = name) => ({
		name,
		text: async () => {reads.push(name); return content;},
	});
	const select = async files => {
		const target = {files, value: "selected"};
		await context.handleLoadFileSelect({target});
		assert.equal(target.value, "");
	};
	return {context, builds, alerts, reads, labels, file, select};
}

test("local selection accepts a single PBN, LIN or DLM without a traveller", async () => {
	for (const extension of ["pbn", "LIN", "dlm"]) {
		const state = selectionContext();
		await state.select([state.file("test." + extension)]);
		assert.equal(state.builds.length, 1);
		assert.equal(state.builds[0].handstrType, extension.toLowerCase());
		assert.equal(state.builds[0].xmlstr, undefined);
		assert.equal(state.alerts.length, 0);
	}
});

test("local PBN and XML/JSON are loaded together regardless of selection order", async () => {
	for (const extension of ["xml", "JSON"]) {
		for (const reverse of [false, true]) {
			const state = selectionContext();
			const files = [state.file("board.PBN", "PBN content"), state.file("results." + extension, "traveller content")];
			await state.select(reverse ? files.reverse() : files);
			assert.equal(state.builds.length, 1);
			assert.equal(state.builds[0].handstr, "PBN content");
			assert.equal(state.builds[0].handstrType, "pbn");
			assert.equal(state.builds[0].xmlstr, "traveller content");
			assert.equal(state.alerts.length, 0);
			assert.match(state.labels[0], /board.PBN/);
			assert.match(state.labels[0], /results./);
		}
	}
});

test("invalid selections are rejected before reading files or replacing the current session", async () => {
	for (const names of [
		["board.xml"], ["board.json"], ["board.txt"],
		["board.pbn", "other.pbn"], ["board.xml", "board.json"],
		["board.lin", "board.xml"], ["board.dlm", "board.json"],
		["board.pbn", "board.txt"], ["board.pbn", "board.xml", "board.json"],
	]) {
		const state = selectionContext();
		await state.select(names.map(name => state.file(name)));
		assert.equal(state.alerts.length, 1, names.join(", "));
		assert.equal(state.reads.length, 0);
		assert.equal(state.builds.length, 0);
		assert.equal(state.labels.length, 0);
	}
	const cancelled = selectionContext();
	await cancelled.select([]);
	assert.equal(cancelled.alerts.length, 0);
});

test("a local read failure leaves the current session unchanged", async () => {
	const state = selectionContext();
	await state.select([state.file("board.pbn"), {
		name: "board.xml",
		text: async () => {throw new Error("Permission denied");},
	}]);
	assert.equal(state.builds.length, 0);
	assert.equal(state.labels.length, 0);
	assert.equal(state.alerts.length, 1);
});
