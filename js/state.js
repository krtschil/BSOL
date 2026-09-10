window.appState = {
    language: "de",
    hands: null,
    lastBoardIndex: 0,
    session: 0,
    currentTraveller: null,
    handEntryMode: false
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

function setCurrentTraveller(traveller) {
    g_currentTraveller = traveller;
    appState.currentTraveller = traveller;
}