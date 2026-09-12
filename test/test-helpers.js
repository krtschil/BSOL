const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function createContext(overrides = {})
{
	const context = {
		console,
		URLSearchParams,
		alert: () => {},
		language: "en",
		window: {location: {search: ""}},
		document: {
			getElementById: () => ({
				style: {},
				replaceChildren: () => {},
			}),
		},
		DOMPurify: {
			sanitize: (value) => value,
		},
		...overrides
	};

	context.globalThis = context;
	vm.createContext(context);
	return context;
}

function loadScript(context, relativePath)
{
	const filename = path.join(root, relativePath);
	vm.runInContext(fs.readFileSync(filename, "utf8"), context, {filename});
}

module.exports = {createContext, loadScript, root};
