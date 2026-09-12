function callAnalysisFunction(index)
{
	if (index==0) setupRanking();
	else if (index==1) setupScorecard();
	else if (index==2) showComparison();
}

function gotoSession()
{
	g_playItAgain = false;
	log("button=session");
	if (g_sessionMode=="ranking") getHands({callback:setupRanking});
	else if (g_sessionMode=="scorecard") getHands({callback:setupScorecard});
	else if (g_sessionMode=="check") getHands({callback:checkAllContracts});
	else getHands({callback:showComparison});
}

function sessionHelp()
{
	var tag = g_sessionMode;

	window.open("bsolhelp.htm#" + tag);
}
