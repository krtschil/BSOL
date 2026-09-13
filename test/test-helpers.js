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
	let source = fs.readFileSync(filename, "utf8");

	// Files ending in .mjs are real ES modules (`export function foo(){}`).
	// The regression tests run everything in a single shared vm context
	// (matching the browser's shared global scope), so strip the `export`
	// keyword rather than pulling in a full ES module loader.
	if (filename.endsWith(".mjs"))
		source = source.replace(/^export (function|const|let|var)/gm, "$1");

	vm.runInContext(source, context, {filename});
}

module.exports = {createContext, loadScript, root};
