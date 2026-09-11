function findPlayedCardDir(bindex,card)
{
	var suits = "SHDC";
	var curBoard = g_hands.boards[bindex];
	var deal = curBoard.Deal;
	var i,suitIndex;

	var suit = card.toUpperCase().charAt(0);
	var value = card.toUpperCase().charAt(1);

	suitIndex = suits.indexOf(suit);

	for (i=0;i<4;i++)
	{
		var holding = deal[i].split(".");

		if (holding[suitIndex].indexOf(value)!=-1)
			return i; //0,1,2,3 = N,E,S,W
	}

	return -1;
}

function calculateTricks(bindex)
{
	var sequence = "23456789TJQKA";
	var trumpSuit;
	var i,j;
	var nstricks = 0;
	var ewtricks = 0;
	var tricks;
	var tricksuit,card;
	var winnerDir = -1;
	var contract = g_hands.boards[bindex].Contract;

	if (validContract(contract))
	{
			// Get trump suit
		trumpsuit = contract.charAt(1).toUpperCase();

		var curBoard = g_hands.boards[bindex];
		var played = curBoard.Played;

		if (curBoard.Claimed=="")
		{
			if (played.length==52)
			{
				for (i=0;i<played.length-3;i=i+4)
				{
					tricksuit = played[i].charAt(0).toUpperCase();
					trickdir = findPlayedCardDir(bindex,played[i]);
					trickvalue = sequence.indexOf(played[i].charAt(1).toUpperCase());

					for (j=1;j<4;j++)
					{
						card = played[i+j];
						cardsuit = card.charAt(0).toUpperCase();
						carddir = findPlayedCardDir(bindex,card);

						if (cardsuit==tricksuit)
						{
							if (sequence.indexOf(card.charAt(1))>trickvalue)
							{
								trickvalue = sequence.indexOf(card.charAt(1));
								trickdir = carddir;
							}
						}
						else if ((trumpsuit!="N")&&(cardsuit==trumpsuit))
						{
							tricksuit = trumpsuit;	// After first ruff, subsequent cards have to be in trumpsuit to beat it
							trickvalue = sequence.indexOf(card.charAt(1));
							trickdir = carddir;
						}
					}

					if ((trickdir==0)||(trickdir==2))
						nstricks++;
					else
						ewtricks++;
				}

				if ((curBoard.Declarer=="N")||(curBoard.Declarer=="S"))
					tricks = nstricks;
				else
					tricks = ewtricks;
			}
			else
			{
				return "";
			}
		}
		else
		{
			tricks = curBoard.Claimed;
		}

		var target = Number(contract.charAt(0)) + 6;

		if (tricks==target)
			return "";
		else if (tricks>target)
			return "+" + (tricks-target);
		else
			return tricks-target;
	}
}

function playNextCard(pthis)
{
	if (g_showPlay)
	{
		if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
		{
			var played = g_hands.boards[g_lastBindex].Played;

			if (g_currentPlayIndex<played.length)
			{
				if (g_lastMatchedPlayIndex == (g_currentPlayIndex - 1))	// still following the actual cards played in the match
				{
					var playedInMatch = played[g_currentPlayIndex];

					if (requestPending())
						return;	// Don't allow while there is a request in progress.
					else
						setRequestTimeout(true);

					spinner(pthis);
					callddd(playedInMatch.toUpperCase());
				}
				else
				{
					displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px solid black;\">Es wird momentan nicht dem Abspiel gefolgt</span>");
				}
			}
			else if (g_currentPlayIndex==played.length)
			{
				if (g_lastMatchedPlayIndex == (g_currentPlayIndex - 1))
				{
					displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px solid black;\">Keine weiteren gespielten Karten vorhanden</span>");
				}
				else
				{
					displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px solid black;\">Es wird momentan nicht dem Abspiel gefolgt</span>");
				}
			}
			else
			{
				displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px solid black;\">Keine weiteren gespielten Karten vorhanden</span>");
			}
		}
	}
}

function enterPlayMode()
{
	setMode(1);	// indicate page is in play g_mode
	show("editHand");
	hide("backPlay");
	hideForwardPlay();
	show("play");
	$("#scorecard").hide();
	show("help");

	document.getElementById("makeableContracts").className = "mc_large";
	document.getElementById("traveller").style.width = "800px";
	document.getElementById("northHand").style.height = Math.floor(g_sectionHeight) + "px";
	document.getElementById("westHand").style.height = Math.floor(g_sectionHeight) + "px";
	document.getElementById("southHand").style.height = Math.floor(g_sectionHeight) + "px";
	document.getElementById("wvul").style.height = (g_sectionHeight-40) + "px";	// Increase height of vulnerability bar to match new table height.
	document.getElementById("vul").style.width = g_sectionHeight + "px";	// Increase width of table centre to match new table height.

	var contracts = document.getElementById("makeableContracts");
	var rows = contracts.rows;

	var cvector = g_hands.boards[g_lastBindex].DoubleDummyTricks;
	var value;

	for (i=0;i<4;i++)
	{
		for (j=0;j<5;j++)
		{
			value = rows[1+i].cells[1+4-j].innerHTML;

			rows[1+i].cells[1+4-j].className = "myLink";
			rows[1+i].cells[1+4-j].onclick = function(){
				var declCHARS = "NSEW";
				var suitCHARS = "CDHSN";
				var suit = $(this).index() - 1;
				var schars = "cdhsn";
				var suitChar = schars.charAt(suit);
				var contract = "*" + suitCHARS.charAt(suit); // Put '*' in case it's number of tricks in makeable contracts table entry !
				if (suit==4) contract = contract + "T"; // No Trumps
				var declarer = $(this.parentNode).index() - 1;

				var indx = (5*($(this.parentNode).index() - 1))+ ($(this).index() - 1);

				g_showOriginalContract = false;

				if ((g_defaultContract==0)||(indx!=g_defaultContractIndex))
				{
					setShowPlay(0);
					playContract(declCHARS.charAt(declarer),suitChar,contract);
				}
				else
					playLinContract();
			};
		}
	}

	showCredits();
}

function stopPlay()
{
	terminateSession();	// Terminate current playing session if there is one in progress.
	setMode(0);			// Not in play mode any more

	var contracts = document.getElementById("makeableContracts");
	var rows = contracts.rows;

	for (i=0;i<4;i++)
	{
		for (j=0;j<5;j++)
		{
			rows[1+i].cells[1+4-j].className = "mc";
			rows[1+i].cells[1+4-j].onclick = null;
		}
	}

	showCredits();
}

function exitCardPlay()
{
	resetTimeout();
	terminateSession();
	document.getElementById("play").innerHTML = g_playButtonText;
	setupTraveller(g_lastBindex,true);
	enterPlayMode();
	document.getElementById("mctable").className = "";
}
