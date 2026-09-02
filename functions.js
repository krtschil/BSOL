function startup(){
		language = "de";  				// Sets the default language
		g_logging = false;
		g_credits =	"";
		g_resultsFilename;
		g_handRecordsFilename;
		g_hands;
		g_scoring = 0;					// Set to "IMP" for IMPs scoring.
		g_lastBindex = 0;
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
		g_session = 0;
		g_bgTrans = 0;					// Unique transaction id allocated to background transaction (e.g single shot accuracy request)
		g_edited = 0;   				// Set to 1 when a change has been made (or 2, if only the Dealer has been changed)
		g_partialHand = 0;				// Non-zero if playing a hand which started with fewer than 52 cards
		g_partialHandTotalTricks;		// Total number of tricks which can be made by declarer and defenders on a partial hand
		g_session_contract;
		g_showOriginalContract = false;	// Set true when "Play: <contract>" button is pressed for a hand recorded in a lin file.
		g_session_declarer;
		g_defaultTravellerWidth;
		g_lastAllTravellersPair=-1;
		g_lastAllTravellersDir="NS";
		g_mode = 0;						// Set to 1 while in play mode
		g_timeout = "";
		g_sectionHeight; 				// Calculated height for a quadrant of the board display
			// Following variable relate to hand entry.
		g_boardNumberFontSize;
		g_fontRatio = 1.0;
		g_textBratio = 0.9;				// Text font size as fraction of button height
		g_handEntryMode = 0;
		g_inputDir = 0;					// 0,1,2,3 = N,E,S,W
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
		g_checkContracts = new Array();
		g_scorecardContext = new Array();	// Array of context objects for current scorecard, indexed by board number
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
		g_mworkers = new Array();		// Workers for makeable contract calculation
		g_nextmworker = 0;
		g_workerInitCount = 0;
		g_db = null;					// Database handle for indexedDB

		g_bgObj = new Object();
		g_completionCount = 0;			// Count of background accuracy requests completed
		g_completionTarget = 0;			// Used for background player accuracy requests

		g_mcSession = 1;				// "Session" number for tagging single board makeable contract requests

		g_trumps = "";					// Trump suit for current board being played
		g_leader = "";					// Leader for current board being played
		g_initial_data = "";
		g_initial_options = "";
		g_newFeatureNoticeShown = 0;	// Set to 1 if has been shown already during this session
		g_initialised = false;			// Set true in buildpage1
		g_playerAcc = new Array();		// Holds player accuracy counts for event, indexed by player name
		g_accTrans = new Object();		// Holds list of acc transactions outstanding for each player

		cacheTimeout = 300000;			// Limit in milliseconds on how long PBN and json are kept in Local Storage
		//processRequest();
		extractParas();
}

 function getParaName(parameters,i)
  {
	var temp = parameters[i].split("=");

	var pname = decodeURIComponent(temp[0]);

	return pname;
  }

  function getPara(parameters,i)
  {
	var temp = parameters[i].split("=");

	var pname = decodeURIComponent(temp[0]);
	var l = decodeURIComponent(temp[1]);

	if (l.length>=2)
	{
		if (l.charAt(0)=="\"")
		{
		  l = l.substring(1, l.length);
		}
		if (l.charAt(l.length-1)=="\"")
		{
		  l = l.substring(0, l.length - 1);
		}
	}

	return l;
  }

  function identifyHonourCardSet(str)
	{
		if ((str != "") && (typeof str != "undefined"))
		{
			var lang = "english";

			if (str.indexOf("R")!=-1)
				lang = "french";
			else if (str.indexOf("H")!=-1)
				lang = "dutch";
			else if (str.indexOf("D")!=-1) // german or french, but french has already been eliminated above
				lang = "german";

			return lang;
		} else {
			var lang = "english";
			return lang;
		}
	}

  function convertToJQKA(str,lang)
	{
		if (lang=="french")
		{
			str = str.replace(/V/g,"J");
			str = str.replace(/D/g,"Q");
			str = str.replace(/R/g,"K");
		}
		else if (lang=="german")
		{
			str = str.replace(/B/g,"J");
			str = str.replace(/D/g,"Q");
		}
		else if (lang=="dutch")
		{
			str = str.replace(/B/g,"J");
			str = str.replace(/V/g,"Q");
			str = str.replace(/H/g,"K");
		}

		return str;
	}

  function extractParas()
  {
    var validDealers = "NSEW";
    var i;
	var p = location.search;

	if (p.length==0)
	{
		return false;	// No parameters
	}
	else
	{
		p = location.search.substring(1).split("&");

		// [KK] Check for allowed parameter names and remove illegal parameters

		var checkP = [];
		var checkPj=0;
		var listOfParams = [
			"board","dealer","vul","north","east","south","west",
			"contract","declarer","title","dd","analyse","optimumscore",
			"leadcard","lin","event","eventid","club","pair_number",
			"direction","compare","file","xml","sessid","msec",
			"display","analysis","debug","jsonlin","lang","nav"];

		for (i=0;i<p.length;i++)
		{
			parameter = getParaName(p,i).toLowerCase();
			parameterValue = encodeURIComponent(getPara(p,i));
			for (let allowed in listOfParams)
			{
				let help = listOfParams[allowed];
				if (help == parameter)
				{
					checkP[checkPj] = parameter + "=" + parameterValue;
					checkPj++;
				}
			}
		}
		//console.log(p);
		p = checkP;
		//console.log(p);

		//-----------

		if ((p.length == 1) && (getParaName(p,0).toLowerCase() == "lang"))
		{
			pname = getParaName(p,0).toLowerCase();
			pvalue = getPara(p,0);
			if (pname.toLowerCase() == "lang")
			{
				language = pvalue;
				changeLanguage(language);
			}
			return false;
		}
		else
		{
			var b = new Object();
			b.boards = new Array();

			var board = new Object();
			var deal = new Array();
			var ddPresent = false;
			var pname;
			var pvalue;
			var jsonlin = "";

			for (i=0;i<p.length;i++)
			{
				pname = getParaName(p,i).toLowerCase();
				pvalue = getPara(p,i);

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
						var played = new Array();
						played[0] = pvalue2;
						board.Played = played;
						board.Bids = new Array();
					}
				}
				else if (pname=="lin")
				{
					b.lin = pvalue;
				}
				else if ((pname=="eventid")|(pname=="event"))
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
						document.getElementById("filename").innerHTML="<br>(" + pvalue +")";
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
				board = JSON.parse(jsonlin);
				b.boards[0] = board;

				if (validateBoard(board)==0) return "";
			}
		}

		if ((typeof b.display != "undefined") && ((typeof b.lin) == "undefined" && (typeof b.xml) == "undefined"))
		{
			console.log("Display parameter found without traveller. Parameter removed");
			delete b.display;
		}

		return b;
	}
  }

  function validateContract(pvalue)
  {
  	var suits = "NSHDC";

	if (pvalue.length>5) return false;

	var level = pvalue.charAt(0);

	if ((level<"1")|(level>"7")) return false;
	if (suits.indexOf(pvalue.charAt(1))==-1) return false;

	return true;
  }

  function checkDeal(board,polarity)
  {
  		var p = ["North","East","South","West"];
		var dir = p[polarity];
  		var str = board.Deal[polarity].replace(/[23456789TAJQK]/g,"");
//		if (str.length!=board.Deal[polarity].length-13) {alert(dir + " Hand does not contain exactly 13 cards");return 0;};
		var str2 = str.replace(/\./g,"");
		switch(language)
		{
			case "de":
				if (str2.length!=str.length-3) {alert(dir + " Hand enthält nicht genau 3 Trennzeichen für die Farben");return 0;};
				if (str2.length!=0) {alert(dir + " Hand enthält ungültige Zeichen");return 0;};
				break;
			default:
				if (str2.length!=str.length-3) {alert(dir + " Hand does not contain exactly 3 suit separators");return 0;};
				if (str2.length!=0) {alert(dir + " Hand contains invalid characters");return 0;};
		}
		return 1;
  }

  function checkForDuplicates(board)
  {
  		var cvalues = "23456789TJQKA";
  		var i,j,k,cardIndex;
		var cards = new Array(4);

		for (i=0;i<cards.length;i++)
			cards[i] = new Array(13);

		for (i=0;i<4;i++)
			for (j=0;j<13;j++)
				cards[i][j] = 0;

		for (i=0;i<4;i++)	// For each polarity N,E,S,W
		{
			var hand = board.Deal[i];
			hand = hand.split(".");

			for (j=0;j<4;j++)
			{
				for (k=0;k<hand[j].length;k++)
				{
					cardIndex = cvalues.indexOf(hand[j][k]);

					if (cards[j][cardIndex]!=0)
					{
						switch(language)
						{
							case "de":
								alert("Ungültige Teilung - doppelte Karte gefunden");
								break;
							default:
								alert("Invalid Deal - duplicate card detected");
						}
						return 0;
					}
					else
						cards[j][cardIndex]++;
				}
			}
		}

		return 1;
  }

  function validateBoard(board)
  {
  		// First, check that all mandatory parameters are present
		switch(language)
		{
			case "de":
				if ((typeof board.board)=="undefined") {alert("Boardnummer nicht angegeben");return 0;};
				if ((typeof board.Dealer)=="undefined") {alert("Teiler nicht angegeben");return 0;};
				if ((typeof board.Vulnerable)=="undefined") {alert("Gefahrenlage nicht angegeben");return 0;};
				if ((typeof board.Deal[0])=="undefined") {alert("Nordhand nicht angegeben");return 0;};
				if ((typeof board.Deal[1])=="undefined") {alert("Osthand nicht angegeben");return 0;};
				if ((typeof board.Deal[2])=="undefined") {alert("Südhand nicht angegeben");return 0;};
				if ((typeof board.Deal[3])=="undefined") {alert("Westhand nicht angegeben");return 0;};
				break;
			default:
				if ((typeof board.board)=="undefined") {alert("Board Number not specified");return 0;};
				if ((typeof board.Dealer)=="undefined") {alert("Dealer not specified");return 0;};
				if ((typeof board.Vulnerable)=="undefined") {alert("Vulnerability not specified");return 0;};
				if ((typeof board.Deal[0])=="undefined") {alert("North hand not specified");return 0;};
				if ((typeof board.Deal[1])=="undefined") {alert("East hand not specified");return 0;};
				if ((typeof board.Deal[2])=="undefined") {alert("South hand not specified");return 0;};
				if ((typeof board.Deal[3])=="undefined") {alert("West hand not specified");return 0;};
		}

		if (checkDeal(board,0)==0) return 0;
		if (checkDeal(board,1)==0) return 0;
		if (checkDeal(board,2)==0) return 0;
		if (checkDeal(board,3)==0) return 0;

		if (checkForDuplicates(board)==0) return 0;

		return 1;
  }

  function createEmptyBoard()
  {
        g_worker = null;
        g_hands = null;
        g_initialised = false;
        g_loaded = false;
        g_worker = new Worker("calldds.js");
        g_worker.addEventListener("message",listenerMain);
        g_file=1;
  		var result = new Object();
		var board = new Object();
		board.board = "1";
		board.Vulnerable = "None";
		board.Dealer = "N";
		board.Deal = ["...","...","...","..."];
		board.DoubleDummyTricks = "********************";
		result.boards = new Array();
		result.boards.push(board);

// 		document.getElementById("form1").style.display = "none";
		buildPage(result,'{"options":{"ns":["true","false","false"],"ew":["true","false","false"],"mk":["true","false"],"auto":"true"}}');
  }

  function readText(file)
  {
      const reader = new FileReader();
      reader.addEventListener(
          "load",
          (e) => {
                var result = new Object();
                result.handstr = e.target.result;

                var filename = file.name.toUpperCase();

                if (filename.endsWith(".PBN"))
                    result.handstrType = "pbn";
                else if (filename.endsWith(".LIN"))
                    result.handstrType = "lin";
                else
                    result.handstrType = "dlm";

                result.board=1;

                if (result!="")
                {
// 				    document.getElementById("form1").style.display = "none";
                    buildPage(result,'{"options":{"ns":["true","false","false"],"ew":["true","false","false"],"mk":["true","false"],"auto":"true"}}');
                }
          },
          false,
        );

// 		var reader = new FileReader();
// 		reader.onload = function (e) {
// 			var result = new Object();
// 			result.handstr = e.target.result;
//
// 			var filename = file.name.toUpperCase();
//
// 			if (filename.endsWith(".PBN"))
// 				result.handstrType = "pbn";
// 			else if (filename.endsWith(".LIN"))
// 				result.handstrType = "lin";
// 			else
// 				result.handstrType = "dlm";
//
// 			result.board=1;
//
// 			if (result!="")
// 			{
// // 				document.getElementById("form1").style.display = "none";
// 				buildPage(result,'{"options":{"ns":["true","false","false"],"ew":["true","false","false"],"mk":["true","false"],"auto":"true"}}');
// 			}
// 		};//end onload()

		reader.readAsText(file);
  }

  function handleLoadFileSelect(evt)
  {
		var files = evt.target.files;

		if (files.length>0)
		{
			var infile = files[0];
			//alert(infile.name);
			if (infile.name.toUpperCase().endsWith(".PBN")|infile.name.toUpperCase().endsWith(".LIN")|infile.name.toUpperCase().endsWith(".DLM"))
			{
				readText(infile);
				evt.target.value = null;
				document.getElementById("filename").innerHTML="<br>(" + infile.name +")";
			}
			else
			{
				switch(language)
				{
					case "de":
						alert("Keine PBN, LIN, oder DLM Datei");
						break;
					default:
						alert("Not a PBN, LIN, or DLM file");

				}
			}
		}
  }

  function processRequest()
  {
  		var result = extractParas();

/* Moved to events.js
		if (result===false)
		{
 			document.getElementById("form1").style.display = "block";
 			var loadfilectl = document.getElementById("loadFile");
			loadfilectl.addEventListener("change", handleLoadFileSelect,false);
 			return;
		}
*/

		if (result!=""){
			buildPage(result,'{"options":{"ns":["true","false","false"],"ew":["true","false","false"],"mk":["true","false"],"auto":"true"}}');
		}

		setupGeneralHelp();
		/*document.getElementById("showGeneralHelp").onclick = function()
		{
			showHelp(this,"generalHelp");
		}*/
		window.focus();
  }

  function calculateBridgeScore({
	level,
	suit, // 'C', 'D', 'H', 'S', 'N'
	doubled, // false, 'X', or 'XX'
	declarerVulnerable,
	tricksTaken
  }) {
	const trickValues = {
	  C: 20,
	  D: 20,
	  H: 30,
	  S: 30,
	  N: [40, 30] // first NT trick is 40, rest 30
	};

	const contractTricks = 6 + eval(level);
	const made = tricksTaken >= contractTricks;
	const doubledMultiplier = doubled === 'XX' ? 4 : doubled === 'X' ? 2 : 1;
	const insultBonus = doubled === 'XX' ? 100 : doubled === 'X' ? 50 : 0;

	let baseScore = 0;

	if (made) {
	  // Trick score
	  if (suit === 'N') {
		baseScore = (trickValues.N[0] + trickValues.N[1] * (level - 1)) * doubledMultiplier;
	  } else {
		baseScore = trickValues[suit] * level * doubledMultiplier;
	  }

	  // Overtricks
	  const overtricks = tricksTaken - contractTricks;
	  let overtrickScore = 0;

	  if (doubledMultiplier === 1) {
		if (suit=='N'){
			overtrickScore = trickValues.N[1] * overtricks;
		} else {
			overtrickScore = trickValues[suit] * overtricks;
		}

		//overtrickScore = trickValues[suit === 'N' ? 'N[1]' : suit] * overtricks;
	  } else {
		const perOver = doubledMultiplier === 2
		  ? (declarerVulnerable ? 200 : 100)
		  : (declarerVulnerable ? 400 : 200);
		overtrickScore = perOver * overtricks;
	  }

	  // Bonuses
	  let bonus = 0;
	  if (baseScore >= 100) {
		bonus = declarerVulnerable ? 500 : 300; // game bonus
	  } else {
		bonus = 50; // partscore bonus
	  }

	  // Slam bonuses
	  if (level === 6) {
		bonus += declarerVulnerable ? 750 : 500;
	  } else if (level === 7) {
		bonus += declarerVulnerable ? 1500 : 1000;
	  }

	  return baseScore + overtrickScore + bonus + insultBonus;

	} else {
	  // Undertricks
	  const undertricks = contractTricks - tricksTaken;
	  let penalty = 0;

	  if (doubledMultiplier === 1) {
		penalty = undertricks * (declarerVulnerable ? 100 : 50);
	  } else {
		if (declarerVulnerable) {
		  if (undertricks === 1) penalty = 200;
		  else if (undertricks === 2) penalty = 500;
		  else penalty = 500 + (undertricks - 2) * 300;
		} else {
		  if (undertricks === 1) penalty = 100;
		  else if (undertricks === 2) penalty = 300;
		  else if (undertricks === 3) penalty = 500;
		  else penalty = 500 + (undertricks - 3) * 300;
		}

		penalty *= doubledMultiplier / 2; // doubled = ×1, redoubled = ×2
	  }

	  return -penalty;
	}
  }

function roundSym (num,decPlaces) {
	var multi = Math.pow(10, decPlaces);
	var value = (Math.round(multi*Math.abs(num))/multi).toFixed(decPlaces);
	if (num<0) { value = -value; }
	return value;
}

function higherHonourCount(suit,base)
{
	var honours = "";

	if (base=="T")
		honours = "JQKA";
	else if (base=="J")
		honours = "QKA";
	else if (base=="Q")
		honours = "KA";
	else if (base=="K")
		honours = "A";

	var cnt = 0;

	for (var i=0;i<honours.length;i++)
	{
		if (suit.includes(honours[i]))
			cnt++;
	}

	return cnt;
}

function krCalc(suits)
{
	var totcards = 0;

	for (var i=0;i<4;i++)
	{
		totcards += suits[i].length;
	}

	if (totcards!=13) return "";

		// Kaplan Rubens Evaluator
	var total = 0;

	for (var i=0;i<4;i++)
	{
		var suit = suits[i];
		var krpoints = 0;

		if (suit.includes("A")) krpoints += 4;
		if (suit.includes("K")) krpoints += 3;
		if (suit.includes("Q")) krpoints += 2;
		if (suit.includes("J")) krpoints += 1;
		if (suit.includes("T")) krpoints += 0.5;

		if ((suit.length>=2)&&(suit.length<=6))
		{
			if (suit.includes("T"))
				if ((suit.includes("J"))|(higherHonourCount(suit,"J")>=2))
					krpoints += 0.5;	// Rule 6

			if (suit.includes("9"))
				if (suit.includes("8")|suit.includes("T")|(higherHonourCount(suit,"T")==2))
					krpoints += 0.5; //Rule 7
		}

		if ((suit.length>=4)&&(suit.length<=6))
		{
			if (suit.includes("9"))
				if ((!suit.includes("8"))&&(!suit.includes("T"))&&(higherHonourCount(suit,"T")==3))
					krpoints += 0.5;	// Rule 8
		}

		if (suit.length>=7)
			if ((!suit.includes("Q"))|(!suit.includes("J")))
				krpoints += 1;	// Rule 9

		if (suit.length>=8)
			if (!suit.includes("Q"))
				krpoints += 1;	// Rule 10

		if (suit.length>=9)
			if ((!suit.includes("Q"))&&(!suit.includes("J")))
				krpoints += 1;	// Rule 11

		krpoints = (suit.length*krpoints)/10.0;	// Rule 12

//		alert(krpoints);

		if (suit.includes("A"))
			krpoints += 3;	//Rule 13

		if ((suit.includes("K"))&&(suit.length>=2))
			krpoints += 2; // Rule 14

		if ((suit.includes("K"))&&(suit.length==1))
			krpoints += 0.5;  // Rule 15

		if ((suit.length>=3)&&(suit.includes("Q")))
		{
			if ((suit.includes("A"))|(suit.includes("K")))
				krpoints += 1;	// Rule 16

			if ((!suit.includes("A"))&&(!suit.includes("K")))
				krpoints += 0.75;	// Rule 17
		}

		if ((suit.length==2)&&(suit.includes("Q")))
		{
			if ((suit.includes("A"))|(suit.includes("K")))
				krpoints += 0.5;	// Rule 18
			else
				krpoints += 0.25;	// Rule 19
		}

		if (suit.includes("J"))
		{
			var cnt = higherHonourCount(suit,"J");

			if (cnt==2)
				krpoints += 0.5;	// Rule 20
			else if (cnt==1)
				krpoints += 0.25;	// Rule 21
		}

		if (suit.includes("T"))
		{
			var cnt = higherHonourCount(suit,"T");

			if (cnt==2)
				krpoints += 0.25;	// Rule 22

			if ((suit.includes("9"))&&(cnt==1))
				krpoints += 0.25;	// Rule 23
		}

		if (suit.length==0)
			krpoints += 3;	// Rule 24
		else if (suit.length==1)
			krpoints += 2;	// Rule 25
		else if (suit.length==2)
			krpoints += 1;	// Rule 26

		total += krpoints;
	}

	total = total - 1;

	var cnt3 = 0;

	for (var i=0;i<4;i++)
	{
		var suit = suits[i];

		if (suit.length==3) cnt3++;
	}

	if (cnt3==3)	// shape is 4-3-3-3
		total += 0.5;

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

function changeLanguage(l) {
	switch(l)
	{
		case "de":
			document.getElementById("loadFile1").value = "Datei auswählen";
			//document.getElementById("manuell").value = "Hand manuell eingeben";
			document.getElementById("blankInput").innerHTML = "Hand manuell eingeben";
			document.getElementById("showGeneralHelp").innerHTML = "Allgemeine Hilfe";
			document.getElementById("aranking").innerHTML = "Alle Paare";
			document.getElementById("flegend").innerHTML = "<b>Analysiere Bridgehände (PBN/LIN/DLM): Datei/manuell eingeben/Paste/Drop</b>";
			document.getElementById("gotoBoard").innerHTML = "Gehe zu";
			document.getElementById("saveBoards").innerHTML = "Speichern";
			document.getElementById("editHand").innerHTML = "Bearbeiten";
			document.getElementById("play").innerHTML = "Spielen";
			document.getElementById("options").innerHTML = "Optionen";
			document.getElementById("help").innerHTML = "Hilfe";
			document.getElementById("computeMakeable").innerHTML = "Analyse";
			document.getElementById("tools").innerHTML = "Mehr..";


			document.getElementById("optionsClose").innerHTML = "Schließen";
			document.getElementById("toolsSubMenuClose").innerHTML = "<span class=\"font-bold\">Schließen</span>";
			document.getElementById("optionsSave").innerHTML = "Als Standard speichern";
			//document.getElementById("input-manuell").action = "?file=blank.pbn&lang=" + language;
			document.getElementById("clearHand").innerHTML = "Leeren";
			document.getElementById("deleteBoard").innerHTML = "Löschen";
			document.getElementById("newBoard").innerHTML = "Neu...";

			document.getElementById("toolsChoose").innerHTML = "Wähle aus:";
			document.getElementById("analyseAllBoards").innerHTML = "Alle Boards analysieren";
			document.getElementById("showPlayerAcc").innerHTML = "Matrix zur Spielgenauigkeit";
			document.getElementById("showSettings").innerHTML = "Einstellungen...";
			document.getElementById("showReleaseHistory").innerHTML = "Versionshinweise...";
			document.getElementById("toolsSubMenuClose").innerHTML = "Schließen";

			document.getElementById("nslab1").innerHTML = "Zahlen und Farben";
			document.getElementById("nslab2").innerHTML = "Nur Farben";
			document.getElementById("nslab3").innerHTML = "Weder Farben noch Zahlen";
			document.getElementById("ewlab1").innerHTML = "Zahlen und Farben";
			document.getElementById("ewlab2").innerHTML = "Nur Farben";
			document.getElementById("ewlab3").innerHTML = "Weder Farben noch Zahlen";

			document.getElementById("mklab1").innerHTML = "Zeige machbare Kontrakte";
			document.getElementById("mklab2").innerHTML = "Zeige Stichzahl";
			document.getElementById("shorts").innerHTML = "Kürzel für die Figuren:";
			document.getElementById("table_makeable").innerHTML = "Tabelle der machbaren Kontrakte:";
			document.getElementById("nsshow_playable").innerHTML = "N/S: Anzeige für spielbare Karten:";
			document.getElementById("ewshow_playable").innerHTML = "O/W: Anzeige für spielbare Karten:";
			document.getElementById("showGeneralHelp").style.display = "";

			document.getElementById("mkautolab1").innerHTML = "Alle Boards automatisch analysieren";
			document.getElementById("settingsHide").innerHTML = "Schließen";
			document.getElementById("showSettingsHelp").innerHTML = "Hilfe";
			document.getElementById("settingsT").innerHTML = "URL verwenden:";
			//document.getElementById("useURL").value = "URL verwenden";
			//document.getElementById("useURLTooltip").title = "Bitte eine gültige URL eingeben";
			document.getElementById("bsession").innerHTML = "Ergebnisanalyse";

			document.getElementById("aboard").innerHTML = "Nochmal spielen";
			document.getElementById("aacc").innerHTML = "Genauigkeit";
			document.getElementById("agotoboard").innerHTML = "Gehe zu..";
			document.getElementById("ahelp").innerHTML = "Hilfe";
			document.getElementById("acheck").innerHTML = "Überprüfen";
			document.getElementById("atraveller").innerHTML = "Board";

			document.getElementById("scoring1").innerHTML = "Bd";
			document.getElementById("scoring2").innerHTML = "Vs";
			document.getElementById("scoring3").innerHTML = "Kontr";
			document.getElementById("scoring4").innerHTML = "von";
			document.getElementById("scoring5").innerHTML = "Aussp";
			document.getElementById("scoring6").innerHTML = "Stiche";
			document.getElementById("scoring7").innerHTML = "DD Stiche (ETF)";
			document.getElementById("scoring8").innerHTML = "Prozent";

			document.getElementById("travellerTable1").innerHTML = "Paare";
			document.getElementById("travellerTable2").innerHTML = "Kontrakt";
			document.getElementById("travellerTable3").innerHTML = "Zu erfüllen";
			document.getElementById("travellerTable4").innerHTML = "Double Dummy";
			document.getElementById("travellerTable5").innerHTML = "Anschrift";
			document.getElementById("travellerTable6").innerHTML = "Prozent";

			document.getElementById("travellerTable7").innerHTML = "NS";
			document.getElementById("travellerTable8").innerHTML = "OW";
			document.getElementById("travellerTable9").innerHTML = "Kontr";
			document.getElementById("travellerTable10").innerHTML = "von";
			document.getElementById("travellerTable11").innerHTML = "Aussp";
			document.getElementById("travellerTable12").innerHTML = "Stiche";
			document.getElementById("travellerTable13").innerHTML = "Über";
			document.getElementById("travellerTable14").innerHTML = "Ziel";
			document.getElementById("travellerTable15").innerHTML = "Erfüllt";
			document.getElementById("travellerTable16").innerHTML = "(NS)";
			document.getElementById("travellerTable17").innerHTML = "NS";
			document.getElementById("travellerTable18").innerHTML = "OW";

			document.getElementById("contractTable1").innerHTML = "Kontrakt";
			document.getElementById("contractTable2").innerHTML = "Alleinspieler";
			document.getElementById("contractTable3").innerHTML = "Frequenz";
			document.getElementById("contractTable4").innerHTML = "Durchschnitt %";

			document.getElementById("ranking1").innerHTML = "Pos";
			document.getElementById("ranking2").innerHTML = "Paar";
			document.getElementById("ranking3").innerHTML = "N/S Spielernamen";
			document.getElementById("rankingDD").innerHTML = "Dbl Dummy";
			document.getElementById("rankcheck1").innerHTML = "Tabellen nach Paarnummer sortieren";

			document.getElementById("scoring_summary1").innerHTML = "Zusammenfassung";

			document.getElementById("ascorecard").innerHTML = "Persönlich";

			document.getElementById("video-i").innerHTML = "Erklärvideo";
			document.getElementById("clipboard").innerHTML = "Hole Boards aus der Zwischenablage";
			document.getElementById("optionsSaveFeedback").innerHTML = "Auswahl gespeichert";

			break;
		default:
			document.getElementById("loadFile1").value = "Open file";
			//document.getElementById("manuell").value = "Enter hand";
			document.getElementById("blankInput").innerHTML = "Enter hand";
			document.getElementById("showGeneralHelp").innerHTML = "General help";
			document.getElementById("aranking").innerHTML = "All Pairs";
			document.getElementById("flegend").innerHTML = "<b>Analyse Bridge hands (PBN/LIN/DLM): file/manual entry/paste/drop file</b>";
			document.getElementById("gotoBoard").innerHTML = "Go To";
			document.getElementById("saveBoards").innerHTML = "Save...";
			document.getElementById("editHand").innerHTML = "Edit";
			document.getElementById("play").innerHTML = "Play";
			document.getElementById("options").innerHTML = "Options";
			document.getElementById("help").innerHTML = "Help";
			document.getElementById("computeMakeable").innerHTML = "Analyse";
			document.getElementById("tools").innerHTML = "More..";

			document.getElementById("optionsClose").innerHTML = "Close";
			document.getElementById("toolsSubMenuClose").innerHTML = "<span  class=\"font-bold\">Close</span>";
			document.getElementById("optionsSave").innerHTML = "Save As Default";
			//document.getElementById("input-manuell").action = "?file=blank.pbn&lang=" + language;
			document.getElementById("clearHand").innerHTML = "Clear";
			document.getElementById("deleteBoard").innerHTML = "Delete";
			document.getElementById("newBoard").innerHTML = "New...";

			document.getElementById("toolsChoose").innerHTML = "Select a Function:";
			document.getElementById("analyseAllBoards").innerHTML = "Analyse All Boards";
			document.getElementById("showPlayerAcc").innerHTML = "Show Player Accuracy Matrix";
			document.getElementById("showSettings").innerHTML = "Settings...";
			document.getElementById("showReleaseHistory").innerHTML = "Release Notes...	";
			document.getElementById("toolsSubMenuClose").innerHTML = "Close";

			document.getElementById("nslab1").innerHTML = "Subscripts and Colours";
			document.getElementById("nslab2").innerHTML = "Colours Only";
			document.getElementById("nslab3").innerHTML = "No Subscripts or Colours";
			document.getElementById("ewlab1").innerHTML = "Subscripts and Colours";
			document.getElementById("ewlab2").innerHTML = "Colours Only";
			document.getElementById("ewlab3").innerHTML = "No Subscripts or Colours";

			document.getElementById("mklab1").innerHTML = "Show makeable contracts";
			document.getElementById("mklab2").innerHTML = "Show number of tricks";
			document.getElementById("shorts").innerHTML = "Honour Card Display:";
			document.getElementById("table_makeable").innerHTML = "Makeable Contracts Table:";
			document.getElementById("nsshow_playable").innerHTML = "N/S Playable Card Display:";
			document.getElementById("ewshow_playable").innerHTML = "E/W Playable Card Display:";
			//document.getElementById("showGeneralHelp").style.display = "none";

			document.getElementById("mkautolab1").innerHTML = "Auto-Analyse Entire Board Set";
			document.getElementById("settingsHide").innerHTML = "Close";
			document.getElementById("showSettingsHelp").innerHTML = "Help";
			document.getElementById("settingsT").innerHTML = "Settings:";
			//document.getElementById("useURL").value = "Enter URL";
			//document.getElementById("useURLTooltip").title = "Please enter a valid URL";
			document.getElementById("bsession").innerHTML = "Results Analysis";

			document.getElementById("aboard").innerHTML = "Play It Again";
			document.getElementById("aacc").innerHTML = "Accuracy";
			document.getElementById("agotoboard").innerHTML = "Go To..";
			document.getElementById("ahelp").innerHTML = "Help";
			document.getElementById("acheck").innerHTML = "Check";
			document.getElementById("atraveller").innerHTML = "Board";

			document.getElementById("scoring1").innerHTML = "Bd";
			document.getElementById("scoring2").innerHTML = "Vs";
			document.getElementById("scoring3").innerHTML = "Bid";
			document.getElementById("scoring4").innerHTML = "by";
			document.getElementById("scoring5").innerHTML = "Ld";
			document.getElementById("scoring6").innerHTML = "Tricks";
			document.getElementById("scoring7").innerHTML = "DD Tricks (ETF)";
			document.getElementById("scoring8").innerHTML = "Percentage";

			document.getElementById("travellerTable1").innerHTML = "Pairs";
			document.getElementById("travellerTable2").innerHTML = "Contract";
			document.getElementById("travellerTable3").innerHTML = "Making";
			document.getElementById("travellerTable4").innerHTML = "Double Dummy";
			document.getElementById("travellerTable5").innerHTML = "Score";
			document.getElementById("travellerTable6").innerHTML = "Percentage";
			document.getElementById("travellerTable7").innerHTML = "NS";
			document.getElementById("travellerTable8").innerHTML = "EW";
			document.getElementById("travellerTable9").innerHTML = "Bid";
			document.getElementById("travellerTable10").innerHTML = "by";
			document.getElementById("travellerTable11").innerHTML = "Lead";
			document.getElementById("travellerTable12").innerHTML = "Tricks";
			document.getElementById("travellerTable13").innerHTML = "Over";
			document.getElementById("travellerTable14").innerHTML = "Target";
			document.getElementById("travellerTable15").innerHTML = "Made";
			document.getElementById("travellerTable16").innerHTML = "(NS)";
			document.getElementById("travellerTable17").innerHTML = "NS";
			document.getElementById("travellerTable18").innerHTML = "EW";

			document.getElementById("contractTable1").innerHTML = "Contract";
			document.getElementById("contractTable2").innerHTML = "Declarer";
			document.getElementById("contractTable3").innerHTML = "Frequency";
			document.getElementById("contractTable4").innerHTML = "Average %";

			document.getElementById("ranking1").innerHTML = "Pos";
			document.getElementById("ranking2").innerHTML = "Pair";
			document.getElementById("ranking3").innerHTML = "N/S Playernames";
			document.getElementById("rankingDD").innerHTML = "Dbl Dummy";
			document.getElementById("rankcheck1").innerHTML = "Sort tables by pair number";

			document.getElementById("scoring_summary1").innerHTML = "Summary";

			document.getElementById("ascorecard").innerHTML = "Personal";

			document.getElementById("video-i").innerHTML = "Video";
			document.getElementById("clipboard").innerHTML = "Get boards data from clipboard";
			document.getElementById("optionsSaveFeedback").innerHTML = "Selection saved";

	}
}

function processClipboardData(text)
{
	var clipBoardData = text;  // + "\n";  // To make sure boards are recognized

	var result = new Object();
	result.handstr = clipBoardData;
	result.board=1;

	// For a [Deal the [Dealer and [Vulnerable entries are also needed. Add default values if missing
	// This way a single PBN line with a [Deal only is accepted
	if (result.handstr.includes("[Deal "))
	{
		if (!result.handstr.includes("[Vulnerable "))
		{
			result.handstr = "[Vulnerable \"None\"\n" + result.handstr;
		}
		if (!result.handstr.includes("[Dealer "))
		{
			result.handstr = "[Dealer \"N\"\n" + result.handstr;
		}
	}

	var isPBN = (result.handstr.includes("% PBN ") || ( (result.handstr.includes("[Dealer ")) && (result.handstr.includes("[Deal ")) && (result.handstr.includes("[Vulnerable "))) );//result.handstr.includes("[Deal ") && result.handstr.includes("[Board ");
	var isLIN = result.handstr.includes("|md|");
	var isDLM = result.handstr.includes("[Document]");

	if (isPBN)
	{
		result.handstrType = "pbn";
		switch(language)
		{
			case "de":
				document.getElementById("filename").innerHTML="<br>(PBN-Daten aus der Zwischenablage eingefügt)";
				break;
			default:
				document.getElementById("filename").innerHTML="<br>(PBN data pasted from clipboard)";
		}
	}

	if (isLIN)
	{
		result.handstrType = "lin";
		switch(language)
		{
			case "de":
				document.getElementById("filename").innerHTML="<br>(LIN-Daten aus der Zwischenablage eingefügt)";
				break;
			default:
				document.getElementById("filename").innerHTML="<br>(LIN data pasted from clipboard)";
		}
	}

	if (isDLM)
	{
		result.handstrType = "dlm";
		switch(language)
		{
			case "de":
				document.getElementById("filename").innerHTML="<br>(DLM-Daten aus der Zwischenablage eingefügt)";
				break;
			default:
				document.getElementById("filename").innerHTML="<br>(DLM data pasted from clipboard)";
		}
	}

	if (isPBN || isLIN || isDLM)
	{
		buildPage(result,'{"options":{"ns":["true","false","false"],"ew":["true","false","false"],"mk":["true","false"],"auto":"true"}}');
	} else {
		switch(language)
		{
			case "de":
				alert("Keine oder falsche PBN/LIN/DLM-Daten in der Zwischenablage gefunden: \n----------------\n" + clipBoardData);
				break;
			default:
				alert("No or wrong PBN/LIN/DLM data found in clipboard: \n----------------\n" + clipBoardData);
		}
	}
}


// Read clipboard when pressing the respective button
// Check whether clipboard contains only one text object.
// Only text data is accepted. Mixed content is rejected.

async function readClipboard() {
  try {

	const items = await navigator.clipboard.read();

	for (const item of items)
	{
		if ((item.types.includes("text/plain")) && (item.types.length == 1))
		{
			const blob = await item.getType("text/plain");
			const text = await blob.text();

			// Save it to a variable for further processing
			var clipBoardData = text + "\n";  // To make sure boards are recognized
			processClipboardData(clipBoardData);

			//return clipBoardData;
		} else {
			switch (language)
			{
				case "de":
					alert("Die Zwischenablage enthält keine PBN/LIN/DLM-Daten");
					break;
				default:
					alert("Clipboard does not contain PBN/LIN/DLM data");
			}
		}
	}

  } catch (err) {
    	console.error('Failed to read clipboard: ', err);
  }
}
/*
function replaceLang(url, newLang) {
  const u = new URL(url);
  u.searchParams.set("lang", newLang);
  return u.toString();
}*/
