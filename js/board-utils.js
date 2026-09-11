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

function getTindexByName(boards,boardName)
{
		// Find the index of the hand corresponding to a particular traveller in the boards array
	var i;

	for (i=0;i<boards.length;i++)
	{
		if (boards[i].board.split(".").join("") == boardName.split(".").join(""))
		{
			return i;
		}
	}

	return -1;
}

function getTindex(boards,traveller)
{
		// Find the index of the hand corresponding to a particular traveller in the boards array
	var i;

	for (i=0;i<boards.length;i++)
	{
		if (boards[i].board == (traveller+1))
		{
			return i;
		}
	}

	return -1;
}

function getTravellerForBoard(bindex)
{
	var i;
	var traveller = null;

	for (i=0;i<g_travellers.event.board.length;i++)
	{
		if (g_travellers.event.board[i].board_no==g_hands.boards[bindex].board)
		{
			if (g_travellers.event.board[i].traveller_line.length!=0)
			{
				return g_travellers.event.board[i];
				break;
			}
		}
	}

	return null;
}

function setCurrentTraveller()
{
	g_currentTraveller = getTravellerForBoard(g_lastBindex);
	return g_currentTraveller;
}

function makeableContractRequestsOutstanding()
{
	var mccount = 0;

	for (var j=0;j<g_hands.boards.length;j++)
	{
		if (g_hands.boards[j].tag!=null)
			if (g_hands.boards[j].tag!==-1) mccount++;
	}

	return mccount;
}

function countAllocated(index)
{
	var i,j;
	var count = 0;

	for (i=0;i<4;i++)
	{
		for (j=0;j<13;j++)
		{
			if ((g_cardQuadrant[i][j]==index)&&(g_playableCards[i][j]==-1)) count++;
		}
	}

	return count;
}

function countUnallocated()
{
	var i,j;
	var count = 0;

	for (i=0;i<4;i++)
	{
		for (j=0;j<13;j++)
		{
			if (g_playableCards[i][j]!=-1) count++;
		}
	}

	return count;
}

function clearCardData()
{
	var i,j;

	for (i=0;i<4;i++)
	{
		for (j=0;j<13;j++)
		{
			g_playableCards[i][j] = -1;
			g_inactiveCards[i][j] = 0;
			g_currentTrickCards[i][j] = 0;
		}
	}
}