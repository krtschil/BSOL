function updateUpperLeftQuadrant(boardIndex)
{
	var btable;
	var optFontSize = Math.floor(g_sectionHeight/7) + "px";
	var lottFontSize = Math.floor(g_sectionHeight/9) + "px";

	/* Check for validity (number of cards)*/
	if (checkBoardValid(boardIndex))
	{
		var lottStr = "<br><div style=\"margin-top:5px;\"><span id=lott style=\"font-size:" + lottFontSize + ";font-weight:bold;\">LoTT: " + lott() + "</span></div>";
	} else {
		let deal = g_hands.boards[boardIndex].Deal;
		let cn = deal[0].length -3;
		let ce = deal[1].length -3;
		let cs = deal[2].length -3;
		let cw = deal[3].length -3;
		switch(language)
		{
			case "de":
				var lottStr = "<br><div style=\"margin-top:5px;background-color:lightpink;\"><span id=lott style=\"font-size:" + lottFontSize + ";font-weight:bold;\">Ungültiges Board: <br>N:" + cn + " O:" + ce + " S:" + cs + " W:" + cw + " Karten</span></div>";
				break;
			default:
				var lottStr = "<br><div style=\"margin-top:5px;background-color:lightpink;\"><span id=lott style=\"font-size:" + lottFontSize + ";font-weight:bold;\">Invalid board: <br>N:" + cn + " E:" + ce + " S:" + cs + " W:" + cw + " cards</span></div>";
		}

	}
	//var lottStr = "<br><div style=\"margin-top:5px;\"><span id=lott style=\"font-size:" + lottFontSize + ";font-weight:bold;\">LoTT: " + lott() + "</span></div>";

	btable = document.getElementById("board");

	var ocell = btable.rows[0].cells[0];
	ocell.textContent = "";

	var names = "";
	var namesFound = true;

	if ((typeof g_hands.boards[boardIndex].PlayerNames)!="undefined")
	{
		if (g_hands.boards[boardIndex].PlayerNames.length>0)
			names = g_hands.boards[boardIndex].PlayerNames;
		else
			namesFound = false;
	}
	else if ((typeof g_hands.PlayerNames)!="undefined")
	{
		names = g_hands.PlayerNames;
	}
	else
	{
		namesFound = false;
	}

	if (namesFound)
	{
		var k;
		var namstr = "<div style=\"text-align:left;border:1px solid grey;padding:2px;margin-left:10px;margin-right:10px;\">";
		var boardName = g_hands.boards[boardIndex].board;
		var namOffset = 0;
		if ((boardName.indexOf(".Closed")!=-1)&&(names.length==8)) namOffset = 4;
		var northName = names[namOffset + 2];
		var southName = names[namOffset];
		var westName = names[namOffset + 1];
		var eastName = names[namOffset + 3];

		namstr = namstr + "<span id=namstr style=\"font-weight:bold;font-size:" + g_namSize + ";\">" + "N: " + northName + "<br>" + "S: " + southName + "<br>";
		namstr = namstr + "E: " + eastName + "<br>W: " + westName + "</span><br>";

		ocell.style.verticalAlign = "top";
		namstr += "</div>";
		//ocell.replaceChildren(sanitizeExplanation(namstr)); //innerHTML = namstr + "</div>";
		ocell.innerHTML = DOMPurify.sanitize(namstr);
	}
	else
	{
		ocell.style.verticalAlign = "middle";
	}

	if ((typeof g_hands.boards[boardIndex].OptimumScore)!="undefined")
	{
		if (g_hands.boards[boardIndex].OptimumScore!="")
			ocell.innerHTML = ocell.innerHTML + "<span id=optStr style=\"font-weight:bold;font-size:" + optFontSize + ";\">Optimum:" + "<br>" + g_hands.boards[boardIndex].OptimumScore + "</span>" + lottStr;
	}
	else
	{
		ocell.innerHTML = ocell.innerHTML + lottStr;
	}

	if ((typeof g_hands.boards[boardIndex].Explanation !="undefined") &&  g_hands.boards[boardIndex].Explanation != ""){
		var exp = g_hands.boards[boardIndex].Explanation;
		//exp = exp.replaceAll("\C","Treff");
		//exp = exp.replaceAll("\D","Karo");
		//exp = exp.replaceAll("\S","Pik");
		exp = exp.replaceAll("}","");
		exp = exp.replaceAll("{","");

		var explanation = document.getElementById("explanation");
		var legend = document.createElement("legend");
		legend.id = "explanation-legend";

		switch (language)
		{
			case "de":
				legend.textContent = "Erläuterung zum Board";
				break;
			default:
				legend.textContent = "Explanation";
		}

		const clean = DOMPurify.sanitize(exp, { RETURN_DOM_FRAGMENT: true });
		explanation.replaceChildren(legend,clean);
		explanation.style.display = "block";
	} else {
		document.getElementById("explanation").style.display = "none";
	}

	if ((typeof g_hands.boards[boardIndex].ScoreTable !="undefined") &&  g_hands.boards[boardIndex].ScoreTable != "")
	{
		var st = g_hands.boards[boardIndex].ScoreTable;


		if (typeof g_hands.boards[boardIndex].ScoreTableH != "undefined")
		{
			var stH = g_hands.boards[boardIndex].ScoreTableH;
			const clean = DOMPurify.sanitize(stH+st, { RETURN_DOM_FRAGMENT: true });
			//document.getElementById("output").replaceChildren(sanitizeExplanation(stH+st)); //innerHTML = stH + st;
			document.getElementById("output").replaceChildren(clean);
		} else {
			//document.getElementById("output").replaceChildren(sanitizeExplanation("Kon AS St  Score  NS    EW  MP mp " + st)); //innerHTML = "Kon AS St  Score  NS    EW  MP mp " + st;
			const clean = DOMPurify.sanitize("Kon AS St  Score  NS    EW  MP mp " + st, { RETURN_DOM_FRAGMENT: true });
			document.getElementById("output").replaceChildren(clean);
		}
		document.getElementById("output").style.display = "block";
	} else {
		document.getElementById("output").style.display = "none";
	}
}

