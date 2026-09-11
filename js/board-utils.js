function getBoardIndex(travindex)
{
	// get board index, given index to a traveller.
	var board = g_travellers.event.board[travindex].board_no;

	var i;

	for (i=0;i<g_hands.boards.length;i++)
	{
		if (g_hands.boards[i].board == board)
		{
			return i;
		}
	}

	return null;
}

function getTravIndex(boardindex)
{
	// get traveller index, given index to a board.
	var board = g_hands.boards[boardindex].board;

	var i;

	for (i=0;i<g_travellers.event.board.length;i++)
	{
		if (g_travellers.event.board[i].board_no == board)
		{
			return i;
		}
	}

	return null;
}

function checkBoardValid(bindex)
{
	if ((typeof g_hands.boards[bindex].Deal)=="undefined") return false;

	var deal = g_hands.boards[bindex].Deal;

	if ((deal[0].length!=16)||(deal[1].length!=16)||(deal[2].length!=16)||(deal[3].length!=16))	// Note string length includes embedded dots between the four suits.
	{
		return false;
	}

	return true;
}