/**********************************************************************************
   -- Copyright (C) 2014-2025 by John Goacher - All Rights Reserved
   - This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/.
***********************************************************************************/

var clipBoardData;
var g_version = "Version: 2.1 (2026-09-03)";
var language = "de";  				// Sets the default language
var g_logging = false;
var g_credits =	"";
var g_resultsFilename;
var g_handRecordsFilename;
var g_hands;
var g_scoring = 0;					// Set to "IMP" for IMPs scoring.
var g_lastBindex = 0;
var g_currentDir;
var g_currentPair;
var g_inactiveCards;
var g_playableCards;
var g_currentPlayer;
var g_currentTrickCards;
var g_currentPlayIndex;				//0..51 represents index to position within the 52 card sequence being played.
var g_lastMatchedPlayIndex; 		//0..51
var g_showPlay=0;					//S If showPlay!=0 show played cards for this hand
var g_hiscore;
var g_allBoards = 0;				// Set non-zero while running an analysis on all boards in a set.
var g_session = 0;
var g_bgTrans = 0;					// Unique transaction id allocated to background transaction (e.g single shot accuracy request)
var g_edited = 0;   				// Set to 1 when a change has been made (or 2, if only the Dealer has been changed)
var g_partialHand = 0;				// Non-zero if playing a hand which started with fewer than 52 cards
var g_partialHandTotalTricks;		// Total number of tricks which can be made by declarer and defenders on a partial hand
var g_session_contract;
var g_showOriginalContract = false;	// Set true when "Play: <contract>" button is pressed for a hand recorded in a lin file.
var g_session_declarer;
var g_defaultTravellerWidth;
var g_lastAllTravellersPair=-1;
var g_lastAllTravellersDir="NS";
var g_mode = 0;						// Set to 1 while in play mode
var g_timeout = "";
var g_sectionHeight; 				// Calculated height for a quadrant of the board display
	// Following variable relate to hand entry.
var g_boardNumberFontSize;
var g_fontRatio = 1.0;
var g_textBratio = 0.9;				// Text font size as fraction of button height
var g_handEntryMode = 0;
var g_inputDir = 0;					// 0,1,2,3 = N,E,S,W
var g_inputBoard;
var g_cardQuadrant;
var g_stopPropagation = 0;
var g_helpId = "";					// id of current help text on display
var g_playButtonText = "Spielen"; 	// Text to show on Play button (otherwise may show, for example, Play: 3H by S)
var g_defaultContract = 0;     		// Set to 1 when there is a default contract for current board (contract and declarer but no
									//  bidding information or cards played)
var g_defaultContractIndex = -1;  	// If default contract is set, this is the index to the button in the makeable contracts table
									// that relates to that declarer/suit combination.
var g_timeoutID = "";				// ID of javascript timeout function related to request throttling.
var g_travellers = null;			// Non-null if traveller records are available
var g_currentTraveller = null; 		// Traveller record corresponding to current board
var g_currow = -1;			   		// Index to current row being displayed (for travellers containing bidding/play data for each row
var g_title = "&nbsp";
var g_sessInfo = null;				// Holds Session Info for the current event
var g_rankInfo = null;				// Holds ranking information for current event.
var g_validPercentageFields = false;// Set to true if percentage fields in json ranking table are non-blank and no negative values
var g_scoring = "MatchPoints";		// Scoring type - MatchPoints, IMP, VP
var g_eventType = "Paarturnier";	// Event Type - one of Pairs, Teams
var g_maxImps = 0;					// Maximum number of IMPs recorded on a single board, if using IMP scoring.
var g_test = 0;						// Set to 1 if called from test environment.
var g_xml = "";						// Set to filename of xml file if present (or to 1 if xml supplied as a string)
var g_xmlstr = "";					// Holds xml when supplied as a string parameter
var g_handstr = "";					// Holds file content when supplied as a string parameter rather than a file url
var g_handstrType = "";				// Can be "pbn", "dlm", or "lin" if file content supplied as string
var g_debug = false;
var g_ofs = 1;						// Offset to columns beyond (optional) lead card column in Scorecard table
var g_protocol = "http:";			// called with http or https
var g_loaded = false;				// Is true if hands/travellers have been loaded already
var g_fullInfo = false;				// Set to true if makeable contract tables contain full information
var g_backgroundFetchCompleted = false;		// Set to true if background fetch of makeable contracts/opt contracts/opening leads has completed.
var g_openingLeadsPresent = false;	// Set to true when ddtricks for opening leads have been calculated and applied.
var g_travellersHaveLeads = false;  // Set to true if at least one lead card is found in a traveller.
var g_file = "";					// contains url of 'pbn' or 'dlm' if filename reference was supplied in request
var g_sessionMode = "scorecard"; 	// assume last looked at scorecard in results analysis
var g_playItAgain = true;		 	// False if in Results Analysis screens
var g_scoreToImps = [[0,10,0],[20,40,1],[50,80,2],[90,120,3],[130,160,4],
					[170,210,5],[220,260,6],[270,310,7],[320,360,8],[370,420,9],
					[430,490,10],[500,590,11],[600,740,12],[750,890,13],[900,1090,14],
					[1100,1290,15],[1300,1490,16],[1500,1740,17],[1750,1990,18],[2000,2240,19],
					[2250,2490,20],[2500,2990,21],[3000,3490,22],[3500,3990,23],[4000,32767,24]];
var g_checkContracts = [];
var g_scorecardContext = [];	// Array of context objects for current scorecard, indexed by board number
var g_uniquePairNumbers = "";		// Set to true or false for Teams events from within function checkForUniquePairNumbers
var g_showAllControls = true;
var g_isMobi = false;				// True if a mobile device
var g_namSize = 0;
var g_bidFontSize = 0;
var g_dealerFontSize = 0;			// Size of dealer char on traveller
var g_urqButtonHeight = 0;			// Height of buttons in upper right quadrant of traveller
var g_urqButtFontSize = 0;			// Font size of buttons in upper right quadrant
var g_scoreFontSize = 0;			// Font size for score in lin file
var g_vulBarLength = 0;				// Height or width of vulnerability bar

var g_worker;						// Worker for Play It Again
var g_mworkers = [];		// Workers for makeable contract calculation
var g_nextmworker = 0;
var g_workerInitCount = 0;
var g_db = null;					// Database handle for indexedDB

var g_bgObj = {};
var g_completionCount = 0;			// Count of background accuracy requests completed
var g_completionTarget = 0;			// Used for background player accuracy requests

var g_mcSession = 1;				// "Session" number for tagging single board makeable contract requests

var g_trumps = "";					// Trump suit for current board being played
var g_leader = "";					// Leader for current board being played
var g_initial_data = "";
var g_initial_options = "";
var g_newFeatureNoticeShown = 0;	// Set to 1 if has been shown already during this session
var g_initialised = false;			// Set true in buildpage1
var g_playerAcc = [];		// Holds player accuracy counts for event, indexed by player name
var g_accTrans = {};		// Holds list of acc transactions outstanding for each player

var cacheTimeout = 300000;			// Limit in milliseconds on how long PBN and json are kept in Local Storage



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





function calldds(str)
{
	var board = g_hands.boards[g_lastBindex];
	var deal = board.Deal;
	var dealstr = "W:" + deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];

	var msg = {};
	msg.request = str;

	if (str!=="q")
	{
		msg.pbn = dealstr;
		msg.trumps = g_trumps;
		msg.leader = g_leader;
	}

	msg.requesttoken = g_session;
	msg.sockref = g_session;

	var context = {};
	context.request = msg.request;

	if (str!=="q")
		context.para = "ongoing";
	else
		context.para = "quit";

	msg.context = context;

	g_worker.postMessage(msg);
}

function buttclick(pthis)
{
		// When a button is clicked on a playable card this function send the card played to the server which will
		// then update the current position and return a json string containing it.

	var cards = "23456789TJQKA";
	var suits = "SHDC";

	var str = pthis.id.replace("button","");
	var suit = Number(str.charAt(2));
	var cd;

	if (str.length==4)
		cd = Number(str.charAt(3));
	else
		cd = Number(str.substring(3));

	if (g_handEntryMode==0)
	{
		str = str.substring(0,2);

		if (requestPending())
			return;	// Don't allow while there is a request in progress.
		else
			setRequestTimeout(true);

/*		for (var i=0;i<4;i++)
		{
			var cstr = suits[i] + ": ";

			for (var j=0;j<13;j++)
			{
				if (g_inactiveCards[i][j]==0)
					cstr += cards[j];
			}

			alert(cstr);
		}*/

		spinner(pthis);
		callddd(str);
	}
	else
	{
		var count;

			// Check number of cards already allocated to this quadrant.
		if ((count = countAllocated(g_inputDir))<13)
		{
            clearMakeableOnInputBoard();
			count++;
			g_playableCards[suit][cd] = -1;
			g_cardQuadrant[suit][cd] = g_inputDir;

			var nextdir = g_inputDir;
			var i;

			if (count==13)
			{
				for (i=0;i<4;i++)
				{
					if (nextdir==3)
						nextdir = 0;
					else
						nextdir++;

					if (countAllocated(nextdir)==0) break;	// Found an empty quadrant
				}

				if (countAllocated(nextdir)==0)
				{
					if (13==countUnallocated())	// Allocate all remaining cards to this quadrant
					{
						selectQuadrant(nextdir);

						for (i=0;i<4;i++)
						{
							for (j=0;j<13;j++)
							{
								if (g_playableCards[i][j]>=0)
								{
									g_playableCards[i][j] = -1;
									g_cardQuadrant[i][j] = nextdir;
								}
							}
						}

						deselectCurrentDir(g_inputDir);
						exitHandEntryMode();
						return;
					}

					selectQuadrant(nextdir);
				}
/*				else	// All quadrants are full, so exit edit mode
				{
					deselectCurrentDir(g_inputDir);
					processHandEntry();
					exitHandEntryMode();
				}*/
			}
			processHandEntry();
		}
		else
		{
			var compass = ["North","East","South","West"];
			displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">13 Cards already allocated to " + compass[g_inputDir] + "</span>");
		}
	}

	g_stopPropagation = 1;
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

function callddd(pstr)
{
	if (pstr!="q") calldds(pstr);
}

function dddquitfunc(data,statusText,jqXHR)
{
	// do nothing routine, supplied as a callback when user quits a play session
}



function resetState()
{
	stopPlay();

	if (g_timeout!="")	// Clear timeout routine queued, if any
	{
		clearTimeout(g_timeout);
		g_timeout = "";
	}

	hideSpinner();

	hideRanking();
	$("#scores").hide();
	$("#scoreandtraveller").hide();
//	$("#mainTitle").hide();
	$("").hide();
	hideAllPopups();
	$("#popup_box").finish();
	document.getElementById("popup_box").display = "none";
}

function terminateSession()
{
	hideSpinner();

	if (g_session!=0)
	{
		callddd("q");  // Terminate any double dummy playing g_session that is in progress.

		showCredits();
	}

	exitHandEntryMode(); // In case hand editing is in progress.
}

function playLinContract(auto=false,dest=0)
{
	var declarerChars = "NESW";
	var leaderChars = "ESWN";

	var board = g_hands.boards[g_lastBindex];

	var contract = board.Contract;

	if (!g_showOriginalContract)
		contract = contract.replace(/[xX\*]/g,"");

	var contractChar = contract.charAt(1);

	if (!auto) setShowPlay(1);

	playContract(board.Declarer,contract.charAt(1),contract,auto,dest);
}



function lottPair(direction)
{
	// Law of Total Tricks
	var suitChars = "SHDC";
	var tricks;
	var board = g_hands.boards[g_lastBindex];

	if ((typeof board.Deal)!="undefined")
	{
		var h1,h2;

		if (direction==1)
		{
			h1 = board.Deal[0].split(".");
			h2 = board.Deal[2].split(".");
		}
		else
		{
			h1 = board.Deal[1].split(".");
			h2 = board.Deal[3].split(".");
		}

		var max = 0;
		var suit;
		var i;

		for (i=0;i<4;i++)
		{
			var slen = h1[i].length + h2[i].length;

			if (slen>max)
			{
				max = slen;
				suit = i;
			}
		}

		var t1,t2;

		if (direction==1)
		{
			t1 = getMakeableTricksForContract(g_lastBindex,"1"+suitChars.charAt(suit),"N");
			t2 = getMakeableTricksForContract(g_lastBindex,"1"+suitChars.charAt(suit),"S");
		}
		else
		{
			t1 = getMakeableTricksForContract(g_lastBindex,"1"+suitChars.charAt(suit),"E");
			t2 = getMakeableTricksForContract(g_lastBindex,"1"+suitChars.charAt(suit),"W");
		}

		if ((t1!=-1)||(t2!=-1))
		{
			tricks = t1;
			if (t2>t1) tricks = t2;
		}
		else
		{
			tricks = -1;
		}
	}

	var result = {};
	result.tricks = tricks;
	result.trumpCount = max;
	result.suit = suit;

	if (tricks!=-1)
		return result;
	else
		return null;
}

function lott()
{
	var ns = lottPair(1);
	var ew = lottPair(2);

	if ((ns!=null)&&(ew!=null))
	{
		var str = (ns.tricks + ew.tricks) + "-" + (ns.trumpCount + ew.trumpCount) + " = " + (ns.tricks + ew.tricks - ns.trumpCount - ew.trumpCount);
		return str;
	}
	else
		return "N/A";
}

function setFieldsFromTravellerLine(bindex,tline)
{
	g_hands.boards[bindex].Contract = tline.contract;
	g_hands.boards[bindex].Declarer = tline.played_by;
	g_hands.boards[bindex].PlayerNames = [];
	g_hands.boards[bindex].Played = [];
	g_hands.boards[bindex].Played[0] = tline.lead;
	g_hands.boards[bindex].Bids = [];
}

function setHandRecordFromLin(bindex,tline)
{
	var curBoard;
	var lin;

	if ((typeof tline.board)!="undefined")
	{
		curBoard = g_hands.boards[bindex];
		var board = tline.board;

		curBoard.PlayerNames = board.PlayerNames;
		curBoard.Dealer = board.Dealer;
		curBoard.Vulnerable = board.Vulnerable;
		curBoard.Deal = board.Deal;
		curBoard.Bids = board.Bids;
		curBoard.Played = board.Played;
		curBoard.Claimed = board.Claimed;
		curBoard.Score = board.Score;
		curBoard.Contract = board.Contract;
		curBoard.Declarer = board.Declarer;

		if (board.Played.length>0)
			curBoard.lead = board.Played[0];

		return curBoard;
	}
	else
	{
		setFieldsFromTravellerLine(bindex,tline);
		return g_hands.boards[bindex];
	}
}

function showTravellerRowButtons()
{
		// should return true if g_xml!=="" ?
//	return (g_showAllControls);
	return false;
}


function setupTraveller(index,active)
{
	var i,j,k;
	var table = document.getElementById("traveller");
	var hcards;
	var boardChanged = false;

//	alert("setupTrav1: " + JSON.stringify(g_hands.boards[g_lastBindex]));
//	alert("setupTrav1: " + JSON.stringify(g_hands.boards[0]));
//	if (g_currow!=-1) alert("curtrav: " + JSON.stringify(g_currentTraveller.traveller_line[g_currow]));
//	alert("g_lastBindex: " + g_lastBindex + " pair: " + g_hands.pair_number + " direction: " + g_hands.direction);

	setMode(0);	// Cancel play mode if it is active

	if (index!=g_lastBindex) boardChanged = true;

	setLastBoardIndex(index);

	$("#board").show();
	$("#scorecard").show();
	hideMenuItems();
	showMainMenuItems();

	if (active==true)
	{
		show("play");
		show("computeMakeable");
		show("tools");

//		if ((typeof g_hands.lin)=="undefined")
		{
			if ((((g_test==1))&&(g_file==''))||(g_xml!=""))
			{
				show("bsession");
				show("bsessionHelp");
			}
		}

		$("#scorecard").show();
	}
	else
	{
		hideMenuItems();
	}

	var rowButtonsVisibility = "visibility:hidden";

	if (showTravellerRowButtons()) rowButtonsVisibility = "";

	var curBoard = g_hands.boards[g_lastBindex];

	if (g_travellers!==null)
	{
		var traveller = getTravellerForBoard(g_lastBindex);
		g_currentTraveller = traveller;
//		alert("from current traveller: " + JSON.stringify(g_currentTraveller.traveller_line[g_currow]));

		if (traveller!=null)
		{
			if (g_currentTraveller.traveller_line.length>1) rowButtonsVisibility = "";

			if (boardChanged) g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);

			if (g_currow!=-1)
			{
				var tline = g_currentTraveller.traveller_line[g_currow];

//				alert("tline: " + JSON.stringify(tline));

				curBoard = setHandRecordFromLin(g_lastBindex,tline);

//				alert("curBoard: " + JSON.stringify(curBoard));
			}
			else if (boardChanged) // (and g_currow==-1). Mustn't display old record because it doesn't apply to the new board.
			{
				delete g_hands.boards[g_lastBindex].PlayerNames;
				g_hands.boards[g_lastBindex].Played = [];
				g_hands.boards[g_lastBindex].Bids = [];
			}
		}
	}

	if (active==true)
	{
		g_defaultContract = 0;	// Assume no default contract defined.
		//if ((curBoard.Contract != null) && (curBoard.Played != null))
		if (((typeof curBoard.Contract)!="undefined")&&((typeof curBoard.Declarer)!="undefined"))
		{
			if ((  (typeof curBoard.Played)!="undefined") || ( (typeof curBoard.Bids)!="undefined") )
			{
				var pbutton = "";
				var isLin = false;

				if ((g_file!="")&&(g_file!==1))
				{
					if (g_file.toUpperCase().endsWith("LIN")) isLin = true;
				}

				if  ( ((typeof curBoard.Played)!="undefined") && ((curBoard.Played.length>1)) ) isLin = true;

				if ((typeof curBoard.Bids)!="undefined")
					if (curBoard.Bids.length>0) isLin = true;

				if (isLin)
				{
					if (validContract(curBoard.Contract))
					{
						var tricksOffset = calculateTricks(g_lastBindex);
						var score = curBoard.Score;

						if ( (score!="") && (typeof score)!="undefined" )
						{
							var ewscore = score;

							if (ewscore.indexOf("%")!=-1)
							{
								ewscore = ewscore.replace("%","");
								ewscore = 100.0 - ewscore;
								ewscore = ewscore.toFixed(2) + "%";

								score = score.replace("%","");
								score = Number(score).toFixed(2) + "%";
							}
							else
							{
								var num = score.match(/\d+/); // returns ["123"]
								score = num ? Number(num[0]) : null;
								//score = Number(result);
								num = ewscore.match(/\d+/); // returns ["123"]
								result = num ? Number(num[0]) : null;
								ewscore = (-Number(result));
							}

							score = " NS: " + score + "&nbsp;&nbsp;&nbsp;EW: " + ewscore;
						}

						if ( ( ((typeof curBoard.Played)!="undefined") && ((curBoard.Played.length>1)) )     || Number.isNaN(tricksOffset) ){
							tricksOffset = "";
						}

						if (typeof score == "undefined"){
							score = "";
						}
						switch(language)
						{
							case "de":
								var bckbutton = "<button id=prevrow class=menuButton style=\"min-width:20px;max-width:20px;width:20px;max-height:" + g_urqButtonHeight + ";" + rowButtonsVisibility + "\" onclick=\"prevTravRow();\"><span id=prevRowButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\"><</span></button>&nbsp;";
								var fwdbutton = "&nbsp;<button id=nextrow class=menuButton style=\"min-width:20px;max-width:20px;width:20px;max-height:" + g_urqButtonHeight + ";" + rowButtonsVisibility + "\" onclick=\"nextTravRow();\"><span id=nextRowButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">><span></button>";
								var accbutton = "&nbsp;<button id=accbutton class=menuButton style=\"margin-left:2px;min-width:35px;max-width:35px;width:35px;max-height:" + g_urqButtonHeight + ";\" onclick=\"log('button=acc');playLinContract(true,1);\"><span id=accButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">Prä</span></button>";
								pbutton = "<div style=\"margin-left:2px;margin-top:2px;clear:both;float:left;\">" + bckbutton + "<button id=linPlay class=\"menuButton\" style=\"min-width:130px;max-height:" + g_urqButtonHeight + ";\"><span id=linPlayButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">Kontr: " + curBoard.Contract.replaceAll(/!/g,"").replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;").replaceAll(/NT/g,"SA") + tricksOffset + " von " + curBoard.Declarer.replaceAll(/E/g,"O") + "</span></button>";
								pbutton = pbutton + accbutton + "<button id=matchContractHelp class=\"menuButton\" style=\"margin-left:2px;min-width:15px;max-width:15px;width:15px;max-height:" + g_urqButtonHeight + ";\"><span id=matchContractHelpButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">?</span></button>" + fwdbutton + "<br><span id=scoreSpan style=\"font-size:" + g_scoreFontSize + ";\">" + score + "</span></div>";
								break;
							default:
								var bckbutton = "<button id=prevrow class=menuButton style=\"min-width:20px;max-width:20px;width:20px;max-height:" + g_urqButtonHeight + ";" + rowButtonsVisibility + "\" onclick=\"prevTravRow();\"><span id=prevRowButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\"><</span></button>&nbsp;";
								var fwdbutton = "&nbsp;<button id=nextrow class=menuButton style=\"min-width:20px;max-width:20px;width:20px;max-height:" + g_urqButtonHeight + ";" + rowButtonsVisibility + "\" onclick=\"nextTravRow();\"><span id=nextRowButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">><span></button>";
								var accbutton = "&nbsp;<button id=accbutton class=menuButton style=\"margin-left:2px;min-width:35px;max-width:35px;width:35px;max-height:" + g_urqButtonHeight + ";\" onclick=\"log('button=acc');playLinContract(true,1);\"><span id=accButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">Acc</span></button>";
								pbutton = "<div style=\"margin-left:2px;margin-top:2px;clear:both;float:left;\">" + bckbutton + "<button id=linPlay class=\"menuButton\" style=\"min-width:130px;max-height:" + g_urqButtonHeight + ";\"><span id=linPlayButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">Play: " + curBoard.Contract.replaceAll(/!/g,"").replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;") + tricksOffset + " by " + curBoard.Declarer + "</span></button>";
								pbutton = pbutton + accbutton + "<button id=matchContractHelp class=\"menuButton\" style=\"margin-left:2px;min-width:15px;max-width:15px;width:15px;max-height:" + g_urqButtonHeight + ";\"><span id=matchContractHelpButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">?</span></button>" + fwdbutton + "<br><span id=scoreSpan style=\"font-size:" + g_scoreFontSize + ";\">" + score + "</span></div>";
						}

					}

					var bidding = "";

					if ((typeof curBoard.Bids)!="undefined")
					{
						bidding = showBidding();
					}

					document.getElementById("currentPosition").innerHTML = bidding + pbutton;

					if (document.getElementById("accbutton")!=null)
						if (document.getElementById("accbutton").style.display=="none") document.getElementById("prevrow").style.marginLeft = "35px";

					if ((typeof curBoard.Bids)!="undefined")
					{
						var bids = g_hands.boards[g_lastBindex].Bids;

						for (var j=0;j<bids.length;j++)
						{
							var cell = document.getElementById("bidIdx" + j);

							if (cell!=null)
							{
								cell.onmouseover = cell.onclick = function(){showBidAlert(this)};
								cell.onmouseout = function(){
									var popup = document.getElementById("popup_box");
									popup.textContent = "";
									popup.style.display="none";
									$("#popup_box").finish();
								}
							}
						}
					}

					if (pbutton!="")
					{
						document.getElementById("linPlay").onclick = function(){g_showOriginalContract = true;playLinContract();};
						document.getElementById("matchContractHelp").onclick = function(){showHelp(this,"playMatchContractHelp");};
					}
				}
			}

			var declStr = "NSEW";
			var suitStr = "CDHSN";

			if (validContract(curBoard.Contract))
			{
				var declIndex = declStr.indexOf(curBoard.Declarer);
				var suitIndex = suitStr.indexOf(curBoard.Contract.charAt(1));

				g_defaultContract = 1;
				g_defaultContractIndex = (declIndex * 5) + suitIndex;
			}
		}
		else
		{
			document.getElementById("currentPosition").innerHTML = g_credits;
		}
	}

	document.getElementById("wvul").style.height = "36px";	// reset height of vulnerability bar in case we have just left play mode
	document.getElementById("northHand").style.height = "";
	document.getElementById("westHand").style.height = "";
	document.getElementById("southHand").style.height = "";
	document.getElementById("makeableContracts").className = "mc";		// Revert to smaller font for makeable contracts table

	if (g_session!=0) callddd("q");  // Terminate any double dummy playing g_session that is in progress.
	setSession(0);
	setLastBoardIndex(index);

	clearCardData();

	while (table.rows.length>6)
	{
		table.deleteRow(-1);
	}

	var npts,spts,wpts,epts;
	var tindex = index;

	if (tindex==-1)
	{
		hide("play");
		$("#board").hide();
	}
	//else if (tindex!=-1)tindex // this construction is useless  // KK
	else
	{
		var north = document.getElementById("northHand");
		var handstr = createHandString(g_hands.boards[tindex],0);
		north.innerHTML = handstr.text;
		north.style.backgroundColor = "#EEEEEE";
		npts = handstr.points;

		var east = document.getElementById("eastHand");
		handstr = createHandString(g_hands.boards[tindex],1);
		east.innerHTML = handstr.text;
		east.style.backgroundColor = "#EEEEEE";
		epts = handstr.points;

		var south = document.getElementById("southHand");
		handstr = createHandString(g_hands.boards[tindex],2);
		south.innerHTML = handstr.text;
		south.style.backgroundColor = "#EEEEEE";
		spts = handstr.points;

		var west = document.getElementById("westHand");
		handstr = createHandString(g_hands.boards[tindex],3);
		west.innerHTML = handstr.text;
		west.style.backgroundColor = "#EEEEEE";
		wpts = handstr.points;

		if (g_handEntryMode)
			npts = epts = spts = wpts = "";

		var points = document.getElementById("points");
		points.rows[0].cells[1].innerHTML = npts;
		points.rows[1].cells[0].innerHTML = wpts;
		points.rows[1].cells[2].innerHTML = epts;
		points.rows[2].cells[1].innerHTML = spts;

		var dealer = new Array(4);
		dealer['N'] = "North";
		dealer['S'] = "South";
		dealer['W'] = "West";
		dealer['E'] = "East";

		document.getElementById("boardNumber").innerHTML = "<span style=\"font-size:" + g_boardNumberFontSize + ";font-weight:normal;\">" + makeBoardNameString(g_hands.boards[g_lastBindex].board) + "</span>";

		var vul = g_hands.boards[tindex].Vulnerable;
		var boardDealer = dealer[g_hands.boards[tindex].Dealer];

		document.getElementById("nvul").textContent = "";
		document.getElementById("wvul").textContent = "";
		document.getElementById("evul").textContent = "";
		document.getElementById("svul").textContent = "";

		setDealerChar(boardDealer,vul);

/*		var dealerChar = "<span style=\"font-size:15px;\">&#9679</span>";

		if (boardDealer=="North")
			document.getElementById("nvul").innerHTML = dealerChar;
		else if (boardDealer=="West")
			document.getElementById("wvul").innerHTML = dealerChar;
		else if (boardDealer=="East")
			document.getElementById("evul").innerHTML = dealerChar;
		else if (boardDealer=="South")
			document.getElementById("svul").innerHTML = dealerChar;*/

		displayVulnerability(vul,boardDealer);

		redrawMCTable(true);	// Populate makeable contracts table for this board.

		updateUpperLeftQuadrant(g_lastBindex);

		document.getElementById("play").onclick = function(){
				if ((document.getElementById("play")).innerHTML == "Stop")
				{
					exitCardPlay();
				}
				else
				{
					if (requestPending()) return;

					terminateSession();

//					if (g_defaultContract==0)
					{
						var pos = getPosition(this);
						switch(language)
						{
							case "de":
								doPopupAt("Klicken Sie auf einen Eintrag (einschließlich leerer) in der Tabelle<br> der machbaren Kontrakte, um diesen zu spielen.",pos.x-100,pos.y-100);
								break;
							default:
								doPopupAt("Tap any of the entries (including blank entries)in the makeable<br>contracts table at any time to start playing that contract.",pos.x-100,pos.y-100);
						}

						document.getElementById("mctable").className = "shadow";
						setTimeout(function(){document.getElementById("mctable").className = "";},4400); // same timeout as in doPopupAt function
					}
//					else
//					{
//						playLinContract();
//					}
				}
			};

		document.getElementById("help").onclick = function()
			{
				hideAllPopups();

				if (g_session==0)
					showHelp(this,"commandHelp");
				else
					showHelp(this,"playHelp");
			}

		document.getElementById("options").onclick = function()
			{
				hideAllPopups();
				showOptions(this);
			}

		document.getElementById("backPlay").onclick = function()
			{
				if (requestPending())
					return;	// Don't allow while there is a request in progress.
				else
					setRequestTimeout(true);

				hideAllPopups();
				spinner(this);
				callddd("u");  // Take back previous card played
			}

		try {
			document.getElementById("forwardPlay").onclick = function()
				{
					hideAllPopups();
					playNextCard(this);
				}
		} catch (e) {};

		document.getElementById("editHand").onclick = edit;
	}

	if (active)
	{
		var board = g_hands.boards[g_lastBindex];

/*		if ((typeof g_hands.Title)!="undefined")
			g_title = g_hands.Title;*/


		const clean = DOMPurify.sanitize(g_title, { RETURN_DOM_FRAGMENT: true });
		document.getElementById("titleText").replaceChildren(clean); //innerHTML = g_title;

		$("#mainTitle").show();

		if ((typeof g_hands.display)=="undefined")
		{
			if ((g_hands.boards[g_lastBindex].DoubleDummyTricks == "********************")||(g_hands.boards[g_lastBindex].DoubleDummyTricks == "--------------------"))
			{
				if (checkBoardValid(g_lastBindex))
				{
					console.log("request issued");
					calculateMakeableSingleBoard(g_lastBindex); // Calculate makeable contracts if not defined
				}
			}
		}
	}
}


function clear()
{
	if (g_handEntryMode!=0)
	{
        clearMakeableOnInputBoard();
		hideAllPopups();
		var bnum = g_hands.boards[g_lastBindex].board;
		g_hands.boards[g_lastBindex] = {"Dealer":"N","Vulnerable":"None","Deal":["...","...","...","..."],"DoubleDummyTricks":"********************"};
		g_hands.boards[g_lastBindex].board = bnum;
		setupHandEntryBoard();
	}
}

function edit()
{
	if (g_handEntryMode==0)
	{
		if (requestPending()) return;

		log("button=edit");
		g_edited = 0;

		if ((g_hands.boards[g_lastBindex].board.toString().indexOf(".edited")==-1)&&((g_test==1)||(g_xml!="")))
		{
			var board = JSON.parse(JSON.stringify(g_hands.boards[g_lastBindex]));
			var bname = g_hands.boards[g_lastBindex].board.toString().replace(".Open","").replace(".Closed","") + ".edited";

				// Does edited version already exist ?
			var index = getTindexByName(g_hands.boards,bname);

			if (index==-1)
				var index = g_hands.boards.length;

			g_hands.boards[index] = board;
			g_hands.boards[index].board = bname;
			gotoTravellerByIndex(index);
		}

		g_defaultContract = 0;	// Don't highlight contract played now that hand has been edited.
		delete g_hands.boards[g_lastBindex].Contract;
		delete g_hands.boards[g_lastBindex].Declarer;
		delete g_hands.boards[g_lastBindex].PlayerNames;
		delete g_hands.boards[g_lastBindex].Bids;
		delete g_hands.boards[g_lastBindex].Played;

		resetState();
		setupTraveller(g_lastBindex,true);
		enterPlayMode();
		$("#scoreandtraveller").show();
		$("#mainTitle").show();
		hideMenuItems();

		if ((g_test!=1)&&(g_xml==""))
		{
			show("deleteBoard");
			show("newBoard");

			if (g_hands.boards.length>1)
			{
				show("next");
				show("prev");
				show("gotoBoard");
			}
		}

		show("editHand");
		show("clearHand");
		show("help");

		var table = document.getElementById("board");
		var cell = table.rows[0].cells[2];

		switch(language)
		{
			case "de":
				cell.innerHTML = "<span style=\"font-size:18px;color:red;\">Klicke auf die N,S,O,W Bereiche,<br>um die Karten für<br>diesen Spieler zu bearbeiten</span>";
				break;
			default:
				cell.innerHTML = "<span style=\"font-size:18px;color:red;\">Tap on N,S,E,W quadrants<br>to edit the cards<br>for that player</span>";
		}


		setupHandEntryBoard();

		switch(language)
		{
			case "de":
				document.getElementById("editHand").textContent = "Fertig";
				break;
			default:
				document.getElementById("editHand").textContent = "Done";
		}

	}
	else
	{
		exitHandEntryMode();
	}
}

function hideMenuItems()
{
	hide("prev");
	hide("showBoards");
	hide("gotoBoard");
	if (document.getElementById("saveLIN")!=null) hide("saveLIN");
	hide("saveBoards");
	hide("backPlay");
	hideForwardPlay();
	hide("play");
	hide("deleteBoard");
	hide("newBoard");
	hide("editHand");
	hide("clearHand");
	hide("options");
	hide("help");
	hide("computeMakeable");
	hide("tools");
	hide("bsession");
	hide("bsessionHelp");
	hide("next");
	hideAllPopups();
	$('#popup_box').hide();
	document.getElementById('popup_box').style.display='none';
}

function showMainMenuItems()
{
//	if ((typeof g_hands.lin)=="undefined")
	if ((g_hands.boards.length>1)||(g_test==1)||(g_xml!=""))
	{
		show("prev");
		show("gotoBoard");
		show("next");

		if (g_file=='')
		{
			show("bsession");
			show("bsessionHelp");
		}
	}

	if ((g_test!=1)&&(g_xml==""))
	{
		if ((typeof g_hands.lin)!=="undefined")
			if (document.getElementById("saveLIN")!=null) show("saveLIN");

		//document.getElementById("saveBoards").innerHTML = "Speichern";	// **** Remove this assignment when html is no longer cached.
		show("saveBoards");
	}

	show("play");
	show("editHand");
	show("options");
	show("computeMakeable");
	show("tools");
}



function checkAccsProcessedForName(name)
{
	var keys = Object.keys(g_accTrans[name].transList);

	if (keys.length==0)
		return true;
	else
		return false;
}

function allAccsProcessed(name=null)
{
	if (name!==null)
	{
		return checkAccsProcessedForName(name);
	}
	else	// Check if finished for all names
	{
		for (var key in g_accTrans)
		{
			if (!checkAccsProcessedForName(key)) return false;
		}
	}

	return true;
}



function accCalcPossible()
{
	var found = false;

	for (var i=0;i<g_hands.boards.length;i++)
	{
		if (g_travellers!==null)
		{
			var traveller = getTravellerForBoard(i);

			var tlines = traveller.traveller_line;

			for (var j=0;j<tlines.length;j++)
			{
				var board = tlines[j].board;

				if (accCalcPossibleForBoard(board))
				{
					found = true;
					break;
				}
			}
		}
		else
		{
			var board = g_hands.boards[i];

			if (accCalcPossibleForBoard(board))
			{
				found = true;
				break;
			}
		}

		if (found) break;
	}

	return found;
}

function processAccs(name=null)
{
	for (var key in g_accTrans)
		g_accTrans[key].transList = {};

	var requestCount = 0;
	switch(language)
	{
		case "de":
			showEmptyProgressBar("Berechnung der Genauigkeit des Spiels für alle Teilnehmer");
			break;
		default:
			showEmptyProgressBar("Calculating accuracy of play for all participants");
	}

	for (var i=0;i<g_hands.boards.length;i++)
	{
		if (g_travellers!==null)
		{
			var traveller = getTravellerForBoard(i);

			if (traveller==null) continue;

			var tlines = traveller.traveller_line;

			if ((typeof tlines)!=="undefined")
			{
				for (var j=0;j<tlines.length;j++)
				{
					var accPresent = false;

					if (typeof tlines[j].board!=="undefined")
					{
						if (typeof tlines[j].board.acc=="undefined")
						{
							tlines[j].board.acc = [-1,-1,-1,-1];	// Create array to hold results, -1 indicates player didn't play this board (e.g. was Dummy)
						}
						else
						{
							for (var k=0;k<4;k++)
								if (tlines[j].board.acc[k]!==-1)
								{
									accPresent = true;
									break;
								}
						}

						if ((!passed(tlines[j]))&&(!accPresent)&&(accCalcPossibleForBoard(tlines[j].board)))
						{
							makeAccRequest(tlines[j].board,i,j);
							requestCount++;
						}
					}
				}
			}
		}
		else
		{
			var accPresent = false;
			var board = g_hands.boards[i];

			if (typeof board.acc=="undefined")
			{
				board.acc = [-1,-1,-1,-1];	// Create array to hold results, -1 indicates player didn't play this board (e.g. was Dummy)
			}
			else
			{
				for (var k=0;k<4;k++)
					if (board.acc[k]!==-1)
					{
						accPresent = true;
						break;
					}
			}

			if ((board.Contract!=="Passed")&&(!accPresent)&&(accCalcPossibleForBoard(board)))
			{
				makeAccRequest(board,i,-1);
				requestCount++;
			}
		}
	}

	if (requestCount==0)
	{
		finishBackgroundOperation();
		log('button=showPlayerAccMatrix');
		showPlayerAccMatrix();
	}
}

function makeAccRequest(board,bdindex,tindex)
{
	var declCHARS = "NSEW";
	var playedCards = "";
	var names;

	names = board.PlayerNames;

	var context = {"names":names,"declarer":board.Declarer,"dest":1};

	var deal = board.Deal;
	var dealstr = deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
		// Check number of cards in each hand is the same and greater than zero. Allow for embedded dots in hand strings
	var handlen = deal[0].length;
	var k;

	if ((deal[0].length==3)&&(deal[1].length==3)&&(deal[2].length==3)&&(deal[3].length==3))
	{
		var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">Board empty - nothing to do.</span></div>";
		displayError(document.getElementById("makeableContracts"),errormsg);
		return;
	}

	for (k=1;k<4;k++)
	{
		if (handlen!=deal[k].length)
		{
			switch(language)
			{
				case "de":
					var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">Alle Hände müssen dieselbe Anzahl von Karten zu Beginn haben.</span></div>";
					break;
				default:
					var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">All hands must start with the same number of cards.</span></div>";
			}
			displayError(document.getElementById("makeableContracts"),errormsg);
			return;
		}
	}

	if ((typeof board.Played)!="undefined")
	{
		var played = board.Played;

		if (played.length>1)
		{
			for (var i=0;i<played.length;i++)
				playedCards = playedCards + played[i];
		}
	}

	var leaderChars = "ewsn";	// Declarer is one place to the right of leader
	var leader = leaderChars.charAt(declCHARS.indexOf(board.Declarer));

	var msg = {};
	msg.request = "a";
	msg.cards = playedCards;
	msg.trumps = board.Contract.charAt(1);
	msg.leader = leader;
	msg.pbn = dealstr;

	var context = {};
	context.key = makeAccKey(board);
	context.declarer = board.Declarer;
	context.tid = g_bgTrans++;
	context.names = names;

	for (var i=0;i<4;i++)
		g_accTrans[names[i]].transList[context.tid]=1;

	context.bdindex = bdindex;
	context.tindex = tindex;
	context.request = msg.request;
	context.requestSubType = "b";	// Background request
	msg.context = context;

	g_mworkers[g_nextmworker].postMessage(msg);

	g_nextmworker++;
	if (g_nextmworker>=g_mworkers.length) g_nextmworker = 0;
	g_completionTarget++;
}



function playContract(declarer,suitChar,contract,auto=false,dest=0)
{
	if (requestPending())
		return;	// There is still a request outstanding.

	var declCHARS = "NSEW";
	var playedCards = "";
	var names;

	hideAllPopups();

	if (g_session!=0) callddd("q");	// Terminate any ddd session that is currently in progress

	terminateSession();
	exitHandEntryMode();

	clearCardData();
	displayHands();

	if ((typeof g_hands.boards[g_lastBindex])!="undefined")
		names = g_hands.boards[g_lastBindex].PlayerNames;
	else
	{
		names = [];
		names[0] = "S";
		names[1] = "W";
		names[2] = "N";
		names[3] = "E";
	}

	var context = {"names":names,"declarer":declarer,"dest":dest};

	var deal = g_hands.boards[g_lastBindex].Deal;
	var dealstr = deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
		// Check number of cards in each hand is the same and greater than zero. Allow for embedded dots in hand strings
	var handlen = deal[0].length;
	var k;

	if ((deal[0].length==3)&&(deal[1].length==3)&&(deal[2].length==3)&&(deal[3].length==3))
	{
		switch(language)
		{
			case "de":
				var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">Board empty - nothing to do.</span></div>";
				break;
			default:
				var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">Leeres Board - es gibt nichts zu tun.</span></div>";
		}
		displayError(document.getElementById("makeableContracts"),errormsg);
		return;
	}

	for (k=1;k<4;k++)
	{
		if (handlen!=deal[k].length)
		{
			switch(language)
			{
				case "de":
					var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">All hands must start with the same number of cards.</span></div>";
					break;
				default:
					var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">Alle Hände müssen zu Beginn mit derselben Anzahl Karten beginnen.</span></div>";
			}
			displayError(document.getElementById("makeableContracts"),errormsg);
			return;
		}
	}

	if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
	{
		var played = g_hands.boards[g_lastBindex].Played;

		if (played.length>1)
		{
			for (var i=0;i<played.length;i++)
				playedCards = playedCards + played[i];
		}
	}

	var leaderChars = "ewsn";	// Declarer is one place to the right of leader
	var leader = leaderChars.charAt(declCHARS.indexOf(declarer));

	setRequestTimeout();

	if (!auto)
	{
		g_session_declarer = declarer;

		if (g_showOriginalContract)
			g_session_contract = contract;
		else
			g_session_contract = "*" + contract.substring(1);

		if ((handlen-3)!=13)	// Subtracting 3 is to allow for the dots between suits.
		{
			setPartialHand(1);
			g_partialHandTotalTricks = handlen-3;	// Subtract 3 to allow for the dots between suits
		}
		else
		{
			setPartialHand(0);
			g_partialHandTotalTricks = 13;
		}

		hideMenuItems();
		show("backPlay");
		showForwardPlay();
		show("options");
		show("play");
		show("help");
	}

	var session = new Date().getTime();

	setSession(session);

	spinner(document.getElementById("makeableContracts").rows[1].cells[0]);

	setLeader(leader);
	setTrumps(suitChar);

	if (!auto)
	{
		var dealstr = "W:" + dealstr;

		var msg = {};
		msg.request = "g";
		msg.pbn = dealstr;
		msg.trumps = g_trumps;
		msg.leader = g_leader;
		msg.requesttoken = g_session;
		msg.sockref = g_session;

		var context = {};
		context.request = msg.request;
		context.para = "new";
		msg.context = context;

		g_worker.postMessage(msg);

		document.getElementById("play").textContent = "Stop";
	}
	else
	{
		var msg = {};
		msg.request = "a";
		msg.cards = playedCards;
		msg.trumps = suitChar;
		msg.leader = leader;
		msg.pbn = dealstr;

		var context = {};
		context.key =  makeAccKey(g_hands.boards[g_lastBindex]);
		context.declarer = declarer;
		context.names = names;
		context.request = msg.request;
		context.requestSubType = "s";	// Single shot accuracy request for one board
		msg.context = context;

		g_worker.postMessage(msg);
	}
}

function getFullMakeableJson(context)
{
}

function showEmptyProgressBar(text)
{
	$("#toolsSubMenu").hide();
	document.getElementById("saveBoards").setAttribute("disabled","");
	document.getElementById("editHand").setAttribute("disabled","");

	g_title = "<div id=outerProgress style='float:left;width:800px;height:15px;'><div id=progress style='float:left;width:0px;height:15px;background-color:#88ff88;text-align:left;color:blue;'>" + text + "</div></div>";
	
	const clean = DOMPurify.sanitize(g_title, { RETURN_DOM_FRAGMENT: true });
	document.getElementById("titleText").replaceChildren(clean); //innerHTML = g_title;
	document.getElementById("outerProgress").width = "800px";
	document.getElementById("progress").width = "0px";
}

function calculateMakeableAllBoards()
{
		// This function is only enabled when makeable contracts are calculated locally, not on the server
	g_allBoards = 1;
	switch(language)
	{
		case "de":
			showEmptyProgressBar("Analyse der Boards im Hintergrund");
			break;
		default:
			showEmptyProgressBar("Analysing boards in background");
	}
	console.log("generating requests for " + g_hands.boards.length + " boards");

	for (var i=0;i<g_hands.boards.length;i++)
		g_hands.boards[i].tag = -1;

	for (var i=0;i<g_hands.boards.length;i++)
		calculateMakeableSingleBoard(i);
}

function finishBackgroundOperation()
{
	$("#progressDiv").hide();
	document.getElementById("saveBoards").removeAttribute("disabled");
	document.getElementById("editHand").removeAttribute("disabled");

	if ((typeof g_hands.Title)!="undefined")
		g_title = g_hands.Title;
	else
		g_title = "&nbsp;";

	const clean = DOMPurify.sanitize(g_title, { RETURN_DOM_FRAGMENT: true });
	document.getElementById("titleText").replaceChildren(clean); //innerHTML = g_title;
}

function resetAnalyseAllBoards()
{
	g_allBoards = 0;
	finishBackgroundOperation();
}

function completedAnalyseAllBoards()
{
	restartBackgroundWorkers();
	resetAnalyseAllBoards();
}

function cacheMakeable(pindex,data)
{
	var limit = 500;
	var delMax = limit/10;

	if (g_db==null) return;

	try {
		var board = g_hands.boards[pindex];
		var deal = board.Deal;
		var dealstr = "W:" + deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
		var vul = board.Vulnerable;
		var key = makeDealKey(dealstr,vul,getRequestedLeads(pindex));
		var ddata = {};
		ddata.deal = key;
		ddata.time = Date.now();
		ddata.dd = JSON.parse(data);
		const transaction = g_db.transaction(["ddCache"], "readwrite");
		const objectStore = transaction.objectStore("ddCache");
		objectStore.put(ddata);

		const myIndex = objectStore.index("time");
		const countRequest = myIndex.count();
		countRequest.onsuccess = function(){
			if (countRequest.result>500)
			{
				var delCount = countRequest.result - 100;

					// delete oldest 10 items
				const myIndex = objectStore.index("time");

				myIndex.openCursor().onsuccess = function(){
					const cursor = event.target.result;
					if (cursor) {
					  if (delCount>0)
					  {
						  delCount = delCount-1;
						  const key = cursor.value.deal;
						  objectStore.delete(key);
						  cursor.continue();
					  }
					} else {
					  console.log("Oldest records purged from ddCache in indexedDB");
					}
				};
  			}
		};
	} catch (e) {};
}

function dddLoadMakeable(data,statusText,jqXHR,bindex)
{
	var vul = ["None","All","NS","EW"];
	var leader = "nesw";
	resetTimeout();

	var tmp = data;
	tmp = JSON.parse(tmp);

	if (this.hasOwnProperty("pbn"))	// It's from a remote request, fill in the missing fields from context
	{
		tmp.sess.pbn = this.pbn;
		tmp.vul = convertVulStr(this.vul);
	}

	for (var i=0;i<g_hands.boards.length;i++)
	{
		var board = g_hands.boards[i];
		var deal = board.Deal;
		var dealstr = "W:" + deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];

		var found = false;

		if (!tmp.sess.hasOwnProperty("pbn"))	// It's a cached value from old version that doesn't have the pbn field (when cached entries time out this clause will no longer be necessary)
		{
			if (g_hands.boards[i].hasOwnProperty("tag")&&(tmp.sess.sockref==g_hands.boards[i].tag))
				found = true;
		}
		else if (g_hands.boards[i].hasOwnProperty("tag")&&(tmp.sess.sockref==g_hands.boards[i].tag)&&(vul[tmp.vul]==board.Vulnerable)&&(dealstr==tmp.sess.pbn))
		{
			found = true;
		}

		if (found)
		{
			board.DoubleDummyTricks = tmp.sess.ddtricks;
			updateParResults(tmp,i);

			if ((typeof tmp.openingLeads)!="undefined")
			{
				g_openingLeadsPresent = true;
				board.openingLeads = tmp.openingLeads;
			}

// 			cacheMakeable(i,data); // **KK**

			if (i==g_lastBindex) redrawMCTable(true);

			if (g_allBoards==1)
			{
				g_hands.boards[i].tag = -1;

					// Count requests outstanding
				var mccount = makeableContractRequestsOutstanding();

				document.getElementById("progress").style.width = ((800*(g_hands.boards.length-mccount))/g_hands.boards.length).toFixed(0) + "px";

				if (mccount==0)
				{
					g_allBoards = 0;
					hideSpinner();

					if (!g_playItAgain)
					{
						if (g_sessionMode=="ranking") setupRanking(true);
						else if (g_sessionMode=="scorecard") setupScorecard(true);
						else if (g_sessionMode=="traveller") showComparison();
						else if (g_sessionMode=="check") checkAllContracts();
					}

					if (g_openingLeadsPresent)
					{
						var table = document.getElementById("scoring");
						var rows = table.rows;

						switch(language)
						{
							case "de":
								rows[1].cells[5+g_ofs].innerHTML = "<select id='ETFMode' name='ETFMode' style='background-color:yellow;'><option value=0>DD Stiche (ETF)</option><option value=1>Angepasstes ETF</option></select>";
								document.getElementById("rankingDD").innerHTML = "<select id='rankETFMode' name='rankETFMode' style='background-color:yellow;'><option value=0>Double Dummy</option><option value=1>Ausspiel-Angepasstes DD</option></select>";
								break;
							default:
								rows[1].cells[5+g_ofs].innerHTML = "<select id='ETFMode' name='ETFMode' style='background-color:yellow;'><option value=0>DD Tricks(ETF)</option><option value=1>Adjusted ETF</option></select>";
								document.getElementById("rankingDD").innerHTML = "<select id='rankETFMode' name='rankETFMode' style='background-color:yellow;'><option value=0>Double Dummy</option><option value=1>Lead-Adjusted DD</option></select>";
						}
						document.getElementById("ETFMode").onchange = function(){document.getElementById("rankETFMode").value=this.selectedIndex;log("operation=ETFMode:"+this.selectedIndex);setupScorecard(true);};
						document.getElementById("rankETFMode").onchange = function(){document.getElementById("ETFMode").value=this.selectedIndex;log("operation=rankETFMode:"+this.selectedIndex);setupRanking();};
					}

					redrawMCTable(true);
					updateUpperLeftQuadrant(g_lastBindex);

					g_fullInfo = true;
					g_backgroundFetchCompleted = true;

					completedAnalyseAllBoards();
				}
			}
			else
			{
				hideSpinner();
			}
		}
	}
}





function updatePlayerAccCountsFromBoard(board,lindata)
{
    if (typeof board=="undefined") return;
	if (typeof board.acc=="undefined") return;

	var acc = board.acc;

	var names = board.PlayerNames;
	var declarer = board.Declarer;

	if (typeof declarer=="undefined") return;	// could happen if board is edited

	var direction = "NESW";
	var declIndex = direction.indexOf(declarer.toUpperCase());
	var declName = returnName(names,declIndex,false);
	var leadIndex = (declIndex + 1) % 4;
	var leadName = returnName(names,leadIndex,false);
	var leadPartnerIndex = (leadIndex + 2) % 4;
	var leadPartnerName = returnName(names,leadPartnerIndex,false);

	var declErrCount = returnAccCount(acc,declIndex);
	var leadErrCount = returnAccCount(acc,leadIndex);
	var partnerErrCount = returnAccCount(acc,leadPartnerIndex);

	updatePlayerAccCounts(declName,"decl",declErrCount,board,lindata);
	updatePlayerAccCounts(leadName,"lead",leadErrCount,board,lindata);
	updatePlayerAccCounts(leadPartnerName,"leadPartner",partnerErrCount,board,lindata);
}

function confirmShowAcc()
{
	switch(language)
	{
		case "de":
			var htmltext = "<span style=\"font-size:16px;\">Popupfenster für die Matrix der Spielergenauigkeit wurde durch den Browser blockiert.<br>Klicken Sie auf 'Weiter', um das Fenster anzuzeigen.</span><br><br>";
			htmltext = htmltext + "<br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';showPlayerAccMatrix();\">Weiter</button>";
			htmltext = htmltext + "<button style=\"cursor:pointer;margin-left:20px;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Schließen</button>";
			break;
		default:
			var htmltext = "<span style=\"font-size:16px;\">Player Accuracy Matrix popup window blocked by browser.<br>Click Proceed to show the window.</span><br><br>";
			htmltext = htmltext + "<br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';showPlayerAccMatrix();\">Proceed</button>";
			htmltext = htmltext + "<button style=\"cursor:pointer;margin-left:20px;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Cancel</button>";
	}
	var i;
	var str = "";



	hideAllPopups();
	doPopupNoTimeout(document.getElementById("boardNumber"),htmltext,200,100);
}

function showPlayerAccMatrix()
{
	g_playerAcc = [];

	for (var i=0;i<g_hands.boards.length;i++)
	{
		if (g_travellers!==null)
		{
			var traveller = getTravellerForBoard(i);

			if (traveller!==null)
			{
				for (var j=0;j<traveller.traveller_line.length;j++)
				{
					var tline = traveller.traveller_line[j];
					updatePlayerAccCountsFromBoard(tline.board,tline.lindata);
				}
			}
		}
		else
		{
			updatePlayerAccCountsFromBoard(g_hands.boards[i],"");
		}
	}

	for (var i=0;i<g_playerAcc.length;i++)
	{
		var pobj = g_playerAcc[i];

		pobj.totalErrCount = pobj.declErrCount + pobj.leadErrCount + pobj.leadPartnerErrCount;
		pobj.totalCount = pobj.declCount + pobj.leadCount + pobj.leadPartnerCount;

		pobj.ratio = pobj.totalErrCount/pobj.totalCount;
	}

	g_playerAcc.sort(function(a,b) {
			if (a.ratio>b.ratio) return 1;
			else if (a.ratio<b.ratio) return -1;
			else return 0;
		});

	var str = "";

	if ((typeof g_hands.club)!=="undefined")
		str += " - " + g_hands.club;

	if ((typeof g_hands.event)!=="undefined")
		str += " " + g_hands.event;

		// Make html page

	switch(language)
	{
		case "de":
			var html = '<head></head>';
			html += '<body><style type=\"text/css\">.myLink {cursor: pointer;font-weight: normal; color: #000099;}\na { font-weight: bold;}\na:link { color: blue; text-decoration:none }\na:visited { color: blue; text-decoration:none }\na:active { color: blue; text-decoration:none }\na:hover { color: red; text-decoration:none }</style>';
			html += '<h2>Matrix der Spielergenauigkeit' + str + '</h2>';
			html += '<button onclick="downloadFile(mydoc(),\'text/html\',\'acc.htm\');">Download</button>';
			html += '<script language=JavaScript>' + downloadFile.toString() + ';function mydoc(){alert("Datei wird in den Downloads-Ordner gespeichert.");return document.body.outerHTML;};</script>';
			html += '<button class=menuButton style="margin-left:30px;" onclick="document.getElementById(\'accMatrixHelp\').style.display=\'block\';">Hilfe</button>';

			html += '<div id="accMatrixHelp" style="width:600px; margin-top:10px; word-wrap:break-word; padding:10px; display:none; border-style:solid; border-width:thin; border-color:#000000; background-color:#FFFFEE">';
			html += '<span style="font-size:16px;">';
			html += "- Die Matrix gibt die Anzahl der Abweichungen vom optimalen Double Dummy Spiel an: für jedes Board und jeden Spieler<br><br>";
			html += "- Die Durchschnitt-Spalte gibt die durchschnittlichen Anzahl von Abweichungen pro Board für jeden Spieler an.<br><br>";
			html += "- Zeilen werden nach dem Durchschnittswert sortiert (von niedrig nach hoch).<br><br>";
			html += "- Die Zellen sind mit Farben codiert - weiß: Board nicht gespielt oder Spieler war Dummy, grün: optimales Spiel, orange: eine Abweichung, rot: zwei oder mehr Abweichungen<br><br>";
			html += "- Ein Klick auf eine Zelle zeigt das zugehörige Board an<br><br>";
			html += "- Die Zeile 'Summe pro Board' gibt die Gesamtzahl an Abweichungen vom Double Dummy Spiel für jedes Board (summiert über alle Tische, die das Board gespielt haben). Boards mit höheren Zahlen könnten die schwierigeren sein<br>";

			html += "</span><br>";
			html += '<button style="cursor:pointer;" onclick="document.getElementById(\'accMatrixHelp\').style.display=\'none\';">Hilfe ausblenden</button>';
			html += '</div>';

			html += '<table cellpadding=2px style="margin-top:10px;border-spacing:0px;">';
			html += "<tr style='background-color:#dddddd;'><th>Name</th><th>Durchschnitt</th><th colspan=" + g_hands.boards.length + " style='text-align:center;'>Board Nummer</th><tr>";
			html += "<tr style='background-color:#dddddd;'><td></td><td></td>";
			break;
		default:
			var html = '<head></head>';
			html += '<body><style type=\"text/css\">.myLink {cursor: pointer;font-weight: normal; color: #000099;}\na { font-weight: bold;}\na:link { color: blue; text-decoration:none }\na:visited { color: blue; text-decoration:none }\na:active { color: blue; text-decoration:none }\na:hover { color: red; text-decoration:none }</style>';
			html += '<h2>Player Accuracy Matrix' + str + '</h2>';
			html += '<button onclick="downloadFile(mydoc(),\'text/html\',\'acc.htm\');">Download</button>';
			html += '<script language=JavaScript>' + downloadFile.toString() + ';function mydoc(){alert("File will be in the Downloads folder");return document.body.outerHTML;};</script>';
			html += '<button class=menuButton style="margin-left:30px;" onclick="document.getElementById(\'accMatrixHelp\').style.display=\'block\';">Help</button>';

			html += '<div id="accMatrixHelp" style="width:600px; margin-top:10px; word-wrap:break-word; padding:10px; display:none; border-style:solid; border-width:thin; border-color:#000000; background-color:#FFFFEE">';
			html += '<span style="font-size:16px;">';
			html += "- The player accuracy matrix shows the number of deviations from optimal double dummy play, for each board for each player<br><br>";
			html += "- The Avg column shows the average number of deviations per board for each player.<br><br>";
			html += "- Rows are sorted by the Avg value (low to high).<br><br>";
			html += "- The cells are colour coded - white indicates board not played or player role was dummy, green indicates optimal play, orange indicates one deviation, red indicates two or more deviations<br><br>";
			html += "- Clicking on a cell brings up the board in Bridge Solver Online, with the bidding and play data for the relevant player<br><br>";
			html += "- The 'Totals Per Board' row shows the total number of deviations from double dummy play for each board (summed over all tables that played the board). Boards with higher totals may be those that are more difficult to play<br>";

			html += "</span><br>";
			html += '<button style="cursor:pointer;" onclick="document.getElementById(\'accMatrixHelp\').style.display=\'none\';">Hide Help</button>';
			html += '</div>';

			html += '<table cellpadding=2px style="margin-top:10px;border-spacing:0px;">';
			html += "<tr style='background-color:#dddddd;'><th>Name</th><th>Avg</th><th colspan=" + g_hands.boards.length + " style='text-align:center;'>Board Number</th><tr>";
			html += "<tr style='background-color:#dddddd;'><td></td><td></td>";
	}

	for (var i=0;i<g_hands.boards.length;i++)
	{
		var str = "" + g_hands.boards[i].board;

		if (str.length==1) str = "&nbsp;" + str;
		html += "<td style=\"border-left:1px solid black;border-right:1px solid black;\">" + str + "</td>";
	}

	html += "</tr>";

	var totals = {};

	for (var i=0;i<g_hands.boards.length;i++)
	{
		totals[i] = 0;
	}

	for (var i=0;i<g_playerAcc.length;i++)
	{
//		alert(g_playerAcc[i].name + " " + g_playerAcc[i].ratio);
		html += "<tr>";
		html += "<td>" + g_playerAcc[i].name + "</td><td>" + g_playerAcc[i].ratio.toFixed(2) + "</td>";

		for (var j=0;j<g_hands.boards.length;j++)
		{
			var board = g_hands.boards[j];
			var bdnum = board.board;

			var found = false;

			if (typeof g_playerAcc[i].boards[bdnum]!=="undefined")
			{
				found = true;

					// Sometimes a file will contain multiple instances of the same board, e.g. a lin file representing a BBO traveller.
					// Check that the player played this particular board instance (N.B. These files will not contain travellers)
				if (g_travellers==null)
				{
					var names = g_hands.boards[j].PlayerNames;

					if ((typeof names)!=="undefined")
					{
						found = false;

						for (var k=0;k<names.length;k++)
						{
							if (g_playerAcc[i].name==names[k])
							{
								found = true;
								break;
							}
						}
					}
				}

				if (found)
				{
					var lindata = g_playerAcc[i].boards[bdnum].lindata;
					var errCount = g_playerAcc[i].boards[bdnum].errCount;
					var bg = "#88ff88";

					if (errCount==1)
						bg = "#ffa500";
					else if (errCount>1)
						bg = "#ff0000";

					bg = "background-color:" + bg + ";";

					errCount = Number(errCount);
					if (errCount==0) errCount = "";

					if (!Number.isNaN(errCount)) totals[j] += Number(errCount);

					var url = "";

					if (g_travellers!==null)
						url = window.location.href + "?lin=" + lindata;
					else
						url = window.location.href + "?jsonlin=" + encodeURIComponent(JSON.stringify(g_hands.boards[j]));

					html += "<td class=myLink style=\"border:1px solid grey;text-align:right;" + bg + "\" onclick=window.open(\'" + url + "\')>" + "<span style=\"color:white;font-weight:bold;\">" + errCount + "</span></td>";
				}
			}

			if ((typeof g_playerAcc[i].boards[bdnum]=="undefined")||!found)	// If didn't play this board (or this instance of this board)
			{
				html += "<td style=\"border:1px solid grey;background-color:white;\"></td>";
			}
		}

		html += "</tr>";
	}

	switch(language)
	{
		case "de":
			html += "<tr style='background-color:#dddddd;'><td colspan=2>Gesamtzahl pro Board</td>";
			break;
		default:
			html += "<tr style='background-color:#dddddd;'><td colspan=2>Totals per board</td>";
	}

	for (var i=0;i<g_hands.boards.length;i++)
		html += "<td style=\"text-align:right;border:1px solid grey;\">" + totals[i] + "</td>";

	html += "</tr>";

	html += "</table><body>";

	var myWindow = window.open("", "_blank");

	if (myWindow==null)
	{
		confirmShowAcc();
		return;
	}

	myWindow.document.write(html);
	myWindow.document.close();
}

function getPlayerAcc(name)
{
	for (var i=0;i<g_playerAcc.length;i++)
	{
		if (name==g_playerAcc[i].name)
			return g_playerAcc[i].ratio.toFixed(2);
	}

	return "";
}

function updatePlayerAccCounts(name,role,count,board,lindata)
{
	if (count==-1) return;	// Board was probably passed out, or has no play information

	var pobj = g_playerAcc.find(item => item.name === name);

	if (pobj==null)
	{
		pobj = {};
		pobj.name = name;
		pobj.declErrCount = 0;
		pobj.declCount = 0;
		pobj.leadErrCount = 0;
		pobj.leadCount = 0;
		pobj.leadPartnerErrCount = 0;
		pobj.leadPartnerCount = 0;
		pobj.boards = {};

		g_playerAcc.push(pobj);
	}

	if (role=="decl")
	{
		pobj.declCount++;
		pobj.declErrCount += count;
	}
	else if (role=="lead")
	{
		pobj.leadCount++;
		pobj.leadErrCount += count;
	}
	else if (role=="leadPartner")
	{
		pobj.leadPartnerCount++;
		pobj.leadPartnerErrCount += count;
	}

	var rec = {};
	rec.errCount = count;
	rec.lindata = lindata;
	pobj.boards[board.board] = rec;
}

function storeAccInMemory(context,index,count)
{
	var acc = null;
	var bdindex = context.bdindex;
	var board;

	if (context.tindex!==-1)
	{
		var traveller = getTravellerForBoard(bdindex);
		var tindex = context.tindex;
		board = traveller.traveller_line[tindex].board;
		acc = board.acc;
	}
	else
	{
		board = g_hands.boards[context.bdindex];
		var acc = board.acc;
	}

	var plindex = (index + 2) % 4;
	acc[plindex] = count;

	return board;
}

function invoke_buildPage2()
{
	if (g_file!='')	// If a pbn or dlm filename was supplied.
		getHands({callback:buildpage2});
	else
		buildpage2();
}

function openIndexedDB()
{
	if ("indexedDB" in window)
	{
		console.log("indexedDB functionality is available in this browser");
		const request = indexedDB.open('cacheData', 1);

		request.onerror = function(event) {
		  console.log("Database error: " + event.target.errorCode);
		};

		request.onupgradeneeded = function(event) {
		  g_db = event.target.result;
		  const objectStore = g_db.createObjectStore("ddCache", { keyPath: "deal" });
		  objectStore.createIndex("time", "time", { unique: false });
		  const objectStore2 = g_db.createObjectStore("accCache", { keyPath: "key" });
		  objectStore2.createIndex("time", "time", { unique: false });
		};

		request.onsuccess = function(event) {
			g_db = event.target.result;
			invoke_buildPage2();
		}
	}
	else
	{
		console.log("indexedDB functionality is NOT available in this browser");
		invoke_buildPage2();
	}
}

function getDDTricks(msg)
{
	delete msg.pfunc;	// Can't pass cloned object containing function

	if (g_mworkers.length>0)
	{
		g_mworkers[g_nextmworker].postMessage(msg);

		g_nextmworker++;
		if (g_nextmworker>=g_mworkers.length) g_nextmworker = 0;
	}
	else	// Background workers not currently running
	{
		g_worker.postMessage(msg);
	}
}

function getIndexedDDTricks(msg)
{
	if (g_db==null)
		getDDTricks(msg);
	else
	{
		const transaction = g_db.transaction(["ddCache"], "readwrite");
		const objectStore = transaction.objectStore("ddCache");
		var req = objectStore.get(makeDealKey(msg.dealstr,msg.vulstr,msg.leadstr));

		req.onsuccess = function(event){
			if (typeof event.target.result!=="undefined")
			{
				var dataObj = event.target.result;
				dataObj.dd.sess.sockref = this.sockref;
				var data = JSON.stringify(dataObj.dd);
				dddLoadMakeable(data,"","",this.context.bindex);
			}
			else	// get it remotely or calculate locally
			{
				getDDTricks(this);
			}
		}.bind(msg);
	}
}

function startAnalyseAll()
{
	// Generate background requests to calculate makeable contracts for all boards
	log('button=analyseAll');
	restartBackgroundWorkers();

	g_bgObj.fn = "analyseAll";		// Will be processed by worker event listener function when background workers have initialised
}

function generateBackgroundAccRequests()
{
	g_bgObj.fn = "processAccs";		// Will be processed by worker event listener function when background workers have initialised
}

function callGetIndexedAcc()
{
		// Revert the current traveller back to g_hands.pair_number/g_hands.direction
	var display = document.getElementById("scoreandtraveller").style.display;
	gotoNextTraveller();
	gotoPrevTraveller();
	if (display=="none") $("#scoreandtraveller").hide();
	getIndexedAcc();
}

function getIndexedAcc()
{
	restartBackgroundWorkers();
	g_completionTarget = 0;
	g_completionCount = 0;

	$("#toolsSubMenu").hide();

	if (!accCalcPossible())
	{
		switch(language)
		{
			case "de":
				doPopupAt("<div style=\"padding:10px;background-color:#FFFFEE;width:180px;border:solid black 1px;\"><span style=\"font-size:16px;\">Kann die Spielgenauigkeit nicht berechnen (die Boards enthalten kein Abspiel)</span></div>",200,200);
				break;
			default:
				doPopupAt("<div style=\"padding:10px;background-color:#FFFFEE;width:180px;border:solid black 1px;\"><span style=\"font-size:16px;\">Can't calculate accuracy of play (boards do not contain a record of the card play sequence)</span></div>",200,200);
		}
		return;
	}

	if (g_db==null)	// IndexedDB not supported in this browser
	{
		generateBackgroundAccRequests();
	}
	else
	{
		var boards;
		const transaction = g_db.transaction(["accCache"], "readwrite");
		const objectStore = transaction.objectStore("accCache");

		if (g_travellers!==null)
			boards = g_travellers.event.board;
		else
			boards = g_hands.boards;

		for (var i=0;i<boards.length;i++)
		{
		  var board = boards[i];

		  if (g_travellers!==null)
		  {
			  var tlines = board.traveller_line;

			  for (var j=0;j<tlines.length;j++)
			  {
				  let tline = tlines[j];

				  if (accCalcPossibleForBoard(tline.board))
				  {
					  var req = objectStore.get(makeAccKey(tline.board));

					  req.onsuccess = function(event){
						  if (typeof event.target.result!=="undefined")
						  {
							this.board.acc = event.target.result.acc;
							g_completionTarget++;
							g_completionCount++;
						  }
						}.bind(tline);
				  }
			  }
		  }
		  else
		  {
				if (accCalcPossibleForBoard(board))
				{
					  var req = objectStore.get(makeAccKey(board));

					  req.onsuccess = function(event){
						  if (typeof event.target.result!=="undefined")
						  {
							this.acc = event.target.result.acc;
							g_completionTarget++;
							g_completionCount++;
						  }
						}.bind(board);
				}
		  }
		}

		transaction.oncomplete = function(event) {
			console.log("All acc values retrieved");
			purgeOldEntries();		// Remove old entries from acc cache

			generateBackgroundAccRequests();
		};
	}
}

function purgeOldEntries()
{
	if (g_db==null) return;

	const transaction = g_db.transaction(["accCache"], "readwrite");
	const objectStore = transaction.objectStore("accCache");

	const myIndex = objectStore.index("time");
	const countRequest = myIndex.count();
	countRequest.onsuccess = function(){
		if (countRequest.result>5000)
		{
			var delCount = countRequest.result - 5000;

				// delete oldest items
			const myIndex = objectStore.index("time");

			myIndex.openCursor().onsuccess = function(){
				const cursor = event.target.result;
				if (cursor) {
				  if (delCount>0)
				  {
					  delCount = delCount-1;
					  const key = cursor.value.key;
					  objectStore.delete(key);
					  cursor.continue();
				  }
				} else {
				  console.log("Old entries purged from accCache in indexedDB");
				}
			};
		}
	};
}

function storeAcc(data,context)
{
	var tmp = data.sess;

	var errCount = tricksConceded(tmp);
	var names = context.names;
	var declarer = context.declarer;

	var direction = "NESW";
	var declIndex = direction.indexOf(declarer.toUpperCase());
	var declName = returnName(names,declIndex,false);
	var leadIndex = (declIndex + 1) % 4;
	var leadName = returnName(names,leadIndex,false);

	var leadErrCount = errCount[leadIndex];

	var leadPartnerIndex = (leadIndex + 2) % 4;
	var leadPartnerName = returnName(names,leadPartnerIndex,false);

	var partnerErrCount = errCount[leadPartnerIndex];

		// Update the board record (in g_hands.boards, or in traveller if there are any
	storeAccInMemory(context,declIndex,tmp.declErr);
	storeAccInMemory(context,leadIndex,leadErrCount);
	var board = storeAccInMemory(context,leadPartnerIndex,partnerErrCount);

	if (g_db!==null)
	{
		const transaction = g_db.transaction(["accCache"], "readwrite");
		const objectStore = transaction.objectStore("accCache");

		var data = {};
		data.key = makeAccKey(board);
		data.acc = board.acc;
		data.time = Date.now();

		var req = objectStore.put(data);
	}

	g_completionCount++;
	document.getElementById("progress").style.width = ((800*g_completionCount)/g_completionTarget).toFixed(0) + "px";
}

function returnAccValue(acc,index)
{
	var index = (index + 2) % 4;
	return acc[index];
}

function getCachedAcc(tline)
{
	var board = tline.board;
	var declarer = board.Declarer;
	var direction = "NESW";
	var names = board.PlayerNames;

	var acc = tline.board.acc;

	var declIndex = direction.indexOf(declarer.toUpperCase());
	var declName = returnName(names,declIndex);
	var declErrCount = returnAccValue(acc,declIndex);
	var leadIndex = (declIndex + 1) % 4;
	var leadName = returnName(names,leadIndex);
	var leadErrCount = returnAccValue(acc,leadIndex);
	var leadPartnerIndex = (leadIndex + 2) % 4;
	var leadPartnerName = returnName(names,leadPartnerIndex);
	var partnerErrCount = returnAccValue(acc,leadPartnerIndex);

	displayAcc(declName,declErrCount,leadName,leadErrCount,leadPartnerName,partnerErrCount,0,1);
}

function displayAcc(declName,declErrCount,leadName,leadErrCount,leadPartnerName,partnerErrCount,elapsed,dest)
{
	var defErrCount = Number(leadErrCount) + Number(partnerErrCount);

	var acc = document.getElementById("accuracy");
	switch(language)
	{
		case "de":
			var str = "<div style=\"float:left;clear:both;\"><div style=\"float:left;\"><span style=\"font-size:24px;\">Abspielgenauigkeit</span></div><div style=\"float:left;clear:both;margin-top:10px;\"><span style=\"font-size:16px;color:black;\">Anzahl der Abweichungen vom optimalen Double Dummy Abspiel:</span></div>";
			break;
		default:
			var str = "<div style=\"float:left;clear:both;\"><div style=\"float:left;\"><span style=\"font-size:24px;\">Accuracy of Play</span></div><div style=\"float:left;clear:both;margin-top:10px;\"><span style=\"font-size:16px;color:black;\">Number of card play deviations from optimal<br>double dummy play:</span></div>";
	}

	var str2 = "<div style=\"margin-top:10px;float:left;clear:both;\"><span style=\"font-size:18px;color:blue;\">";

	switch(language)
	{
		case "de":
			if ((declErrCount==0)&&(defErrCount==0))
				str = str + str2 + "Abspiel des Alleinspielers und der Gegner war optimal</span></div>";

			if (declErrCount>0)
				str = str + str2 + "Alleinspieler (" + declName + "): " + declErrCount + "</span></div>";

			if (defErrCount>0)
			{
				str = str + str2 + "Gegner: " + defErrCount;
				str += "<br>&nbsp;&nbsp;&nbsp;Ausspieler (" + leadName + "): " + leadErrCount;
				str += "<br>&nbsp;&nbsp;&nbsp;Partner: (" + leadPartnerName + "): " + partnerErrCount + "</span></div>";
			}
			break;
		default:
			if ((declErrCount==0)&&(defErrCount==0))
				str = str + str2 + "Card play was optimal by declarer and defenders</span></div>";

			if (declErrCount>0)
				str = str + str2 + "Declarer (" + declName + "): " + declErrCount + "</span></div>";

			if (defErrCount>0)
			{
				str = str + str2 + "Defenders: " + defErrCount;
				str += "<br>&nbsp;&nbsp;&nbsp;Lead Defender (" + leadName + "): " + leadErrCount;
				str += "<br>&nbsp;&nbsp;&nbsp;Partner: (" + leadPartnerName + "): " + partnerErrCount + "</span></div>";
			}
	}
	str += "</div></div>";

//		str += "<br>Elapsed time: " + tmp.sess.deltaElapsed + "<br><br>";

/*		var optCount = 0;
	var subOptCount = 0;

	for (var i=0;i<tmp.sess.optimumCount.length;i++)
	{
		if (tmp.sess.cardDirection[i]==0)
		{
			optCount += tmp.sess.optimumCount[i];
			subOptCount += tmp.sess.subOptimumCount[i];
		}
	}

	str += " ,optimumCardRatio: " + optCount/(optCount+subOptCount);*/

	if (dest==0)
		acc.innerHTML = "<span style=\"font-size:16px;color:blue;\">" + str + "</span>";
	else
	{
		switch(language)
		{
			case "de":
				var htmltext = "Abspielgenauigkeit:<br>Fehler des Alleinspielers: " + declErrCount + "<br>" + "Fehler der Gegner: " + defErrCount + "<br>" + "Verbrauchte Zeit: " + elapsed + " Sekunden";
				htmltext = "</div><br><button style=\"cursor:pointer;margin-top:15px;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Schließen</button>";
				doPopupNoTimeout(document.getElementById("boardNumber"),"<span style=\"font-size:16px;color:blue;\">" + str + htmltext + "</span>",250,50);
				break;
			default:
				var htmltext = "Accuracy of Play:<br>Declarer Errors: " + declErrCount + "<br>" + "Defence Errors: " + defErrCount + "<br>" + "Elapsed Time: " + elapsed + " seconds";
				htmltext = "</div><br><button style=\"cursor:pointer;margin-top:15px;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Close</button>";
				doPopupNoTimeout(document.getElementById("boardNumber"),"<span style=\"font-size:16px;color:blue;\">" + str + htmltext + "</span>",250,50);
		}
	}
}

function load(data,statusText,jqXHR,ctx)
{
	var context = this;
		// Note: The direction index for Names is 2,3,0,1 for N,E,S,W, but for errCount is 0,1,2,3
	hideSpinner();
	resetTimeout();
	var tmp = data;

	tmp = JSON.parse(tmp);
	tmp = tmp.sess;

	if (load.arguments.length>3)	// being performed locally, not on server
		context = ctx;

	var errCount = tricksConceded(tmp);


	var names = context.names;
	var declarer = context.declarer;

	var direction = "NESW";
	var declIndex = direction.indexOf(declarer.toUpperCase());
	var declName = returnName(names,declIndex);
	var declErrCount = tmp.declErr;
	var leadIndex = (declIndex + 1) % 4;
	var leadName = returnName(names,leadIndex);

	var leadErrCount = errCount[leadIndex];

	var leadPartnerIndex = (leadIndex + 2) % 4;
	var leadPartnerName = returnName(names,leadPartnerIndex);

	var partnerErrCount = errCount[leadPartnerIndex];
	var elapsed = tmp.deltaElapsed;

	displayAcc(declName,declErrCount,leadName,leadErrCount,leadPartnerName,partnerErrCount,elapsed,this.dest);
}

function load2(data,statusText,	jqXHR)
{
	hideSpinner();
	resetTimeout();

	var tmp = data;
	tmp = JSON.parse(tmp);

	switch(language)
	{
		case "de":
			var htmltext = "Spielgenauigkeit:<br>Fehler des Alleinspielers: " + tmp.sess.declErr + "<br>" + "Fehler der Gegner: " + tmp.sess.defErr + "<br>" + "Verbrauchte Zeit: " + tmp.sess.deltaElapsed + " Sekunden";
			htmltext += "</div><br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Schließen</button>";
			break;
		default:
			var htmltext = "Accuracy of Play:<br>Declarer Errors: " + tmp.sess.declErr + "<br>" + "Defence Errors: " + tmp.sess.defErr + "<br>" + "Elapsed Time: " + tmp.sess.deltaElapsed + " seconds";
			htmltext += "</div><br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Cancel</button>";
	}

	doPopupNoTimeout(document.getElementById("boardNumber"),htmltext,250,50);
}

function dddloadfunc(data,statusText,jqXHR,context)
{
		// Process the response from a ddd request
	var ctx = this;
	if (dddloadfunc.arguments.length>3) ctx = context;

	hideSpinner();
	resetTimeout();

	if (g_mode==1)
	{
		var tmp =data;
		tmp = JSON.parse(tmp);
//				alert(tmp.sess.deltaElapsed);

		if ((tmp.sess.status<200)&&(tmp.sess.status!=0))
		{
			if (tmp.sess.status==14)
			{
				displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Request Timed Out</span>");
				return;
			}
			else
			{
				displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Error: " + tmp.sess.status + "</span>");
				return;
			}
		}

		if (ctx.para=="new")
		{
			log("fn=playcontract");
		}

		if (ctx.para=="new")	// If it's a new session store the session identifier as the current session
		{
			if (tmp.requesttoken==g_session)	// response holds the correct request token, so update the session number to reflect the global session id allocated by the cgi
				setSession(tmp.sess.sockref);
			else
				return;	// this session was cancelled before this response was received.
		}

		if (tmp.sess.sockref!=g_session)	// Don't process this response, this session is no longer current.
			return;
		else
		{
			if (tmp.sess.status==0)
				processPosition(tmp.sess);
			else							// some kind of error detected by ddd
			{
				if (tmp.sess.status==201)	// No lock file, session never existed or timed out
				{
					switch(language)
					{
						case "de":
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Keine aktive Session (abgelaufen?)</span>");
							break;
						default:
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">No active session (expired?)</span>");
					}
				}
				else if (tmp.sess.status==207)
				{
					switch(language)
					{
						case "de":
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Kann nicht zurückgehen, es wurde noch keine Karte gespielt</span>");
							break;
						default:
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Cannot go back, no card has been played yet</span>");
					}
				}
				else if (tmp.sess.status==208)	// hand finished, all tricks now played
				{
					processPosition(tmp.sess);
				}
				else if (tmp.sess.status==209)
				{
					switch(language)
					{
						case "de":
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Ungültige Karte in der aufgezeichneten Abspielfolge</span>");
							break;
						default:
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Invalid card in recorded play sequence</span>");
					}
				}
				else if (tmp.sess.status!=202) // Not a 'lock file' busy message
				{
					switch(language)
					{
						case "de":
							alert("Fehler " + tmp.sess.status + "," + tmp.sess.errno + " - " + tmp.sess.errmsg);
							break;
						default:
							alert("Error " + tmp.sess.status + "," + tmp.sess.errno + " - " + tmp.sess.errmsg);
					}
				}
			}
		}
	}
}



function hideForwardPlay()
{
		// Try/Catch in case using older version of ddummy.htm without this button
	try {
		hide("forwardPlay");
	} catch (err) {};
}

function showForwardPlay()
{
		// Try/Catch in case using older version of ddummy.htm without this button
	try {
			// Only show this button if playing a contract from a BBO lin file
		if (g_showPlay!=0) show("forwardPlay");
	} catch (err) {};
}



function selectQuadrant(index)
{
	if (g_stopPropagation!=0)
	{
		g_stopPropagation = 0;
		return;
	}

	if (g_handEntryMode!=0)
	{
		if (index!=g_inputDir)
		{
			deselectCurrentDir(index);
			setInputDirection(index);
			initHandEntry();
			processHandEntry();
		}
	}
}

function calculateMakeableSingleBoard(bindex)
{
	if (!requestPending())
		calculateMakeableContracts(dddLoadMakeable,getRequestedLeads(bindex),bindex);
}







function calculateMakeableContracts(pfunc,pleadstr,bindex)
{
	var i,j,k;

	requestStr = "";
	paraStr = "";

	var validBoard = true;

	var started = 0;
	var vul = "";
	var deal = "";

	for (k=bindex;k<g_hands.boards.length;k++)
	{
		validBoard = checkBoardValid(k);

		if (validBoard) break;
	}

	bindex = k;

	if (validBoard)
	{
		var deal = g_hands.boards[bindex].Deal;
		var dealstr = deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
			// Get the makeable contracts for the current board.
		var suitCHARS = "CDHSN";
		var dealerChars = "ewsn";	// Dealer is one place to the right of declarer

		vul = g_hands.boards[bindex].Vulnerable;
		if (g_allBoards==0) g_hands.boards[bindex].OptimumScore = "";
		if (bindex==g_lastBindex) updateUpperLeftQuadrant(bindex);

		var contracts;

		contracts = document.getElementById("makeableContracts");

		var rows = contracts.rows;

		if (g_allBoards==0)
		{
			g_hands.boards[bindex].DoubleDummyTricks = "********************";
			spinnerNoDelay(document.getElementById("makeableContracts").rows[1].cells[0]);
		}

		requestStr = "W:" + dealstr.split("x").join(" ");

			// Clear makeable contracts table.
		if (bindex==g_lastBindex)
			for (j=0;j<5;j++)		// For each trump suit
				for (i=0;i<4;i++)	// For each leader
				{
					rows[1+i].cells[1+j].firstChild.childNodes[0].nodeValue = "*";
				}
	}

	if (validBoard)
	{
		var tag = g_mcSession++;
		g_hands.boards[bindex].tag = tag;

		var leadstr = "";

		if (pleadstr!="")
		{
			if (g_allBoards==0) largeSpinner();
			leadstr = "&leadstr=" + pleadstr;
		}

		var notFound = true;

		dealstr = "W:" + dealstr;

		var context = {};
		context.para = "makeable";
		context.bindex = bindex;
		context.request = "m";

		var msg = {};
		msg.request = "m";
		msg.dealstr = dealstr;
		msg.leadstr = pleadstr;
		msg.vulstr = vul;
		msg.pfunc = pfunc;

		msg.sockref = tag;
		msg.context = context;

		getIndexedDDTricks(msg);	// Note: This can be an asynchronous request
	}

	if ((!validBoard)&&g_allBoards==0)
	{
		var errormsg;

		switch(language)
		{
			case "de":
				errormsg = "<div style=\"padding:10px;background-color:#FFFFEE;width:180px;border:solid black 1px;\"><span style=\"font-size:16px;\">Allen Händen müssen 13 Karten zugewiesen sein, bevor die machbaren Kontrakte berechnet werden können.</span></div>";
				break;
			default:
				errormsg = "<div style=\"padding:10px;background-color:#FFFFEE;width:180px;border:solid black 1px;\"><span style=\"font-size:16px;\">All hands must contain 13 cards before makeable contracts can be calculated.</span></div>";
		}


		displayErrorAbsPosition(errormsg,300,250);
	}
	else if ((!validBoard)&&(g_allBoards!=0))
	{
		var mccount = makeableContractRequestsOutstanding(); // Count this board as analysed, so that end of sequence can still be detected

		if (mccount==0) completedAnalyseAllBoards();
	}
}

function showBoardKeypad()
{
	var boardThreshold = 36; // Show a scroll bar if more boards than this
	switch(language)
	{
		case "de":
			var htmltext = "<span style=\"font-weight:bold;\">Wähle Board Nummer...</span><br>";
			break;
		default:
			var htmltext = "<span style=\"font-weight:bold;\">Go to Board Number...</span><br>";
	}
	var i;

	if (g_hands.boards.length>boardThreshold) htmltext += "<div style=\"overflow:scroll;max-height:300px;\">";

	for (i=0;i<g_hands.boards.length;i++)
	{
		if ((typeof g_hands.boards[i].Deal)!="undefined")
		{
			var board = g_hands.boards[i].board;
			htmltext = htmltext + "<button onclick=\"log('button=gotoBoard');gotoTravellerByIndex(" + i + ");\" style=\"width:50px;cursor:pointer;font-size:14px;padding:1px;text-align:center\">" + makeBoardNameString(board) + "</button>";
		}

		if ((i%10)==9) htmltext = htmltext + "<br>";
	}

	if (g_hands.boards.length>boardThreshold) htmltext += "</div>";

	switch(language)
	{
		case "de":
			htmltext = htmltext + "</div><br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Schließen</button>";
			break;
		default:
			htmltext = htmltext + "</div><br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Close</button>";
	}

	hideAllPopups();
	doPopupNoTimeout(document.getElementById("gotoBoard"),htmltext,100,50);
}

function showNewBoardSelector()
{
	switch(language)
	{
		case "de":
			var htmltext = "<span style=\"font-weight:bold;\">Wählen Sie eine Boardnummer im Bereich 1 bis 99 (bereits verwendete Nummern werden nicht angzeigt)</span><br><br>";
			break;
		default:
			var htmltext = "<span style=\"font-weight:bold;\">Choose A Number For New Board in range 1 to 99 (numbers in use are not shown)</span><br><br>";
	}

	var i;
	var buttonCount = 0;

	for (i=1;i<100;i++)
	{
	    var j;
	    var inUse = false;

	    for (j=0;j<g_hands.boards.length;j++)
	    {
	        if (g_hands.boards[j].board==i) {inUse = true;break;}
	    }

        if (!inUse)
        {
            buttonCount++;
		    htmltext = htmltext + "<button onclick=\"log('button=newBoard');newBoard(" + i + ");gotoTraveller(\'" + i + "\');terminateSession();edit();\" style=\"width:50px;font-size:14px;padding:1px;text-align:center\">" + i + "</button>";
        }

		if ((buttonCount%12)==11) htmltext = htmltext + "<br>";
	}

	switch(language)
	{
		case "de":
			htmltext = htmltext + "<br><br><button onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Schließen</button>";
			break;
		default:
			htmltext = htmltext + "<br><br><button onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Close</button>";
	}

	$("#optionsBox").hide();
	hideHelp();
	doPopupNoTimeout(document.getElementById("newBoard"),htmltext,100,50);
}

function showTravellerKeypad()
{
	switch(language)
	{
		case "de":
			var htmltext = "<span style=\"font-weight:bold;\">Wähle Board Nummer ...</span><br>";
			break;
		default:
			var htmltext = "<span style=\"font-weight:bold;\">Go to Board Number...</span><br>";
	}
	var i;
	var str = "";

	if (g_handEntryMode!=0) str = "edit();";

	for (i=0;i<g_hands.boards.length;i++)
	{
		var board = g_hands.boards[i].board.toString();
		htmltext = htmltext + "<button onclick=\"$('#popup_box').hide();log('button=gototraveller');setLastBoardIndex(getTindexByName(g_hands.boards,'" + board + "'));showComparison();\" style=\"width:50px;cursor:pointer;font-size:14px;padding:1px;text-align:center\">" + makeBoardNameString(board) + "</button>";

		if ((i%10)==9) htmltext = htmltext + "<br>";
	}

	switch(language)
	{
		case "de":
			htmltext = htmltext + "<br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Schließen</button>";
			break;
		default:
			htmltext = htmltext + "<br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Close</button>";
	}

	hideAllPopups();
	doPopupNoTimeout(document.getElementById("gotoBoard"),htmltext,100,50);
}

function initSettings()
{
	if (localStorageSupported())
	{
		if (document.getElementById("mkauto1").checked)
		{
			res = localStorage.getItem("mkauto1");

			if (res!==null)
			{
				document.getElementById("mkauto1").checked = (res==="true");
			}
			else
			{
				document.getElementById("mkauto1").checked = true;
			}
		}

		document.getElementById("mkauto1").onclick = document.getElementById("mkautolab1").onclick = function(){localStorage.setItem("mkauto1",document.getElementById("mkauto1").checked);};

		var krck = document.getElementById("krcalc");

		if (krck!==null)
		{
			res = localStorage.getItem("krcalc");

			if (res!==null)
			{
				if (res=="true")
					krck.checked  = true;
				else
					krck.checked = false;
			}
		}
	}
}

function setOptions(optionsStr)
{
		//*** This function is only called at startup, from buildPage1
	try {
		if (optionsStr!==null)
		{
			var options = JSON.parse(optionsStr);
			document.getElementById("nsrad1").checked = options.options.ns[0]==="true";
			document.getElementById("nsrad2").checked = options.options.ns[1]==="true";
			document.getElementById("nsrad3").checked = options.options.ns[2]==="true";
			document.getElementById("ewrad1").checked = options.options.ew[0]==="true";
			document.getElementById("ewrad2").checked = options.options.ew[1]==="true";
			document.getElementById("ewrad3").checked = options.options.ew[2]==="true";
			document.getElementById("mkrad1").checked = options.options.mk[0]==="true";
			document.getElementById("mkrad2").checked = options.options.mk[1]==="true";
		}

		var sel = document.getElementById("honourCardSet");

		if (sel!=null)
		{
			if (localStorageSupported())
			{
				var value = localStorage.getItem("honourCardSet");
				if (value!=null) sel.value = value;
			}
		}
	} catch (err) {alert(err);};
}

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











function calculateCrossImps()
{
	var boards = g_travellers.event.board;
	var i;

	var pairs = g_travellers.event.participants.pair;

	for (i=0;i<pairs.length;i++)
		pairs[i].crossImpsBoardsPlayed = 0;

	for (i=0;i<boards.length;i++)
	{
		var tlines = boards[i].traveller_line;
		var j,k;

		for (j=0;j<tlines.length;j++)
		{
			var includeBoard = true;

			includeBoard = isValidCrossImps(tlines[j]);

			if (played(tlines[j]))	// Otherwise this pair didn't play this board.
			{
				var totalNS = 0;
				var totalEW = 0;
				var nplayed = 0;

				if (scoreContainsAdjustment(tlines[j]))
				{
					nplayed++;

					totalNS = convertAdjustmentToCrossImps(tlines[j],1);
					totalEW = convertAdjustmentToCrossImps(tlines[j],2);
				}
				else
				{
					var score1 = tlines[j].score;

					for (k=0;k<tlines.length;k++)
					{
						if (k!=j)
						{
							if (played(tlines[k]))	// otherwise other pair didn't play board
							{
								if (!scoreContainsAdjustment(tlines[k]))
								{
									nplayed++;

									if (includeBoard)
									{
										var score2 = tlines[k].score;
										totalNS = totalNS + convertScoreToImps(score1,score2);
										totalEW = totalEW + convertScoreToImps(score2,score1);
									}
								}
							}
						}
					}
				}

				if (nplayed>0)
				{
					var infoNS = getPlayerInfo(tlines[j].ns_pair_number,1);
					var infoEW = getPlayerInfo(tlines[j].ew_pair_number,2);
					var nsIndex = infoNS.pair_index;
					var ewIndex = infoEW.pair_index;

					if (includeBoard)
					{
						tlines[j].crossImpsNS = (totalNS/nplayed).toFixed(2);
						tlines[j].crossImpsEW = (totalEW/nplayed).toFixed(2);
					}
					else
					{
						tlines[j].crossImpsNS = "";
						tlines[j].crossImpsEW = "";
					}

					if ((typeof g_travellers.event.participants.pair[nsIndex].boardsPlayed)=="undefined")
					{
						g_travellers.event.participants.pair[nsIndex].boardsPlayed = 0;
						g_travellers.event.participants.pair[nsIndex].totalCrossImps = 0;
					}

					if ((typeof g_travellers.event.participants.pair[ewIndex].boardsPlayed)=="undefined")
					{
						g_travellers.event.participants.pair[ewIndex].boardsPlayed = 0;
						g_travellers.event.participants.pair[ewIndex].totalCrossImps = 0;
					}

					var nsObj = g_travellers.event.participants.pair[nsIndex];
					var ewObj = g_travellers.event.participants.pair[ewIndex];

					nsObj.boardsPlayed++;
					ewObj.boardsPlayed++;

					if (includeBoard)
					{
						nsObj.crossImpsBoardsPlayed++;
						ewObj.crossImpsBoardsPlayed++;

						nsObj.totalCrossImps += Number((totalNS/nplayed).toFixed(2));
						ewObj.totalCrossImps += Number((totalEW/nplayed).toFixed(2));
					}
				}
				else
				{
					tlines[j].crossImpsNS = "";
					tlines[j].crossImpsEW = "";
				}
			}
		}
	}

	var pairs = g_travellers.event.participants.pair;

	for (i=0;i<pairs.length;i++)
	{
		pairs[i].crossImpsPerBoard = Number(pairs[i].totalCrossImps)/pairs[i].crossImpsBoardsPlayed;
	}
}

function calculateMaxImps()
{
	if ((typeof g_travellers)!="undefined")
	{
		var travellers = g_travellers.event.board;
		var maxImps = -32767;
		var i,j;

		for (i=0;i<g_travellers.event.board.length;i++)
		{
			var board = g_travellers.event.board[i];

			for (j=0;j<board.traveller_line.length;j++)
			{
				var tline = board.traveller_line[j];
				var nspts = Number(tline.ns_match_points);
				var ewpts = Number(tline.ew_match_points);

				if ((nspts<0)||(ewpts<0)) g_scoring = "IMP";

				if (g_eventType!="Teams")
				{
					if (nspts>maxImps) maxImps = nspts;
					if (ewpts>maxImps) maxImps = ewpts;
				}
				else if (Math.abs(tline.crossImpsNS)>maxImps)
				{
					maxImps = Math.abs(tline.crossImpsNS);
				}
				else if (Math.abs(tline.crossImpsEW)>maxImps)
				{
					maxImps = Math.abs(tline.crossImpsEW);
				}
			}
		}

		g_maxImps = maxImps;
	}
}

function showBidAlert(pthis){
		// Show the explanation of the bid
	var id = Number(pthis.id.substring(6));
	var bids = g_hands.boards[g_lastBindex].Bids;
	var msg = bids[id];
	msg = msg.split("|");

	if (msg.length>1)
		msg = msg[1];

	var popup = document.getElementById("popup_box");
	popup.style.padding = "2px";
	popup.style.backgroundColor = "yellow";
	popup.style.top = ((getPosition(pthis).y) - 20 - $(this).scrollTop()) + "px";
	const clean = DOMPurify.sanitize("<span style='font-weight:bold;'>" + msg + "</span>", { RETURN_DOM_FRAGMENT: true });
	popup.replaceChildren(clean); //innerHTML = "<span style='font-weight:bold;'>" + msg + "</span>";
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").delay(100).fadeIn(200).delay(4000).fadeOut(100);
	popup.style.left = (getPosition(pthis).x -  $(popup).width())  + "px";
}

function showNames(pthis,dir){
		// Show popup with player names
	if (pthis.innerHTML == "") return;
	var pair = pthis.innerHTML;
	var info = getPlayerInfo(pair,dir);
	var pairs;
	var dirLabel = "N/S";

	if (dir==2) dirLabel = "O/W";

	if (info.singleWinner)
		dirLabel = "Pair";

	var text ="&nbsp;" + info.player1 + " & " + info.player2 + "  " + dirLabel + " " + pair + "&nbsp;";

	var popup = document.getElementById("popup_box");
	popup.style.padding = "0px";
	popup.style.top = ((getPosition(pthis).y) - 20 - $(this).scrollTop()) + "px";
	popup.style.left = getPosition(pthis).x  + "px";
	const clean = DOMPurify.sanitize(text, { RETURN_DOM_FRAGMENT: true });
	popup.replaceChildren(clean); //innerHTML = text;
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").delay(100).fadeIn(200).delay(4000).fadeOut(100);
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


function getPlayerAndRole(info,tline)
{
	var prole = {};
	var found = false;
	var tdirection = 1;		// assume played North/South
	var declarer_pair = false;
	var first = false;
	var opp_pair;
	var optNE = document.getElementById("pdiroptNE").checked;
	var optNW = document.getElementById("pdiroptNW").checked;
	var optSE = document.getElementById("pdiroptSE").checked;

	if ((info.pair_number==tline.ns_pair_number)&&((info.direction==1)||info.singleWinner))
	{
		found = true;
		tdirection = 1;	// Played NS

		opp_pair = tline.ew_pair_number;

		if ((tline.played_by=="N")||(tline.played_by=="S"))
		{
			declarer_pair = true;

			if (((!info.singleWinner)&&(tline.played_by=="N"))||
				((info.singleWinner)&&optNE&&(tline.played_by=="N"))||
				((info.singleWinner)&&optNW&&(tline.played_by=="N"))||
				((info.singleWinner)&&optSE&&(tline.played_by=="S")))
			{
				first = true;
			}
		}
		else if (((!info.singleWinner)&&(tline.played_by=="W"))||
				((info.singleWinner)&&optNE&&(tline.played_by=="W"))||
				((info.singleWinner)&&optNW&&(tline.played_by=="W"))||
				((info.singleWinner)&&optSE&&(tline.played_by=="E")))
		{
			first = true;
		}
	}
	else if ((info.pair_number==tline.ew_pair_number)&&((info.direction==2)||info.singleWinner))
	{
		found = true;
		tdirection =2 ;	// played EW

		opp_pair = tline.ns_pair_number;

		if ((tline.played_by=="E")||(tline.played_by=="W"))
		{
			declarer_pair = true;

			if (((!info.singleWinner)&&(tline.played_by=="E"))||
				((info.singleWinner)&&optNE&&(tline.played_by=="E"))||
				((info.singleWinner)&&optNW&&(tline.played_by=="W"))||
				((info.singleWinner)&&optSE&&(tline.played_by=="E")))
				first = true;
		}
		else if (((!info.singleWinner)&&(tline.played_by=="N"))||
				((info.singleWinner)&&(optNE)&&(tline.played_by=="N"))||
				((info.singleWinner)&&(optNW)&&(tline.played_by=="S"))||
				((info.singleWinner)&&(optSE)&&(tline.played_by=="N")))
		{
			first = true;
		}
	}

	prole = {};
	prole.found = found;
	prole.tdirection = tdirection;
	prole.declarer_pair = declarer_pair;
	prole.first = first;
	prole.opp_pair = opp_pair;

	return prole;
}



function setButtonColor()
{
	document.getElementById("ascorecard").style.backgroundColor = "";
	document.getElementById("aranking").style.backgroundColor = "";
	document.getElementById("atraveller").style.backgroundColor = "";
	document.getElementById("acheck").style.backgroundColor = "";

	if (g_sessionMode=="scorecard") document.getElementById("ascorecard").style.backgroundColor = "#BBBB88";
	else if (g_sessionMode=="ranking") document.getElementById("aranking").style.backgroundColor = "#BBBB88";
	else if (g_sessionMode=="traveller") document.getElementById("atraveller").style.backgroundColor = "#BBBB88";
	else if (g_sessionMode=="check") document.getElementById("acheck").style.backgroundColor = "#BBBB88";
}

function showPlayAnalysis(bd)
{
	var ctx = g_scorecardContext[bd];
	var data=checkHigherScoringPairs(ctx.tlines,ctx.row,ctx.direction);
	setupResultReasons(ctx,data);
	var index = getTindexByName(g_hands.boards,bd);
	setupTraveller(index,false);

	if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
		if (g_hands.boards[g_lastBindex].Played.length>1)
			playLinContract(true,1);

//	showHelp(this,"resultReasons");
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








// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function loadTraveller_2(data,statusText,jqXHR)
{
	if (data!="") dddLoadMakeable(data,statusText,jqXHR,this.bindex);

	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);
	var player1 = info.player1;
	var player2 = info.player2;

	var pdirection = 1; // Assume played this board as NS (for singlewinner movement can switch direction

	var pairs = g_travellers.event.participants.pair;
	var declarer_pair = false;

	var tlines = g_currentTraveller.traveller_line;

	var i;

	var found = false;

	for (i=0;i<tlines.length;i++)
	{
		var tline = tlines[i];

		if (played(tline))
		{
			if (info.pair_found)
			{
				var prole,found,pdirection,declarer_pair,first,opp_pair;

				prole = getPlayerAndRole(info,tline);
				found = prole.found;
				pdirection = prole.tdirection;
				declarer_pair = prole.declarer_pair;
				first = prole.first;
				opp_pair = prole.opp_pair;

				if (found)
				{
					switch(language)
					{
						case "de":
							if (declarer_pair)
							{
								if (first) declarer_name = info.player1;
								else declarer_name = info.player2;
							}

							var subHeading = document.getElementById("compSubHeading");
							var hstr = "";

							hstr = "Board " +  g_currentTraveller.board_no;

							var dirstr = "NS";

							if (pdirection==2) dirstr = "EW";

							if (info.singleWinner)
								hstr = hstr + ", Vergleich für Paar " + g_hands.pair_number + " auf " + dirstr;
							else
								hstr = hstr + ", Vergleich für " + dirstr + " Paar " + g_hands.pair_number;

							hstr = hstr + " (" + player1 + " und " + player2 + ")";

							subHeading.innerHTML = "<span style=\"font-size:12px;\">" + hstr + "</span>";

							g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);

							if (g_currow==-1) continue;	// Didn't play on this traveller

							var tline = g_currentTraveller.traveller_line[g_currow];

							var str;

							if (!validContract(g_hands.boards[g_lastBindex].Contract))
							{
								if (tline.contract=="Passed")
									str = "Board wurde durchgepasst.";
								else if (tline.contract=="NP")
									str = "Board wurde nicht gespielt.";
								else
									str = "Kein Kontrakt vorhanden.";
							}
							else
							{
								str = "Kontrakt war " + g_hands.boards[g_lastBindex].Contract + " von " + g_hands.boards[g_lastBindex].Declarer + " ";

								if (declarer_pair)
									str = str + "(" + declarer_name + ")";
								else
								{
									str = str + "(gegen " + player1.split(" ")[0] + " und " + player2.split(" ")[0] + ")";
								}

								var contractLevel = Number(g_hands.boards[g_lastBindex].Contract.charAt(0));
								var overtricks = tline.tricks - (contractLevel + 6);

								str = str + " mit " + tline.tricks + " Stichen";

								if (overtricks>0)
									str = str + " (" + overtricks + " Überstiche)";
								else if (overtricks<0)
									str = str + " (" + (-overtricks) + " Faller)";
							}

							var nspts = Number(tline.ns_match_points);
							var ewpts = Number(tline.ew_match_points);

							if (g_scoring!="IMP")
							{
								var percent = 100*(nspts/(nspts + ewpts));

								if (pdirection==2) percent = 100 - percent;

								percent = parseFloat(Math.round(percent * 100) / 100).toFixed(0);
								var pbar = document.getElementById("pbar");
								var width = Math.round((percent*150)/100);
								width = width + "px";
								pbar.style.width = width;
								pbar.style.minWidth = width;
								pbar.style.MaxWidth = width;
								pbar.style.backgroundColor = "#55ff55";	// green

								document.getElementById("percentValue").innerHTML = percent + "%";
								$("#percentValue").show();
								$("#ourPercentage").show();
							}
							else
							{
								$("#percentValue").hide();
								$("#ourPercentage").hide();
							}

							if (validContract(g_hands.boards[g_lastBindex].Contract))
							{
								if (((typeof g_hands.boards[g_lastBindex].DoubleDummyTricks)!="undefined")&&checkBoardValid(g_lastBindex))
								{
									var ntricks2 = getMakeableTricksForContract(g_lastBindex,g_hands.boards[g_lastBindex].Contract,g_hands.boards[g_lastBindex].Declarer);

									if (tline.tricks==ntricks2)
										str = str + ", die gleiche Zahl wie von der Double Dummy Analyse vorhergesagt."
									else if (tline.tricks<ntricks2)
									{
										var shortfall = ntricks2 - tline.tricks;
										str = str + ", " + shortfall + " weniger als von der Double Dummy Analyse vorhergesagt.";
									}
									else
									{
										var excess = tline.tricks - ntricks2;
										str = str + ", " + excess + " mehr als von der Double Dummy Analyse vorhergesagt.";
									}

								}
							}

							var ourscore = tline.score;
							var res = compareScores(g_travellers.event.board[getTravIndex(g_lastBindex)].traveller_line,ourscore,pdirection);

							if (res.adjusted>0)	// We received a percentage instead of score (don't say anything.
							{
							}
							else if ((res.lower==0)&&(res.higher==0)) str = str + " Das war ein ganz flaches Board.";
							else if (res.higher==0)
							{
								if (res.same==0) str = str + " Das war einsamer Top.";
								else str = str + " Das war ein geteilter Top mit " + res.same + " anderen Paaren.";
							}
							else if (res.lower==0)
							{
								if (res.same==0) str = str + " Das war ein einsamer Nuller."
								else str = str + " Das war ein geteilter Nuller mit " + res.same + " anderen Paaren.";
							}
							else
								str = str + " Es gab " + res.higher + " bessere und " + res.lower + " schlechtere Paare in diesem Board."

							var ns = "NS";
							var ew = "EW";
							var str2 = "";

								// Temporarily disable this output.
		/*
							if (((pdirection==1)&&(ns.indexOf(g_hands.boards[g_lastBindex].Declarer)!=-1))|
								((pdirection==2)&&(ew.indexOf(g_hands.boards[g_lastBindex].Declarer)!=-1)))
							{
									// we were declarer
								// *** need to change this line if used: checkHigherScoringPairs(g_currentTraveller.traveller_line,g_currow,pdirection);

							}*/

							document.getElementById("comparisonText").innerHTML = "<span style=\"font-size:12px;\">" + str + str2 + "</span>";

			//				getInfoForSimilarContracts(g_currow,g_hands.direction);
							break;
						default:
							if (declarer_pair)
							{
								if (first) declarer_name = info.player1;
								else declarer_name = info.player2;
							}

							var subHeading = document.getElementById("compSubHeading");
							var hstr = "";

							hstr = "Board " +  g_currentTraveller.board_no;

							var dirstr = "NS";

							if (pdirection==2) dirstr = "EW";

							if (info.singleWinner)
								hstr = hstr + ", comparison for pair " + g_hands.pair_number + " playing " + dirstr;
							else
								hstr = hstr + ", comparison for " + dirstr + " pair " + g_hands.pair_number;

							hstr = hstr + " (" + player1 + " and " + player2 + ")";

							subHeading.innerHTML = "<span style=\"font-size:12px;\">" + hstr + "</span>";

							g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);

							if (g_currow==-1) continue;	// Didn't play on this traveller

							var tline = g_currentTraveller.traveller_line[g_currow];

							var str;

							if (!validContract(g_hands.boards[g_lastBindex].Contract))
							{
								if (tline.contract=="Passed")
									str = "Board was passed out.";
								else if (tline.contract=="NP")
									str = "Board was not played.";
								else
									str = "Contract not available.";
							}
							else
							{
								str = "Contract was " + g_hands.boards[g_lastBindex].Contract + " by " + g_hands.boards[g_lastBindex].Declarer + " ";

								if (declarer_pair)
									str = str + "(" + declarer_name + ")";
								else
								{
									str = str + "(defended by " + player1.split(" ")[0] + " and " + player2.split(" ")[0] + ")";
								}

								var contractLevel = Number(g_hands.boards[g_lastBindex].Contract.charAt(0));
								var overtricks = tline.tricks - (contractLevel + 6);

								str = str + " making " + tline.tricks + " tricks";

								if (overtricks>0)
									str = str + " (" + overtricks + " overtricks)";
								else if (overtricks<0)
									str = str + " (" + (-overtricks) + " off)";
							}

							var nspts = Number(tline.ns_match_points);
							var ewpts = Number(tline.ew_match_points);

							if (g_scoring!="IMP")
							{
								var percent = 100*(nspts/(nspts + ewpts));

								if (pdirection==2) percent = 100 - percent;

								percent = parseFloat(Math.round(percent * 100) / 100).toFixed(0);
								var pbar = document.getElementById("pbar");
								var width = Math.round((percent*150)/100);
								width = width + "px";
								pbar.style.width = width;
								pbar.style.minWidth = width;
								pbar.style.MaxWidth = width;
								pbar.style.backgroundColor = "#55ff55";	// green

								document.getElementById("percentValue").innerHTML = percent + "%";
								$("#percentValue").show();
								$("#ourPercentage").show();
							}
							else
							{
								$("#percentValue").hide();
								$("#ourPercentage").hide();
							}

							if (validContract(g_hands.boards[g_lastBindex].Contract))
							{
								if (((typeof g_hands.boards[g_lastBindex].DoubleDummyTricks)!="undefined")&&checkBoardValid(g_lastBindex))
								{
									var ntricks2 = getMakeableTricksForContract(g_lastBindex,g_hands.boards[g_lastBindex].Contract,g_hands.boards[g_lastBindex].Declarer);

									if (tline.tricks==ntricks2)
										str = str + ", the same number predicted by double dummy analysis."
									else if (tline.tricks<ntricks2)
									{
										var shortfall = ntricks2 - tline.tricks;
										str = str + ", " + shortfall + " fewer than predicted by double dummy analysis.";
									}
									else
									{
										var excess = tline.tricks - ntricks2;
										str = str + ", " + excess + " more than predicted by double dummy analysis.";
									}

								}
							}

							var ourscore = tline.score;
							var res = compareScores(g_travellers.event.board[getTravIndex(g_lastBindex)].traveller_line,ourscore,pdirection);

							if (res.adjusted>0)	// We received a percentage instead of score (don't say anything.
							{
							}
							else if ((res.lower==0)&&(res.higher==0)) str = str + " This was a completely flat board.";
							else if (res.higher==0)
							{
								if (res.same==0) str = str + " This was an outright top score.";
								else str = str + " This was a joint top with " + res.same + " other pairs.";
							}
							else if (res.lower==0)
							{
								if (res.same==0) str = str + " This was an outright bottom score."
								else str = str + " This was a joint bottom with " + res.same + " other pairs.";
							}
							else
								str = str + " There were " + res.higher + " higher scoring and " + res.lower + " lower scoring pairs on this board."

							var ns = "NS";
							var ew = "EW";
							var str2 = "";

								// Temporarily disable this output.
		/*
							if (((pdirection==1)&&(ns.indexOf(g_hands.boards[g_lastBindex].Declarer)!=-1))|
								((pdirection==2)&&(ew.indexOf(g_hands.boards[g_lastBindex].Declarer)!=-1)))
							{
									// we were declarer
								// *** need to change this line if used: checkHigherScoringPairs(g_currentTraveller.traveller_line,g_currow,pdirection);

							}*/

							document.getElementById("comparisonText").innerHTML = "<span style=\"font-size:12px;\">" + str + str2 + "</span>";

			//				getInfoForSimilarContracts(g_currow,g_hands.direction);

					}
					break;
				}
			}
		}
	}

	if (!found)
	{
		var str = "The currently selected pair (" + player1 + " & " + player2 + ") did not play this board.";
		str = str + " Colour coding of table below is from point of view of NS pairs."
		document.getElementById("compSubHeading").innerHTML = str;
		document.getElementById("percentValue").textContent = "";
		$("#ourPercentage").hide();
		$("#comparisonText").hide();
	}
	else
	{
		if (g_scoring!="IMP")
			$("#ourPercentage").show();
		else
			$("#ourPercentage").hide();

		$("#comparisonText").show();
	}

	displayTraveller(pdirection);

	hideSpinner();
	hideAllPopups();
	$("#scoreandtraveller").hide();
	hideRanking();
	$("#scores").hide();
	$("#comparison").show();
	$("#checkListDiv").hide();
	$("#abuttons").show();
}



function getDirectionForTline(tline,info)
{
}



function checkContract(bindex,trindex)
{
	var decl="NESW";
	var suits = "NSHDC";
	var result = {};
	result.valid = true;
	result.leadDeclError = false;
	result.possibleWrongPolarity = false;
	result.shortSuit = false;
	result.possibleSuitDeclError = false;

	if (!checkBoardValid(bindex))	// No Hand Record for this board
		return result;

	if (g_travellers==null) return result;	// No travellers, only hands records for this event.

	var traveller = getTravellerForBoard(bindex);

	if (traveller==null) return result;

	var line = traveller.traveller_line[trindex];

	if (validContract(line.contract))
	{
		var dcl = decl.indexOf(line.played_by);
		var partner = dcl + 2;
		partner = partner % 4;
		var leader = dcl + 1;
		if (leader>3) leader = 0;

		var declSuit = suits.indexOf(line.contract.charAt(1));
		result.declSuit = declSuit;

		if (declSuit>0)		// i.e. Not a NoTrump contract, so check combined trump suit length
		{
			var hand = g_hands.boards[bindex].Deal[dcl];
			hand = hand.split(".");
			var tks = hand[declSuit-1].length;
			var maxSuitLength = tks;

			hand = g_hands.boards[bindex].Deal[partner];
			hand = hand.split(".");

			if (hand[declSuit-1].length>maxSuitLength)
				maxSuitLength = hand[declSuit-1].length;

			var tks = tks + hand[declSuit-1].length;

			if ((tks<7)&&(maxSuitLength<5))
			{
				result.valid = false;
				result.shortSuit = true;
				result.combinedSuitLength = tks;
			}
		}

		if (line.tricks>=7)	// They made a contract in this suit, is it likely ?
		{
			var oppIndx1 = (dcl+1)%4;
			var oppIndx2 = (dcl+3)%4;

			var oppTks1 = getMakeableTricksForContract(bindex,line.contract,decl.charAt(oppIndx1));
			var oppTks2 = getMakeableTricksForContract(bindex,line.contract,decl.charAt(oppIndx2));

			if ((oppTks1>=9)||(oppTks2>=9))
			{
				result.valid = false;
				result.possibleSuitDeclError = true;
			}
		}

		if (line.lead!="")	// check lead card is consistent with declarer
		{
			var curlead = leadCard(line.lead).replace("10","T");

			var suit = curlead.charAt(1);
			var card = curlead.charAt(0);

			hand = g_hands.boards[bindex].Deal[leader];

			hand = hand.split(".");

			if (hand[suits.indexOf(suit)-1].indexOf(card)==-1)
			{
				var reason = "";
				var partner = leader + 2;
				partner = partner % 4;
				hand = g_hands.boards[bindex].Deal[partner];

				hand = hand.split(".");

				if (hand[suits.indexOf(suit)-1].indexOf(card)!=-1)
					result.possibleWrongPolarity = true;

				result.valid = false;
				result.leadDeclError = true;
				return result;
			}
			else
				return result;
		}
		else
			return result;
	}
	else
		return result;
}

function getRequestedLeads(bindex)
{
	var i;

	if (g_travellers==null) return "";	// No travellers, only hands records for this event.

	var traveller = getTravellerForBoard(bindex);

	if (traveller==null) return "";

	var leadsRequired = [];

	for (i=0;i<20;i++) leadsRequired[i] = 0;

	var lines = traveller.traveller_line;

			// Build up request string for required opening lead information for this traveller.
	for (i=0;i<lines.length;i++)
	{
		if (validContract(lines[i].contract))
		{
			var idx = getLeadsIdx(lines[i].contract,lines[i].played_by);
			leadsRequired[idx] = 1;

			if (lines[i].lead!="") g_travellersHaveLeads = true;
		}
	}

	var leadstr = "";

	for (i=0;i<20;i++) leadstr = leadstr + leadsRequired[i];

	if (leadstr.indexOf("1")!=-1) return leadstr;
	else return "";
}

function showComparison()
{
	g_sessionMode = "traveller";
	setButtonColor();

		// Display the information extracted from the traveller for the current board
	var i;

	setCurrentTraveller();

	if (g_currentTraveller!=null)
	{
		if (((typeof g_hands.boards[g_lastBindex].openingLeads)=="undefined")&&!g_backgroundFetchCompleted)
		{
			if ((typeof g_hands.boards[g_lastBindex].Deal)!="undefined")
			{
				var leadstr = getRequestedLeads(g_lastBindex);

				calculateMakeableContracts(loadTraveller_2,leadstr,g_lastBindex);
			}
			else	// No Hand Data available
			{
				this.bindex = g_lastBindex;
				loadTraveller_2("","","");
			}
		}
		else
		{
			this.bindex = g_lastBindex;
			loadTraveller_2("","","");
		}
	}
	else
	{
		hideAllPopups();
		$("#scoreandtraveller").hide();
		hideRanking();
		$("#scores").hide();
		$("#abuttons").show();

		displayErrorAbsPosition("Kein Boardzettel verfügbar",300,250);
	}
}

function showCurrentBoard()
{
	log("button=PlayItAgain");

	g_playItAgain = true;

	if ((typeof g_hands.boards[g_lastBindex].Deal)!="undefined")
	{
		hideRanking();
		$("#scores").hide();
		$("#comparison").hide();
		$("#checkListDiv").hide();
		$("#abuttons").hide();
		$("#scoreandtraveller").show();
		$("#mainTitle").show();
		g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);
		setupTraveller(g_lastBindex,true);
		enterPlayMode();
	}
	else
		displayErrorAbsPosition("Es gibt kein Handdiagramm für dieses Board",300,200);
}

function travellersNotFound(jqXHR,textStatus,errorThrown)
{
		// Travellers not found
	clearTravellersLocalStorage();
	hideSpinner();
	resetTimeout();
	this.callback();
}

function setDefaultContracts()
{
	var i,j,k;

	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);

		// Create blank hand records for any travellers which do not have them.
	for (i=0;i<g_travellers.event.board.length;i++)
	{
		var bindex = getBoardIndex(i);

		if (bindex==null)		// No board for this traveller
		{
			var newindex = g_hands.boards.length;
			g_hands.boards[newindex] = {};
			g_hands.boards[newindex].board = "" + g_travellers.event.board[i].board_no;
		}
	}

		// Fill in contract, lead card, declarer, and all leads from traveller in all hand records.
	for (j=0;j<g_hands.boards.length;j++)
	{
		var leadstr = getRequestedLeads(j);

		if (leadstr!="") g_hands.boards[j].requestedLeads = leadstr;	// used to determine which declarer/suit combinations to calculate optimum leads for

		var found = false;

		for (i=0;i<g_travellers.event.board.length;i++)
		{
			if (g_travellers.event.board[i].board_no==g_hands.boards[j].board)
			{
				var tlineData = getTlineForPair(j,info);

				if (tlineData!=null)
				{
					var tline = tlineData.tline;

					if (!setHandRecordFromLin(j,tline))
					{
						var tlDirection = tlineData.direction;

						g_hands.boards[j].Declarer = tline.played_by;
						g_hands.boards[j].Contract = tline.contract;

						var played = [];

						var lead = leadCard(tline.lead).replace("10","T");

						if (lead.length==2)
						{
							lead = lead.charAt(1) + lead.charAt(0);
						}
						else
							lead = "  ";

						played[0] = lead;
						g_hands.boards[j].Played = played;	// Opening Lead for current pair
						g_hands.boards[j].Bids = [];
					}

					found = true;
					break;
				}
			}
		}

		if (!found)
		{
			delete g_hands.boards[j].Declarer;
			delete g_hands.boards[j].Contract;
		}
	}
}

function loadTraveller_1(data,statusText,jqXHR,context)
{
/*	var players = new Array();*/

	hideSpinner();
	resetTimeout();

/*	if (g_hands.lin!=="")
	{
		try {
			var tmp = JSON.parse(linToJson(g_hands.lin));
			var bd = tmp.boards[0];
			if ((typeof bd.PlayerNames)!=="undefined")
			{
				for (var i=0;i<4;i++)
					players[i] = bd.PlayerNames[i];
			}
		} catch (e) {};
	}*/

	if (data!="")
	{
		if (g_travellers==null)
		{
			if (g_xml!="")
			{
				if (g_debug)
					alert(data);

				data = convertXML(data);	// convert it to json

				if (g_debug)
					alert(JSON.stringify(data));
			}

			g_travellers = JSON.parse(data);

			if ((typeof g_travellers.event.participants.pair)!="undefined")
			{
				var i;

				var pairs = g_travellers.event.participants.pair;

					// Standardise representation of direction.
				for (i=0;i<pairs.length;i++)
				{
					if (pairs[i].direction=="NS") pairs[i].direction="N";
					else if (pairs[i].direction=="EW") pairs[i].direction="E";
				}
			}

			getSessionInfo();	// Set up details of session.

			if (g_eventType=="Teams")
			{
				calculateCrossImps();
				calculateMaxImps();
				g_rankInfo = null;
				getRankingInfo();
			}
		}

		var i;

		for (i=0;i<g_travellers.event.participants.pair.length;i++)
		{
			var data = g_travellers.event.participants.pair[i];
		}

		for (var i=0;i<g_travellers.event.board.length;i++)
		{
			var tlines = g_travellers.event.board[i].traveller_line;

			for (var j=0;j<tlines.length;j++)
			{
				if ((typeof tlines[j].lindata)!="undefined")
				{
					if (typeof tlines[j].board=='undefined')	// If fetched from cache it may have been converted already
					{
						try {
							var lind = decodeURIComponent(tlines[j].lindata.replace(/\\'/g,"'"));
							var tmp = eval("(" + linToJson(lind) + ")");
							tlines[j].board = tmp.boards[0];

/*							if ((typeof tmp.boards[0].PlayerNames)!=="undefined")
							{
								try {
									if ((players.length>0)&&(players.length==tmp.boards[0].PlayerNames.length))
									{
										var found = true;

										for (var k=0;k<players.length;k++)
											if (players[k]!==tmp.boards[0].PlayerNames[k]) found = false;
									}

									if (found)
									{
										alert("found it: " + j);
										g_currow = j;
									}
								} catch (e) {};
							}*/
						} catch (e) {
							tlines[j].lindata = "";
						};
					}
				}
			}
		}

		setDefaultContracts();
	}

	context.callback(context);
}

function needToAnalyse()
{
	var result = false;

	for (var i=0;i<g_hands.boards.length;i++)
	{
		if (checkBoardValid(i))
		{
			if (((typeof g_hands.boards[i].DoubleDummyTricks)=="undefined")||(g_hands.boards[g_lastBindex].DoubleDummyTricks == "********************")||(g_hands.boards[g_lastBindex].DoubleDummyTricks == "--------------------"))
				return true;

			if (((typeof g_hands.boards[i].OptimumScore)=="undefined")||(g_hands.boards[i].OptimumScore==""))
				return true;

			if (g_travellers!=null)
			{
				getRequestedLeads(i);
				if (g_travellersHaveLeads)
					return true;
			}
		}
	}
}





function loadTraveller(data,statusText,jqXHR)
{
	try {
		localStorage.removeItem("bwjson");
		localStorage.setItem("bwtime","" + Date.now());
	} catch (e) {clearTravellersLocalStorage();};

	saveEventLocalStorage(data);
	loadTraveller_1(data,statusText,jqXHR,this);
}


function pbnToJson(fileData)
{
		// Make sure there is a defined "trim" function (needed for IE8 and earlier)
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	  }
	}

	g_fullInfo = true;	// Assume makeable contracts table contains full information

	var defaultBoard = 1;

		// This routine only works for PBN files that conform to "Export Format"
		// First convert the different types of line endings to a single "\n"
		// [KK] Replace empty lines within comments of "[Result ". 5 empty lines are accepted
	fileData = fileData.replace(/\r\n/g,"\n");
	fileData = fileData.replace(/\r/g,"\n");
	fileData = fileData.replaceAll("{\n","{");
	fileData = fileData.replaceAll("{\n","{");
	fileData = fileData.replaceAll("{\n","{");
	fileData = fileData.replaceAll("{\n","{");
	fileData = fileData.replaceAll("{\n","{");
	fileData = stripComments(fileData);   // [KK] Comments after "[Result " are not stripped instead used for displaying board comments
	fileData = fileData.split("\n");

	var line = "";
	var outStr = "{\"boards\":[";

	var count = 0;

	var i,tmp;

	while (fileData.length>0)
	{
		var data = getPBNSegment(fileData);

		tmp=getLine(data,"[Board",true);

		if (tmp===null)
		{
			tmp = "" + defaultBoard++;
		}
		var playerN = "";
		var playerE = "";
		var playerW = "";
		var playerS = "";

		var contract = "";
		var declarer = "";
		var score = "";
		var result = "";
		var resultComment = "";
		var scoreTableH ="";
		var scoreTable = "";
		var notes = [];

		var dealer = getLine(data,"[Dealer",true);
		var vulStr = getLine(data,"[Vulnerable",true);
		var deal = getLine(data,"[Deal ",true);	// Include space to distinguish from "Dealer" keyword.
		playerN = getLine(data,"[North ",true);
		playerE = getLine(data,"[East ",true);
		playerS = getLine(data,"[South ",true);
		playerW = getLine(data,"[West ",true);
		contract = getLine(data,"[Contract ",true);
		declarer = getLine(data,"[Declarer ",true);
		score = getLine(data,"[Score ",true);
		result = getLine(data,"[Result ",true);
		resultComment = getLineFull(data,"[Result ");
		resultComment = resultComment.replaceAll("}","");
		notes = getLineNotes(data,"[Note ",true);
		scoreTableH = getLine(data,"[ScoreTable",true);
		if (scoreTableH !=null) scoreTableH = scoreTableH.replaceAll(/\\[A-Z0-9]*;?/g," ");

		scoreTable = getLineFull(data,"[ScoreTable",true);
		scoreTable = scoreTable.replaceAll(/PASS/g,"PAXX");
		scoreTable = scoreTable.replaceAll(/ SA /g," NT ");
		scoreTable = scoreTable.replaceAll(/S:/g,"Z:");
		scoreTable = scoreTable.replaceAll(/ S /g," Z ");
		scoreTable = scoreTable.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
		scoreTable = scoreTable.replaceAll(/Z:/g,"S:");
		scoreTable = scoreTable.replaceAll(/ Z /g," S ");
		scoreTable = scoreTable.replaceAll(/ NT /g," SA ");
		scoreTable = scoreTable.replaceAll(/PAXX/g,"PASS");

		/*
		const fieldNames = ["Contract", "Declarer", "Tricks", "Score", "NS", "EW", "MP_NS", "MP_EW"];
		const lines = scoreTable
				.split("<br>")
				.map(line => line.trim())
				.filter(line => line.length > 0);

		const scores = lines.map(line => {
			const values = line.split(/\s+/);
			const obj = {};
			fieldNames.forEach((field, i) => {
				obj[field] = values[i];
				});
			return obj;
		});
		*/

		// Set title to the Event as given in the pbn file
		if ((g_hands.Title == "") || (typeof g_hands.Title == 'undefined')){
			if (getLine(data,"[Event ",true) !== null) {
				g_hands.Title = "<b>" + getLine(data,"[Event ",true) + "</b>";
			}
		}

		var auction = getLineFull(data,"[Auction ");
		if (auction !="") {
			auction = auction.replace(/\t/g, ' ');
			auction = auction.replace(/\s+/g, ' ');

			/*var n;
			if (notes != null){
				for (var k=1;k<notes.length;k++){
					n = notes[k];
					n = n.trim();
					auction = auction.replace(" =" + k + "= ","|" + n + " ");
				}
			}
			*/
			auction = auction.replace(/ =/g, '=');
			//auction = auction.replace(/= /g, '=');
			auction = auction.replace(/  /g, ' ');
			auction = auction.trim();
		}
		var playLeader = getLine(data,"[Play ",true);	// Who leads to the first trick (peek only, doesn't consume "data")
		var play = getLineFull(data,"[Play ");
		if (play != ""){
			play = play.replace(/\t/g, ' ');
			play = play.replace(/  /g, ' ');
			play = play.trim();
		}

		if ((dealer!==null)&&(vulStr!==null)&&(deal!==null))
		{
			if ((dealer!="")&&(vulStr!="")&&(deal!=""))
			{
				if (count!=0) outStr = outStr + ",";

				count++;
				outStr = outStr + "{\"board\":\"" + tmp + "\",";

				if ((playerN!=null) && (playerE !=null) && (playerS!=null) && (playerW!=null)){
					outStr = outStr + "\"PlayerNames\":[\"" + playerS + "\",\"" + playerW + "\",\"" + playerN + "\",\"" + playerE + "\"],";
				}

				outStr = outStr + "\"Dealer\":\"" + dealer + "\",";

				if ((vulStr=="Love")||(vulStr=="-")) vulStr = "None";
				if (vulStr=="Both") vulStr = "All";

				outStr = outStr + "\"Vulnerable\":\"" + vulStr + "\",";
				outStr = outStr + "\"Deal\":[";

				var first = deal.charAt(0);
				deal = deal.substring(deal.indexOf(':')+1).trim();

				var lang = identifyHonourCardSet(deal,lang);
				deal = convertToJQKA(deal,lang);

				var index = 0;

				if (first=='N')
					index = 0;
				else if (first=='S')
					index = 2;
				else if (first=='W')
					index = 3;
				else if (first=='E')
					index = 1;

				var hands2 = deal.split(" ");
				var hands = new Array(4);

				for (i=0;i<4;i++)
				{
					if (hands2[i].trim()=="-")
						hands2[i] = "...";	// Empty hand

					hands[index] = hands2[i];
					index++;

					if (index>3) index = 0;
				}

				for (i=0;i<4;i++)
				{
					outStr = outStr + "\"" + hands[i] + "\"";

					if (i!=3) outStr = outStr + ",";
				}

				outStr = outStr + "],";

				if (contract!=null){
					outStr = outStr + "\"Contract\":" + "\"" + contract + "\",";
				}

				if (declarer!=null){
					outStr = outStr + "\"Declarer\":" + "\"" + declarer + "\",";
				}

				if (result!=null){
					outStr = outStr + "\"Claimed\":" + "\"" + result + "\",";
				}

				if (resultComment!=null){
					outStr = outStr + "\"Explanation\":" + "\"" + resultComment + "\",";
				}

				if (score!=null){
					outStr = outStr + "\"Score\":\"" + score + "\",";
				}

				if (auction != ""){
					auction = auction.split(" ");
					outStr = outStr + "\"Bids\":[";
					for (var j=0;j<auction.length;j++){

						var n;
						var a = auction[j];

						/*
							If alerts contain the = character replace it with -
							Otherwise there is a collision with the second type of alerts
							marked by =1= and taken from the notes object
						*/
						if (a.indexOf("|") != -1)
						{
							a = a.replaceAll("=","-");
						}

						pos = a.indexOf("=");
						if (pos!=-1)
						{
							if (notes != null){
								for (var k=1;k<notes.length;k++){
									pos = a.indexOf("=" + k + "=");
									if (pos!=-1)
									{
										n = notes[k];
										n = n.trim();
										a = a.replace("=" + k + "=","|" + n);
										break;
									}

								}
							} else {  //if alerted but no explanations available (e.g. Realbridge)
								var anz = 1;
								while (a.indexOf("=")!=-1){
									a = a.replace("=" + anz + "=","|");
									anz++;
								}
							}
						}

						outStr = outStr + "\"" + a + "\"";
						if (auction.length == j+1){
							outStr = outStr + "],";
						} else {
							outStr = outStr + ",";
						}

					}
				}

				if (play != ""){
					play = play.split(" ");
					play = reorderPlaySequence(play,playLeader,contract);	// [KK] Re-derive true chronological play order from PBN's fixed-column layout
					outStr = outStr + "\"Played\":[";
					for (var j=0;j<play.length;j++){
						outStr = outStr + "\"" + play[j] + "\"";
						if (play.length == j+1){
							outStr = outStr + "],";
						} else {
							outStr = outStr + ",";
						}

					}
				}

				var ddum = "********************";

				var optScore = getLine(data.slice(0),"[OptimumScore",true);

				if (optScore!==null)
				{
					outStr = outStr + "\"OptimumScore\":\"" + optScore + "\",";
				}

				var optPresent = getLine(data,"[OptimumResultTable",false);

				if (optPresent!==null)
				{
					var trickCount = new Array(20);
					var idx = new Array(20);

					for (i=0;i<20;i++)
					{
						trickCount[i] = 0;
						idx[i] = 0;
					}

					for (i=0;i<20;i++)
					{
						var ctr;

						if (i<data.length)
							ctr = data[i];
						else	// end of file
						{
							break;
						}

						ctr = ctr.trim();

						if (ctr.length==0) continue;	// Ignore blank lines

						if (ctr.charAt(0)=='[')		// No more entries in table, rewind and start search for new board
						{
							break;
						}

						ctr = ctr.trim();
						var comp = ctr.split(/ +/);

						var decl = comp[0].trim().toUpperCase().charAt(0);

						if (decl=='N') idx[i] = 0;
						else if (decl=='S') idx[i] = 5;
						else if (decl=='E') idx[i] = 10;
						else if (decl=='W') idx[i] = 15;

						var cont = comp[1].trim().toUpperCase().charAt(0);

						if (cont=='N') idx[i] = idx[i] + 0;
						else if (cont=='S') idx[i] = idx[i] + 1;
						else if (cont=='H') idx[i] = idx[i] + 2;
						else if (cont=='D') idx[i] = idx[i] + 3;
						else if (cont=='C') idx[i] = idx[i] + 4;

						trickCount[i] = parseInt(comp[2]);
					}

					var fullInfo = false;	// Set true if full information is present in the table (not just for makeable contracts);

					for (i=0;i<20;i++)
					{
						if ((trickCount[i]>1)&&(trickCount[i]<7))
						{
								// 0 1nd 1 are often used to indicate number of tricks for a particular contract is not present, but any value
								// in range 2 to 7 inclusive suggests that full information is present.
							fullInfo = true;
							break;
						}
					}

					if (!fullInfo) g_fullInfo = false;

					for (i=0;i<20;i++)
					{
						if (!fullInfo)
							if (trickCount[i]<7) trickCount[i] = -1;

						if (trickCount[i]>=0)
							ddum = setCharAt(ddum,idx[i],parseInt(trickCount[i]).toString(16).trim().charAt(0));
						else
							ddum = setCharAt(ddum,idx[i],'-');
					}
				}
				else
				{
					g_fullInfo = false;
				}

				if (scoreTable != "")
				{
					outStr = outStr + "\"ScoreTable\":\"" + scoreTable + "\",";
				}

				if (scoreTableH != "")
				{
					outStr = outStr + "\"ScoreTableH\":\"" + scoreTableH + "\",";
				}

				outStr = outStr + "\"DoubleDummyTricks\":\"" + ddum + "\"}";
			}
		}
	}

	outStr = outStr + "]}";//console.log(outStr);
	return outStr;
}

function callAnalysisFunction(index)
{
	if (index==0) setupRanking();
	else if (index==1) setupScorecard();
	else if (index==2) showComparison();
}

function handsNotFound(jqXHR,textStatus,errorThrown)
{
	// Hands Not Found
	/*var msg = "Hand Record file could not be retrieved"; **KK** */
	switch(language)
	{
		case "de":
			var msg = "Die Datei konnte nicht geholt werden (Falsche URL oder CORS-Kopfzeile 'Access-Control-Allow-Origin' fehlt)";
			break;
		default:
			var msg = "Hand Record file could not be retrieved (wrong URL or CORS header 'Access-Control-Allow-Origin' missing)";
	}
	var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:200px;position:absolute;top:100px;left:100px;\"><span style=\"font-size:16px;\">" + msg + "</span></div>";
	displayError(document.getElementById("boardNumber"),errormsg);
	clearPBNlocalStorage();
	getTraveller(this);
}



function loadHands(data,statusText,jqXHR,context)
{
	loadHands_1(data,statusText,jqXHR,this);
}

function loadHands_1(data,statusText,jqXHR,context)
{
	if ( typeof String.prototype.endsWith != 'function' ) {
	  String.prototype.endsWith = function( str ) {
		return this.substring( this.length - str.length, this.length ) === str;
	  }
	};

	if ((typeof context)!="undefined")
		if ((typeof context.callback)!="undefined")
			this.callback = context.callback;

	var hands;

	if (g_file!==1)	// If pbn data not supplied as string
	{
		if ((g_file=='')||(g_file.toUpperCase().endsWith('PBN')))
			hands = pbnToJson(data);
		else if (g_file.toUpperCase().endsWith('DLM'))
			hands = dlmToJson(data);
		else if (g_file.toUpperCase().endsWith('LIN'))
			hands = linToJson(data);
		else	// if pbn string was not supplied as explicit parameter
		{
			hideSpinner();
			switch(language)
			{
				case "de":
					alert("Nur PBN, DLM und LIN-Dateien von BBO werden unterstützt.");
					break;
				default:
					alert("Only PBN, DLM, and bridge base online LIN file types are supported.");
			}

			return;
		}
	}
	else
	{
		hands = data;
	}

	hands = JSON.parse(hands);

    var saved_boards = g_hands.boards;

	var i;
	var board = {};

	if (typeof g_hands.boards!=="undefined")
		board = g_hands.boards[g_lastBindex].board;
	else
		saved_boards = {};

	g_hands.boards = hands.boards;

	if ((typeof hands.PlayerNames)!="undefined")
		g_hands.PlayerNames = hands.PlayerNames;

    for (i=0;i<saved_boards.length;i++)
	{
		board = saved_boards[i];

		if ((typeof board.board)!="undefined")
		{
			if (board.board.toString().indexOf(".edited")!=-1)
			{
				g_hands.boards[g_hands.boards.length] = board;
			}
		}
	}

	var index = 0;

    if ((typeof board.board)!="undefined")
		index = getTindexByName(g_hands.boards,board.board);

	if ((g_file=='')||(g_xml!="")) // If request is from Bridgewebs, or if xml filename or xml string has been explicitly supplied
	{
		setLastBoardIndex(index);

		setupTraveller(g_lastBindex,true);
		getTraveller(this);
	}
	else
	{
		if (index!=-1)	// Shouldn't happen that index==-1 unless current hand is not in retrieved PBN file !!
		{
			setupTraveller(index,true);
			enterPlayMode();
		}
		else
		{
			hideSpinner();
			document.getElementById("bdy").style.display="none";
			switch(language)
			{
				case "de":
					alert("Board " + board.board + " gibt es nicht");
					break;
				default:
					alert("Board " + board.board + " does not exist");
			}
		}

		hideSpinner();
		resetTimeout();
		this.callback();
	}
}

function getHands(context)
{
		var data="";

		if (requestPending())
			return;	// Don't allow while there is a request in progress.
		else
			setRequestTimeout();

			// Get the hand records for this event
		var turl = "";

		if (g_file=='')	// No pbn url or pbn string supplied.
		{
			if (g_test==1)
				turl = "data/" + g_hands.club + "_" + g_hands.event + ".pbn";
		}
		else if (g_file!==1)	// filename supplied (1 would indicate pbn content supplied as a string parameter)
		{
			turl = g_file;
		}

		if ((data!=="")&&(g_loaded==false))
		{
			g_loaded = true;
			loadHands_1(data,"","",context);
		}
		else if ((turl!="")&&(g_loaded==false))
		{
			g_loaded = true;
			hideRanking();
			$("#scores").hide();
			$("#comparison").hide();
			$("#checkListDiv").hide();
			largeSpinner();
			doRequestHTMLasync(turl,loadHands,handsNotFound,context);
		}
		else if ((g_handstr!=="")&&(g_loaded==false))
		{
			var data = "";
			g_loaded = true;

			if (g_handstrType=="pbn")
				data = pbnToJson(g_handstr);
			else if (g_handstrType=="lin")
				data = linToJson(g_handstr);
			else if (g_handstrType=="dlm")
				data = dlmToJson(g_handstr);

			loadHands_1(data,"","",context);
		}
		else
			loadTraveller_1("","","",context);
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

function getTraveller(context)
{
			// Get the traveller data
		var turl = "";
		var data = "";

		if (g_test==1)
			turl = "data/" + g_hands.club + "_" + g_hands.event + ".json";
		else if ((g_xml!="")&&(g_xml!==1))
		{
			turl = g_xml;
		}

		if (g_travellers==null)
		{
			if (g_xml!==1) // xml string not supplied as parameter
			{
				if (data=="")
				{
					largeSpinner();
					doRequestHTMLasync(turl,loadTraveller,travellersNotFound,context);
				}
				else
				{
					loadTraveller_1(data,"","",context);
				}
			}
			else
			{
				loadTraveller_1(g_xmlstr,"","",context);
			}
		}
		else
			loadTraveller_1("","","",context);
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

function showCheckTraveller()
{
	drawMiniHand();
	var cp = document.getElementById("minihand").cloneNode(true);
	cp.removeAttribute("id");
	$(cp).find("*").removeAttr("id");

			// Should delete old cloned node if present
			// Should remove all the ids from the loned node first
	var cboard = document.getElementById("checkBoard");
	while (cboard.firstChild) cboard.removeChild(cboard.firstChild);
	cboard.appendChild(cp);
	$("#checkList").hide();

	var tlines = getTravellerForBoard(g_lastBindex).traveller_line;

	var table = document.getElementById("checkTraveller");
	var rows = table.rows;
	var i;

	for (i=rows.length-1;i>0;i--)
		table.deleteRow(-1);

	for (i=0;i<tlines.length;i++)
	{
		var tline = tlines[i];

		table.insertRow(-1);
		var row = table.rows[table.rows.length-1];

		row.insertCell(-1);
		row.cells[0].innerHTML = tline.ns_pair_number;
		row.insertCell(-1);
		row.cells[1].innerHTML = tline.ew_pair_number;
		row.insertCell(-1);
		row.cells[2].innerHTML = tline.contract.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
		row.insertCell(-1);
		row.cells[3].innerHTML = tline.played_by;
		row.insertCell(-1);
		row.cells[4].innerHTML = tline.lead.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
		row.insertCell(-1);
		row.cells[5].innerHTML = tline.tricks;
	}

	$("#checkTravellerDiv").show();
}

function checkAllContracts()
{
	var suits = "NSHDC";
	var i,j;

	g_sessionMode = "check";
	setButtonColor();

	hideAllPopups();
	hideRanking();
	$("#scoreandtraveller").hide();
	$("#scores").hide();
	$("#comparison").hide();
	$("#abuttons").show();
	$("#checkListDiv").show();
	$("#checkList").show();
	$("#checkTravellerDiv").hide();

	var table = document.getElementById("checkList");
	if (g_checkContracts.length>0) return;

	for (i=0;i<g_hands.boards.length;i++)
	{
		var traveller = getTravellerForBoard(i);

		var lines = traveller.traveller_line;

		for (j=0;j<lines.length;j++)
		{
			var result = checkContract(i,j);

			if (!result.valid)	// Report if necessary
			{
				var line = lines[j];

					// Is there any other pair on the traveller in the same contract ?
				var other = false;
				var k;

				for (k=0;k<lines.length;k++)
				{
					var oppLine = lines[k];

					if (k!=j)
					{
						if (validContract(oppLine.contract))
						{
							var oppSuit = suits.indexOf(oppLine.contract.charAt(1));

							if ((oppSuit==result.declSuit)&&(oppLine.played_by==line.played_by))
							{
								other = true;
								break;
							}
						}
					}
				}

				if (other)	// Don't log this as a possible error if another pair on the traveller have same suit/declarer
				{
					result.shortSuit = false;
					result.possibleSuitDeclError = false;
				}

				if (result.leadDeclError||result.shortSuit||result.possibleSuitDeclError)
				{
					result.bindex = i;
					result.traveller = traveller;
					result.tindex = j;
					g_checkContracts[g_checkContracts.length] = result;

/*					if (result.leadDeclError)
 						alert("Board: " + g_hands.boards[i].board + ",  " + line.contract + " " + line.played_by + " " + line.lead + ", Lead Card or Declarer is incorrect");

					if (result.shortSuit)
						alert("Board: " + g_hands.boards[i].board + ",  " + line.contract + " " + line.played_by + " " + "Short suit length: " + result.combinedSuitLength);

					if (result.possibleSuitDeclError)
						alert("Board: " + g_hands.boards[i].board + ",  " + line.contract + " " + line.played_by + " " + "Either Suit or Declarer may be incorrect");
*/
				}
			}
		}
	}

	var table = document.getElementById("checkList");

	for (i=0;i<g_checkContracts.length;i++)
	{
		table.insertRow(-1);

		var row = table.rows[table.rows.length-1];
		var data = g_checkContracts[i];
		var tline = data.traveller.traveller_line[data.tindex];

		row.insertCell(-1);
		row.cells[0].innerHTML = g_hands.boards[data.bindex].board;
		row.cells[0].onclick = function(){setLastBoardIndex(getTindexByName(g_hands.boards,this.innerHTML));showCheckTraveller();};
		row.cells[0].style.textAlign="right";
		row.cells[0].className = "myLink";
		row.insertCell(-1);
		row.cells[1].innerHTML = tline.ns_pair_number;
		row.insertCell(-1);
		row.cells[2].innerHTML = tline.ew_pair_number;
		row.insertCell(-1);
		row.cells[3].innerHTML = tline.contract.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
		row.insertCell(-1);
		row.cells[4].innerHTML = tline.played_by;
		row.insertCell(-1);
		row.cells[5].innerHTML = tline.lead.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
		row.insertCell(-1);
		row.cells[6].innerHTML = tline.tricks;
		row.insertCell(-1);

		var reason = "";

		switch(language)
		{
			case "de":
				if (data.leadDeclError)
					reason = "Ausspiel oder Alleinspieler stimmt nicht";
				else if (data.shortSuit)
					reason = "Überprüfen Sie die Trumpffarbe (kurze Länge)";
				else if (data.possibleSuitDeclError)
					reason = "Entweder Farbe oder Alleinspieler stimmen nicht";
				break;
			default:
				if (data.leadDeclError)
					reason = "Lead Card or Declarer is incorrect";
				else if (data.shortSuit)
					reason = "Check declarer suit (short length)";
				else if (data.possibleSuitDeclError)
					reason = "Either Suit or Declarer may be incorrect";
		}


		row.cells[7].textContent = reason;
	}
}

function reportBSOLNotSupported()
{
	switch(language)
	{
		case "de":
			document.body.innerHTML = "<div style='background-color:#ffff00;border:1px solid black;padding:5px 5px;width:400px;margin-top:25px;margin-left:25px;'><span style='font-size:18px;'>Dieser Browser unterstützt nicht die Funktionen, die vom Bridge Solver benötigt werden. Bitte versuchen Sie, wenn möglich eine neuere Version des Browsers zu installieren oder versuchen Sie einen anderen Browser.</span></div>";
			break;
		default:
			document.body.innerHTML = "<div style='background-color:#ffff00;border:1px solid black;padding:5px 5px;width:400px;margin-top:25px;margin-left:25px;'><span style='font-size:18px;'>This browser does not support the features required by Bridge Solver. Try upgrading to a more recent version of the browser, if possible, or try a different browser.</span></div>";
	}
	//document.body.innerHTML = "<div style='background-color:#ffff00;border:1px solid black;padding:5px 5px;width:400px;margin-top:25px;margin-left:25px;'><span style='font-size:18px;'>Dieser Browser unterstützt nicht die Funktionen, die vom Bridge Solver benötigt werden. Bitte versuchen Sie, wenn möglich eine neuere Version des Browsers zu installieren oder versuchen Sie einen anderen Browser.</span></div>";
}

function listener(event,workerType)
{
	if ((event.data!=="initialised")&&(event.data!=="failed"))
	{
		var request = event.data.context.request;

		if (request=="m")
			dddLoadMakeable(event.data.result,"","",event.data.context.bindex);
		else if (request=="a")
		{
			if (event.data.context.requestSubType=="b")	// Background acc request
			{
				var result = JSON.parse(event.data.result);

				if ((typeof result.sess.status)!="undefined")
					console.log("error from background acc request, status code: " + result.sess.status);
				else
					storeAcc(result,event.data.context);

				var names = event.data.context.names;
				var tid = event.data.context.tid;

				var nameFound = false;

				for (var i=0;i<4;i++)
				{
					delete g_accTrans[names[i]].transList[tid];
				}

				if (allAccsProcessed())
				{
					finishBackgroundOperation();
					log('button=showPlayerAccMatrix');
					showPlayerAccMatrix();
				}
			}
			else
				load(event.data.result,null,null,event.data.context);
		}
		else if (request=="b")
		{
			dddLoadMakeable(event.data.result,"","",event.data.context.bindex);
		}
		else
		{
			if (event.data.context.para=="benchmark")
			{
				var res = JSON.parse(event.data.result);

				if (localStorageSupported())
					localStorage.setItem("benchmark",String(res.sess.deltaElapsed));

				console.log("benchmark time was " +  res.sess.deltaElapsed + " seconds");

				if (Number(res.sess.deltaElapsed)>0.12)
				{
				}

				buildPage1(g_initial_data,g_initial_options);
			}
			else
			{
				dddloadfunc(event.data.result,null,null,event.data.context);
			}
		}
	}
	else if (event.data=="failed")
	{
		hideSpinner();
		reportBSOLNotSupported();
		return;
	}
	else	// worker creation succeeded
	{
//				g_workerInitCount++;
		if (workerType=="main")
		{
			if (!g_initialised)	// buildPage1 hasn't run yet
			{
				if (localStorageSupported())
					var tmp = localStorage.getItem("benchmark");
				else
					tmp = null;

				if (tmp==null)
				{
						// generate benchmarking request
					var dealstr = "W:.AKQT954.KJ64.72xAKJ8.82.A8.KJT64x97652.76.Q92.AQ8xQT43.J3.T753.953";

					var msg = {};
					msg.request = "g";
					msg.pbn = dealstr;
					msg.trumps = "H";
					msg.leader = "n";
					msg.requesttoken = 1;
					msg.sockref = 1;

					var context = {};
					context.request = msg.request;
					context.para = "benchmark";
					msg.context = context;

					g_worker.postMessage(msg);
				}
				else
				{
					buildPage1(g_initial_data,g_initial_options);
				}
			}
		}
		else	// Background worker
		{
			g_workerInitCount++;
			console.log("initcount: " + g_workerInitCount);

			if (g_workerInitCount==g_mworkers.length)
			{
				if (g_bgObj.fn=="processAccs")
				{
					processAccs();
					return;
				}
			}

			if ((g_workerInitCount==g_mworkers.length))
			{
				if (g_bgObj.fn=="analyseAll")
				{
					g_bgObj.fn = "";
					console.log("calculate makeable all boards");
					calculateMakeableAllBoards();
				}
			}
		}
	}
}

function listenerMain(event)
{
	listener(event,"main");
}

function listenerBackground(event)
{
	listener(event,"background");
}

function workerSupported()
{
	if (typeof(Worker)!=="undefined")
		return true;
	else
		return false;
}

function webAssemblySupported()
{
	try {
		if (typeof WebAssembly === "object"&& typeof WebAssembly.instantiate === "function") {
			const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
			if (module instanceof WebAssembly.Module)
				return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
		}
	} catch (e) {}

    return false;
}

function createBackgroundWorkers()
{
	var nworkers = 4;	// Make this the maximum number of concurrent worker threads for makeable contracts
	/*
	if (navigator.hardwareConcurrency<nworkers)
		nworkers = navigator.hardwareConcurrency;
	*/
	if (navigator.hardwareConcurrency) {
		nworkers = Math.floor(navigator.hardwareConcurrency/2);
	}
	console.log("Cores: " + navigator.hardwareConcurrency + " Workers: " + nworkers);

	for (var i=0;i<nworkers;i++)
	{
		var worker = new Worker("calldds.js");
		worker.addEventListener("message",listenerBackground);
		g_mworkers.push(worker);
	}

	g_nextmworker = 0;
}

function stopBackgroundWorkers()
{
	console.log("stopping background worker threads");

	for (var i=0;i<g_mworkers.length;i++)
	{
		g_mworkers[i].terminate();
	}

	g_mworkers = [];

	g_workerInitCount = 0;
	g_nextmworker = 0;
	resetAnalyseAllBoards();
}

function createMainWorker()
{
	if (g_worker==null)
	{
		if ((g_hands!=null)&&(g_session!==0)) exitCardPlay();	// g_hands may not have been initialised yet when createMainWorker is called at startup
		console.log("creating main worker thread");
		g_worker = new Worker("calldds.js");
		g_worker.addEventListener("message",listenerMain);
	} else {
        /* **KK**
         * Initializing necessary to allow files to be uploaded again (initially a second upload failed)
         * */
      g_worker = null;
      setHands(null);

      g_initialised = false;
      g_loaded = false;
      console.log("creating main worker thread again");
      g_worker = new Worker("calldds.js");
      g_worker.addEventListener("message",listenerMain);
    }
}

function restartBackgroundWorkers()
{
		console.log("terminate then restart background workers");

		stopBackgroundWorkers();
		createBackgroundWorkers();	// Recreate them
}

function buildPage(data,options)
{
//document.body.style.transform = 'scale(' + $(window).width()/800 + ')';
//document.body.style['-o-transform'] = 'scale(' + $(window).width()/800 + ')';
//document.body.style['-webkit-transform'] = 'scale(' + $(window).width()/800 + ')';
//document.body.style['-moz-transform'] = 'scale(' + $(window).width()/800 + ')';
	g_initial_data = data;
	g_initial_options = options;
	largeSpinner();
	console.log("start: " + (new Date).toUTCString());

	if (webAssemblySupported()&&workerSupported())
	{
		createMainWorker();
	}
	else
	{
		hideSpinner();
		reportBSOLNotSupported();
	}
}

function buildPage1(data,options)
{
	g_initialised = true;
	$("#largeSpinner").finish();

//	if (webAssemblySupported()&&workerSupported())	// Create background workers, even if "play it again" will user remote server
//		createBackgroundWorkers();

	var defaultOptions = getCookie("BSOL_options");

    g_protocol = location.protocol  || 'http:';

    if (g_protocol != 'https:')
    {
        g_protocol = 'http:';
    }

	hide("bsession");
	hide("bsessionHelp");
	hide("branking");
	hide("bscorecard");
	hide("btraveller");
	hideRanking();
	hide("scores");

	document.getElementById("northHand").style.whiteSpace = "nowrap";
	document.getElementById("eastHand").style.whiteSpace = "nowrap";
	document.getElementById("southHand").style.whiteSpace = "nowrap";
	document.getElementById("westHand").style.whiteSpace = "nowrap";
	document.getElementById("miniNorth").style.whiteSpace = "nowrap";
	document.getElementById("miniEast").style.whiteSpace = "nowrap";
	document.getElementById("miniSouth").style.whiteSpace = "nowrap";
	document.getElementById("miniWest").style.whiteSpace = "nowrap";

	var referrer = document.referrer;

	var idx = document.referrer.indexOf("testpbntojson");

	var sctable = document.getElementById("scoring");

	if (sctable.rows[1].cells.length<8) g_ofs = 0;

	var table = document.getElementById("rankingNS");
	table.rows[0].cells[4].id = "rankingDD";

	if (idx!=-1)
		g_test = 1;

	if ((typeof data.file)!="undefined")
		g_file = data.file;

	if ((typeof data.handstr)!="undefined")
	{
		g_file = 1;	// Indicate pbn has been supplied as a literal string
		g_handstr = data.handstr;
		g_handstrType = data.handstrType;
		delete data.handstr;
		delete data.handstrType;
	}

	if ((typeof data.xml)!="undefined")
		g_xml = data.xml;		// url of file containing travellers etc. has been providedg

	if ((typeof data.xmlstr)!="undefined")	// Indicate json has been supplied as a literal string
	{
		g_xml = 1;
		g_xmlstr = data.xmlstr;
		delete data.xmlstr;	// Delete field because it makes ajax requests containing g_hands very large
	}

	if ((typeof data.debug)!="undefined")
		if (data.debug=="true")
			g_debug = true;

	initSettings();

	if (defaultOptions === undefined)
		setOptions(options);
	else
		setOptions(defaultOptions);

	g_credits = "<span style=\"font-size:12px;\"><a href=\"https://mirgo2.co.uk/bridgesolver\" target=\"_blank\">Bridge Solver Online</a>:<br><span style=\"font-weight:bold\">John Goacher</span></span><br><br><span style=\"font-size:12px;\">Double Dummy Solver Module:<br><span style=\"font-weight:bold\">Bo Haglund</span></span>";

		// Make sure there is a defined "trim" function (needed for IE8 and earlier)
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	  }
	}

	$(window).on("orientationchange",function(event){
		window.t = setTimeout(function(){orientationChanged();},250);
	});

	$("#computeMakeable").keypress(function(e){
   			if(e.keyCode === 13){
       			e.preventDefault();
   			}});

	setDisplaySizing();

//	document.getElementById("scrollDiv").style.height = (height + 10) + "px";

	hideRanking();
	hide("scores");
	hide("scoreandtraveller");

	document.getElementById("northHand").onclick = function() {selectQuadrant(0);};
	document.getElementById("eastHand").onclick = function() {selectQuadrant(1);};
	document.getElementById("southHand").onclick = function() {selectQuadrant(2);};
	document.getElementById("westHand").onclick = function() {selectQuadrant(3);};
	document.getElementById("bsession").onclick = gotoSession;
	document.getElementById("computeMakeable").onclick = function () {calculateMakeableSingleBoard(g_lastBindex);};
	document.getElementById("gotoBoard").onclick = function() {getHands({callback:showBoardKeypad});};
	document.getElementById("newBoard").onclick = showNewBoardSelector;
	document.getElementById("deleteBoard").onclick = showDeleteConfirmation;

	if (document.getElementById("saveLIN")!=null) document.getElementById("saveLIN").onclick = function() {hideAllPopups();downloadFile(g_hands.lin,"text/lin","board.lin");};
	document.getElementById("saveBoards").onclick = function() {hideAllPopups();getHands({callback:generatePBN});};
//	document.getElementById("analyseAllBoards").onclick = calculateMakeableAllBoards;
//	document.getElementById("saveSingleBoard").onclick = function() {generatePBN(false);$("#toolsSubMenu").hide();};
//	document.getElementById("closetoolsSubMenu").onclick = function(){$("#toolsSubMenu").hide();};
	document.getElementById("aranking").onclick = function() {log("button=AllPairs");setupRanking();};
	document.getElementById("ascorecard").onclick = function() {log("button=Personal");setupScorecard();};
	document.getElementById("aacc").onclick = function() {log("button=showAccMatrix");callGetIndexedAcc();};
	document.getElementById("atraveller").onclick = function() {log("button=Traveller");showComparison();};
	document.getElementById("tools").onclick = function() {showtoolsSubMenu();};
	document.getElementById("analyseAllBoards").onclick = function() {getHands({callback:startAnalyseAll});};
	document.getElementById("showPlayerAcc").onclick = function() {getHands({callback:callGetIndexedAcc});};
	document.getElementById("showSettings").onclick = function() {getHands({callback:showSettings});};
	document.getElementById("showReleaseHistory").onclick = function() {window.open("releaseNotes.htm","_blank");};

	if (document.getElementById("aprev")!=null)
	{
		document.getElementById("aprev").onclick = function(){log('button=prevTraveller');setLastBoardIndex(getNextOrPrevBindex(false));showComparison();};
		document.getElementById("anext").onclick = function(){log('button=nextTraveller');setLastBoardIndex(getNextOrPrevBindex(true));showComparison();};
	}

	if (document.getElementById("acheck")!=null)
	{
//		document.getElementById("acheck").onclick = function(){log("button=check");checkAllContracts();};
		document.getElementById("acheck").style.display = "none";
	}

	document.getElementById("agotoboard").onclick = showTravellerKeypad;
	document.getElementById("aboard").onclick = showCurrentBoard;
	document.getElementById("rankcheck").onclick = function(){sortRanking(!document.getElementById("rankcheck").checked);setupRanking()};

	var cell = document.getElementById("scPlayerNames");

	switch(language)
	{
		case "de":
			cell.innerHTML = "<div style='float:left;'><select id='sortMode' name='sortMode' style='background-color:yellow;'><option value=0>Nach Rolle sortieren</option><option value=1>Nach Board sortieren</option></select></div><div style='float:left;vertical-align:middle;margin-left:10px;'><span id='scPlayerNames2' style='color:white;'></span></div>";
			break;
		default:
			cell.innerHTML = "<div style='float:left;'><select id='sortMode' name='sortMode' style='background-color:yellow;'><option value=0>Sort By Role</option><option value=1>Sort by Board</option></select></div><div style='float:left;vertical-align:middle;margin-left:10px;'><span id='scPlayerNames2' style='color:white;'></span></div>";
	}

	document.getElementById("sortMode").onchange = function(){log("operation=sortMode:"+this.selectedIndex);setupScorecard(true);};

	var krckbox = document.getElementById("krcalc");

	if (krckbox!==null)
	{
		krckbox.onchange = function(){
								var krck = document.getElementById("krcalc");

								if (localStorageSupported())
								{
									if (krck.checked)
										localStorage.setItem("krcalc","true");
									else
										localStorage.setItem("krcalc","false");
								}

								updatePointsDisplay();
							};
		setupKRHelp();
		document.getElementById("krhelp").onclick = function(){showHelp(this,"krHelpText");};
	}

	g_defaultTravellerWidth = document.getElementById("traveller").style.width;
	g_inactiveCards = new Array(4);
	g_playableCards = new Array(4);
	setCurrentTrickCards(new Array(4));

	for (i=0;i<4;i++)
	{
		g_playableCards[i] = new Array(13);
		g_inactiveCards[i] = new Array(13);
		g_currentTrickCards[i] = new Array(13);

		for (j=0;j<13;j++)
		{
			g_playableCards[i][j] = -1;
			g_inactiveCards[i][j] = 0;
			g_currentTrickCards[i][j] = 0;
		}
	}

	setHands(data);

//	g_hands.boards = pbnToJson(g_handstr);

	if ((typeof g_hands.lin)!=="undefined")
	{
		var linstr = linToJson(g_hands.lin);
		var linhands = JSON.parse(linstr);
		g_hands.boards = linhands.boards;
	}

		// Set defaults in case pair number and direction not provided.
	if ((typeof g_hands.pair_number)=="undefined") g_hands.pair_number = "";
	if ((typeof g_hands.direction)=="undefined") g_hands.direction = 1;
	if (g_hands.direction=="") g_hands.direction = 1;
	if (g_hands.direction=="NS") g_hands.direction = 1;
	else if (g_hands.direction=="EW") g_hands.direction = 2;

	if ((g_hands.pair_number=="")&&((typeof g_hands.lin)!=="undefined")) g_showAllControls = false;

	openIndexedDB();	// Will call getHands or buildPage2 from onsuccess callback
}

function buildpage2()
{
	var rank1button = document.getElementById("rank1");
	var rank2button = document.getElementById("rank2");

//	g_lastBindex = 0;
	hide("next");
	hide("prev");

	$("#allBoards").hide();
	$("#scoreandtraveller").hide();;

	var prev = document.getElementById("prev");
	prev.onclick = function(){log("button=prevBoard");getHands({callback:gotoPrevTraveller});}

	var next = document.getElementById("next");
	next.onclick = function(){log("button=nextBoard");getHands({callback:gotoNextTraveller});}

	if ((typeof g_hands.Title)!="undefined")
		g_title = g_hands.Title;

	const clean = DOMPurify.sanitize(g_title, { RETURN_DOM_FRAGMENT: true });
	document.getElementById("titleText").replaceChildren(clean); //innerHTML = g_title;

	setupCommandHelp();
	setupPlayHelp();
	setupEditHelp();
	setupSettingsHelp();
	setupPlayMatchContractHelp();
	showMainMenuItems();
	if (g_file=="") setupTraveller(g_lastBindex,true);
	enterPlayMode();	// Large version of traveller with clickable contracts

	g_playItAgain = true;

	var emptyHand = false;

	if ((typeof g_hands.display)=="undefined")
	{
		$("#mainTitle").show();

		if (g_hands.boards.length==1)
		{
			setLastBoardIndex(0);
			var board = g_hands.boards[g_lastBindex];
			var count = 0;

			for (i=0;i<4;i++)
			{
				count = count + board.Deal[i].length;
			}

			if (count==12)	// Only one board, and it's empty (just contains the suit separators), so go into edit mode.
			{
				emptyHand = true;

				if (g_xml=="")
					edit();	// Go into edit mode if no travellers
				else
					g_hands.display = "allpairs";
			}
		}

		if (!emptyHand)
			$("#scoreandtraveller").show();

		if ((typeof g_hands.forceAnalyse)!="undefined")	// Call "analyse" automatically.
		{
			calculateMakeableSingleBoard(g_lastBindex);
		}
		else
		{
			if (((g_hands.boards.length==1))&&(g_file==""))
				calculateMakeableSingleBoard(g_lastBindex); // Calculate them anyway if not defined
			else
			{
				if (document.getElementById("mkauto1").checked)
				{
					g_bgObj.fn = "analyseAll";

					createBackgroundWorkers();
				}
			}
		}
	}

	hideSpinner();

	if ((typeof g_hands.display)!="undefined")
	{
		g_playItAgain = false;

		var display = g_hands.display;
		log("button=analysis");

		if (display=="allpairs")
		{
		    g_sessionMode = "ranking";
			getHands({callback:setupRanking});
		}
		else if (display=="personal")
		{
		    g_sessionMode = "scorecard";
			getHands({callback:setupScorecard});
		}
		else if (display=="board")
		{
		    g_sessionMode = "traveller";
			getHands({callback:showComparison});
		}
		else if (display=="check")
		{
			g_sessionMode = "check";
			getHands({callback:checkAllContracts});
		}
		else
		{
			g_playItAgain = true;
		}
	}

	console.log("initialisation complete: " + (new Date).toUTCString());

	showNewFeaturesNotice();
}

function doNothing()
{
}


function show(button)
{
	$("#"+button).show();
}

function hide(button)
{
	$("#"+button).hide();
}


