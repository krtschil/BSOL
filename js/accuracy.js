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

