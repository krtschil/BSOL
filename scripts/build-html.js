const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const fragments = [
	"head.html",
	"start.html",
	"main-view.html",
	"overlays.html",
	"footer.html",
];

const index = fragments
	.map((fragment) => fs.readFileSync(path.join(root, "html", fragment), "utf8").trimEnd())
	.join("\n\n") + "\n";

fs.writeFileSync(path.join(root, "index.html"), index);
