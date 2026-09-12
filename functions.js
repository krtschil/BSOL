function startup(){
		language = "de";  				// Sets the default language
		g_logging = false;
		g_credits =	"";
		g_resultsFilename;
		g_handRecordsFilename;
		g_hands;
		g_scoring = 0;					// Set to "IMP" for IMPs scoring.
		setLastBoardIndex(0);
		g_currentDir;
		g_currentPair;
		g_inactiveCards;
		g_playableCards;
		g_currentPlayer;
		g_currentTrickCards;
		g_currentPlayIndex;				//0..51 represents index to position within the 52 card sequence being played.
		g_lastMatchedPlayIndex; 		//0..51
		g_showPlay=0;					//S If showPlay!=0 show played cards for this hand
		g_hiscore;
		g_allBoards = 0;				// Set non-zero while running an analysis on all boards in a set.
		setSession(0);
		g_bgTrans = 0;					// Unique transaction id allocated to background transaction (e.g single shot accuracy request)
		g_edited = 0;   				// Set to 1 when a change has been made (or 2, if only the Dealer has been changed)
		setPartialHand(0);				// Non-zero if playing a hand which started with fewer than 52 cards
		g_partialHandTotalTricks;		// Total number of tricks which can be made by declarer and defenders on a partial hand
		g_session_contract;
		g_showOriginalContract = false;	// Set true when "Play: <contract>" button is pressed for a hand recorded in a lin file.
		g_session_declarer;
		g_defaultTravellerWidth;
		g_lastAllTravellersPair=-1;
		g_lastAllTravellersDir="NS";
		setMode(0);						// Set to 1 while in play mode
		g_timeout = "";
		g_sectionHeight; 				// Calculated height for a quadrant of the board display
			// Following variable relate to hand entry.
		g_boardNumberFontSize;
		g_fontRatio = 1.0;
		g_textBratio = 0.9;				// Text font size as fraction of button height
		setHandEntryMode(0);
		setInputDirection(0);					// 0,1,2,3 = N,E,S,W
		g_inputBoard;
		g_cardQuadrant;
		g_stopPropagation = 0;
		g_helpId = "";					// id of current help text on display
		g_playButtonText = "Spielen"; 	// Text to show on Play button (otherwise may show, for example, Play: 3H by S)
		g_defaultContract = 0;     		// Set to 1 when there is a default contract for current board (contract and declarer but no
										//  bidding information or cards played)
		g_defaultContractIndex = -1;  	// If default contract is set, this is the index to the button in the makeable contracts table
										// that relates to that declarer/suit combination.
		g_timeoutID = "";				// ID of javascript timeout function related to request throttling.
		g_travellers = null;			// Non-null if traveller records are available
		g_currentTraveller = null; 		// Traveller record corresponding to current board
		g_currow = -1;			   		// Index to current row being displayed (for travellers containing bidding/play data for each row
		g_title = "&nbsp";
		g_sessInfo = null;				// Holds Session Info for the current event
		g_rankInfo = null;				// Holds ranking information for current event.
		g_validPercentageFields = false;// Set to true if percentage fields in json ranking table are non-blank and no negative values
		g_scoring = "MatchPoints";		// Scoring type - MatchPoints, IMP, VP
		g_eventType = "Paarturnier";	// Event Type - one of Pairs, Teams
		g_maxImps = 0;					// Maximum number of IMPs recorded on a single board, if using IMP scoring.
		g_test = 0;						// Set to 1 if called from test environment.
		g_xml = "";						// Set to filename of xml file if present (or to 1 if xml supplied as a string)
		g_xmlstr = "";					// Holds xml when supplied as a string parameter
		g_handstr = "";					// Holds file content when supplied as a string parameter rather than a file url
		g_handstrType = "";				// Can be "pbn", "dlm", or "lin" if file content supplied as string
		g_debug = false;
		g_ofs = 1;						// Offset to columns beyond (optional) lead card column in Scorecard table
		g_protocol = "http:";			// called with http or https
		g_loaded = false;				// Is true if hands/travellers have been loaded already
		g_fullInfo = false;				// Set to true if makeable contract tables contain full information
		g_backgroundFetchCompleted = false;		// Set to true if background fetch of makeable contracts/opt contracts/opening leads has completed.
		g_openingLeadsPresent = false;	// Set to true when ddtricks for opening leads have been calculated and applied.
		g_travellersHaveLeads = false;  // Set to true if at least one lead card is found in a traveller.
		g_file = "";					// contains url of 'pbn' or 'dlm' if filename reference was supplied in request
		g_sessionMode = "scorecard"; 	// assume last looked at scorecard in results analysis
		g_playItAgain = true;		 	// False if in Results Analysis screens
		g_scoreToImps = [[0,10,0],[20,40,1],[50,80,2],[90,120,3],[130,160,4],
							[170,210,5],[220,260,6],[270,310,7],[320,360,8],[370,420,9],
							[430,490,10],[500,590,11],[600,740,12],[750,890,13],[900,1090,14],
							[1100,1290,15],[1300,1490,16],[1500,1740,17],[1750,1990,18],[2000,2240,19],
							[2250,2490,20],[2500,2990,21],[3000,3490,22],[3500,3990,23],[4000,32767,24]];
		g_checkContracts = [];
		g_scorecardContext = [];	// Array of context objects for current scorecard, indexed by board number
		g_uniquePairNumbers = "";		// Set to true or false for Teams events from within function checkForUniquePairNumbers
		g_showAllControls = true;
		g_isMobi = false;				// True if a mobile device
		g_namSize = 0;
		g_bidFontSize = 0;
		g_dealerFontSize = 0;			// Size of dealer char on traveller
		g_urqButtonHeight = 0;			// Height of buttons in upper right quadrant of traveller
		g_urqButtFontSize = 0;			// Font size of buttons in upper right quadrant
		g_scoreFontSize = 0;			// Font size for score in lin file
		g_vulBarLength = 0;				// Height or width of vulnerability bar

		g_worker;						// Worker for Play It Again
		g_mworkers = [];		// Workers for makeable contract calculation
		g_nextmworker = 0;
		g_workerInitCount = 0;
		g_db = null;					// Database handle for indexedDB

		g_bgObj = {};
		g_completionCount = 0;			// Count of background accuracy requests completed
		g_completionTarget = 0;			// Used for background player accuracy requests

		g_mcSession = 1;				// "Session" number for tagging single board makeable contract requests

		setTrumps("");					// Trump suit for current board being played
		setLeader("");					// Leader for current board being played
		g_initial_data = "";
		g_initial_options = "";
		g_newFeatureNoticeShown = 0;	// Set to 1 if has been shown already during this session
		g_initialised = false;			// Set true in buildpage1
		g_playerAcc = [];		// Holds player accuracy counts for event, indexed by player name
		g_accTrans = {};		// Holds list of acc transactions outstanding for each player

		cacheTimeout = 300000;			// Limit in milliseconds on how long PBN and json are kept in Local Storage
		//processRequest();
		extractParas();
}

  function extractParas()
  {
    const validDealers = "NSEW";
	const allowedParameters = new Set([
		"board", "dealer", "vul", "north", "east", "south", "west",
		"contract", "declarer", "title", "dd", "analyse", "optimumscore",
		"leadcard", "lin", "event", "eventid", "club", "pair_number",
		"direction", "compare", "file", "xml", "sessid", "msec",
		"display", "analysis", "debug", "jsonlin", "lang", "nav"
	]);
	const parameters = [];
	const searchParams = new URLSearchParams(window.location.search);

	for (const [name, value] of searchParams) {
		const parameterName = name.toLowerCase();

		if (allowedParameters.has(parameterName)) {
			parameters.push([parameterName, value]);
		}
	}

	if (parameters.length === 0)
	{
		return false;	// No parameters
	}

	if (parameters.length === 1 && parameters[0][0] === "lang")
	{
		language = parameters[0][1];
		changeLanguage(language);
		return false;
	}

	const b = {};
	b.boards = [];

	let board = {};
	const deal = [];
	let ddPresent = false;
	let jsonlin = "";

	for (const [pname, rawValue] of parameters)
	{
		let pvalue = rawValue;

				if (pname=="board")
				{
					if (pvalue.length>15)
					{
						switch(language)
						{
							case "de":
								alert("Der Wert für den Parameter 'Board' ist zu lang (maximal 15 Zeichen)");
								break;
							default:
								alert("Board parameter value is too long (maximum 15 characters)");
						}
						return "";
					}

					board.board = pvalue;
				}
				else if (pname=="dealer")
				{
					pvalue = pvalue.toUpperCase();

					if (pvalue.length!=1)
					{
						switch(language)
						{
							case "de":
								alert("Ungültiger Wert für 'Dealer' (nur ein einzelnes Zeichen ist zugelassen)");
								break;
							default:
								alert("Invalid value for Dealer parameter (must be single character)");
						}
					}
					else
					{
						var index = validDealers.indexOf(pvalue);

						if (index==-1)
						{
							switch(language)
							{
								case "de":
									alert("Ungültiger Wert für 'Dealer' - muss eines von N,S,E,W sein");
									break;
								default:
									alert("Invalid value for Dealer Parameter - must be one of N,S,E,W");
							}
							return "";
						}
					}

					board.Dealer = pvalue;
				}
				else if (pname=="vul")
				{
					pvalue = pvalue.toUpperCase();

					if ((pvalue!="NS")&&(pvalue!="EW")&&(pvalue!="ALL")&&(pvalue!="NONE"))
					{
						switch(language)
						{
							case "de":
								alert("Ungültige Gefahrenlage - muss eines von NS,EW,All, oder None sein");
								break;
							default:
								alert("Invalid vulnerability - must be one of NS,EW,All, or None");
						}
						return "";
					}

					if (pvalue=="ALL") pvalue = "All";
					if (pvalue=="BOTH") pvalue = "All";
					if (pvalue=="NONE") pvalue = "None";

					board.Vulnerable = pvalue;
				}
				else if (pname=="north")
					deal[0] = pvalue.toUpperCase();
				else if (pname=="east")
					deal[1] = pvalue.toUpperCase();
				else if (pname=="south")
					deal[2] = pvalue.toUpperCase();
				else if (pname=="west")
					deal[3] = pvalue.toUpperCase();
				else if (pname=="contract")
				{
					var contract = pvalue.toUpperCase();
					pvalue = pvalue.replace(/X/g,"x");
					pvalue = pvalue.replace(/\*/g,"x");

					if (validateContract(pvalue))
						board.Contract = pvalue;
				}
				else if (pname=="declarer")
				{
					pvalue = pvalue.toUpperCase();

					if (pvalue.length==1)
						if (validDealers.indexOf(pvalue)!=-1)
							board.Declarer = pvalue.toUpperCase();
				}
				else if (pname=="title")
				{
					b.Title = pvalue.replaceAll("+"," ");
				}
				else if (pname=="analyse")	// calculate makeable contracts and par contract/score automatically
				{
					if (pvalue.toUpperCase()=="TRUE")
						b.forceAnalyse = 1;
				}
				else if (pname=="dd")
				{
					pvalue = pvalue.toLowerCase();

					if (pvalue.length!=20)
					{
						switch(language)
						{
							case "de":
								alert("Der Parameter für Double Dummy Stiche muss 20 Zeichen lang sein");
								break;
							default:
								alert("Double Dummy Tricks parameter must be 20 characters long");
						}
						return "";
					}

					var substr = pvalue.replace(/[^1234567890abcd\-\*]/g,"");

					if (substr.length!=pvalue.length)
					{
						switch(language)
						{
							case "de":
								alert("Der Parameter für Double Dummy Stiche darf nur die Zeichen 0 bis 9, a bis d, A bis D, -, und * enthalten");
								break;
							default:
								alert("Double Dummy parameter value may only contain the characters 0 to 9, a to d, A to D, -, and *");
						}
						return "";
					}

					var fullInfo = 0;	// Set to 1 if full information is present in the dd string (not just for makeable contracts);
					var j;

					for (j=0;j<20;j++)
					{
						if ((pvalue.charAt(j)>"1")&&(pvalue.charAt(j)<"7"))
						{
								// 0 1nd 1 are often used to indicate number of tricks for a particular contract is not present, but any value
								// in range 2 to 7 inclusive suggests that full information is present.
							fullInfo = 1;
							break;
						}
					}

					var pvalue2 = "";

					for (j=0;j<20;j++)
					{
						if (fullInfo==0)
						{
							if (pvalue.charAt(j)<"7")
								pvalue2 = pvalue2.concat("-");
							else
								pvalue2 = pvalue2.concat(pvalue.charAt(j));
						}
						else
							pvalue2 = pvalue2.concat(pvalue.charAt(j));
					}

					board.DoubleDummyTricks = pvalue2;

					ddPresent = true;
				}
				else if (pname=="optimumscore")
				{
					board.OptimumScore = pvalue;
				}
				else if (pname=="leadcard")
				{
					pvalue = pvalue.toUpperCase();

					var validCard = true;

					if (pvalue.length!=2)
						validCard = false;
					else
					{
						var cvalue = pvalue.charAt(0);
						var cards = "23456789TJQKA";

						if (cards.indexOf(cvalue)==-1)
							validCard = false;
						else
						{
							var suit = "CHDS";

							if (suit.indexOf(pvalue.charAt(1))==-1)
								validCard = false;
						}
					}

					if (validCard)
					{
						pvalue = pvalue.toUpperCase();
						var pvalue2 = "";
						pvalue2 = pvalue.charAt(1).concat(pvalue.charAt(0));
						var played = [];
						played[0] = pvalue2;
						board.Played = played;
						board.Bids = [];
					}
				}
				else if (pname=="lin")
				{
					b.lin = pvalue;
				}
				else if ((pname=="eventid")||(pname=="event"))
				{
					b.event = pvalue;
				}
				else if (pname=="club")
				{
					b.club = pvalue;
				}
				else if (pname=="pair_number")
				{
					b.pair_number = pvalue;
				}
				else if (pname=="direction")
				{
					b.direction = pvalue;
				}
				else if (pname=="compare")
				{
					b.compare = 1;
				}
				else if (pname=="file")
				{
					if (pvalue!="")
					{
						b.file = pvalue;
						let fn = document.getElementById("filename");
						pvalue = "<br>(" + pvalue +")";
						const clean = DOMPurify.sanitize(pvalue, { RETURN_DOM_FRAGMENT: true });
						fn.replaceChildren(clean);
						//document.getElementById("filename").innerHTML="<br>(" + pvalue +")";
					}
				}
				else if (pname=="xml")
				{
					b.xml = pvalue;
				}
				else if (pname=="sessid")
				{
					b.sessid = pvalue;
				}
				else if (pname=="msec")
				{
					b.msec = pvalue; // Section Number for Multiple Section Events
				}
				else if (pname=="display")
				{
					pvalue = pvalue.toLowerCase();

					if ((pvalue!="allpairs")&&(pvalue!="personal")&&(pvalue!="board"))
					{
						switch(language)
						{
							case "de":
								alert('Wert des "display" Parameters, sofern vorhanden, muss "allpairs", "personal", oder "board" sein');
								break;
							default:
								alert('value of "display" parameter, when present, must be "allpairs", "personal", or "board"');
						}
					}
					else
					{
						b.display = pvalue;
					}
				}
				else if (pname=="analysis")
				{
						// Request is from BridgeWebs. This means that "Results Analysis" button will be displayed. If any 3rd party
						// site sets this parameter the button will be displayed but won't display any data.
					b.analysis = pvalue.toLowerCase();
				}
				else if (pname=="debug")
				{
					if (pvalue=="true")	// any other setting is interpreted as "false"
						b.debug = pvalue;
				}
				else if (pname=="jsonlin")
				{
					jsonlin = pvalue;
				}
				else if (pname=="lang")
				{
					language = pvalue;
					changeLanguage(language);
				}
				else if (pname=="nav")
				{
					if (pvalue==0)
					{
						document.getElementById("data").style.display = "none";
					} else {
						document.getElementById("data").style.display = "";
					}
				}
				/*else if (pname=="clip")
				{
					if (pvalue==1)
					{
						document.getElementById("clipboard").style.display = "";
					} else {
						document.getElementById("clipboard").style.display = "none";
					}
				}*/
				else return false;
	}

			if (jsonlin=="")
			{
				if (!ddPresent) board.DoubleDummyTricks = "********************";

				board.Deal = deal;
				b.boards[0] = board;

				if (((typeof b.file)=="undefined")&&((typeof b.lin)=="undefined"))
				{
					var dealstr = deal[0] + deal[1] + deal[2] + deal[3];
					var lang = identifyHonourCardSet(dealstr);
					deal[0] = convertToJQKA(deal[0],lang);
					deal[1] = convertToJQKA(deal[1],lang);
					deal[2] = convertToJQKA(deal[2],lang);
					deal[3] = convertToJQKA(deal[3],lang);

					if (validateBoard(board)==0) return "";
				}

				if (!((typeof board.Declarer)!=undefined)&&((typeof board.Contract!=undefined)))
				{
						// Delete all these if either declarer or contract is not defined.
					delete board.Declarer;
					delete board.Contract;
					delete board.Played;
					delete board.Bids;
				}
			}
			else
			{
				//board = JSON.parse(jsonlin);
				try {
					board = JSON.parse(jsonlin);
				} catch (error) {
					console.error("Invalid jsonlin parameter", error);
					return "";
				}
				b.boards[0] = board;

				if (validateBoard(board)==0) return "";
			}
		if ((typeof b.display != "undefined") && ((typeof b.lin) == "undefined" && (typeof b.xml) == "undefined"))
		{
			console.log("Display parameter found without traveller. Parameter removed");
			delete b.display;
		}

		return b;
	}

/*
function replaceLang(url, newLang) {
  const u = new URL(url);
  u.searchParams.set("lang", newLang);
  return u.toString();
}*/
