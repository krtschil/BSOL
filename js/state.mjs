export var clipBoardData;
export var g_version = "Version: 2.1 (2026-09-03)";
export var language = "de";  				// Sets the default language
export var g_logging = false;
export var g_credits =	"";
export var g_resultsFilename;
export var g_handRecordsFilename;
export var g_hands;
// g_scoring initialized below					// Set to "IMP" for IMPs scoring.
export var g_lastBindex = 0;
export var g_currentDir;
export var g_currentPair;
export var g_inactiveCards;
export var g_playableCards;
export var g_currentPlayer;
export var g_currentTrickCards;
export var g_currentPlayIndex;				//0..51 represents index to position within the 52 card sequence being played.
export var g_lastMatchedPlayIndex; 		//0..51
export var g_showPlay=0;					//S If showPlay!=0 show played cards for this hand
export var g_hiscore;
export var g_allBoards = 0;				// Set non-zero while running an analysis on all boards in a set.
export var g_session = 0;
export var g_bgTrans = 0;					// Unique transaction id allocated to background transaction (e.g single shot accuracy request)
export var g_edited = 0;   				// Set to 1 when a change has been made (or 2, if only the Dealer has been changed)
export var g_partialHand = 0;				// Non-zero if playing a hand which started with fewer than 52 cards
export var g_partialHandTotalTricks;		// Total number of tricks which can be made by declarer and defenders on a partial hand
export var g_session_contract;
export var g_showOriginalContract = false;	// Set true when "Play: <contract>" button is pressed for a hand recorded in a lin file.
export var g_session_declarer;
export var g_defaultTravellerWidth;
export var g_lastAllTravellersPair=-1;
export var g_lastAllTravellersDir="NS";
export var g_mode = 0;						// Set to 1 while in play mode
export var g_timeout = "";
export var g_sectionHeight; 				// Calculated height for a quadrant of the board display
	// Following variable relate to hand entry.
export var g_boardNumberFontSize;
export var g_fontRatio = 1.0;
export var g_textBratio = 0.9;				// Text font size as fraction of button height
export var g_handEntryMode = 0;
export var g_inputDir = 0;					// 0,1,2,3 = N,E,S,W
export var g_inputBoard;
export var g_cardQuadrant;
export var g_stopPropagation = 0;
export var g_helpId = "";					// id of current help text on display
export var g_playButtonText = "Spielen"; 	// Text to show on Play button (otherwise may show, for example, Play: 3H by S)
export var g_defaultContract = 0;     		// Set to 1 when there is a default contract for current board (contract and declarer but no
									//  bidding information or cards played)
export var g_defaultContractIndex = -1;  	// If default contract is set, this is the index to the button in the makeable contracts table
									// that relates to that declarer/suit combination.
export var g_timeoutID = "";				// ID of javascript timeout function related to request throttling.
export var g_travellers = null;			// Non-null if traveller records are available
export var g_currentTraveller = null; 		// Traveller record corresponding to current board
export var g_currow = -1;			   		// Index to current row being displayed (for travellers containing bidding/play data for each row
export var g_title = "&nbsp";
export var g_sessInfo = null;				// Holds Session Info for the current event
export var g_rankInfo = null;				// Holds ranking information for current event.
export var g_validPercentageFields = false;// Set to true if percentage fields in json ranking table are non-blank and no negative values
export var g_scoring = "MatchPoints";		// Scoring type - MatchPoints, IMP, VP
export var g_eventType = "Paarturnier";	// Event Type - one of Pairs, Teams
export var g_maxImps = 0;					// Maximum number of IMPs recorded on a single board, if using IMP scoring.
export var g_test = 0;						// Set to 1 if called from test environment.
export var g_xml = "";						// Set to filename of xml file if present (or to 1 if xml supplied as a string)
export var g_xmlstr = "";					// Holds xml when supplied as a string parameter
export var g_handstr = "";					// Holds file content when supplied as a string parameter rather than a file url
export var g_handstrType = "";				// Can be "pbn", "dlm", or "lin" if file content supplied as string
export var g_debug = false;
export var g_ofs = 1;						// Offset to columns beyond (optional) lead card column in Scorecard table
export var g_protocol = "http:";			// called with http or https
export var g_loaded = false;				// Is true if hands/travellers have been loaded already
export var g_fullInfo = false;				// Set to true if makeable contract tables contain full information
export var g_backgroundFetchCompleted = false;		// Set to true if background fetch of makeable contracts/opt contracts/opening leads has completed.
export var g_openingLeadsPresent = false;	// Set to true when ddtricks for opening leads have been calculated and applied.
export var g_travellersHaveLeads = false;  // Set to true if at least one lead card is found in a traveller.
export var g_file = "";					// contains url of 'pbn' or 'dlm' if filename reference was supplied in request
export var g_sessionMode = "scorecard"; 	// assume last looked at scorecard in results analysis
export var g_playItAgain = true;		 	// False if in Results Analysis screens
export var g_scoreToImps = [[0,10,0],[20,40,1],[50,80,2],[90,120,3],[130,160,4],
					[170,210,5],[220,260,6],[270,310,7],[320,360,8],[370,420,9],
					[430,490,10],[500,590,11],[600,740,12],[750,890,13],[900,1090,14],
					[1100,1290,15],[1300,1490,16],[1500,1740,17],[1750,1990,18],[2000,2240,19],
					[2250,2490,20],[2500,2990,21],[3000,3490,22],[3500,3990,23],[4000,32767,24]];
export var g_checkContracts = [];
export var g_scorecardContext = [];	// Array of context objects for current scorecard, indexed by board number
export var g_uniquePairNumbers = "";		// Set to true or false for Teams events from within function checkForUniquePairNumbers
export var g_showAllControls = true;
export var g_isMobi = false;				// True if a mobile device
export var g_namSize = 0;
export var g_bidFontSize = 0;
export var g_dealerFontSize = 0;			// Size of dealer char on traveller
export var g_urqButtonHeight = 0;			// Height of buttons in upper right quadrant of traveller
export var g_urqButtFontSize = 0;			// Font size of buttons in upper right quadrant
export var g_scoreFontSize = 0;			// Font size for score in lin file
export var g_vulBarLength = 0;				// Height or width of vulnerability bar

export var g_worker;						// Worker for Play It Again
export var g_mworkers = [];		// Workers for makeable contract calculation
export var g_nextmworker = 0;
export var g_workerInitCount = 0;
export var g_db = null;					// Database handle for indexedDB

export var g_bgObj = {};
export var g_completionCount = 0;			// Count of background accuracy requests completed
export var g_completionTarget = 0;			// Used for background player accuracy requests

export var g_mcSession = 1;				// "Session" number for tagging single board makeable contract requests

export var g_trumps = "";					// Trump suit for current board being played
export var g_leader = "";					// Leader for current board being played
export var g_initial_data = "";
export var g_initial_options = "";
export var g_newFeatureNoticeShown = 0;	// Set to 1 if has been shown already during this session
export var g_initialised = false;			// Set true in buildpage1
export var g_playerAcc = [];		// Holds player accuracy counts for event, indexed by player name
export var g_accTrans = {};		// Holds list of acc transactions outstanding for each player

export var cacheTimeout = 300000;			// Limit in milliseconds on how long PBN and json are kept in Local Storage

window.appState = {
    language: "de",
    hands: null,
    lastBoardIndex: 0,
    currentTraveller: null,
    handEntryMode: false,
    inputDirection: 0,
    inputBoard: null,
    session: 0,
    mode: 0,
    currentPlayer: null,
    currentTrickCards: null,
    currentPlayIndex: 0,
    lastMatchedPlayIndex: 0,
    showPlay: 0,
    partialHand: 0,
    trumps: "",
    leader: ""
};

export function setLastBoardIndex(index) {
    g_lastBindex = index;
    appState.lastBoardIndex = index;
}

export function setHands(hands) {
    g_hands = hands;
    appState.hands = hands;
}

export function setHandEntryMode(enabled) {
    g_handEntryMode = enabled ? 1 : 0;
    appState.handEntryMode = enabled;
}

export function setInputDirection(direction) {
    g_inputDir = direction;
    appState.inputDirection = direction;
}

export function setInputBoard(board) {
    g_inputBoard = board;
    window.appState.inputBoard = board;
}

export function setSession(session) {
    g_session = session;
    window.appState.session = session;
}

export function setMode(mode) {
    g_mode = mode;
    window.appState.mode = mode;
}

export function setCurrentPlayer(player) {
    g_currentPlayer = player;
    window.appState.currentPlayer = player;
}

export function setCurrentTrickCards(cards) {
    g_currentTrickCards = cards;
    window.appState.currentTrickCards = cards;
}

export function setCurrentPlayIndex(index) {
    g_currentPlayIndex = index;
    window.appState.currentPlayIndex = index;
}

export function setLastMatchedPlayIndex(index) {
    g_lastMatchedPlayIndex = index;
    window.appState.lastMatchedPlayIndex = index;
}

export function setShowPlay(value) {
    g_showPlay = value;
    window.appState.showPlay = value;
}

export function setPartialHand(value) {
    g_partialHand = value;
    window.appState.partialHand = value;
}

export function setTrumps(trumps) {
    g_trumps = trumps;
    window.appState.trumps = trumps;
}

export function setLeader(leader) {
    g_leader = leader;
    window.appState.leader = leader;
}

export function setCurrentTraveller(traveller) {
    g_currentTraveller = traveller;
    appState.currentTraveller = traveller;
}
if (typeof window !== "undefined") {
    Object.assign(window, {
        clipBoardData, g_version, language, g_logging, g_credits, g_resultsFilename,
        g_handRecordsFilename, g_hands, g_scoring, g_lastBindex, g_currentDir,
        g_currentPair, g_inactiveCards, g_playableCards, g_currentPlayer,
        g_currentTrickCards, g_currentPlayIndex, g_lastMatchedPlayIndex, g_showPlay,
        g_hiscore, g_allBoards, g_session, g_bgTrans, g_edited, g_partialHand,
        g_partialHandTotalTricks, g_session_contract, g_showOriginalContract,
        g_session_declarer, g_defaultTravellerWidth, g_lastAllTravellersPair,
        g_lastAllTravellersDir, g_mode, g_timeout, g_sectionHeight, g_boardNumberFontSize,
        g_fontRatio, g_textBratio, g_handEntryMode, g_inputDir, g_inputBoard,
        g_cardQuadrant, g_stopPropagation, g_helpId, g_playButtonText, g_defaultContract,
        g_defaultContractIndex, g_timeoutID, g_travellers, g_currentTraveller, g_currow,
        g_title, g_sessInfo, g_rankInfo, g_validPercentageFields, g_eventType,
        g_maxImps, g_test, g_xml, g_xmlstr, g_handstr, g_handstrType, g_debug,
        g_ofs, g_protocol, g_loaded, g_fullInfo, g_backgroundFetchCompleted,
        g_openingLeadsPresent, g_travellersHaveLeads, g_file, g_sessionMode,
        g_playItAgain, g_scoreToImps, g_checkContracts, g_scorecardContext,
        g_uniquePairNumbers, g_showAllControls, g_isMobi, g_namSize, g_bidFontSize,
        g_dealerFontSize, g_urqButtonHeight, g_urqButtFontSize, g_scoreFontSize,
        g_vulBarLength, g_worker, g_mworkers, g_nextmworker, g_workerInitCount,
        g_db, g_bgObj, g_completionCount, g_completionTarget, g_mcSession,
        g_trumps, g_leader, g_initial_data, g_initial_options, g_newFeatureNoticeShown,
        g_initialised, g_playerAcc, g_accTrans, cacheTimeout, appState,
        setLastBoardIndex, setHands, setHandEntryMode, setInputDirection,
        setInputBoard, setSession, setMode, setCurrentPlayer, setCurrentTrickCards,
        setCurrentPlayIndex, setLastMatchedPlayIndex, setShowPlay, setPartialHand,
        setTrumps, setLeader, setCurrentTraveller
    });
}
