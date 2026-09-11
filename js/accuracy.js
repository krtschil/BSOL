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

function tricksConceded(data)
{
		// Note: The direction index is 0,1,2,3 for N,S,E,W
	var tricksConceded = data.tricksConceded;
	var cardDirection = data.cardDirection;

	var errCount = [];

	for (var i=0;i<4;i++)
		errCount[i] = 0;

	for (var i=0;i<tricksConceded.length;i++)
	{
		if (tricksConceded[i]!=0)
			errCount[cardDirection[i]]++;
	}

	return errCount;
}

function generateBackgroundAccRequests()
{
	g_bgObj.fn = "processAccs";		// Will be processed by worker event listener function when background workers have initialised
}

function callGetIndexedAcc()
{
		// Revert the current traveller back to g_hands.pair_number/g_hands.direction
	var display = document.getElementById("scoreandtraveller").style.display;
	gotoNextTraveller();
	gotoPrevTraveller();
	if (display=="none") $("#scoreandtraveller").hide();
	getIndexedAcc();
}

function getIndexedAcc()
{
	restartBackgroundWorkers();
	g_completionTarget = 0;
	g_completionCount = 0;

	$("#toolsSubMenu").hide();

	if (!accCalcPossible())
	{
		switch(language)
		{
			case "de":
				doPopupAt("<div style=\"padding:10px;background-color:#FFFFEE;width:180px;border:solid black 1px;\"><span style=\"font-size:16px;\">Kann die Spielgenauigkeit nicht berechnen (die Boards enthalten kein Abspiel)</span></div>",200,200);
				break;
			default:
				doPopupAt("<div style=\"padding:10px;background-color:#FFFFEE;width:180px;border:solid black 1px;\"><span style=\"font-size:16px;\">Can't calculate accuracy of play (boards do not contain a record of the card play sequence)</span></div>",200,200);
		}
		return;
	}

	if (g_db==null)	// IndexedDB not supported in this browser
	{
		generateBackgroundAccRequests();
	}
	else
	{
		var boards;
		const transaction = g_db.transaction(["accCache"], "readwrite");
		const objectStore = transaction.objectStore("accCache");

		if (g_travellers!==null)
			boards = g_travellers.event.board;
		else
			boards = g_hands.boards;

		for (var i=0;i<boards.length;i++)
		{
		  var board = boards[i];

		  if (g_travellers!==null)
		  {
			  var tlines = board.traveller_line;

			  for (var j=0;j<tlines.length;j++)
			  {
				  let tline = tlines[j];

				  if (accCalcPossibleForBoard(tline.board))
				  {
					  var req = objectStore.get(makeAccKey(tline.board));

					  req.onsuccess = function(event){
						  if (typeof event.target.result!=="undefined")
						  {
							this.board.acc = event.target.result.acc;
							g_completionTarget++;
							g_completionCount++;
						  }
						}.bind(tline);
				  }
			  }
		  }
		  else
		  {
				if (accCalcPossibleForBoard(board))
				{
					  var req = objectStore.get(makeAccKey(board));

					  req.onsuccess = function(event){
						  if (typeof event.target.result!=="undefined")
						  {
							this.acc = event.target.result.acc;
							g_completionTarget++;
							g_completionCount++;
						  }
						}.bind(board);
				}
		  }
		}

		transaction.oncomplete = function(event) {
			console.log("All acc values retrieved");
			purgeOldEntries();		// Remove old entries from acc cache

			generateBackgroundAccRequests();
		};
	}
}

function processAccs(name=null)
{
	for (var key in g_accTrans)
		g_accTrans[key].transList = {};

	var requestCount = 0;
	switch(language)
	{
		case "de":
			showEmptyProgressBar("Berechnung der Genauigkeit des Spiels für alle Teilnehmer");
			break;
		default:
			showEmptyProgressBar("Calculating accuracy of play for all participants");
	}

	for (var i=0;i<g_hands.boards.length;i++)
	{
		if (g_travellers!==null)
		{
			var traveller = getTravellerForBoard(i);

			if (traveller==null) continue;

			var tlines = traveller.traveller_line;

			if ((typeof tlines)!=="undefined")
			{
				for (var j=0;j<tlines.length;j++)
				{
					var accPresent = false;

					if (typeof tlines[j].board!=="undefined")
					{
						if (typeof tlines[j].board.acc=="undefined")
						{
							tlines[j].board.acc = [-1,-1,-1,-1];	// Create array to hold results, -1 indicates player didn't play this board (e.g. was Dummy)
						}
						else
						{
							for (var k=0;k<4;k++)
								if (tlines[j].board.acc[k]!==-1)
								{
									accPresent = true;
									break;
								}
						}

						if ((!passed(tlines[j]))&&(!accPresent)&&(accCalcPossibleForBoard(tlines[j].board)))
						{
							makeAccRequest(tlines[j].board,i,j);
							requestCount++;
						}
					}
				}
			}
		}
		else
		{
			var accPresent = false;
			var board = g_hands.boards[i];

			if (typeof board.acc=="undefined")
			{
				board.acc = [-1,-1,-1,-1];	// Create array to hold results, -1 indicates player didn't play this board (e.g. was Dummy)
			}
			else
			{
				for (var k=0;k<4;k++)
					if (board.acc[k]!==-1)
					{
						accPresent = true;
						break;
					}
			}

			if ((board.Contract!=="Passed")&&(!accPresent)&&(accCalcPossibleForBoard(board)))
			{
				makeAccRequest(board,i,-1);
				requestCount++;
			}
		}
	}

	if (requestCount==0)
	{
		finishBackgroundOperation();
		log('button=showPlayerAccMatrix');
		showPlayerAccMatrix();
	}
}

function makeAccRequest(board,bdindex,tindex)
{
	var declCHARS = "NSEW";
	var playedCards = "";
	var names;

	names = board.PlayerNames;

	var context = {"names":names,"declarer":board.Declarer,"dest":1};

	var deal = board.Deal;
	var dealstr = deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
		// Check number of cards in each hand is the same and greater than zero. Allow for embedded dots in hand strings
	var handlen = deal[0].length;
	var k;

	if ((deal[0].length==3)&&(deal[1].length==3)&&(deal[2].length==3)&&(deal[3].length==3))
	{
		var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">Board empty - nothing to do.</span></div>";
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
					var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">Alle Hände müssen dieselbe Anzahl von Karten zu Beginn haben.</span></div>";
					break;
				default:
					var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:180px;\"><span style=\"font-size:16px;\">All hands must start with the same number of cards.</span></div>";
			}
			displayError(document.getElementById("makeableContracts"),errormsg);
			return;
		}
	}

	if ((typeof board.Played)!="undefined")
	{
		var played = board.Played;

		if (played.length>1)
		{
			for (var i=0;i<played.length;i++)
				playedCards = playedCards + played[i];
		}
	}

	var leaderChars = "ewsn";	// Declarer is one place to the right of leader
	var leader = leaderChars.charAt(declCHARS.indexOf(board.Declarer));

	var msg = {};
	msg.request = "a";
	msg.cards = playedCards;
	msg.trumps = board.Contract.charAt(1);
	msg.leader = leader;
	msg.pbn = dealstr;

	var context = {};
	context.key = makeAccKey(board);
	context.declarer = board.Declarer;
	context.tid = g_bgTrans++;
	context.names = names;

	for (var i=0;i<4;i++)
		g_accTrans[names[i]].transList[context.tid]=1;

	context.bdindex = bdindex;
	context.tindex = tindex;
	context.request = msg.request;
	context.requestSubType = "b";	// Background request
	msg.context = context;

	g_mworkers[g_nextmworker].postMessage(msg);

	g_nextmworker++;
	if (g_nextmworker>=g_mworkers.length) g_nextmworker = 0;
	g_completionTarget++;
}
