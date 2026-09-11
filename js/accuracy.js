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

function purgeOldEntries()
{
	if (g_db==null) return;

	const transaction = g_db.transaction(["accCache"], "readwrite");
	const objectStore = transaction.objectStore("accCache");

	const myIndex = objectStore.index("time");
	const countRequest = myIndex.count();
	countRequest.onsuccess = function(){
		if (countRequest.result>5000)
		{
			var delCount = countRequest.result - 5000;

				// delete oldest items
			const myIndex = objectStore.index("time");

			myIndex.openCursor().onsuccess = function(){
				const cursor = event.target.result;
				if (cursor) {
				  if (delCount>0)
				  {
					  delCount = delCount-1;
					  const key = cursor.value.key;
					  objectStore.delete(key);
					  cursor.continue();
				  }
				} else {
				  console.log("Old entries purged from accCache in indexedDB");
				}
			};
		}
	};
}

function storeAcc(data,context)
{
	var tmp = data.sess;

	var errCount = tricksConceded(tmp);
	var names = context.names;
	var declarer = context.declarer;

	var direction = "NESW";
	var declIndex = direction.indexOf(declarer.toUpperCase());
	var declName = returnName(names,declIndex,false);
	var leadIndex = (declIndex + 1) % 4;
	var leadName = returnName(names,leadIndex,false);

	var leadErrCount = errCount[leadIndex];

	var leadPartnerIndex = (leadIndex + 2) % 4;
	var leadPartnerName = returnName(names,leadPartnerIndex,false);

	var partnerErrCount = errCount[leadPartnerIndex];

		// Update the board record (in g_hands.boards, or in traveller if there are any
	storeAccInMemory(context,declIndex,tmp.declErr);
	storeAccInMemory(context,leadIndex,leadErrCount);
	var board = storeAccInMemory(context,leadPartnerIndex,partnerErrCount);

	if (g_db!==null)
	{
		const transaction = g_db.transaction(["accCache"], "readwrite");
		const objectStore = transaction.objectStore("accCache");

		var data = {};
		data.key = makeAccKey(board);
		data.acc = board.acc;
		data.time = Date.now();

		var req = objectStore.put(data);
	}

	g_completionCount++;
	document.getElementById("progress").style.width = ((800*g_completionCount)/g_completionTarget).toFixed(0) + "px";
}

function getCachedAcc(tline)
{
	var board = tline.board;
	var declarer = board.Declarer;
	var direction = "NESW";
	var names = board.PlayerNames;

	var acc = tline.board.acc;

	var declIndex = direction.indexOf(declarer.toUpperCase());
	var declName = returnName(names,declIndex);
	var declErrCount = returnAccValue(acc,declIndex);
	var leadIndex = (declIndex + 1) % 4;
	var leadName = returnName(names,leadIndex);
	var leadErrCount = returnAccValue(acc,leadIndex);
	var leadPartnerIndex = (leadIndex + 2) % 4;
	var leadPartnerName = returnName(names,leadPartnerIndex);
	var partnerErrCount = returnAccValue(acc,leadPartnerIndex);

	displayAcc(declName,declErrCount,leadName,leadErrCount,leadPartnerName,partnerErrCount,0,1);
}

function displayAcc(declName,declErrCount,leadName,leadErrCount,leadPartnerName,partnerErrCount,elapsed,dest)
{
	var defErrCount = Number(leadErrCount) + Number(partnerErrCount);

	var acc = document.getElementById("accuracy");
	switch(language)
	{
		case "de":
			var str = "<div style=\"float:left;clear:both;\"><div style=\"float:left;\"><span style=\"font-size:24px;\">Abspielgenauigkeit</span></div><div style=\"float:left;clear:both;margin-top:10px;\"><span style=\"font-size:16px;color:black;\">Anzahl der Abweichungen vom optimalen Double Dummy Abspiel:</span></div>";
			break;
		default:
			var str = "<div style=\"float:left;clear:both;\"><div style=\"float:left;\"><span style=\"font-size:24px;\">Accuracy of Play</span></div><div style=\"float:left;clear:both;margin-top:10px;\"><span style=\"font-size:16px;color:black;\">Number of card play deviations from optimal<br>double dummy play:</span></div>";
	}

	var str2 = "<div style=\"margin-top:10px;float:left;clear:both;\"><span style=\"font-size:18px;color:blue;\">";

	switch(language)
	{
		case "de":
			if ((declErrCount==0)&&(defErrCount==0))
				str = str + str2 + "Abspiel des Alleinspielers und der Gegner war optimal</span></div>";

			if (declErrCount>0)
				str = str + str2 + "Alleinspieler (" + declName + "): " + declErrCount + "</span></div>";

			if (defErrCount>0)
			{
				str = str + str2 + "Gegner: " + defErrCount;
				str += "<br>&nbsp;&nbsp;&nbsp;Ausspieler (" + leadName + "): " + leadErrCount;
				str += "<br>&nbsp;&nbsp;&nbsp;Partner: (" + leadPartnerName + "): " + partnerErrCount + "</span></div>";
			}
			break;
		default:
			if ((declErrCount==0)&&(defErrCount==0))
				str = str + str2 + "Card play was optimal by declarer and defenders</span></div>";

			if (declErrCount>0)
				str = str + str2 + "Declarer (" + declName + "): " + declErrCount + "</span></div>";

			if (defErrCount>0)
			{
				str = str + str2 + "Defenders: " + defErrCount;
				str += "<br>&nbsp;&nbsp;&nbsp;Lead Defender (" + leadName + "): " + leadErrCount;
				str += "<br>&nbsp;&nbsp;&nbsp;Partner: (" + leadPartnerName + "): " + partnerErrCount + "</span></div>";
			}
	}
	str += "</div></div>";

//		str += "<br>Elapsed time: " + tmp.sess.deltaElapsed + "<br><br>";

/*		var optCount = 0;
	var subOptCount = 0;

	for (var i=0;i<tmp.sess.optimumCount.length;i++)
	{
		if (tmp.sess.cardDirection[i]==0)
		{
			optCount += tmp.sess.optimumCount[i];
			subOptCount += tmp.sess.subOptimumCount[i];
		}
	}

	str += " ,optimumCardRatio: " + optCount/(optCount+subOptCount);*/

	if (dest==0)
		acc.innerHTML = "<span style=\"font-size:16px;color:blue;\">" + str + "</span>";
	else
	{
		switch(language)
		{
			case "de":
				var htmltext = "Abspielgenauigkeit:<br>Fehler des Alleinspielers: " + declErrCount + "<br>" + "Fehler der Gegner: " + defErrCount + "<br>" + "Verbrauchte Zeit: " + elapsed + " Sekunden";
				htmltext = "</div><br><button style=\"cursor:pointer;margin-top:15px;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Schließen</button>";
				doPopupNoTimeout(document.getElementById("boardNumber"),"<span style=\"font-size:16px;color:blue;\">" + str + htmltext + "</span>",250,50);
				break;
			default:
				var htmltext = "Accuracy of Play:<br>Declarer Errors: " + declErrCount + "<br>" + "Defence Errors: " + defErrCount + "<br>" + "Elapsed Time: " + elapsed + " seconds";
				htmltext = "</div><br><button style=\"cursor:pointer;margin-top:15px;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Close</button>";
				doPopupNoTimeout(document.getElementById("boardNumber"),"<span style=\"font-size:16px;color:blue;\">" + str + htmltext + "</span>",250,50);
		}
	}
}

function load(data,statusText,jqXHR,ctx)
{
	var context = this;
		// Note: The direction index for Names is 2,3,0,1 for N,E,S,W, but for errCount is 0,1,2,3
	hideSpinner();
	resetTimeout();
	var tmp = data;

	tmp = JSON.parse(tmp);
	tmp = tmp.sess;

	if (load.arguments.length>3)	// being performed locally, not on server
		context = ctx;

	var errCount = tricksConceded(tmp);


	var names = context.names;
	var declarer = context.declarer;

	var direction = "NESW";
	var declIndex = direction.indexOf(declarer.toUpperCase());
	var declName = returnName(names,declIndex);
	var declErrCount = tmp.declErr;
	var leadIndex = (declIndex + 1) % 4;
	var leadName = returnName(names,leadIndex);

	var leadErrCount = errCount[leadIndex];

	var leadPartnerIndex = (leadIndex + 2) % 4;
	var leadPartnerName = returnName(names,leadPartnerIndex);

	var partnerErrCount = errCount[leadPartnerIndex];
	var elapsed = tmp.deltaElapsed;

	displayAcc(declName,declErrCount,leadName,leadErrCount,leadPartnerName,partnerErrCount,elapsed,this.dest);
}

function load2(data,statusText,	jqXHR)
{
	hideSpinner();
	resetTimeout();

	var tmp = data;
	tmp = JSON.parse(tmp);

	switch(language)
	{
		case "de":
			var htmltext = "Spielgenauigkeit:<br>Fehler des Alleinspielers: " + tmp.sess.declErr + "<br>" + "Fehler der Gegner: " + tmp.sess.defErr + "<br>" + "Verbrauchte Zeit: " + tmp.sess.deltaElapsed + " Sekunden";
			htmltext += "</div><br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Schließen</button>";
			break;
		default:
			var htmltext = "Accuracy of Play:<br>Declarer Errors: " + tmp.sess.declErr + "<br>" + "Defence Errors: " + tmp.sess.defErr + "<br>" + "Elapsed Time: " + tmp.sess.deltaElapsed + " seconds";
			htmltext += "</div><br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Cancel</button>";
	}

	doPopupNoTimeout(document.getElementById("boardNumber"),htmltext,250,50);
}

