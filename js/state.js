window.appState = {
    language: "de",
    hands: null,
    lastBoardIndex: 0,
    currentTraveller: null,
    handEntryMode: false,
    inputDirection: 0,
    inputBoard: null,
    session: 0,
    mode: 0
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

function setCurrentTraveller(traveller) {
    g_currentTraveller = traveller;
    appState.currentTraveller = traveller;
}