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
