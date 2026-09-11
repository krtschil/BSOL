function checkPlayerNameForTline(name,names)
{
	var namePresent = false;

	for (var i=0;i<4;i++)
	{
		if (names[i]==name) return true;
	}

	return false;
}

function accCalcPossibleForBoard(board)
{
	var possible = false;

	if (typeof board=="undefined") return false;

	if ((typeof board.Played!=="undefined")&&(typeof board.PlayerNames!=="undefined"))
		if ((board.Played.length>1))
			return true;

	return false;
}

function makeAccKey(board)
{
	var key = {};

	key.names = board.PlayerNames;
	key.deal = board.Deal;
	key.trumps = board.Contract.charAt(1);
	key.cards = board.Played;

	return JSON.stringify(key);
}