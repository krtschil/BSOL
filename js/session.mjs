import { log } from "./network.mjs";

export function callAnalysisFunction(index)
{
	if (index==0) setupRanking();
	else if (index==1) setupScorecard();
	else if (index==2) showComparison();
}

export function gotoSession()
{
	g_playItAgain = false;
	log("button=session");
	if (g_sessionMode=="ranking") getHands({callback:setupRanking});
	else if (g_sessionMode=="scorecard") getHands({callback:setupScorecard});
	else if (g_sessionMode=="check") getHands({callback:checkAllContracts});
	else getHands({callback:showComparison});
}

export function sessionHelp()
{
	var tag = g_sessionMode;

	window.open("bsolhelp.htm#" + tag);
}

// Window-bridge: expose these functions as globals so legacy classic
// scripts (bootstrap.js, events.js) can keep calling them unchanged.
// Remove entries here once every caller has been migrated to `import`.
if (typeof window !== "undefined")
{
	Object.assign(window, {
		callAnalysisFunction,
		gotoSession,
		sessionHelp,
	});
}
