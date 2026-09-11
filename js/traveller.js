function getRowFromTraveller(pair,direction)
{
	var i;
	var info = getSessionInfo();
	var singleWinner = info.singleWinner;

	var tlines = g_currentTraveller.traveller_line;


	for (i=0;i<tlines.length;i++)
	{
		var line = tlines[i];

		if ((((direction==1)||singleWinner)&&(line.ns_pair_number==pair))||(((direction==2)||singleWinner)&&(line.ew_pair_number==pair)))
		{
//			alert("getRowFromTraveller: pair/direction/row: " + pair + "/" + direction + "/" + i + " " + JSON.stringify(line));
			return i;
		}
	}

	return -1;	// Indicates not found in any traveller
}

function getInfoForSimilarContracts(lineIndex,direction)
{
	var i;
	var traveller = g_currentTraveller.traveller_line;
	var curLine = traveller[lineIndex];
	var suit = curLine.contract.charAt(1);
	var declarer = curLine.played_by;
	var level = Number(curLine.contract.charAt(0));

	var result = {};
	result.totalPairs = traveller.length;
	result.totalThisSuitAndDeclarer = 0;
	result.moreTricks = 0;
	result.sameTricks = 0;
	result.lessTricks = 0;
	result.bidPartScore = 0;
	result.madePartScore = 0;
	result.bidGameScore = 0;
	result.madeGameScore = 0;
	result.bidSmallSlam = 0;
	result.madeSmallSlam = 0;
	result.bidGrandSlam = 0;
	result.madeGrandSlam = 0;

	for (i=0;i<traveller.length;i++)
	{
		if (i!=lineIndex)
		{
			var t = traveller[i];

			if ((t.contract.charAt(1)==suit)&&(declarer==t.played_by))
			{
				result.totalThisSuitAndDeclarer++;


			}
		}
	}

	var playedByPercent = Math.round((100*(result.totalThisSuitAndDeclarer+1))/(result.totalPairs));

	switch(language)
	{
		case "de":
			var str = "Diese Farbe/Alleinspieler-Kombination wurde an " + result.totalThisSuitAndDeclarer + " von " + result.totalPairs + " anderen Tischen (" + playedByPercent + "%).";
			break;
		default:
			var str = "This suit/declarer combination was played at " + result.totalThisSuitAndDeclarer + " of " + result.totalPairs + " other tables (" + playedByPercent + "%).";
	}
	
	const clean = DOMPurify.sanitize(document.getElementById("comparisonText").innerHTML + "<span style=\"font-size:12px;\"><br><br><p>" + str + "</p></span>", { RETURN_DOM_FRAGMENT: true });
	document.getElementById("comparisonText").replaceChildren(clean);
	//document.getElementById("comparisonText").innerHTML = document.getElementById("comparisonText").innerHTML + "<span style=\"font-size:12px;\"><br><br><p>" + str + "</p></span>";

	return result;
}