function roundSym (num,decPlaces) {
	var multi = Math.pow(10, decPlaces);
	var value = (Math.round(multi*Math.abs(num))/multi).toFixed(decPlaces);
	if (num<0) { value = -value; }
	return value;
}

function higherHonourCount(suit,base)
{
	var honours = base=="T" ? "JQKA" : base=="J" ? "QKA" : base=="Q" ? "KA" : base=="K" ? "A" : "";
	var count = 0;

	for (var i=0;i<honours.length;i++)
		if (suit.includes(honours[i])) count++;

	return count;
}

function krCalc(suits)
{
	var totalCards = suits.reduce((total,suit) => total + suit.length,0);
	if (totalCards!=13) return "";

	var total = 0;
	for (var i=0;i<4;i++)
	{
		var suit = suits[i];
		var points = 0;
		if (suit.includes("A")) points += 4;
		if (suit.includes("K")) points += 3;
		if (suit.includes("Q")) points += 2;
		if (suit.includes("J")) points += 1;
		if (suit.includes("T")) points += 0.5;

		if (suit.length>=2 && suit.length<=6)
		{
			if (suit.includes("T") && (suit.includes("J") || higherHonourCount(suit,"J")>=2)) points += 0.5;
			if (suit.includes("9") && (suit.includes("8") || suit.includes("T") || higherHonourCount(suit,"T")==2)) points += 0.5;
		}
		if (suit.length>=4 && suit.length<=6 && suit.includes("9") && !suit.includes("8") && !suit.includes("T") && higherHonourCount(suit,"T")==3) points += 0.5;
		if (suit.length>=7 && (!suit.includes("Q") || !suit.includes("J"))) points += 1;
		if (suit.length>=8 && !suit.includes("Q")) points += 1;
		if (suit.length>=9 && !suit.includes("Q") && !suit.includes("J")) points += 1;

		points = suit.length * points / 10;
		if (suit.includes("A")) points += 3;
		if (suit.includes("K") && suit.length>=2) points += 2;
		if (suit.includes("K") && suit.length==1) points += 0.5;
		if (suit.length>=3 && suit.includes("Q")) points += suit.includes("A") || suit.includes("K") ? 1 : 0.75;
		if (suit.length==2 && suit.includes("Q")) points += suit.includes("A") || suit.includes("K") ? 0.5 : 0.25;

		if (suit.includes("J"))
		{
			var jCount = higherHonourCount(suit,"J");
			if (jCount==2) points += 0.5;
			else if (jCount==1) points += 0.25;
		}
		if (suit.includes("T"))
		{
			var tCount = higherHonourCount(suit,"T");
			if (tCount==2) points += 0.25;
			if (suit.includes("9") && tCount==1) points += 0.25;
		}

		if (suit.length==0) points += 3;
		else if (suit.length==1) points += 2;
		else if (suit.length==2) points += 1;
		total += points;
	}

	total -= 1;
	if (suits.filter(suit => suit.length==3).length==3) total += 0.5;
	return total;
}

function updatePointsDisplay()
{
	var npts,epts,spts,wpts;
	var tindex = g_lastBindex;

	if (!g_handEntryMode)
	{
		var handstr = createHandString(g_hands.boards[tindex],0);
		npts = handstr.points;
		handstr = createHandString(g_hands.boards[tindex],1);
		epts = handstr.points;
		handstr = createHandString(g_hands.boards[tindex],2);
		spts = handstr.points;
		handstr = createHandString(g_hands.boards[tindex],3);
		wpts = handstr.points;
	}
	else
	{
		npts = epts = spts = wpts = "";
	}

	var points = document.getElementById("points");
	points.rows[0].cells[1].innerHTML = npts;
	points.rows[1].cells[0].innerHTML = wpts;
	points.rows[1].cells[2].innerHTML = epts;
	points.rows[2].cells[1].innerHTML = spts;
}

function buttclick(pthis)
{
	var str = pthis.id.replace("button","");
	var suit = Number(str.charAt(2));
	var cd;

	if (str.length==4)
		cd = Number(str.charAt(3));
	else
		cd = Number(str.substring(3));

	if (g_handEntryMode==0)
		handlePlayCardClick(pthis);
	else
		handleHandEntryCardClick(suit,cd);
}

function createMiniHandString(hand,index)
{
		// Create a string containing the hand for North, South, East, or West, to go into the mini hand diagram
	var points = 0;
	var incPoints;
	var cardSymbols = ["<img alt=\"Spade\" height=10px src=\"pics/spade.gif\">","<img alt=\"Heart\" height=10px src=\"pics/heart.gif\">","<img alt=\"Diamond\" height=10px src=\"pics/diamond.gif\">","<img alt=\"Club\" height=10px src=\"pics/club.gif\">"];
	var suitLetters = ["S","H","D","C"];
	var cardLetters = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
	hand = hand.Deal[index];
	hand = hand.split(".");
	var cardindex;

	var text = "";

	for (i=0;i<4;i++)
	{
		var tmpstr = hand[i];

		text = text + cardSymbols[i] +"&nbsp;";

		for (j=0;j<tmpstr.length;j++)
		{
			var card = tmpstr.charAt(j);
			var cardstr;

			if (card!="T")
				cardstr = card;
			else
				cardstr = "10";

			if (card=="A")
			{
				incPoints=4;
				cardindex = 12;
			}
			else if (card=="K")
			{
				incPoints=3;
				cardindex = 11;
			}
			else if (card=="Q")
			{
				incPoints=2;
				cardindex = 10;
			}
			else if (card=="J")
			{
				incPoints=1;
				cardindex = 9;
			}
			else if (card=="T")
			{
				incPoints = 0;
				cardindex = 8;
			}
			else
			{
				incPoints = 0;
				cardindex = Number(card) - 2;
			}

			if ((g_handEntryMode==0)||(g_playableCards[i][cardindex]==-1))
				points = points + incPoints;

			text = text + convertHonourCards(cardstr);

		}

		if (i!=3) text = text.concat("<br>");

		text = "<span style=\"font-size:12px;font-weight:normal;\">" + text + "</span>";
	}

	var record = {};

	var textstr = text;
    var ruler = document.getElementById("ruler");

    ruler.style.display="inline";
   	ruler.innerHTML = textstr;
	var align="margin:auto;width:" + ruler.offsetWidth + "px;";
	ruler.style.display="none";

	if (index==1)
		align = "float:left";
	else if (index==3)
		align = "float:right;";

	record.text = "<div style=\"text-align:left;" + align + "\"><span style=\"font-weight:600;font-size:12pt;\">" + text + "</span></div>";
	record.points = points;

	return record;
}

function convertHonourCards(para)
{
	var str = para;

	try {	// in case html doesn't contain honourCardSet field
		var value = document.getElementById("honourCardSet").value;

		if (value=="JQKA") return str;

		if (value=="BDKA")
		{
			str = str.replace(/J/g,"B");
			str = str.replace(/Q/g,"D");
			return str;
		}
		else if (value=="VDRA")
		{
			str = str.replace(/J/g,"V");
			str = str.replace(/Q/g,"D");
			str = str.replace(/K/g,"R");
		}
		else if (value=="BVHA")
		{
			str = str.replace(/J/g,"B");
			str = str.replace(/Q/g,"V");
			str = str.replace(/K/g,"H");
		}

		return str;
	} catch (e) {return para};
}

function createHandString(hand,index)
{
		// Create a string containing the hand for North, South, East, or West, to go into the table above the traveller
	var points = 0;
	var incPoints;
	var cardSymbolSize = Math.floor(0.8*(g_textBratio*g_sectionHeight/4)) + "px";
	if (!g_isMobi) cardSymbolSize = Math.floor(0.6*(g_textBratio*g_sectionHeight/4)) + "px";

	//**KK** var cardSymbols = ["<img height=" + cardSymbolSize + " src=\"pics/spade.gif\">","<img height=" + cardSymbolSize + " src=\"pics/heart.gif\">","<img height=" + cardSymbolSize + " src=\"pics/diamond.gif\">","<img height=" + cardSymbolSize + " src=\"pics/club.gif\">"];
	var cardSymbols = ["<img alt=\"Spade\" style=\"height:" + cardSymbolSize + "\" src=\"pics/spade.gif\">","<img alt=\"Heart\" style=\"height:" + cardSymbolSize + "\" src=\"pics/heart.gif\">","<img alt=\"Diamond\" style=\"height:" + cardSymbolSize + "\" src=\"pics/diamond.gif\">","<img alt=\"Club\" style=\"height:" + cardSymbolSize + "\" src=\"pics/club.gif\">"];
	var suitLetters = ["S","H","D","C"];
	var cardLetters = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
	hand = hand.Deal[index];
	hand = hand.split(".");
	var cardindex;
	var buttHeight =  Math.round(g_sectionHeight/4+4) + "px";
	var showSubscript = false;
	var showColourCode = false;
	var cardFontSize =  Math.round(0.9*g_textBratio*g_sectionHeight/4) + "px";
	var subFontSize =  Math.round(0.45*(g_textBratio*g_sectionHeight/4)) + "px";

	if ((index==0)||(index==2))	// North/South Hand
	{
		showSubscript = document.getElementById("nsrad1").checked;
		showColorCode = !document.getElementById("nsrad3").checked;
	}
	else
	{
		showSubscript = document.getElementById("ewrad1").checked;
		showColorCode = !document.getElementById("ewrad3").checked;
	}

	var matchSuit = -1;
	var matchCard = -1;

	if (g_showPlay)
	{
		if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
		{
			var played = g_hands.boards[g_lastBindex].Played;

			if (g_currentPlayIndex<played.length)
			{
				if (g_lastMatchedPlayIndex == (g_currentPlayIndex - 1))	// still following the actual cards played in the match
				{
						var playedInMatch = played[g_currentPlayIndex];
						var suitChars = "SHDC";
						matchSuit = Number(suitChars.indexOf(playedInMatch.toUpperCase().charAt(0)));

						var cardChars = "23456789TJQKA";
						matchCard = cardChars.indexOf(playedInMatch.toUpperCase().charAt(1));
				}
			}
		}
	}

	var text = "";

	var krpoints = 0;	// Kaplan Reuben evaluator points for this holding

	for (i=0;i<4;i++)
	{
		var tmpstr = hand[i];

		text = text + "<button class=blankButton style='height:" + buttHeight + ";'>" + cardSymbols[i] + "</button>";

		for (j=0;j<tmpstr.length;j++)
		{
			var card = tmpstr.charAt(j);
			var cardstr;

			if (card!="T")
				cardstr = card;
			else
				cardstr = "10";

			if (card=="A")
			{
				incPoints=4;
				cardindex = 12;
			}
			else if (card=="K")
			{
				incPoints=3;
				cardindex = 11;
			}
			else if (card=="Q")
			{
				incPoints=2;
				cardindex = 10;
			}
			else if (card=="J")
			{
				incPoints=1;
				cardindex = 9;
			}
			else if (card=="T")
			{
				incPoints = 0;
				cardindex = 8;
			}
			else
			{
				incPoints = 0;
				cardindex = Number(card) - 2;
			}

			cardstr = convertHonourCards(cardstr);

			if ((g_handEntryMode==0)||(g_playableCards[i][cardindex]==-1))
				points = points + incPoints;

			var score = g_playableCards[i][cardindex];
			var id = suitLetters[i] + cardLetters[cardindex] + i + "" + cardindex;

			if (score>=0)
			{
				if ((g_inputDir==index)&&(g_handEntryMode!=0))
				{
					var color = "#00FF00";

					var id = suitLetters[i] + cardLetters[cardindex] + i + "" + cardindex;
					text = text + "<button id=\"button" + id + "\" onclick=\"buttclick(this);\" style=\"margin:0px;cursor:pointer;background-color:" + color + ";height:" + buttHeight + ";width:30px;padding:1px;font-size:" + cardFontSize + ";font-weight:bold;vertical-align:text-top\"" + cardstr + "><span>"+cardstr+"</span></button>";
				}
				else
				{
					var sup = "";
					var color = "#FFFFFF";

					if (showColorCode)
					{
						color = "#FFFF00";

						if (score==g_hiscore) color = "#00FF00";
					}

					if (g_showPlay!=0)
					{
						if ((matchSuit==i)&&(matchCard==cardindex))
							sup = "<span style=\"font-size:" + cardFontSize + ";font-style:italic;color:blue;\">*</span>"
					}

					var id = suitLetters[i] + cardLetters[cardindex] + i + "" + cardindex;
					var subscript = "";

					if (showSubscript)
						subscript = "<span><sub style=\"font-size:12px;font-style:italic;vertical-align:-5%;\">" + score + "</sub></span>";

					text = text + "<button id=\"button" + id + "\" onclick=\"buttclick(this);\" style=\"margin:0px;padding:0px;cursor:pointer;background-color:" + color + ";height:" + buttHeight + ";min-width:30px;padding:1px;font-size:" + cardFontSize + ";font-weight:bold;vertical-align:text-top;\"><span style='text-align:center;line-height:1em;'>" + sup +cardstr+"</span>" + subscript + "</button>";
				}
			}
			else if (g_currentTrickCards[i][cardindex]!=0)
				text = text + "<button style=\"margin:0px;background-color:#6699FF;color:white;height:" + buttHeight + ";min-width:30px;font-size:" + cardFontSize + ";font-weight:bold;padding:1px;vertical-align:text-top\" disabled><span  style='text-align:center;line-height:1em;'>" + cardstr + "</span></button> ";
			else if (g_inactiveCards[i][cardindex]!=0)
				text = text + "<button style=\"margin:0px;border:0px;background-color:#EEEEEE;color:#CCCCCC;font-size:" + cardFontSize + ";font-weight:bold;height:" + buttHeight + ";padding:1px;vertical-align:text-top\"><span  style='text-align:center;line-height:1em;'>" + cardstr + "</span></button> ";
			else
				if ((g_handEntryMode==0)||(g_inputDir!=index))
					text = text + "<button class=blankButton style=\"height:" + buttHeight + ";font-size:" + cardFontSize + ";font-weight:bold;\"><span  style='text-align:center;line-height:1em;'>" + cardstr + "</span></button> ";
				else
					text = text + "<button id=\"button" + id + "\" onclick=\"deselectCard(this);\" style=\"margin:0px;cursor:pointer;background-color:#FFFFFF;height:" + buttHeight + ";min-width:30px;font-size:" + cardFontSize + ";font-weight:bold;padding:1px;vertical-align:text-top\"><span style='text-align:center;line-height:1em;'>" + cardstr + "<sub style=\"font-size:12px;font-style:italic;vertical-align:-5%;\">&#10004;</sub></span></button>";
		}

		if (i!=3) text = text.concat("<br>");
	}

	krpoints = krCalc(hand);

	var record = {};

	var textstr = text;
    var ruler = document.getElementById("ruler");

    ruler.style.display="inline";
    ruler.innerHTML = textstr;
	var align="margin:auto;width:" + ruler.offsetWidth + "px;";
	ruler.style.display="none";

	if (index==1)
		align = "float:left";
	else if (index==3)
		align = "float:right;";

	var pts = document.getElementById("points");

	record.text = "<div style=\"width:200px;text-align:left;" + align + "\"><span style=\"font-weight:600;font-size:10pt;\">" + text + "</span></div>";

	var kr = false;
	var krid = document.getElementById("krcalc");

	if (krid!==null)
	{
		kr = krid.checked;
	}

	if (kr)	// Show Kaplan-Rubens points as well
		if (krpoints!=="")
			record.points = "<b>" + roundSym(krpoints,2) + "</b>" + " (" + points + ")";
		else
			record.points = "-- (" + points + ")";
	else
	record.points = points + " &nbsp;";

	return record;
}

function drawMiniHand()
{
	if (checkBoardValid(g_lastBindex)&&((typeof g_hands.boards[g_lastBindex].Deal)!="undefined"))
	{
		var minitable = document.getElementById("minihand");
		minitable.rows[1].cells[1].innerHTML = "<span style=\"font-size:20px;\">" + g_hands.boards[g_lastBindex].board + "</span>";
		minitable.rows[1].cells[1].style.textAlign = "center";

		var north = createMiniHandString(g_hands.boards[g_lastBindex],0);
		var east = createMiniHandString(g_hands.boards[g_lastBindex],1);
		var south = createMiniHandString(g_hands.boards[g_lastBindex],2);
		var west = createMiniHandString(g_hands.boards[g_lastBindex],3);

		var miniPoints = document.getElementById("miniPoints");

		if (miniPoints!=null)
		{
			var ptsSpan = "<span style=\"font-size:10px;\">";

			miniPoints.rows[0].cells[1].innerHTML = ptsSpan + north.points + "</span>";
			miniPoints.rows[1].cells[0].innerHTML = ptsSpan + west.points + "</span>";
			miniPoints.rows[1].cells[2].innerHTML = ptsSpan + east.points + "</span>";
			miniPoints.rows[2].cells[1].innerHTML = ptsSpan + south.points + "</span>";
		}

		document.getElementById("miniNorth").innerHTML = north.text;
		document.getElementById("miniEast").innerHTML = east.text;
		document.getElementById("miniSouth").innerHTML = south.text;
		document.getElementById("miniWest").innerHTML = west.text;
		document.getElementById("miniDlr").innerHTML = "<span style=\"font-size:10px;\">Dlr: " + g_hands.boards[g_lastBindex].Dealer + "<br>Vul: " + g_hands.boards[g_lastBindex].Vulnerable + "</span>";

		redrawMCTable(false);
		$("#minihand").show();
		$("#miniMakeableContracts").show();
	}
	else
	{
		$("#minihand").hide();
		$("#miniMakeableContracts").hide();
	}
}

function displayHands() {
    const board = appState.hands.boards[appState.lastBoardIndex];

    const north = document.getElementById("northHand");
    const east = document.getElementById("eastHand");
    const south = document.getElementById("southHand");
    const west = document.getElementById("westHand");

    north.innerHTML = createHandString(board, 0).text;
    east.innerHTML = createHandString(board, 1).text;
    south.innerHTML = createHandString(board, 2).text;
    west.innerHTML = createHandString(board, 3).text;
}
