function clearMakeableOnInputBoard()
{
    if (g_edited!=1)
    {
        g_edited = 1;
        g_inputBoard.DoubleDummyTricks = "********************";
        g_inputBoard.OptimumScore = "";
        redrawMCTable(true);
	}
}

function setupHandEntryBoard()
{
	var i,j,k;
	var quadrant = ["northHand","eastHand","southHand","westHand"];
	setHandEntryMode(true);
	setInputDirection(0);
	var cards = "";

	setInputBoard(g_hands.boards[g_lastBindex]);
	g_cardQuadrant = new Array(4);

	var table = document.getElementById("board");
	table.rows[0].cells[0].innerHTML = "<span style=\"font-size:22px;font-weight:bold;\">Board:<br>" + g_inputBoard.board + "</span>";

	for (i=0;i<4;i++)
	{
		g_cardQuadrant[i] = new Array(13);

		for (j=0;j<13;j++)
		{
			g_cardQuadrant[i][j] = 0;
			g_playableCards[i][j] = 1;	// Card available to be allocated to a player
			g_inactiveCards[i][j] = 0;
			g_currentTrickCards[i][j] = 0;
		}
	}

	for (i=0;i<4;i++)	// For each hand
	{
		var cards = g_inputBoard.Deal[i];
		cards = cards.split(".");

		for (j=0;j<4;j++)	// For each suit
		{
			var suitCards = cards[j];

			for (k=0;k<suitCards.length;k++)
			{
				var index = getCardIndex(suitCards[k]);
				g_cardQuadrant[j][index] = i;
				g_playableCards[j][index] = -1;
			}
		}
	}

	$('#popup_box').hide();
	document.getElementById('popup_box').style.display='none';

	initHandEntry();
	processHandEntry();
}

function deselectCurrentDir(index)
{
	var cardIndex = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
	var i,j;
	var cards2 = "";

	if (index!=-1)
	{
		for (i=0;i<4;i++)
		{
			for (j=12;j>=0;j--)
			{
				if ((g_playableCards[i][j]==-1)&&(g_cardQuadrant[i][j]==g_inputDir))
					cards2 = cards2 + cardIndex[j];
			}

			if (i!=3) cards2 = cards2 + ".";
		}

		g_inputBoard.Deal[g_inputDir] = cards2;

		setInputDirection(-1);
	}
}

function initHandEntry()
{
	var cardStr = "23456789TJQKA";
	var currentCards = g_inputBoard.Deal[g_inputDir].split(".");
	var cards = "";
	var i,j;

	for (i=0;i<4;i++)
	{
		for (j=12;j>=0;j--)
		{
			if ((g_playableCards[i][j] != -1)||(g_cardQuadrant[i][j]==g_inputDir))
				cards = cards + cardStr[j];
		}

		if (i<3) cards = cards + ".";
	}

	g_inputBoard.Deal[g_inputDir] = cards;

	processHandEntry();
}

function processHandEntry()
{
	var north = document.getElementById("northHand");
	var handstr = createHandString(g_inputBoard,0);
	north.innerHTML = handstr.text;
	north.style.backgroundColor = "#EEEEEE";
	npts = handstr.points;
	var east = document.getElementById("eastHand");
	handstr = createHandString(g_inputBoard,1);
	east.innerHTML = handstr.text;
	east.style.backgroundColor = "#EEEEEE";
	epts = handstr.points;
	var south = document.getElementById("southHand");
	handstr = createHandString(g_inputBoard,2);
	south.innerHTML = handstr.text;
	south.style.backgroundColor = "#EEEEEE";
	spts = handstr.points;

	var west = document.getElementById("westHand");
	handstr = createHandString(g_inputBoard,3);
	west.innerHTML = handstr.text;
	west.style.backgroundColor = "#EEEEEE";
	wpts = handstr.points;

	var points = document.getElementById("points");

	points.rows[0].cells[1].textContent = "";
	points.rows[1].cells[0].textContent = "";
	points.rows[1].cells[2].textContent = "";
	points.rows[2].cells[1].textContent = "";

	var dealer = new Array(4);
	dealer['N'] = "North";
	dealer['S'] = "South";
	dealer['W'] = "West";
	dealer['E'] = "East";

	document.getElementById("boardNumber").innerHTML = "<span style=\"font-size:48px;\">" + makeBoardNameString(g_inputBoard.board) + "</span>";

	var vul = g_inputBoard.Vulnerable;
	var boardDealer = dealer[g_inputBoard.Dealer];

	document.getElementById("nvul").textContent = "";
	document.getElementById("wvul").textContent = "";
	document.getElementById("evul").textContent = "";
	document.getElementById("svul").textContent = "";

	var dealerChar = "&#9679";

	if (boardDealer=="North")
		document.getElementById("nvul").innerHTML = dealerChar;
	else if (boardDealer=="West")
		document.getElementById("wvul").innerHTML = dealerChar;
	else if (boardDealer=="East")
		document.getElementById("evul").innerHTML = dealerChar;
	else if (boardDealer=="South")
		document.getElementById("svul").innerHTML = dealerChar;

	displayVulnerability(vul,boardDealer);

	var contracts = document.getElementById("makeableContracts");
	var rows = contracts.rows;

	var cvector = g_inputBoard.DoubleDummyTricks;

	redrawMCTable(true);

	if ((g_test==1)||(g_xml!=""))	// Show only Set Vulnerability if travellers are available - can't save the board so no point showing Dealer
		{
			switch(language) {
				case "de":
					document.getElementById("boardNumber").innerHTML = "<button id=setVul class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Ändere<br>Gefahrenlage</button>";
					break;
				default:
					document.getElementById("boardNumber").innerHTML = "<button id=setVul class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Change<br>Vul</button>";
			}
		}
	else
	{
		switch(language)
		{
			case "de":
				document.getElementById("boardNumber").innerHTML = "<button id=setDealer class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Ändere<br>Teiler</button><br><button id=setVul class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Ändere<br>Gefahrenlage</button>";
				document.getElementById("setDealer").onclick = showDealerKeypad;
				break;
			default:
				document.getElementById("boardNumber").innerHTML = "<button id=setDealer class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Change<br>Dealer</button><br><button id=setVul class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Change<br>Vul</button>";
				document.getElementById("setDealer").onclick = showDealerKeypad;
		}
	}

	document.getElementById("setVul").onclick = showVulnerabilityKeypad;

	document.getElementById("play").onclick = function(){
//			if (g_defaultContract==0)
			{
				if (!requestPending())
				{
					switch(language)
					{
						case "de":
							doPopup(this,"Klicke auf irgendeinen Eintrag (einschließlich leerer Einträge)<br>in der Tabelle der machbaren Kontrakte, um diesen Kontrakt zu spielen.");
							break;
						default:
							doPopup(this,"Tap any of the entries (including blank entries)in the makeable<br>contracts table at any time to start playing that contract.");
					}
					document.getElementById("mctable").className = "shadow";
					setTimeout(function(){document.getElementById("mctable").className = "";},4400); // same timeout as in doPopupAt function
				}
			}
//		else
//			{
//				playLinContract();
//			}
		};

	document.getElementById("help").onclick = function()
		{
			showHelp(this,"editHelp");
		}

	document.getElementById("backPlay").onclick = function()
		{
			hideAllPopups();
			spinner(this);
			callddd("u");  // Take back previous card played
		}

	document.getElementById("editHand").onclick = edit;
	document.getElementById("clearHand").onclick = clear;

	var ptsctl = document.getElementById("ptsctl");

	if (ptsctl!==null)
		ptsctl.style.display = "none";
}

function quitHandEntryMode()
{
	if (g_handEntryMode!=0)
	{
		var i,j;
		var quadrant = ["northHand","eastHand","southHand","westHand"];

		deselectCurrentDir(g_currentDir);
		setHandEntryMode(false);
		setupTraveller(g_lastBindex,true);
		enterPlayMode();
		$("#scoreandtraveller").show();
		switch(language)
		{
			case "de":
				document.getElementById("editHand").textContent = "Bearbeiten";
				break;
			default:
				document.getElementById("editHand").textContent = "Edit";
		}

		document.getElementById("board").rows[0].cells[2].textContent = "";
	}
}

function exitHandEntryMode()
{
	if (g_handEntryMode!=0)
	{
		var i,j;
		var quadrant = ["northHand","eastHand","southHand","westHand"];

		deselectCurrentDir(g_currentDir);
		setHandEntryMode(false);
		delete g_inputBoard.Bids;
		delete g_inputBoard.Played;
		delete g_inputBoard.Contract;
		delete g_inputBoard.Claimed;
		delete g_inputBoard.Declarer;

		if ((typeof g_hands.lin)!=="undefined")
		{
			delete g_hands.lin;
			setupCommandHelp();
		}

		g_hands.boards[g_lastBindex] = g_inputBoard;
		setupTraveller(g_lastBindex,true);
		enterPlayMode();
		$("#scoreandtraveller").show();
		$("#mainTitle").show();
		switch(language)
		{
			case "de":
				document.getElementById("editHand").textContent = "Bearbeiten";
				break;
			default:
				document.getElementById("editHand").textContent = "Edit";
		}

		var ptsctl = document.getElementById("ptsctl");

		if (ptsctl!==null)
			ptsctl.style.display = "inline";

		document.getElementById("currentPosition").innerHTML = g_credits;
		showCredits();
	}
}

function setVulnerability(vul)
{
    clearMakeableOnInputBoard();
	g_inputBoard.Vulnerable = vul;
	g_inputBoard.OptimumScore = "";
	displayVulnerability(vul,g_inputBoard.Dealer);
}

function setDealer(dealer)
{
    if (g_edited==0) g_edited = 2;   // Indicate Dealer modified (doesn't affect makeable contracts)

    g_inputBoard.Dealer = dealer.charAt(0);
    displayDealer(dealer,g_inputBoard.Vulnerable);
}

function deselectCard(pthis)
{
		// When a button is clicked on a playable card this function send the card played to the server which will
		// then update the current position and return a json string containing it.
    clearMakeableOnInputBoard();
	var str = pthis.id.replace("button","");
	var suit = Number(str.charAt(2));
	var cd;

	if (str.length==4)
		cd = Number(str.charAt(3));
	else
		cd = Number(str.substring(3));

	g_playableCards[suit][cd] = 1;
	processHandEntry();
}