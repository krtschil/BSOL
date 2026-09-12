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

function newBoard(boardnum)
{
        // Currently not used....
    var i;
	var dealerPattern = "NESW";
	var vulnerabilityPattern = ["None", "NS", "EW", "All", "NS", "EW", "All", "None","EW", "All", "None", "NS", "All", "None", "NS", "EW"];
    var currentBoardName = g_hands.boards[g_lastBindex].board;
    var board = {};
    var curTindex = g_lastBindex;
    var idx = 1;

    if (!Number.isNaN(boardnum)) idx = Number(boardnum);

	board.Dealer = dealerPattern.charAt((idx-1) % 4);
	board.Vulnerable = vulnerabilityPattern[(idx-1) % 16];
	board.board = boardnum.toString();
	board.DoubleDummyTricks = "********************";
	board.Deal = [];

    clearMakeableOnInputBoard();

	for (i=0;i<4;i++)
	{
	    board.Deal[i] ="...";
	}

	    // Insert the new board at the correct position within the numbered boards.
	var bnum = Number(board.board);

	for (i=0;i<g_hands.boards.length;i++)
	{
	    var cbd = g_hands.boards[i];

	    if (!Number.isNaN(cbd.board))
	    {
	        if (Number(cbd.board)>bnum)
	        {
	            var tmp = [];
	            var j;

	            for (j=0;j<i;j++)
	                tmp[j] = g_hands.boards[j];

                tmp[i] = board;

                for (j=i;j<g_hands.boards.length;j++)
                    tmp[j+1] = g_hands.boards[j];

                g_hands.boards = [];

                for (j=0;j<tmp.length;j++)
                    g_hands.boards[j] = tmp[j];

                if (curTindex>=i) g_lastBindex++;

	            return;
	        }
	    }
	}

	g_hands.boards[g_hands.boards.length] = board;
}

function deleteBoard()
{
    var i;
    var tmp = [];

    if (g_hands.boards.length==1) return;

    clearMakeableOnInputBoard();

    for (i=0;i<g_lastBindex;i++)
        tmp[i] = g_hands.boards[i];

    for (i=g_lastBindex+1;i<g_hands.boards.length;i++)
        tmp[i-1] = g_hands.boards[i];

    g_hands.boards = [];

    for (i=0;i<tmp.length;i++)
        g_hands.boards[i] = tmp[i];

    if (g_lastBindex>g_hands.boards.length-1) 
		{
			setLastBoardIndex(0);
		}

    quitHandEntryMode();
}

function showDeleteConfirmation()
{
    var htmltext;
    var boardNam = g_hands.boards[g_lastBindex].board;

	switch(language)
	{
		case "de":
			if (g_hands.boards.length==1)
			{
				htmltext = "<span style=\"font-weight:bold;\">Kann das einzige Board nicht löschen</span><br><br>";
				htmltext = htmltext + "<button onclick=\"document.getElementById('popup_box').style.display='none';\" style=\"width:80px;font-size:14px;padding:1px;text-align:center\">OK</button>";
			}
			else
			{
				htmltext = "<span style=\"font-weight:bold;\">Board  " + boardNam +" löschen?</span><br><br>";
				htmltext = htmltext + "<button onclick=\"log('button=deleteBoard');deleteBoard();edit();document.getElementById('popup_box').style.display='none';\" style=\"width:80px;font-size:14px;padding:1px;text-align:center\">Ja</button>";
				htmltext = htmltext + "<button onclick=\"document.getElementById('popup_box').style.display='none';\" style=\"width:80px;font-size:14px;padding:1px;text-align:center\">Nein</button>";
			}
			break;
		default:
			if (g_hands.boards.length==1)
			{
				htmltext = "<span style=\"font-weight:bold;\">Can't delete only board</span><br><br>";
				htmltext = htmltext + "<button onclick=\"document.getElementById('popup_box').style.display='none';\" style=\"width:80px;font-size:14px;padding:1px;text-align:center\">OK</button>";
			}
			else
			{
				htmltext = "<span style=\"font-weight:bold;\">Delete Board  " + boardNam +" ?</span><br><br>";
				htmltext = htmltext + "<button onclick=\"log('button=deleteBoard');deleteBoard();edit();document.getElementById('popup_box').style.display='none';\" style=\"width:80px;font-size:14px;padding:1px;text-align:center\">Yes</button>";
				htmltext = htmltext + "<button onclick=\"document.getElementById('popup_box').style.display='none';\" style=\"width:80px;font-size:14px;padding:1px;text-align:center\">No</button>";
			}
	}

	var buttLoc = getPosition(document.getElementById("deleteBoard"));
	doPopupNoTimeout(document.getElementById("deleteBoard"),htmltext,buttLoc.x - 20,buttLoc.y - 100);
}

