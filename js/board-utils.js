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