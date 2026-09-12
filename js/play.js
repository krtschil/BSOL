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

function processPosition(hcards,para)
{
		// Updates the card display while in 'play' mode from the json data received back from the web server after a card is played.
		// hcards is a javascript object built from the json string received from the server.
	var savehcards = hcards;

	if (hcards.errno<0)
	{
		alert(savehcards);
		alert(hcards.errmsg);
	}

	var finished="";

	if (hcards.errno==0)
	{
		setCurrentPlayer(hcards.player);
		if (g_currentPlayer=="north") setCurrentPlayer(0);
		else if (g_currentPlayer=="east") setCurrentPlayer(1);
		else if (g_currentPlayer=="south") setCurrentPlayer(2);
		else if (g_currentPlayer=="west") setCurrentPlayer(3);
	}

	for (i=0;i<4;i++)
	{
		for (j=0;j<13;j++)
		{
			g_playableCards[i][j] = -1;
			g_inactiveCards[i][j] = 1;	// set all cards inactive, then set cards remaining active.
			g_currentTrickCards[i][j] = 0;
		}
	}

	if (hcards.errno==0)
	{
		if (g_showPlay!=0)
		{
			setCurrentPlayIndex(hcards.trick*4 + hcards.trickCard);

				// Check if cards played match what is stored in the hand record up to this point
			if (g_currentPlayIndex==0)
				setLastMatchedPlayIndex(-1);
			else
			{
				if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
				{
					var played = g_hands.boards[g_lastBindex].Played;

					if (g_lastMatchedPlayIndex >= (g_currentPlayIndex-2))
					{
						setLastMatchedPlayIndex(g_currentPlayIndex - 2);
					}

					if (g_lastMatchedPlayIndex == (g_currentPlayIndex - 2))	// see if card just played is still part of sequence played in match
					{
						if ((g_currentPlayIndex-1)<=(played.length-1))
						{
							var lastSuit = hcards.lastSuit;
							var lastCard = hcards.lastCard;

							var playedInMatch = played[g_currentPlayIndex-1];
							var suitChars = "SHDC";
							var matchSuit = Number(suitChars.indexOf(playedInMatch.toUpperCase().charAt(0)));

							var cardChars = "23456789TJQKA";
							var matchCard = cardChars.indexOf(playedInMatch.charAt(1));

							if ((lastSuit==matchSuit)&&(lastCard==matchCard))
							{
								g_lastMatchedPlayIndex++;

								if ((typeof g_hands.boards[g_lastBindex].Claimed)!="undefined")
								{
									if ((g_lastMatchedPlayIndex==played.length-1)&&(played.length<52))
										switch(language)
										{
											case "de":
												if (g_hands.boards[g_lastBindex].Claimed!="")
													finished = "<br><span style=\"color:red;font-weight:bold;font-size:16px;\">" + g_hands.boards[g_lastBindex].Claimed + " Stiche beansprucht</span>";
												else
													finished = "<br><span style=\"color:red;font-weight:bold;font-size:16px;\">Keine weiteren Karten gespielt</span>";
												break;
											default:
												if (g_hands.boards[g_lastBindex].Claimed!="")
													finished = "<br><span style=\"color:red;font-weight:bold;font-size:16px;\">" + g_hands.boards[g_lastBindex].Claimed + " Tricks Claimed</span>";
												else
													finished = "<br><span style=\"color:red;font-weight:bold;font-size:16px;\">No More Cards Played</span>";
										}
								}
							}
						}
					}
				}
			}
		}

		var currentTrick = hcards.currentTrick;

		for (i=0;i<currentTrick.length;i++)
		{
			g_currentTrickCards[currentTrick[i][0]][currentTrick[i][1]] = 1;
		}

		var remaining = hcards.remaining;

		for (i=0;i<4;i++)
		{
			var playerCardsRemaining = remaining[i];

			for (j=0;j<4;j++)
			{
				var suitRemaining = playerCardsRemaining[j];

				for (k=0;k<suitRemaining.length;k++)
				{
					g_inactiveCards[j][suitRemaining[k]] = 0;
				}
			}
		}

		var cards = hcards.cards;

		g_hiscore = 0;

		for (i=0;i<cards.length;i++)
		{
			var data = cards[i];
			var score = data.score;
			var suits = data.values;
			var currentTricks;

			if ((g_currentPlayer==0)||(g_currentPlayer==2))	// North/South
				currentTricks = hcards.tricksNS;
			else
				currentTricks = hcards.tricksEW;

				// Add current tricks to tricks remaining to give total that can be made on this hand given current position
			score = score + currentTricks;

			if (score>g_hiscore) g_hiscore = score;

			for (j=0;j<4;j++)
			{
				var values = suits[j];

				for (k=0;k<values.length;k++)
				{
					g_playableCards[j][values[k]] = score;
				}
			}
		}

		if ((hcards.trick==0)&&(hcards.trickCard==0))
		{
			if ((g_session_contract.charAt(0)=="-")||(g_session_contract.charAt(0)=="*"))
			{
				var maxTricksDeclarer = g_partialHandTotalTricks - g_hiscore;
				var minusTricks;

				if (g_partialHand==0)
				{
					if (maxTricksDeclarer<7)
					{
						minusTricks = 7 - maxTricksDeclarer;
						g_session_contract = "1" + g_session_contract.substring(1) + "-" + minusTricks;
					}
					else
					{
						var contractTricks = maxTricksDeclarer - 6;
						g_session_contract = contractTricks + g_session_contract.substring(1);
					}
				}
				else	// For partial hands just show the suit, not the level of contract
				{
					g_session_contract = g_session_contract.substring(1);
				}
			}
		}

		switch(language)
		{
			case "de":
				if ((hcards.tricksNS+hcards.tricksEW)==g_partialHandTotalTricks) finished = "<br><span style=\"color:red;font-weight:bold;font-size:16px;\">Beendet</span>";
				break;
			default:
				if ((hcards.tricksNS+hcards.tricksEW)==g_partialHandTotalTricks) finished = "<br><span style=\"color:red;font-weight:bold;font-size:16px;\">Finished</span>";
		}

		var original = "";

		switch(language)
		{
			case "de":
				if ((g_showPlay!=0)&&(g_showOriginalContract==false))
					original = "<br><span style=\"font-size:12px;font-weight:normal;\">(ursprünglich gespielter Kontrakt: " + g_hands.boards[g_lastBindex].Contract + ")</span>";
				document.getElementById("currentPosition").innerHTML = "<span style=\"font-weight:bold;font-size:16px;\">Kontrakt: " + substituteSuitSymbol(g_session_contract) + " von " + g_session_declarer + original + "<br><br>" + "NS Stiche: " + hcards.tricksNS + "<br>OW Stiche: " + hcards.tricksEW + "</span>" + finished;
				break;
			default:
				if ((g_showPlay!=0)&&(g_showOriginalContract==false))
					original = "<br><span style=\"font-size:12px;font-weight:normal;\">(originally played in " + g_hands.boards[g_lastBindex].Contract + ")</span>";
				document.getElementById("currentPosition").innerHTML = "<span style=\"font-weight:bold;font-size:16px;\">Contract: " + substituteSuitSymbol(g_session_contract) + " by " + g_session_declarer + original + "<br><br>" + "NS Tricks: " + hcards.tricksNS + "<br>EW Tricks: " + hcards.tricksEW + "</span>" + finished;
		}
	}

	displayHands();
}

function hideForwardPlay()
{
		// Try/Catch in case using older version of ddummy.htm without this button
	try {
		hide("forwardPlay");
	} catch (err) {};
}

function showForwardPlay()
{
		// Try/Catch in case using older version of ddummy.htm without this button
	try {
			// Only show this button if playing a contract from a BBO lin file
		if (g_showPlay!=0) show("forwardPlay");
	} catch (err) {};
}

function handlePlayCardClick(pthis)
{
	var str = pthis.id.replace("button","");

	if (requestPending())
		return;
	else
		setRequestTimeout(true);

	spinner(pthis);
	callddd(str.substring(0,2));
}

function calldds(str)
{
	var board = g_hands.boards[g_lastBindex];
	var deal = board.Deal;
	var dealstr = "W:" + deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];

	var msg = {};
	msg.request = str;

	if (str!=="q")
	{
		msg.pbn = dealstr;
		msg.trumps = g_trumps;
		msg.leader = g_leader;
	}

	msg.requesttoken = g_session;
	msg.sockref = g_session;

	var context = {};
	context.request = msg.request;

	if (str!=="q")
		context.para = "ongoing";
	else
		context.para = "quit";

	msg.context = context;

	g_worker.postMessage(msg);
}

function callddd(pstr)
{
	if (pstr!="q") calldds(pstr);
}

function dddquitfunc(data,statusText,jqXHR)
{
	// do nothing routine, supplied as a callback when user quits a play session
}

function resetState()
{
	stopPlay();

	if (g_timeout!="")	// Clear timeout routine queued, if any
	{
		clearTimeout(g_timeout);
		g_timeout = "";
	}

	hideSpinner();

	hideRanking();
	$("#scores").hide();
	$("#scoreandtraveller").hide();
//	$("#mainTitle").hide();
	$("").hide();
	hideAllPopups();
	$("#popup_box").finish();
	document.getElementById("popup_box").display = "none";
}

function terminateSession()
{
	hideSpinner();

	if (g_session!=0)
	{
		callddd("q");  // Terminate any double dummy playing g_session that is in progress.

		showCredits();
	}

	exitHandEntryMode(); // In case hand editing is in progress.
}

function playLinContract(auto=false,dest=0)
{
	var declarerChars = "NESW";
	var leaderChars = "ESWN";

	var board = g_hands.boards[g_lastBindex];

	var contract = board.Contract;

	if (!g_showOriginalContract)
		contract = contract.replace(/[xX\*]/g,"");

	var contractChar = contract.charAt(1);

	if (!auto) setShowPlay(1);

	playContract(board.Declarer,contract.charAt(1),contract,auto,dest);
}

function playContract(declarer,suitChar,contract,auto=false,dest=0)
{
	if (requestPending())
		return;	// There is still a request outstanding.

	var declCHARS = "NSEW";
	var playedCards = "";
	var names;

	hideAllPopups();

	if (g_session!=0) callddd("q");	// Terminate any ddd session that is currently in progress

	terminateSession();
	exitHandEntryMode();

	clearCardData();
	displayHands();

	var board = g_hands.boards[g_lastBindex];
	var names = board.PlayerNames;

	if (!Array.isArray(names) || names.length < 4) {
		names = ["S", "W", "N", "E"];
	}
	/*
	if ((typeof g_hands.boards[g_lastBindex])!="undefined")
		names = g_hands.boards[g_lastBindex].PlayerNames;
	else
	{
		names = [];
		names[0] = "S";
		names[1] = "W";
		names[2] = "N";
		names[3] = "E";
	}*/

	var context = {"names":names,"declarer":declarer,"dest":dest};

	var deal = g_hands.boards[g_lastBindex].Deal;
	var dealstr = deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
		// Check number of cards in each hand is the same and greater than zero. Allow for embedded dots in hand strings
	var handlen = deal[0].length;
	var k;

	if ((deal[0].length==3)&&(deal[1].length==3)&&(deal[2].length==3)&&(deal[3].length==3))
	{
		switch(language)
		{
			case "de":
				var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">Board empty - nothing to do.</span></div>";
				break;
			default:
				var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">Leeres Board - es gibt nichts zu tun.</span></div>";
		}
		displayError(document.getElementById("makeableContracts"),errormsg);
		return;
	}

	for (k=1;k<4;k++)
	{
		if (handlen!=deal[k].length)
		{
			switch(language)
			{
				case "de":
					var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">All hands must start with the same number of cards.</span></div>";
					break;
				default:
					var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">Alle Hände müssen zu Beginn mit derselben Anzahl Karten beginnen.</span></div>";
			}
			displayError(document.getElementById("makeableContracts"),errormsg);
			return;
		}
	}

	if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
	{
		var played = g_hands.boards[g_lastBindex].Played;

		if (played.length>1)
		{
			for (var i=0;i<played.length;i++)
				playedCards = playedCards + played[i];
		}
	}

	var leaderChars = "ewsn";	// Declarer is one place to the right of leader
	var leader = leaderChars.charAt(declCHARS.indexOf(declarer));

	setRequestTimeout();

	if (!auto)
	{
		g_session_declarer = declarer;

		if (g_showOriginalContract)
			g_session_contract = contract;
		else
			g_session_contract = "*" + contract.substring(1);

		if ((handlen-3)!=13)	// Subtracting 3 is to allow for the dots between suits.
		{
			setPartialHand(1);
			g_partialHandTotalTricks = handlen-3;	// Subtract 3 to allow for the dots between suits
		}
		else
		{
			setPartialHand(0);
			g_partialHandTotalTricks = 13;
		}

		hideMenuItems();
		show("backPlay");
		showForwardPlay();
		show("options");
		show("play");
		show("help");
	}

	var session = new Date().getTime();

	setSession(session);

	spinner(document.getElementById("makeableContracts").rows[1].cells[0]);

	setLeader(leader);
	setTrumps(suitChar);

	if (!auto)
	{
		var dealstr = "W:" + dealstr;

		var msg = {};
		msg.request = "g";
		msg.pbn = dealstr;
		msg.trumps = g_trumps;
		msg.leader = g_leader;
		msg.requesttoken = g_session;
		msg.sockref = g_session;

		var context = {};
		context.request = msg.request;
		context.para = "new";
		msg.context = context;

		g_worker.postMessage(msg);

		document.getElementById("play").textContent = "Stop";
	}
	else
	{
		var msg = {};
		msg.request = "a";
		msg.cards = playedCards;
		msg.trumps = suitChar;
		msg.leader = leader;
		msg.pbn = dealstr;

		var context = {};
		context.key =  makeAccKey(g_hands.boards[g_lastBindex]);
		context.declarer = declarer;
		context.names = names;
		context.request = msg.request;
		context.requestSubType = "s";	// Single shot accuracy request for one board
		msg.context = context;

		g_worker.postMessage(msg);
	}
}

function dddloadfunc(data,statusText,jqXHR,context)
{
		// Process the response from a ddd request
	var ctx = this;
	if (dddloadfunc.arguments.length>3) ctx = context;

	hideSpinner();
	resetTimeout();

	if (g_mode==1)
	{
		var tmp =data;
		tmp = JSON.parse(tmp);
//				alert(tmp.sess.deltaElapsed);

		if ((tmp.sess.status<200)&&(tmp.sess.status!=0))
		{
			if (tmp.sess.status==14)
			{
				displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Request Timed Out</span>");
				return;
			}
			else
			{
				displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Error: " + tmp.sess.status + "</span>");
				return;
			}
		}

		if (ctx.para=="new")
		{
			log("fn=playcontract");
		}

		if (ctx.para=="new")	// If it's a new session store the session identifier as the current session
		{
			if (tmp.requesttoken==g_session)	// response holds the correct request token, so update the session number to reflect the global session id allocated by the cgi
				setSession(tmp.sess.sockref);
			else
				return;	// this session was cancelled before this response was received.
		}

		if (tmp.sess.sockref!=g_session)	// Don't process this response, this session is no longer current.
			return;
		else
		{
			if (tmp.sess.status==0)
				processPosition(tmp.sess);
			else							// some kind of error detected by ddd
			{
				if (tmp.sess.status==201)	// No lock file, session never existed or timed out
				{
					switch(language)
					{
						case "de":
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Keine aktive Session (abgelaufen?)</span>");
							break;
						default:
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">No active session (expired?)</span>");
					}
				}
				else if (tmp.sess.status==207)
				{
					switch(language)
					{
						case "de":
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Kann nicht zurückgehen, es wurde noch keine Karte gespielt</span>");
							break;
						default:
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Cannot go back, no card has been played yet</span>");
					}
				}
				else if (tmp.sess.status==208)	// hand finished, all tricks now played
				{
					processPosition(tmp.sess);
				}
				else if (tmp.sess.status==209)
				{
					switch(language)
					{
						case "de":
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Ungültige Karte in der aufgezeichneten Abspielfolge</span>");
							break;
						default:
							displayError(document.getElementById("boardNumber"),"<span style=\"font-size:18px;background-color:#FFFFEE;padding:10px;border:1px;border-color:black;\">Invalid card in recorded play sequence</span>");
					}
				}
				else if (tmp.sess.status!=202) // Not a 'lock file' busy message
				{
					switch(language)
					{
						case "de":
							alert("Fehler " + tmp.sess.status + "," + tmp.sess.errno + " - " + tmp.sess.errmsg);
							break;
						default:
							alert("Error " + tmp.sess.status + "," + tmp.sess.errno + " - " + tmp.sess.errmsg);
					}
				}
			}
		}
	}
}
