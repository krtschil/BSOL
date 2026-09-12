const {execFileSync} = require("node:child_process");

execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
	stdio: "inherit",
});
