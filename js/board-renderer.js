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

function showBidding()
{
	var vul = g_hands.boards[g_lastBindex].Vulnerable;
	var red = "#FF0000";
	var green ="#00FF00";
	var dirs = "WNES";
	var i,row;
	var headerDiv = document.createElement("div");
	var headerTable = document.createElement("table");
	headerTable.className = "bidding";
	headerTable.id = "biddingHeader";
	headerTable.style.borderBottom="0px";
	headerDiv.appendChild(headerTable);
	headerTable.insertRow(-1);
	var headerRow = headerTable.rows[0];

	for (i=0;i<4;i++)
	{
		headerRow.insertCell(-1);
		var cell = headerRow.cells[i];
		cell.style.width = "50px";
		cell.innerHTML = dirs.charAt(i);

		var color;
		if (vul=="All") color = red;
		else if (vul=="None") color = green;
		else if ((i==0)||(i==2))
		{
			if (vul=="EW") color = red; else color = green;
		}
		else
		{
			if (vul=="NS") color = red; else color = green;
		}

		cell.style.backgroundColor = color;
		cell.style.fontSize = g_bidFontSize;
	}

	var el = document.createElement("div");
	var table = document.createElement("table");
	table.className = "bidding";
	table.id = "bidding";
	el.appendChild(table);

	var bids = g_hands.boards[g_lastBindex].Bids;
	var dealer = g_hands.boards[g_lastBindex].Dealer;
	var dealerChars = "WNES";
	var dealerIndex = dealerChars.indexOf(dealer);

	var j=0;
	var k;

	i = 0;

	while (j<bids.length)
	{
		if (i==0)
		{
			table.insertRow(-1);
			row = table.rows[table.rows.length-1];
		}

		if (j==0)
		{
			for (k=0;k<dealerIndex;k++)
			{
				row.insertCell(-1);
				row.cells[i].style.width="50px";
				row.cells[i] = "-";
				i++;
			}
		}

		row.insertCell(-1);

		var components = bids[j].split("|");
		var bd = components[0].toUpperCase();
		var suffix = "";
		if (bd.indexOf("!")!=-1) suffix = "!";

		if (bd.charAt(0)=="P") bd = "Pass" + suffix;
		else if (bd.charAt(0)=="D") bd = "x" + suffix;
		else if (bd.charAt(0)=="R") bd = "xx" + suffix;

		if (components.length>1)
		{
			row.cells[i].style.backgroundColor="yellow";
			row.cells[i].id = "bidIdx" + j;
			row.cells[i].style.cursor = "pointer";
		}
		else
		{
			row.cells[i].style.cursor = "default";
		}

		if (bd.includes("C"))
		{
			bd = bd.replace("C","&#9827;");
		} else if (bd.includes("D"))
		{
			bd = bd.replace("D","<span style='color:red'>&#9830;</span>");
		} else if (bd.includes("H"))
		{
			bd = bd.replace("H","<span style='color:red'>&#9829;</span>");
		} else if (bd.includes("S"))
		{
			bd = bd.replace("S","&#9824;");
		}
		row.cells[i].innerHTML = bd;
		row.cells[i].style.fontSize = g_bidFontSize;
		i++;

		if (i>3) i =0;
		j++;
	}

	var boxHeight = Math.floor(3*g_sectionHeight/5) + "px";

	return "<div style=\"margin-left:35px;float:left;padding: 0; border:1px solid black; width: 200px;\">" + headerDiv.innerHTML + "</div><div id=biddingContent style=\"margin-left:35px; float:left; clear:both; padding: 0; border:1px solid black; width: 200px; height:" + boxHeight + "; overflow-y: auto;\">" + el.innerHTML + "</div>";
}

function showCredits()
{
	if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
		if (g_hands.boards[g_lastBindex].Played.length>1) return;	// Board contains play data, so show bidding and replay controls instead of credits

		// Check for empty string first because toUpperCase() fails on empty string.
	if ((typeof g_hands.lin)=="undefined")
	{
		if ((g_file==="") && document.getElementById("currentPosition").innerHTML == ""  ) {
			document.getElementById("currentPosition").innerHTML = g_credits;
		}

		else if (g_file!==1)
		{
			if ((!g_file.toUpperCase().endsWith('LIN')) && document.getElementById("currentPosition").innerHTML =="" ) {
				document.getElementById("currentPosition").innerHTML = g_credits;
			}
		}
	}
}

function updateParResults(data,pindex)
{
	var nsc = convertParContractString(data.contractsNS);
	var ewc = convertParContractString(data.contractsEW);
	var nss = data.scoreNS;
	var ews = data.scoreEW;

	nss = nss.substring(3);
	ews = ews.substring(3);

	var index = nss.indexOf("-");
	if (index==-1) nss = "+" + nss;

	index = ews.indexOf("-");
	if (index==-1) ews = "+" + ews;

	nsc = nsc.substring(3).trim();
	ewc = ewc.substring(3).trim();

	nsc = nsc.replaceAll(/C$/g,"&#9827;");
	nsc = nsc.replaceAll(/D$/g,"<span style='color:red'>&#9830;</span>");
	nsc = nsc.replaceAll(/H$/g,"<span style='color:red'>&#9829;</span>");
	nsc = nsc.replaceAll(/S$/g,"&#9824;");

	nsc = nsc.replaceAll("C+","&#9827;+");
	nsc = nsc.replaceAll("D+","<span style='color:red'>&#9830;</span>+");
	nsc = nsc.replaceAll("H+","<span style='color:red'>&#9829;</span>+");
	nsc = nsc.replaceAll("S+","&#9824;+");

	nsc = nsc.replaceAll("C-","&#9827;-");
	nsc = nsc.replaceAll("D-","<span style='color:red'>&#9830;</span>-");
	nsc = nsc.replaceAll("H-","<span style='color:red'>&#9829;</span>-");
	nsc = nsc.replaceAll("S-","&#9824;-");

	nsc = nsc.replaceAll("C,","&#9827;,");
	nsc = nsc.replaceAll("D,","<span style='color:red'>&#9830;</span>,");
	nsc = nsc.replaceAll("H,","<span style='color:red'>&#9829;</span>,");
	nsc = nsc.replaceAll("S,","&#9824;,");

	nsc = nsc.replaceAll("Cx","&#9827;x");
	nsc = nsc.replaceAll("Dx","<span style='color:red'>&#9830;</span>x");
	nsc = nsc.replaceAll("Hx","<span style='color:red'>&#9829;</span>x");
	nsc = nsc.replaceAll("Sx","&#9824;x");


	ewc = ewc.replaceAll(/C$/g,"&#9827;");
	ewc = ewc.replaceAll(/D$/g,"<span style='color:red'>&#9830;</span>");
	ewc = ewc.replaceAll(/H$/g,"<span style='color:red'>&#9829;</span>");
	ewc = ewc.replaceAll(/S$/g,"&#9824;");

	ewc = ewc.replaceAll("C+","&#9827;+");
	ewc = ewc.replaceAll("D+","<span style='color:red'>&#9830;</span>+");
	ewc = ewc.replaceAll("H+","<span style='color:red'>&#9829;</span>+");
	ewc = ewc.replaceAll("S+","&#9824;+");

	ewc = ewc.replaceAll("C-","&#9827;-");
	ewc = ewc.replaceAll("D-","<span style='color:red'>&#9830;</span>-");
	ewc = ewc.replaceAll("H-","<span style='color:red'>&#9829;</span>-");
	ewc = ewc.replaceAll("S-","&#9824;-");

	ewc = ewc.replaceAll("C,","&#9827;,");
	ewc = ewc.replaceAll("D,","<span style='color:red'>&#9830;</span>,");
	ewc = ewc.replaceAll("H,","<span style='color:red'>&#9829;</span>,");
	ewc = ewc.replaceAll("S,","&#9824;,");

	ewc = ewc.replaceAll("Cx","&#9827;x");
	ewc = ewc.replaceAll("Dx","<span style='color:red'>&#9830;</span>x");
	ewc = ewc.replaceAll("Hx","<span style='color:red'>&#9829;</span>x");
	ewc = ewc.replaceAll("Sx","&#9824;x");

	var optstring;

	if (nsc==ewc)
	{
		optstring =  nsc + "; " + nss;
	}
	else
	{
		optstring =  nsc + "; " + nss + "<br>" + ewc + "; " + ews;
	}

	g_hands.boards[pindex].OptimumScore = optstring;

	if (pindex==g_lastBindex) updateUpperLeftQuadrant(pindex);
}

function showNewFeaturesNotice()
{
	if (!g_newFeatureNoticeShown) g_newFeatureNoticeShown = 1;

	try {
		if (localStorageSupported())
		{
			var alertShown = localStorage.getItem("newFeatureShown");
			var shown = true;

			if (alertShown==null)
				shown = false;
			else if (Number(alertShown)>3)
				shown = true;
			else
				shown = false;

			switch(language)
			{
				case "de":
					var txt = "<ul><li>Bei den Optionen gibt es eine Auswahlbox, um die Kürzel für Figuren auswählen zu können (JQKA,BDKA,VDRA,or BVHA), Standard ist JQKA</li><br>";
					txt += "</ul>";
					txt += "Detaillierte Informationen finden Sie in den  <a href=releaseNotes.htm target=_blank>Versionshinweisen.</a>";
					break;
				default:
					var txt = "<ul><li>The High Card Points display at the bottom left of the board diagram now has the option to display the result of a Kaplan-Rubens hand evaluation. Click on the ? character in the points display box for further explanation.</li>";
					txt += "</ul>";
					txt += "See the <a href=releaseNotes.htm target=_blank>release notes</a> for a full history of recent changes.";
			}
			
			if (!shown)
			{
				localStorage.setItem('newFeatureShown','4');
				switch(language)
				{
					case "de":
						var str = "<div style=\"width:500px;\"><span style=\"font-size:24px;\">Neue Funktionen</span><br><span style=\"font-size:15px;\">" + txt + "</span></div>";
						str += "<br><br><button style=menuButton onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\"><span style=\"font-size:16px;\">Schließen</span></button>";
						break;
					default:
						var str = "<div style=\"width:500px;\"><span style=\"font-size:24px;\">New Features</span><br><span style=\"font-size:15px;\">" + txt + "</span></div>";
						str += "<br><button style=menuButton onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\"><span style=\"font-size:16px;\">Close</span></button>";
				}
				doPopupNoTimeout(document.getElementById("boardNumber"),"<span style=\"font-size:16px;color:blue;\">" + str + "</span>",100,50);
			}
		}
	} catch (err) {};
}

function setDisplaySizing()
{
	var dim = "800#480";
	dim = dim.split("#");

	var width,height;

		// Default settings - for windowed desktop systems.
	width = dim[0];
	height = dim[1];
	height = ((800*height)/width) -17 - 25; // allow for table padding and buttons below
	g_sectionHeight = height/3;

	var ismobi = false;

	if (navigator.userAgent!="undefined")
		ismobi = /mobile/i.test(navigator.userAgent) && !/ipad|tablet/i.test(navigator.userAgent); // if true, it's a phone rather than PC or tablet

	g_isMobi = ismobi;

	var defaultHeight = 480 - 17 - 25;

//	if ((ismobi=="Mobi")|(ismobi=="Android"))
	{
		var screen_width = screen.availWidth;
		var screen_height = screen.availHeight;

		if ((screen_width!="undefined")&&(screen_height!="undefined"))
		{
			height = screen_height;
			width = screen_width;

				// Sanity check
			var ratio = width/height;

			if (ratio<1.66) height = width/1.66

	/*		if (ratio>1.666)	// If ratio is lower than 1.666 use default values for height and width
			{
				if (ratio>1.78)	// BSOL window won't look right at very high aspect ratio, so use defaults instead.
				{
					width=800;
					height=450;
				}
			}*/

			if (width>height)
				height = ((800*height)/width) -17 - 80; // allow for table padding and buttons below
			else	// Use the defaults
			{
				height = defaultHeight;
			}

			g_sectionHeight = Math.floor(height/3);
		}
	}

	var buttHeight = Math.floor((g_sectionHeight/4)) + "px";
	var vulBarHeight = Math.floor(((20*height)/defaultHeight));
	g_vulBarLength = Math.floor((g_sectionHeight-2*vulBarHeight));

	document.getElementById("northHand").style.height = g_sectionHeight + "px";
	document.getElementById("westHand").style.height = g_sectionHeight + "px";
	document.getElementById("southHand").style.height = g_sectionHeight + "px";
	document.getElementById("wvul").style.height = (g_sectionHeight-2*vulBarHeight) + "px";	// Increase height of vulnerability bar to match new table height.
	document.getElementById("wvul").style.width = vulBarHeight + "px";	// Increase height of vulnerability bar to match new table height
	document.getElementById("nvul").style.width = g_vulBarLength + "px";	// Set length of vulnerability bar
	document.getElementById("svul").style.width = g_vulBarLength + "px";	// Set length of vulnerability bar
	document.getElementById("vul").style.height = g_sectionHeight + "px";	// Increase width of table centre to match new table height.
	document.getElementById("vul").style.width = g_sectionHeight + "px";	// Increase width of table centre to match new table height.

	for (var i=0;i<3;i++)
	{
		document.getElementById("vul").rows[i].cells[0].style.width = vulBarHeight + "px";
		document.getElementById("vul").rows[i].cells[2].style.width = vulBarHeight + "px";
	}


	var table = document.getElementById("vul");
	var rows = table.rows;
	rows[0].style.height = vulBarHeight + "px";
	rows[0].cells[0].style.height = vulBarHeight + "px";
	rows[2].style.height = vulBarHeight + "px";
	rows[2].cells[0].style.height = vulBarHeight + "px";
	document.getElementById("nvul").style.height = vulBarHeight + "px";
	document.getElementById("svul").style.height = vulBarHeight + "px";

	g_boardNumberFontSize = Math.floor(((48*height)/defaultHeight)) + "px";
	g_fontRatio = height/defaultHeight;

	document.getElementById("scrollDiv").style.height = (height + 10) + "px";

	var nodes = document.getElementsByClassName("blankButton");

	var i;

	for (i=0;i<nodes.length;i++)
	{
		nodes[i].style.height = buttHeight;
	}

	if (g_isMobi)
		g_namSize = g_sectionHeight/9 + "px";
	else
		g_namSize = g_sectionHeight/10 + "px";

	var namstr = document.getElementById("namstr");

	if (namstr!=null)
		namstr.style.fontSize = g_namSize;

	var bidtable = document.getElementById("bidding");
	var biddingHeader = document.getElementById("biddingHeader");

	if (g_isMobi)
		g_bidFontSize = eval(Math.floor(g_sectionHeight/8)+3) + "px";
	else
		g_bidFontSize = eval(Math.floor(g_sectionHeight/10)+3) + "px";

	if (bidtable!=null)
	{
		for (var i=0;i<bidtable.rows.length;i++)
		{
			var row = bidtable.rows[i];

			for (var j=0;j<row.cells.length;j++)
				row.cells[j].style.fontSize = g_bidFontSize;
		}

		var row = biddingHeader.rows[0];

		for (var i=0;i<row.cells.length;i++)
			row.cells[i].style.fontSize = g_sectionHeight/8 + "px";

		document.getElementById("biddingContent").style.height = 3*g_sectionHeight/5 + "px";
	}

	var optFontSize = Math.floor(g_sectionHeight/7) + "px";
	var lottFontSize = Math.floor(g_sectionHeight/9) + "px";

	var optimumStr = document.getElementById("optStr");

	if (optimumStr!=null) optimumStr.style.fontSize = optFontSize;

	var lottStr = document.getElementById("lott");

	if (lottStr!=null) lottStr.style.fontSize = lottFontSize;

	g_dealerFontSize = Math.floor(16*g_fontRatio);

	var dealerEl = document.getElementById("dealerChar");

	if (dealerEl!=null)
		dealerEl.style.fontSize = g_dealerFontSize + "px";

	g_urqButtonHeight = Math.floor(g_sectionHeight/5) + "px";
	g_urqButtFontSize = Math.floor(g_textBratio*0.8*g_sectionHeight/6) + "px";

	var linplay = document.getElementById("linPlay");

	if (linplay!=null)
	{
		document.getElementById("prevrow").style.height = g_urqButtonHeight;
		document.getElementById("nextrow").style.height = g_urqButtonHeight;
		document.getElementById("accbutton").style.height = g_urqButtonHeight;
		document.getElementById("linPlay").style.height = g_urqButtonHeight;
		document.getElementById("matchContractHelp").style.height = g_urqButtonHeight;
		document.getElementById("prevRowButtFontSize").style.fontSize = g_urqButtFontSize;
		document.getElementById("nextRowButtFontSize").style.fontSize = g_urqButtFontSize;
		document.getElementById("accButtFontSize").style.fontSize = g_urqButtFontSize;
		document.getElementById("linPlayButtFontSize").style.fontSize = g_urqButtFontSize;
		document.getElementById("matchContractHelpButtFontSize").style.fontSize = g_urqButtFontSize;
	}

	g_scoreFontSize = g_sectionHeight/8 + "px";

	var scorespan = document.getElementById("scoreSpan");

	if (scorespan!=null) scorespan.style.fontSize = g_scoreFontSize;

	var vul = document.getElementById("setVul");

	if (vul!=null) vul.style.minWidth = g_vulBarLength + "px";

	var dlr = document.getElementById("setDealer");

	if (dlr!=null) dlr.style.minWidth = g_vulBarLength + "px";
}

function orientationChanged()
{
	setDisplaySizing();
	if (g_handEntryMode==0) document.getElementById("boardNumber").innerHTML = "<span style=\"font-size:" + Math.floor(g_boardNumberFontSize) + ";font-weight:normal;\">" + makeBoardNameString(g_hands.boards[g_lastBindex].board) + "</span>";
	displayHands();
	redrawMCTable(true);
}
