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

function redrawMCTable(large)
{
	var i,j,value;
	switch(language)
	{
		case "de":
			var labels = "NSOW";
			break;
		default:
			var labels = "NSEW";
	}
	var contracts;

	if (large)
		contracts = document.getElementById("makeableContracts");
	else
		contracts = document.getElementById("miniMakeableContracts");

	var rows = contracts.rows;
	var buttonHeight = Math.round(g_sectionHeight/5);
	var buttonTextHeight = Math.round((buttonHeight*4.5)/7) + "px";

	if (!large)
		buttonTextHeight = Math.round((buttonHeight*4)/12) + "px";

	var symbolHeight = "15px";

	if (!large) symbolHeight = "8px";

	var cardSymbols = ["<img alt=\"Spade\" style=\"height:" + symbolHeight + "\" src=\"pics/spade.gif\">","<img alt=\"Heart\"style=\"height:" + symbolHeight + "\" src=\"pics/heart.gif\">","<img alt=\"Diamond\" style=\"height:" + symbolHeight + "\" src=\"pics/diamond.gif\">","<img alt=\"Club\" style=\"height:" + symbolHeight + "\" src=\"pics/club.gif\">"];
	var cells = rows[0].cells;

	cells[0].textContent = "";
	switch(language)
	{
		case "de":
			cells[5].innerHTML = "<span style=\"font-size:" + symbolHeight + ";\">SA</span>";
			break;
		default:
			cells[5].innerHTML = "<span style=\"font-size:" + symbolHeight + ";\">NT</span>";
	}
	cells[4].innerHTML = cardSymbols[0];
	cells[3].innerHTML = cardSymbols[1];
	cells[2].innerHTML = cardSymbols[2];
	cells[1].innerHTML = cardSymbols[3];

	var cvector = g_hands.boards[g_lastBindex].DoubleDummyTricks;
	contracts.setAttribute("data-contracts",cvector);

	var showContracts = document.getElementById("mkrad1").checked;

	var suits = "NSHDC";
	var directions = "NSEW";
	var defSuit;
	var defDeclarer;

	if (g_defaultContract!=0)
	{
		if (g_hands.boards[g_lastBindex].Contract === undefined)
		{
			//console.log("Undefined:: " + (g_hands.boards[g_lastBindex].Contract));
			defSuit = "NP";
		}
		else
		{
			//console.log("Contract: " + g_hands.boards[g_lastBindex].Contract);
			defSuit = suits.indexOf(g_hands.boards[g_lastBindex].Contract.charAt(1));

		}
		defDeclarer = directions.indexOf(g_hands.boards[g_lastBindex].Declarer);
		//defSuit = suits.indexOf(g_hands.boards[g_lastBindex].Contract.charAt(1));
	}

	for (i=0;i<4;i++)
	{
		rows[1+i].cells[0].innerHTML = "<span style=\"font-size:" + buttonTextHeight + ";\">" + labels.charAt(i) + "</span>";

		for (j=0;j<5;j++)
		{
			value = "*";

			if ((cvector.charAt(j+5*i)!="*")&&(cvector.charAt(j+5*i)!="-"))
			{
				value = parseInt(cvector.charAt(j+5*i),16);

				if (showContracts)
				{
					if (value<7)
						value = "-";
					else
						value = value - 6;
				}
			}
			else if ((!showContracts)&&(cvector.charAt(j+5*i)=="-"))
				value = "*";
			else
				value = cvector.charAt(j+5*i);

			var bcolor = "";

			if ((g_defaultContract!=0)&&(i==defDeclarer)&&(j==defSuit))
				bcolor = "background-color:#FFFF00;";

			if (large)
				rows[1+i].cells[1+4-j].innerHTML = "<button class=menuButton style=\"min-width:0px;width:42px;max-width:42px;max-height:" + buttonHeight + "px;" + bcolor + "\">" + "<span style=\"font-style:normal;font-size:" + buttonTextHeight + ";\">" + value + "</span></button>";
			else
				rows[1+i].cells[1+4-j].innerHTML = "<span style=\"font-size:10px;" + bcolor + "\">" + value + "</span>";

		}
	}
}

function displayVulnerability(vul,dealer)
{
	var vcolor = "#FF0000";
	var nvcolor = "#00FF00";
	var nscolor,ewcolor;

	nscolor = ewcolor = nvcolor;

	if (vul=="All")
		nscolor = ewcolor = vcolor;
	else if (vul=="NS")
		nscolor = vcolor;
	else if (vul=="EW")
		ewcolor = vcolor;

	document.getElementById("nvul").style.backgroundColor = nscolor;
	document.getElementById("wvul").style.backgroundColor = ewcolor;
	document.getElementById("evul").style.backgroundColor = ewcolor;
	document.getElementById("svul").style.backgroundColor = nscolor;
	displayDealer(dealer,vul);
}

function displayDealer(dealer,vul)
{
        dealer = dealer.charAt(0);

		document.getElementById("nvul").textContent = "";
		document.getElementById("wvul").textContent = "";
		document.getElementById("evul").textContent = "";
		document.getElementById("svul").textContent = "";

		if (dealer=="N")
			setDealerChar("North",vul);
		else if (dealer=="W")
			setDealerChar("West",vul);
		else if (dealer=="E")
			setDealerChar("East",vul);
		else if (dealer=="S")
			setDealerChar("South",vul);
}

function setDealerChar(dir,vul)
{
		var dealerCharWhite = "<span id=dealerChar style=\"font-size:" + g_dealerFontSize + "px;color:white;\">&#9679</span>";
		var dealerCharBlue = "<span id=dealerChar style=\"font-size:" + g_dealerFontSize + "px;color:#0088ff;\">&#9679</span>";
		var dealerChar = dealerCharBlue;

		if (vul=="All")
			dealerChar = dealerCharWhite;
		else if ((vul=="NS")&&((dir=="North")||(dir=="South")))
			dealerChar = dealerCharWhite;
		else if ((vul=="EW")&&((dir=="East")||(dir=="West")))
			dealerChar = dealerCharWhite;

		if (dir=="North")
			document.getElementById("nvul").innerHTML = dealerChar;
		else if (dir=="East")
			document.getElementById("evul").innerHTML = dealerChar;
		else if (dir=="South")
			document.getElementById("svul").innerHTML = dealerChar;
		else if (dir=="West")
			document.getElementById("wvul").innerHTML = dealerChar;
}
