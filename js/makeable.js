function getMakeableTricksForContract(index,contract,declarer)
{
	var trickChars = "0123456789ABCD";
	var suits = "NSHDC";
	var decls = "NSEW";

	if (!validContract(contract)) return -1;

	var suit = suits.indexOf(contract.charAt(1));
	var decl = decls.indexOf(declarer);

	if ((typeof g_hands.boards[index].DoubleDummyTricks)=="undefined")
		return -1;

	var cvector = g_hands.boards[index].DoubleDummyTricks;

	var value = trickChars.indexOf(cvector.charAt((5*decl) + suit).toUpperCase());

	if ((value=="-")||(value=="*")) return -1;

	return Number(value);
}

function getHighestScoringMakeableContractForDirection(bindex,direction,vulnerable)
{
	var suit = "CDHSN";
	var dir = "NS";
	var score;
	var topscore = 0;
	var result = {};
	var contract = "";
	var declarer = "";
	var i,j;
	var tricks;
	var lastSuit=null,lastDeclarer,lastTricks=null;

	if (direction==2) dir = "EW";

	for (i=0;i<dir.length;i++)
	{
		for (j=0;j<suit.length;j++)
		{
			contract = "1" + suit.charAt(j);
			declarer = dir.charAt(i);

				//********** if used would need to modify this to allow for the fact that makeable contracts might not be
				//********** available.
			tricks = getMakeableTricksForContract(bindex,contract,declarer);
			score = calcScoreForMakeable(suit.charAt(j),tricks,vulnerable);

			if (score>topscore)
			{
				topscore = score;
				lastSuit = suit.charAt(j);
				lastDeclarer = declarer;
				lastTricks = tricks;
			}
		}
	}

	if (dir.indexOf(lastDeclarer)==0)	// Check whether partner can also make this contract
	{
		tricks = getMakeableTricksForContract(bindex,"1" + lastSuit,dir.charAt(1));

		if (tricks==lastTricks) lastDeclarer = dir;
	}

	if (lastSuit!=null)
	{
		result.contract = (lastTricks - 6) + lastSuit;
		result.declarer = lastDeclarer;
		return result;
	}

	return null;	// No makeable contract possible
}

function getMakeableTricksForLead(pindex,tline)
{
	var ntricks = null;

	if ((typeof g_hands.boards[pindex].DoubleDummyTricks)!="undefined")
	{
		if (tline.lead!="")
		{
			var idx = getLeadsIdx(tline.contract,tline.played_by);

			if ((typeof g_hands.boards[pindex].openingLeads)!="undefined")
			{
				var leads = g_hands.boards[pindex].openingLeads[idx];

				var ltricks;

				for (j=0;j<leads.length;j++)
				{
					var cl = leads[j];

					if (cl[0].replace("T","10")==leadCard(tline.lead))
					{
						var score = Number(cl[1]);
						ntricks = 13-score;
						break;
					}
				}
			}
		}
	}

	return ntricks;
}

function calculateMakeableAllBoards()
{
		// This function is only enabled when makeable contracts are calculated locally, not on the server
	g_allBoards = 1;
	switch(language)
	{
		case "de":
			showEmptyProgressBar("Analyse der Boards im Hintergrund");
			break;
		default:
			showEmptyProgressBar("Analysing boards in background");
	}
	console.log("generating requests for " + g_hands.boards.length + " boards");

	for (var i=0;i<g_hands.boards.length;i++)
		g_hands.boards[i].tag = -1;

	for (var i=0;i<g_hands.boards.length;i++)
		calculateMakeableSingleBoard(i);
}

function finishBackgroundOperation()
{
	$("#progressDiv").hide();
	document.getElementById("saveBoards").removeAttribute("disabled");
	document.getElementById("editHand").removeAttribute("disabled");

	if ((typeof g_hands.Title)!="undefined")
		g_title = g_hands.Title;
	else
		g_title = "&nbsp;";

	const clean = DOMPurify.sanitize(g_title, { RETURN_DOM_FRAGMENT: true });
	document.getElementById("titleText").replaceChildren(clean); //innerHTML = g_title;
}

function resetAnalyseAllBoards()
{
	g_allBoards = 0;
	finishBackgroundOperation();
}

function completedAnalyseAllBoards()
{
	restartBackgroundWorkers();
	resetAnalyseAllBoards();
}

function cacheMakeable(pindex,data)
{
	var limit = 500;
	var delMax = limit/10;

	if (g_db==null) return;

	try {
		var board = g_hands.boards[pindex];
		var deal = board.Deal;
		var dealstr = "W:" + deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];
		var vul = board.Vulnerable;
		var key = makeDealKey(dealstr,vul,getRequestedLeads(pindex));
		var ddata = {};
		ddata.deal = key;
		ddata.time = Date.now();
		ddata.dd = JSON.parse(data);
		const transaction = g_db.transaction(["ddCache"], "readwrite");
		const objectStore = transaction.objectStore("ddCache");
		objectStore.put(ddata);

		const myIndex = objectStore.index("time");
		const countRequest = myIndex.count();
		countRequest.onsuccess = function(){
			if (countRequest.result>500)
			{
				var delCount = countRequest.result - 100;

					// delete oldest 10 items
				const myIndex = objectStore.index("time");

				myIndex.openCursor().onsuccess = function(){
					const cursor = event.target.result;
					if (cursor) {
					  if (delCount>0)
					  {
						  delCount = delCount-1;
						  const key = cursor.value.deal;
						  objectStore.delete(key);
						  cursor.continue();
					  }
					} else {
					  console.log("Oldest records purged from ddCache in indexedDB");
					}
				};
  			}
		};
	} catch (e) {};
}

function dddLoadMakeable(data,statusText,jqXHR,bindex)
{
	var vul = ["None","All","NS","EW"];
	var leader = "nesw";
	resetTimeout();

	var tmp = data;
	tmp = JSON.parse(tmp);

	if (this.hasOwnProperty("pbn"))	// It's from a remote request, fill in the missing fields from context
	{
		tmp.sess.pbn = this.pbn;
		tmp.vul = convertVulStr(this.vul);
	}

	for (var i=0;i<g_hands.boards.length;i++)
	{
		var board = g_hands.boards[i];
		var deal = board.Deal;
		var dealstr = "W:" + deal[3] + "x" + deal[0] + "x" + deal[1] + "x" + deal[2];

		var found = false;

		if (!tmp.sess.hasOwnProperty("pbn"))	// It's a cached value from old version that doesn't have the pbn field (when cached entries time out this clause will no longer be necessary)
		{
			if (g_hands.boards[i].hasOwnProperty("tag")&&(tmp.sess.sockref==g_hands.boards[i].tag))
				found = true;
		}
		else if (g_hands.boards[i].hasOwnProperty("tag")&&(tmp.sess.sockref==g_hands.boards[i].tag)&&(vul[tmp.vul]==board.Vulnerable)&&(dealstr==tmp.sess.pbn))
		{
			found = true;
		}

		if (found)
		{
			board.DoubleDummyTricks = tmp.sess.ddtricks;
			updateParResults(tmp,i);

			if ((typeof tmp.openingLeads)!="undefined")
			{
				g_openingLeadsPresent = true;
				board.openingLeads = tmp.openingLeads;
			}

// 			cacheMakeable(i,data); // **KK**

			if (i==g_lastBindex) redrawMCTable(true);

			if (g_allBoards==1)
			{
				g_hands.boards[i].tag = -1;

					// Count requests outstanding
				var mccount = makeableContractRequestsOutstanding();

				document.getElementById("progress").style.width = ((800*(g_hands.boards.length-mccount))/g_hands.boards.length).toFixed(0) + "px";

				if (mccount==0)
				{
					g_allBoards = 0;
					hideSpinner();

					if (!g_playItAgain)
					{
						if (g_sessionMode=="ranking") setupRanking(true);
						else if (g_sessionMode=="scorecard") setupScorecard(true);
						else if (g_sessionMode=="traveller") showComparison();
						else if (g_sessionMode=="check") checkAllContracts();
					}

					if (g_openingLeadsPresent)
					{
						var table = document.getElementById("scoring");
						var rows = table.rows;

						switch(language)
						{
							case "de":
								rows[1].cells[5+g_ofs].innerHTML = "<select id='ETFMode' name='ETFMode' style='background-color:yellow;'><option value=0>DD Stiche (ETF)</option><option value=1>Angepasstes ETF</option></select>";
								document.getElementById("rankingDD").innerHTML = "<select id='rankETFMode' name='rankETFMode' style='background-color:yellow;'><option value=0>Double Dummy</option><option value=1>Ausspiel-Angepasstes DD</option></select>";
								break;
							default:
								rows[1].cells[5+g_ofs].innerHTML = "<select id='ETFMode' name='ETFMode' style='background-color:yellow;'><option value=0>DD Tricks(ETF)</option><option value=1>Adjusted ETF</option></select>";
								document.getElementById("rankingDD").innerHTML = "<select id='rankETFMode' name='rankETFMode' style='background-color:yellow;'><option value=0>Double Dummy</option><option value=1>Lead-Adjusted DD</option></select>";
						}
						document.getElementById("ETFMode").onchange = function(){document.getElementById("rankETFMode").value=this.selectedIndex;log("operation=ETFMode:"+this.selectedIndex);setupScorecard(true);};
						document.getElementById("rankETFMode").onchange = function(){document.getElementById("ETFMode").value=this.selectedIndex;log("operation=rankETFMode:"+this.selectedIndex);setupRanking();};
					}

					redrawMCTable(true);
					updateUpperLeftQuadrant(g_lastBindex);

					g_fullInfo = true;
					g_backgroundFetchCompleted = true;

					completedAnalyseAllBoards();
				}
			}
			else
			{
				hideSpinner();
			}
		}
	}
}

function getDDTricks(msg)
{
	delete msg.pfunc;	// Can't pass cloned object containing function

	if (g_mworkers.length>0)
	{
		g_mworkers[g_nextmworker].postMessage(msg);

		g_nextmworker++;
		if (g_nextmworker>=g_mworkers.length) g_nextmworker = 0;
	}
	else	// Background workers not currently running
	{
		g_worker.postMessage(msg);
	}
}

function getIndexedDDTricks(msg)
{
	if (g_db==null)
		getDDTricks(msg);
	else
	{
		const transaction = g_db.transaction(["ddCache"], "readwrite");
		const objectStore = transaction.objectStore("ddCache");
		var req = objectStore.get(makeDealKey(msg.dealstr,msg.vulstr,msg.leadstr));

		req.onsuccess = function(event){
			if (typeof event.target.result!=="undefined")
			{
				var dataObj = event.target.result;
				dataObj.dd.sess.sockref = this.sockref;
				var data = JSON.stringify(dataObj.dd);
				dddLoadMakeable(data,"","",this.context.bindex);
			}
			else	// get it remotely or calculate locally
			{
				getDDTricks(this);
			}
		}.bind(msg);
	}
}

