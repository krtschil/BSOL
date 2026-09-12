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

function getFullMakeableJson(context)
{
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
