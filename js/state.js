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

function setLastBoardIndex(index) {
    g_lastBindex = index;
    appState.lastBoardIndex = index;
}

function setHands(hands) {
    g_hands = hands;
    appState.hands = hands;
}

function setHandEntryMode(enabled) {
    g_handEntryMode = enabled ? 1 : 0;
    appState.handEntryMode = enabled;
}

function setInputDirection(direction) {
    g_inputDir = direction;
    appState.inputDirection = direction;
}

function setInputBoard(board) {
    g_inputBoard = board;
    window.appState.inputBoard = board;
}

function setSession(session) {
    g_session = session;
    window.appState.session = session;
}

function setMode(mode) {
    g_mode = mode;
    window.appState.mode = mode;
}

function setCurrentPlayer(player) {
    g_currentPlayer = player;
    window.appState.currentPlayer = player;
}

function setCurrentTrickCards(cards) {
    g_currentTrickCards = cards;
    window.appState.currentTrickCards = cards;
}

function setCurrentPlayIndex(index) {
    g_currentPlayIndex = index;
    window.appState.currentPlayIndex = index;
}

function setLastMatchedPlayIndex(index) {
    g_lastMatchedPlayIndex = index;
    window.appState.lastMatchedPlayIndex = index;
}

function setShowPlay(value) {
    g_showPlay = value;
    window.appState.showPlay = value;
}

function setPartialHand(value) {
    g_partialHand = value;
    window.appState.partialHand = value;
}

function setTrumps(trumps) {
    g_trumps = trumps;
    window.appState.trumps = trumps;
}

function setLeader(leader) {
    g_leader = leader;
    window.appState.leader = leader;
}

function setCurrentTraveller(traveller) {
    g_currentTraveller = traveller;
    appState.currentTraveller = traveller;
}