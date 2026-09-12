function showTravellerRowButtons()
{
	// should return true if g_xml!=="" ?
	// return (g_showAllControls);
}

function setupTraveller(index,active)
{
	var i,j,k;
	var table = document.getElementById("traveller");
	var hcards;
	var boardChanged = false;

	setMode(0);

	if (index!=g_lastBindex) boardChanged = true;

	setLastBoardIndex(index);

	$("#board").show();
	$("#scorecard").show();
	hideMenuItems();
	showMainMenuItems();

	if (active==true)
	{
		show("play");
		show("computeMakeable");
		show("tools");

		{
			if ((((g_test==1))&&(g_file==''))||(g_xml!=""))
			{
				show("bsession");
				show("bsessionHelp");
			}
		}

		$("#scorecard").show();
	}
	else
	{
		hideMenuItems();
	}

	var rowButtonsVisibility = "visibility:hidden";

	if (showTravellerRowButtons()) rowButtonsVisibility = "";

	var curBoard = g_hands.boards[g_lastBindex];

	if (g_travellers!==null)
	{
		var traveller = getTravellerForBoard(g_lastBindex);
		g_currentTraveller = traveller;

		if (traveller!=null)
		{
			if (g_currentTraveller.traveller_line.length>1) rowButtonsVisibility = "";

			if (boardChanged) g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);

			if (g_currow!=-1)
			{
				var tline = g_currentTraveller.traveller_line[g_currow];
				curBoard = setHandRecordFromLin(g_lastBindex,tline);
			}
			else if (boardChanged)
			{
				delete g_hands.boards[g_lastBindex].PlayerNames;
				g_hands.boards[g_lastBindex].Played = [];
				g_hands.boards[g_lastBindex].Bids = [];
			}
		}
	}

	if (active==true)
	{
		g_defaultContract = 0;
		if (((typeof curBoard.Contract)!="undefined")&&((typeof curBoard.Declarer)!="undefined"))
		{
			if (((typeof curBoard.Played)!="undefined") || ((typeof curBoard.Bids)!="undefined"))
			{
				var pbutton = "";
				var isLin = false;

				if ((g_file!="")&&(g_file!==1))
				{
					if (g_file.toUpperCase().endsWith("LIN")) isLin = true;
				}

				if (((typeof curBoard.Played)!="undefined") && ((curBoard.Played.length>1))) isLin = true;

				if ((typeof curBoard.Bids)!="undefined")
					if (curBoard.Bids.length>0) isLin = true;

				if (isLin)
				{
					if (validContract(curBoard.Contract))
					{
						var tricksOffset = calculateTricks(g_lastBindex);
						var score = curBoard.Score;

						if ((score!="") && (typeof score)!="undefined")
						{
							var ewscore = score;

							if (ewscore.indexOf("%")!=-1)
							{
								ewscore = ewscore.replace("%","");
								ewscore = 100.0 - ewscore;
								ewscore = ewscore.toFixed(2) + "%";

								score = score.replace("%","");
								score = Number(score).toFixed(2) + "%";
							}
							else
							{
								var num = score.match(/\d+/);
								score = num ? Number(num[0]) : null;
								num = ewscore.match(/\d+/);
								result = num ? Number(num[0]) : null;
								ewscore = (-Number(result));
							}

							score = " NS: " + score + "&nbsp;&nbsp;&nbsp;EW: " + ewscore;
						}

						if ((((typeof curBoard.Played)!="undefined") && ((curBoard.Played.length>1))) || Number.isNaN(tricksOffset))
							tricksOffset = "";

						if (typeof score == "undefined")
							score = "";

						switch(language)
						{
							case "de":
								var bckbutton = "<button id=prevrow class=menuButton style=\"min-width:20px;max-width:20px;width:20px;max-height:" + g_urqButtonHeight + ";" + rowButtonsVisibility + "\" onclick=\"prevTravRow();\"><span id=prevRowButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\"><</span></button>&nbsp;";
								var fwdbutton = "&nbsp;<button id=nextrow class=menuButton style=\"min-width:20px;max-width:20px;width:20px;max-height:" + g_urqButtonHeight + ";" + rowButtonsVisibility + "\" onclick=\"nextTravRow();\"><span id=nextRowButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">><span></button>";
								var accbutton = "&nbsp;<button id=accbutton class=menuButton style=\"margin-left:2px;min-width:35px;max-width:35px;width:35px;max-height:" + g_urqButtonHeight + ";\" onclick=\"log('button=acc');playLinContract(true,1);\"><span id=accButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">Prä</span></button>";
								pbutton = "<div style=\"margin-left:2px;margin-top:2px;clear:both;float:left;\">" + bckbutton + "<button id=linPlay class=\"menuButton\" style=\"min-width:130px;max-height:" + g_urqButtonHeight + ";\"><span id=linPlayButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">Kontr: " + curBoard.Contract.replaceAll(/!/g,"").replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;").replaceAll(/NT/g,"SA") + tricksOffset + " von " + curBoard.Declarer.replaceAll(/E/g,"O") + "</span></button>";
								pbutton = pbutton + accbutton + "<button id=matchContractHelp class=\"menuButton\" style=\"margin-left:2px;min-width:15px;max-width:15px;width:15px;max-height:" + g_urqButtonHeight + ";\"><span id=matchContractHelpButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">?</span></button>" + fwdbutton + "<br><span id=scoreSpan style=\"font-size:" + g_scoreFontSize + ";\">" + score + "</span></div>";
								break;
							default:
								var bckbutton = "<button id=prevrow class=menuButton style=\"min-width:20px;max-width:20px;width:20px;max-height:" + g_urqButtonHeight + ";" + rowButtonsVisibility + "\" onclick=\"prevTravRow();\"><span id=prevRowButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\"><</span></button>&nbsp;";
								var fwdbutton = "&nbsp;<button id=nextrow class=menuButton style=\"min-width:20px;max-width:20px;width:20px;max-height:" + g_urqButtonHeight + ";" + rowButtonsVisibility + "\" onclick=\"nextTravRow();\"><span id=nextRowButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">><span></button>";
								var accbutton = "&nbsp;<button id=accbutton class=menuButton style=\"margin-left:2px;min-width:35px;max-width:35px;width:35px;max-height:" + g_urqButtonHeight + ";\" onclick=\"log('button=acc');playLinContract(true,1);\"><span id=accButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">Acc</span></button>";
								pbutton = "<div style=\"margin-left:2px;margin-top:2px;clear:both;float:left;\">" + bckbutton + "<button id=linPlay class=\"menuButton\" style=\"min-width:130px;max-height:" + g_urqButtonHeight + ";\"><span id=linPlayButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">Play: " + curBoard.Contract.replaceAll(/!/g,"").replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;") + tricksOffset + " by " + curBoard.Declarer + "</span></button>";
								pbutton = pbutton + accbutton + "<button id=matchContractHelp class=\"menuButton\" style=\"margin-left:2px;min-width:15px;max-width:15px;width:15px;max-height:" + g_urqButtonHeight + ";\"><span id=matchContractHelpButtFontSize style=\"font-weight:bold;font-size:" + g_urqButtFontSize + ";text-align:center;line-height:1em;\">?</span></button>" + fwdbutton + "<br><span id=scoreSpan style=\"font-size:" + g_scoreFontSize + ";\">" + score + "</span></div>";
						}
					}

					var bidding = "";

					if ((typeof curBoard.Bids)!="undefined")
					{
						bidding = showBidding();
					}

					document.getElementById("currentPosition").innerHTML = bidding + pbutton;

					if (document.getElementById("accbutton")!=null)
						if (document.getElementById("accbutton").style.display=="none") document.getElementById("prevrow").style.marginLeft = "35px";

					if ((typeof curBoard.Bids)!="undefined")
					{
						var bids = g_hands.boards[g_lastBindex].Bids;

						for (var j=0;j<bids.length;j++)
						{
							var cell = document.getElementById("bidIdx" + j);

							if (cell!=null)
							{
								cell.onmouseover = cell.onclick = function(){showBidAlert(this)};
								cell.onmouseout = function(){
									var popup = document.getElementById("popup_box");
									popup.textContent = "";
									popup.style.display="none";
									$("#popup_box").finish();
								}
							}
						}
					}

					if (pbutton!="")
					{
						document.getElementById("linPlay").onclick = function(){g_showOriginalContract = true;playLinContract();};
						document.getElementById("matchContractHelp").onclick = function(){showHelp(this,"playMatchContractHelp");};
					}
				}
			}

			var declStr = "NSEW";
			var suitStr = "CDHSN";

			if (validContract(curBoard.Contract))
			{
				var declIndex = declStr.indexOf(curBoard.Declarer);
				var suitIndex = suitStr.indexOf(curBoard.Contract.charAt(1));

				g_defaultContract = 1;
				g_defaultContractIndex = (declIndex * 5) + suitIndex;
			}
		}
		else
		{
			document.getElementById("currentPosition").innerHTML = g_credits;
		}
	}

	document.getElementById("wvul").style.height = "36px";
	document.getElementById("northHand").style.height = "";
	document.getElementById("westHand").style.height = "";
	document.getElementById("southHand").style.height = "";
	document.getElementById("makeableContracts").className = "mc";

	if (g_session!=0) callddd("q");
	setSession(0);
	setLastBoardIndex(index);

	clearCardData();

	while (table.rows.length>6)
	{
		table.deleteRow(-1);
	}

	var npts,spts,wpts,epts;
	var tindex = index;

	if (tindex==-1)
	{
		hide("play");
		$("#board").hide();
	}
	else
	{
		var north = document.getElementById("northHand");
		var handstr = createHandString(g_hands.boards[tindex],0);
		north.innerHTML = handstr.text;
		north.style.backgroundColor = "#EEEEEE";
		npts = handstr.points;

		var east = document.getElementById("eastHand");
		handstr = createHandString(g_hands.boards[tindex],1);
		east.innerHTML = handstr.text;
		east.style.backgroundColor = "#EEEEEE";
		epts = handstr.points;

		var south = document.getElementById("southHand");
		handstr = createHandString(g_hands.boards[tindex],2);
		south.innerHTML = handstr.text;
		south.style.backgroundColor = "#EEEEEE";
		spts = handstr.points;

		var west = document.getElementById("westHand");
		handstr = createHandString(g_hands.boards[tindex],3);
		west.innerHTML = handstr.text;
		west.style.backgroundColor = "#EEEEEE";
		wpts = handstr.points;

		if (g_handEntryMode)
			npts = epts = spts = wpts = "";

		var points = document.getElementById("points");
		points.rows[0].cells[1].innerHTML = npts;
		points.rows[1].cells[0].innerHTML = wpts;
		points.rows[1].cells[2].innerHTML = epts;
		points.rows[2].cells[1].innerHTML = spts;

		var dealer = new Array(4);
		dealer['N'] = "North";
		dealer['S'] = "South";
		dealer['W'] = "West";
		dealer['E'] = "East";

		document.getElementById("boardNumber").innerHTML = "<span style=\"font-size:" + g_boardNumberFontSize + ";font-weight:normal;\">" + makeBoardNameString(g_hands.boards[g_lastBindex].board) + "</span>";

		var vul = g_hands.boards[tindex].Vulnerable;
		var boardDealer = dealer[g_hands.boards[tindex].Dealer];

		document.getElementById("nvul").textContent = "";
		document.getElementById("wvul").textContent = "";
		document.getElementById("evul").textContent = "";
		document.getElementById("svul").textContent = "";

		setDealerChar(boardDealer,vul);

		displayVulnerability(vul,boardDealer);

		redrawMCTable(true);

		updateUpperLeftQuadrant(g_lastBindex);

		document.getElementById("play").onclick = function(){
				if ((document.getElementById("play")).innerHTML == "Stop")
				{
					exitCardPlay();
				}
				else
				{
					if (requestPending()) return;

					terminateSession();

					{
						var pos = getPosition(this);
						switch(language)
						{
							case "de":
								doPopupAt("Klicken Sie auf einen Eintrag (einschließlich leerer) in der Tabelle<br> der machbaren Kontrakte, um diesen zu spielen.",pos.x-100,pos.y-100);
								break;
							default:
								doPopupAt("Tap any of the entries (including blank entries)in the makeable<br>contracts table at any time to start playing that contract.",pos.x-100,pos.y-100);
						}

						document.getElementById("mctable").className = "shadow";
						setTimeout(function(){document.getElementById("mctable").className = "";},4400);
					}
				}
			};

		document.getElementById("help").onclick = function()
			{
				hideAllPopups();

				if (g_session==0)
					showHelp(this,"commandHelp");
				else
					showHelp(this,"playHelp");
			}

		document.getElementById("options").onclick = function()
			{
				hideAllPopups();
				showOptions(this);
			}

		document.getElementById("backPlay").onclick = function()
			{
				if (requestPending())
					return;
				else
					setRequestTimeout(true);

				hideAllPopups();
				spinner(this);
				callddd("u");
			}

		try {
			document.getElementById("forwardPlay").onclick = function()
				{
					hideAllPopups();
					playNextCard(this);
				}
		} catch (e) {}

		document.getElementById("editHand").onclick = edit;
	}

	if (active)
	{
		var board = g_hands.boards[g_lastBindex];

		const clean = DOMPurify.sanitize(g_title, { RETURN_DOM_FRAGMENT: true });
		document.getElementById("titleText").replaceChildren(clean);

		$("#mainTitle").show();

		if ((typeof g_hands.display)=="undefined")
		{
			if ((g_hands.boards[g_lastBindex].DoubleDummyTricks == "********************")||(g_hands.boards[g_lastBindex].DoubleDummyTricks == "--------------------"))
			{
				if (checkBoardValid(g_lastBindex))
				{
					console.log("request issued");
					calculateMakeableSingleBoard(g_lastBindex);
				}
			}
		}
	}
}

function getRowFromTraveller(pair,direction)
{
	var i;
	var info = getSessionInfo();
	var singleWinner = info.singleWinner;

	var tlines = g_currentTraveller.traveller_line;

	for (i=0;i<tlines.length;i++)
	{
		var line = tlines[i];

		if ((((direction==1)||singleWinner)&&(line.ns_pair_number==pair))||(((direction==2)||singleWinner)&&(line.ew_pair_number==pair)))
		{
			return i;
		}
	}

	return -1;
}

function getInfoForSimilarContracts(lineIndex,direction)
{
	var i;
	var traveller = g_currentTraveller.traveller_line;
	var curLine = traveller[lineIndex];
	var suit = curLine.contract.charAt(1);
	var declarer = curLine.played_by;
	var level = Number(curLine.contract.charAt(0));

	var result = {};
	result.totalPairs = traveller.length;
	result.totalThisSuitAndDeclarer = 0;
	result.moreTricks = 0;
	result.sameTricks = 0;
	result.lessTricks = 0;
	result.bidPartScore = 0;
	result.madePartScore = 0;
	result.bidGameScore = 0;
	result.madeGameScore = 0;
	result.bidSmallSlam = 0;
	result.madeSmallSlam = 0;
	result.bidGrandSlam = 0;
	result.madeGrandSlam = 0;

	for (i=0;i<traveller.length;i++)
	{
		if (i!=lineIndex)
		{
			var t = traveller[i];

			if ((t.contract.charAt(1)==suit)&&(declarer==t.played_by))
			{
				result.totalThisSuitAndDeclarer++;


			}
		}
	}

	var playedByPercent = Math.round((100*(result.totalThisSuitAndDeclarer+1))/(result.totalPairs));

	switch(language)
	{
		case "de":
			var str = "Diese Farbe/Alleinspieler-Kombination wurde an " + result.totalThisSuitAndDeclarer + " von " + result.totalPairs + " anderen Tischen (" + playedByPercent + "%).";
			break;
		default:
			var str = "This suit/declarer combination was played at " + result.totalThisSuitAndDeclarer + " of " + result.totalPairs + " other tables (" + playedByPercent + "%).";
	}
	
	const clean = DOMPurify.sanitize(document.getElementById("comparisonText").innerHTML + "<span style=\"font-size:12px;\"><br><br><p>" + str + "</p></span>", { RETURN_DOM_FRAGMENT: true });
	document.getElementById("comparisonText").replaceChildren(clean);
	//document.getElementById("comparisonText").innerHTML = document.getElementById("comparisonText").innerHTML + "<span style=\"font-size:12px;\"><br><br><p>" + str + "</p></span>";

	return result;
}

function sortTravellerLines(lines,pdirection)
{
	lines.sort(function(a,b) {
			var sign = 1;

			if (pdirection==2) sign = -1;

			if ((a.contract!=null)&&(b.contract!=null))
			{
				var suits = "CDHSN";
				var declarers = "WESN";
				var levelb = Number(b.contract.charAt(0));
				var levela = Number(a.contract.charAt(0));
				var suitb = suits.indexOf(b.contract.charAt(1));
				var suita = suits.indexOf(a.contract.charAt(1));
			}

			var mpta = returnPoints(a,sign);
			var mptb = returnPoints(b,sign);

			if ((a.contract!=null)&&(b.contract!=null))
			{
/*				if (sortBySuit)
				{
					if (suitb>suita) return 1;
					else if (suitb<suita) return -1;
					else if (levelb>levela) return 1;
					else if (levelb<levela) return -1;
				}*/
				if (levelb>levela) return 1;
				else if (levelb<levela) return -1;
				else if (suitb>suita) return 1;
				else if (suitb<suita) return -1;
				else if ((b.contract.indexOf("**")!=-1)&&(a.contract.indexOf("**")==-1)) return 1;
				else if ((b.contract.indexOf("**")==-1)&&(a.contract.indexOf("**")!=-1)) return -1;
				else if ((b.contract.indexOf("*")!=-1)&&(a.contract.indexOf("*")==-1)) return 1;
				else if ((b.contract.indexOf("*")==-1)&&(a.contract.indexOf("*")!=-1)) return -1;
				else if ((b.ns_pair_number=="")&&(a.ns_pair_number!="")) return 1;	// checking for optimum contract row
				else if ((b.ns_pair_number!="")&&(a.ns_pair_number=="")) return -1;	// checking for optimum contract row
				else if (declarers.indexOf(b.played_by)>declarers.indexOf(a.played_by)) return 1;
				else if (declarers.indexOf(a.played_by)>declarers.indexOf(b.played_by)) return -1;
			}

			if (mptb>mpta) return 1;
			else if (mptb<mpta) return -1;
			else return comparePairNumbers(a.ns_pair_number,b.ns_pair_number);
			});
}

function computeTravellerStatistics(pdirection)
{
	var i,j;
	var result = [];
	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);

	var traveller = g_currentTraveller.traveller_line;

	for (i=0;i<traveller.length;i++)
	{
		var found = false;
		var tline = traveller[i];

		if (played(tline))
		{
			var contract = tline.contract;

			if (!validContract(contract))
			{
				if (passed(tline))
					switch(language)
					{
						case "de":
							contract = "Durchgepasst";
							break;
						default:
							contract = "Passed out"
					}
				else
					contract = "N/A";
			}

			for (j=0;j<result.length;j++)
			{
				var cobj = result[j];

				if ((cobj.contract==contract)&&(cobj.played_by==tline.played_by))
				{
					found = true;
					cobj.tcount++;

					var percent;

					if (g_scoring!="IMP")
						percent = (100*Number(tline.ns_match_points))/(Number(tline.ns_match_points) + Number(tline.ew_match_points));
					else if (g_eventType!="Teams")
						percent = Number(tline.ns_match_points);
					else
					{
						if (pdirection==1)
							percent = Number(tline.crossImpsNS);
						else
							percent = Number(tline.crossImpsEW);
					}

					if (percent<cobj.minPercent)
						cobj.minPercent = percent;
					else if (percent>cobj.maxPercent)
						cobj.maxPercent = percent;

					break;
				}
			}

			if (!found)
			{
				var newobj = {};
				newobj.contract = contract;
				newobj.played_by = tline.played_by;
				newobj.tcount = 1;

				var percent;

				if (g_scoring!="IMP")
					percent = (100*Number(tline.ns_match_points))/(Number(tline.ns_match_points) + Number(tline.ew_match_points));
				else if (g_eventType!="Teams")
					percent = Number(tline.ns_match_points);
				else
				{
					if (pdirection==1)
						percent = Number(tline.crossImpsNS);
					else
						percent = Number(tline.crossImpsEW);
				}

				newobj.minPercent = percent;
				newobj.maxPercent = percent;
				result[result.length] = newobj;
			}
		}
	}

	var str = "";

	result.sort(function(a,b) {
			var suits = "CDHSN";
			var levelb = Number(b.contract.charAt(0));
			var levela = Number(a.contract.charAt(0));
			var suitb = suits.indexOf(b.contract.charAt(1));
			var suita = suits.indexOf(a.contract.charAt(1));

			if (levelb>levela) return 1;
			else if (levelb<levela) return -1;
			else if (suitb>suita) return 1;
			else if (suitb<suita) return -1;
			else return 0;
			});

	var ctable = document.getElementById("contractTable");
	var tlen = ctable.rows.length;

	for (i=0;i<tlen-1;i++)
	{
		ctable.deleteRow(-1);
	}

	switch(language)
	{
		case "de":
			if (g_scoring!="IMP")
			{
				if (pdirection==1)
					ctable.rows[0].cells[3].textContent = "Min/Max NS Prozente";
				else
					ctable.rows[0].cells[3].textContent = "Min/Max OW Prozente";
			}
			else
			{
				var tailEnd = "Punkte";

				if (g_eventType=="Teams") tailEnd = "Cross Imps";

				if (pdirection==1)
					ctable.rows[0].cells[3].textContent = "Min/Max NS " + tailEnd;
				else
					ctable.rows[0].cells[3].textContent = "Min/Max OW " + tailEnd;
			}
			break;
		default:
				if (g_scoring!="IMP")
			{
				if (pdirection==1)
					ctable.rows[0].cells[3].textContent = "Min/Max NS Percentage";
				else
					ctable.rows[0].cells[3].textContent = "Min/Max EW Percentage";
			}
			else
			{
				var tailEnd = "Points";

				if (g_eventType=="Teams") tailEnd = "Cross Imps";

				if (pdirection==1)
					ctable.rows[0].cells[3].textContent = "Min/Max NS " + tailEnd;
				else
					ctable.rows[0].cells[3].textContent = "Min/Max EW " + tailEnd;
			}
	}
	for (i=0;i<result.length;i++)
	{
		var curobj = result[i];
		percentLo = curobj.minPercent;
		percentHi = curobj.maxPercent;

		if (g_scoring!="IMP")
		{
			percentLo = parseFloat(curobj.minPercent).toFixed(0);
			percentHi = parseFloat(curobj.maxPercent).toFixed(0);
		}

		if (pdirection==2)
		{
			var tmp = percentLo;

			if (g_scoring!="IMP")
			{
				percentLo = 100 - percentHi;
				percentHi = 100 - tmp;
			}
			else if (g_eventType!="Teams")
			{
				percentLo = -percentHi;
				percentHi = -tmp;
			}
		}

		ctable.insertRow(-1);
		var crow = ctable.rows[ctable.rows.length-1];

		for (j=0;j<6;j++)
		{
			crow.insertCell(-1);
		}

		var cells = crow.cells;
		cells[0].innerHTML = curobj.contract.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
		cells[1].innerHTML = curobj.played_by;
		cells[2].innerHTML = curobj.tcount;

		cells[3].innerHTML = drawBar(curobj.tcount,traveller.length,150,15,false);

		if (g_scoring!="IMP")
		{
			if (percentHi==percentLo)
				cells[4].innerHTML = percentLo + "%";
			else
				cells[4].innerHTML = percentLo + "-" + percentHi + "%";
		}
		else
		{
			if (percentHi==percentLo)
				cells[4].innerHTML = percentLo;
			else
				cells[4].innerHTML = percentLo + " to " + percentHi;
		}

			// Draw the box showing minimum and maximum percentage, or IMPs
		var box1,box2,box3;

		if (g_scoring!="IMP")
		{
			box1 = drawBoxedBar(percentLo,percentLo,Math.round(150*percentLo/100),15,"white",true);
			box2 = drawBoxedBar(percentHi-percentLo,percentHi-percentLo,Math.round(150*(percentHi-percentLo)/100),15,"#dddddd",false);
			box3 = drawBoxedBar(100-percentHi,100-percentHi,Math.round(150*(100-percentHi)/100),15,"white",false);
		}
		else
		{
			g_MaxImps = Number(g_maxImps);
			percentLo = Number(percentLo);
			percentHi = Number(percentHi);
			box1 = drawBoxedBar(g_maxImps + percentLo,g_maxImps + percentLo,Math.round(150*(g_maxImps + percentLo)/(2*g_maxImps)),15,"white",true);
			box2 = drawBoxedBar(percentHi-percentLo,percentHi-percentLo,Math.round(150*(percentHi-percentLo)/(2*g_maxImps)),15,"#dddddd",false);
			box3 = drawBoxedBar(g_maxImps-percentHi,g_maxImps-percentHi,Math.round(150*(g_maxImps-percentHi)/(2*g_maxImps)),15,"white",false);
		}

		cells[5].style.minWidth = "300px";
		cells[5].style.width = "300px";
		cells[5].innerHTML = box1+box2+box3;
	}

	return result;
}

function displayTraveller(pdirection)
{
	var table = document.getElementById("travellerTable");
	var rows = table.rows;
	var nrows = rows.length;
	var i;
	var sign = 1;
	var dirstr = "NS";

	window.scroll(0,0);

	if (g_scoring=="IMP")
	{
		if (g_eventType!="Teams")
			rows[0].cells[5].textContent = "Punkte";
		else
			rows[0].cells[5].textContent = "Cross Imps";
	}

	if (pdirection==2)
	{
		sign = -1;
		dirstr = "OW";
	}

	for (i=2;i<nrows;i++)
	{
		table.deleteRow(-1);
	}

	var lines = g_currentTraveller.traveller_line;

	var optimum = g_hands.boards[g_lastBindex].OptimumScore;
	var optscore = "";
	var optcontract = "";

	if ((typeof optimum)!="undefined")
	{
		optimum = optimum.split(";");
		optscore = optimum[1];
		optcontracts = optimum[0].split(",");

		var k;

		for (k=0;k<optcontracts.length;k++)
		{
			var optcontract = optcontracts[k];
			optcontract = optcontract.split(" ");
			var contract = optcontract[1];

			if (contract.indexOf("+")!=-1)	// remove overtricks
			{
				contract = contract.substring(0,2);
			}

			if (contract.indexOf("N")!=-1) contract=contract.replace("N","NT");

			contract = contract.replace("x","*");

			var optdir = optcontract[0];

			var ctricks = getMakeableTricksForContract(g_lastBindex,contract,optdir.charAt(0));

			var line = {};
			line.ns_pair_number = "";
			line.ew_pair_number = "";
			line.contract = contract;
			line.played_by = optdir;
			line.tricks = ctricks;
			line.lead = "";
			line.score = optscore.replace("+","");

			lines[lines.length] = line;
		}
	}

	sortTravellerLines(lines,pdirection);

	var j = 0;

	for (j=0;j<rows[0].cells.length;j++)
		rows[0].cells[j].style.padding = "4px";

	var beige = "#ffffdd";
	var backColor = beige;

	var red = "#ff5555";
	var green = "#55ff55";

	var maxover = 3;	// Maximum number of over/under tricks on this traveller (initially assume 3)

	var validBoard = checkBoardValid(g_lastBindex);

	for (i=0;i<lines.length;i++)
	{
		var tline = lines[i];
		var overtricks = 0;

		if (validBoard&&validContract(tline.contract))
			overtricks = Math.abs(tline.tricks - (6 + (Number(tline.contract.charAt(0)))));

		if (validBoard&&((typeof g_hands.boards[g_lastBindex].DoubleDummyTricks)!="undefined"))
		{
			if (validContract(tline.contract))
			{
				var ddovertricks = Math.abs(tline.tricks - getMakeableTricksForContract(g_lastBindex,tline.contract,tline.played_by));
				if (ddovertricks > maxover) maxover = ddovertricks;
			}
		}
	}

	for (i=0;i<lines.length;i++)
	{
		var tline = lines[i];

		if (played(tline))
		{
			table.insertRow(-1);
			var row = rows[rows.length-1];

			var m;

			for (m=0;m<14;m++)
				row.insertCell(-1);

			row.cells[0].innerHTML = tline.ns_pair_number;
			row.cells[0].onclick = row.cells[0].onmouseover = function(){showNames(this,1);};
			row.cells[0].onmouseout = function(){
					var popup = document.getElementById("popup_box");
					popup.textContent = "";
					popup.style.display="none";
					$("#popup_box").finish();
				}
			row.cells[0].style.textAlign="right";
			row.cells[0].className = "myLink";

			if ((sign==1)&&(tline.ns_pair_number==g_hands.pair_number))
				row.cells[0].style.backgroundColor = "#bbbbff";

			row.cells[1].innerHTML = tline.ew_pair_number;
			row.cells[1].onclick = row.cells[1].onmouseover = function(){showNames(this,2);};
			row.cells[1].onmouseout = function(){
					var popup = document.getElementById("popup_box");
					popup.textContent = "";
					popup.style.display="none";
					$("#popup_box").finish();
				}
			row.cells[1].style.textAlign="right";
			row.cells[1].className = "myLink";

			if ((sign==-1)&&(tline.ew_pair_number==g_hands.pair_number))
				row.cells[1].style.backgroundColor = "#bbbbff";

			if (validContract(tline.contract))
			{
				row.cells[2].innerHTML = tline.contract.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
			}
			else
			{
				if (passed(tline))
					row.cells[2].textContent = "Passed";
				else
					row.cells[2].textContent = "N/A";
			}

			if (i!=0)
			{
				if (row.cells[2].innerHTML!=rows[i+1].cells[2].innerHTML)
					if (backColor == beige)
						backColor = "#eeeeee";
					else
						backColor = beige;
			}

			if (validContract(tline.contract))
			{
				row.cells[3].innerHTML = tline.played_by;
				row.cells[4].innerHTML = leadCard(tline.lead.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;"));
				row.cells[5].innerHTML = tline.tricks;
				row.cells[5].style.textAlign="right";

				var overtricks = tline.tricks - (6 + (Number(tline.contract.charAt(0))));

				var overtstr = overtricks;

				if (overtricks==0) overtstr = "=";
				else if (overtricks>0) overtstr = "+" + overtricks;

				row.cells[6].innerHTML = overtstr;
				row.cells[6].style.textAlign="right";

				var colorplus  = green;
				var colorminus = red;

				if ((sign == 1)&&((tline.played_by=="W")||(tline.played_by=="E")))
				{
					colorplus = red;
					colorminus = green;
				}
				else if ((sign == -1)&&((tline.played_by=="N")||(tline.played_by=="S")))
				{
					colorplus = red;
					colorminus = green;
				}

				if (validBoard&&((typeof g_hands.boards[g_lastBindex].DoubleDummyTricks)!="undefined"))
				{
					row.cells[7].innerHTML = getMakeableTricksForContract(g_lastBindex,tline.contract,tline.played_by);
					row.cells[7].style.textAlign="right";

					var relDDLead = "";

					if (tline.lead!="")
					{
						if ((typeof g_hands.boards[g_lastBindex].openingLeads)!="undefined")
						{
							var idx = getLeadsIdx(tline.contract,tline.played_by);
							var leads = g_hands.boards[g_lastBindex].openingLeads[idx];

							var ltricks;

							var validLeadCard = false;

							for (j=0;j<leads.length;j++)
							{
								var cl = leads[j];


								if (cl[0].replace("T","10")==leadCard(tline.lead))


								{
									validLeadCard = true;
									var score = Number(cl[1]);

									if ((13-score)!=getMakeableTricksForContract(g_lastBindex,tline.contract,tline.played_by))
									{
										row.cells[7].innerHTML = (13-score) + "(" + getMakeableTricksForContract(g_lastBindex,tline.contract,tline.played_by) + ")";
										row.cells[4].style.backgroundColor = colorplus;
										relDDLead = tline.tricks - (13-score);
										if (relDDLead==0) relDDLead = "=";
										else if (relDDLead>0) relDDLead = "+" + relDDLead;
										break;
									}
								}
							}

							//if (!validLeadCard) row.cells[4].style.backgroundColor = "#888888";
						}
					}

					var relDD = tline.tricks - getMakeableTricksForContract(g_lastBindex,tline.contract,tline.played_by);

					var relDDStr = "" + relDD;

					if (relDD==0) relDDStr = "=";
					else if (relDD>0) relDDStr = "+" + relDDStr;

					if (relDDLead!="") relDDStr = relDDLead + "(" + relDDStr + ")";

					row.cells[8].innerHTML = relDDStr;
					row.cells[8].style.textAlign="right";

					var ddoverplus,ddoverminus;

					if (relDD>0)
					{
						ddoverplus = relDD;
						ddoverminus = 0;
					}
					else if (relDD<0)
					{
						ddoverminus = -relDD;
						ddoverplus = 0;
					}
					else
					{
						ddoverplus = ddoverminus = 0;
					}

					var width = Math.round((ddoverminus*13)/maxover);
					width = width + "px";
					var pbar = "<div style=\"float:left;align:left;width:13px;min-width;13px;max-width:13px;height:16px;border:none;background-color:" + backColor + ";\"><div style=\"float:right;position:absolute:top:0px;right:80px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width;
					pbar = pbar + ";background-color:" + colorminus + ";\"></div></div>";

					var width = Math.round((ddoverplus*13)/maxover);
					width = width + "px";
					var pbar2 = "<div style=\"float:left;width:13px;min-width;13px;max-width:13px;height:16px;border:none;border-left:0px;background-color:" + backColor + ";\"><div style=\"float:left;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width;
					pbar2 = pbar2 + ";background-color:" + colorplus + ";\"></div></div>";

					row.cells[9].style.minWidth = "30px";
					row.cells[9].innerHTML = pbar+pbar2;
				}
			}

			row.cells[10].innerHTML = tline.score;
			row.cells[10].style.textAlign="right";

			if (tline.ns_pair_number!="")
			{
				var percentNS,percentEW;

				if (g_scoring!="IMP")
				{
					percentNS = calcPercentage(tline,1);
					percentEW = 100 - percentNS;
				}
				else
				{
					if (g_eventType!="Teams")
					{
						if (tline.ns_match_points>0)
						{
							percentNS = 100*(tline.ns_match_points/g_maxImps);
							percentEW = 0;
						}
						else
						{
							percentNS = 0;
							percentEW = 100*(tline.ew_match_points/g_maxImps);
						}
					}
					else	// It's a Teams event, so show calculated cross Imp scores
					{
						percentNS = 100*(tline.crossImpsNS/g_maxImps);
						percentEW = 100*(tline.crossImpsEW/g_maxImps);
					}
				}

				if (g_scoring!="IMP") row.cells[11].innerHTML = percentNS + "%";
				else if (g_eventType!="Teams")
					row.cells[11].innerHTML = tline.ns_match_points;
				else
				{
					row.cells[11].innerHTML = tline.crossImpsNS;
				}

				row.cells[11].style.textAlign="right";

				var colorNS  = green;
				var colorEW = red;

				if (sign == -1)
				{
					colorNS = red;
					colorEW = green;
				}

				var width = Math.round((percentNS*50)/100);
				width = width + "px";
				var pbar = "<div style=\"float:left;align:left;width:50px;min-width;50px;max-width:50px;height:16px;border:none;background-color:" + backColor + ";\"><div style=\"float:right;position:absolute:top:0px;right:80px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width;
				pbar = pbar + ";background-color:" + colorNS + ";\"></div></div>";

				var width = Math.round((percentEW*50)/100);
				width = width + "px";
				var pbar2 = "<div style=\"float:left;width:50px;min-width;50px;max-width:50px;height:16px;border:none;border-left:0px;background-color:" + backColor + ";\"><div style=\"float:left;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width;
				pbar2 = pbar2 + ";background-color:" + colorEW + ";\"></div></div>";

				row.cells[12].style.minWidth = "104px";
				row.cells[12].innerHTML = pbar+pbar2;

				if (g_scoring!="IMP") row.cells[13].innerHTML = percentEW + "%";
				else if (g_eventType!="Teams")
					row.cells[13].innerHTML = tline.ew_match_points;
				else
				{
					row.cells[13].innerHTML = (tline.crossImpsEW);
				}

				row.cells[13].style.textAlign="right";
			}
			else
			{
				row.cells[11].colSpan=3;
				row.cells[11].style.textAlign = "center";
				switch(language)
				{
					case "de":
						row.cells[11].textContent = "--- Optimaler Kontrakt ---";
						break;
					default:
						row.cells[11].textContent = "--- Optimum Contract ---";
				}
				row.deleteCell(13);
				row.deleteCell(12);
			}

			row.style.backgroundColor = backColor;

			for (j=0;j<row.cells.length;j++)
			{
				row.cells[j].style.padding = "4px";

				if (row.cells[0].innerHTML=="")
				{
					row.cells[j].style.borderTop = row.cells[j].style.borderBottom = "1px solid black";
				}
			}
		}
	}

	for (i=lines.length-1;i>=0;i--)
	{
		tline = lines[i];

		if (tline.ns_pair_number=="")
		{
			lines.remove(i);	// Utilising locally defined Array.remove function
		}
	}

	computeTravellerStatistics(pdirection);

	drawMiniHand();
}

function initTravRow(dir)
{
	if (g_travellers!=null)
	{
		g_currentTraveller = getTravellerForBoard(g_lastBindex);
		changeCurrentPair(g_hands.pair_number,g_hands.direction);

		if (g_currentTraveller.traveller_line.length>1)
		{
			if (dir==1)
			{
				if (g_currow<g_currentTraveller.traveller_line.length-1)
					g_currow++;
				else
					g_currow = 0;
			}
			else
			{
				if (g_currentTraveller.traveller_line.length>1)
				{
					if (g_currow>0)
						g_currow--;
					else
						g_currow = g_currentTraveller.traveller_line.length-1;
				}
			}
		}

		terminateSession();
		setupTraveller(g_lastBindex,true);
		enterPlayMode();
	}
}

function initPrevTravRow()
{
	initTravRow(0);
}

function prevTravRow()
{
	if (g_currentTraveller!=null)
	{
		if (g_currentTraveller.traveller_line.length>1)
		{
			if (g_currow>0)
				g_currow--;
			else
				g_currow = g_currentTraveller.traveller_line.length-1;
		}
	}
	else
	{
		getHands({callback:initPrevTravRow});
		return;
	}

	terminateSession();
	setupTraveller(g_lastBindex,true);
	enterPlayMode();
}

function initNextTravRow()
{
	initTravRow(1);
}

function nextTravRow()
{
	if (g_currentTraveller!=null)
	{
		if (g_currentTraveller.traveller_line.length>1)
		{
			if (g_currow<g_currentTraveller.traveller_line.length-1)
				g_currow++;
			else
				g_currow = 0;
		}
	}
	else
	{
		getHands({callback:initNextTravRow});
		return;
	}

	terminateSession();
	setupTraveller(g_lastBindex,true);
	enterPlayMode();
}

function gotoTraveller(name)
{
	terminateSession();
	setupTraveller(getTindexByName(g_hands.boards,name),true);
	enterPlayMode();
	$("#scoreandtraveller").show();
	$("#mainTitle").show();
	$("#allBoards").hide();
	$("#popup_box").hide();
}

function gotoPrevTraveller()
{
	var bindex = getNextOrPrevBindex(false);
	gotoTravellerByIndex(bindex);
}

function gotoNextTraveller()
{
	var bindex = getNextOrPrevBindex(true);
	gotoTravellerByIndex(bindex);
}

function getNextOrPrevBindex(forward)
{
	var tindex = g_lastBindex;

	if (forward)
		{if (tindex<g_hands.boards.length-1) tindex++; else tindex = 0;}
	else
		{if (tindex>0) tindex--; else tindex = g_hands.boards.length-1;}

	return tindex;
}

function gotoTravellerByIndex(index)
{
	var saveHandEntryMode = g_handEntryMode;

	terminateSession();
	setupTraveller(index,true);
	enterPlayMode();
	$("#scoreandtraveller").show();
	$("#mainTitle").show();
	$("#allBoards").hide();
	$("#popup_box").hide();

	if (saveHandEntryMode!=0) edit();
}

function checkContract(bindex,trindex)
{
	var decl="NESW";
	var suits = "NSHDC";
	var result = {};
	result.valid = true;
	result.leadDeclError = false;
	result.possibleWrongPolarity = false;
	result.shortSuit = false;
	result.possibleSuitDeclError = false;

	if (!checkBoardValid(bindex))	// No Hand Record for this board
		return result;

	if (g_travellers==null) return result;	// No travellers, only hands records for this event.

	var traveller = getTravellerForBoard(bindex);

	if (traveller==null) return result;

	var line = traveller.traveller_line[trindex];

	if (validContract(line.contract))
	{
		var dcl = decl.indexOf(line.played_by);
		var partner = dcl + 2;
		partner = partner % 4;
		var leader = dcl + 1;
		if (leader>3) leader = 0;

		var declSuit = suits.indexOf(line.contract.charAt(1));
		result.declSuit = declSuit;

		if (declSuit>0)		// i.e. Not a NoTrump contract, so check combined trump suit length
		{
			var hand = g_hands.boards[bindex].Deal[dcl];
			hand = hand.split(".");
			var tks = hand[declSuit-1].length;
			var maxSuitLength = tks;

			hand = g_hands.boards[bindex].Deal[partner];
			hand = hand.split(".");

			if (hand[declSuit-1].length>maxSuitLength)
				maxSuitLength = hand[declSuit-1].length;

			var tks = tks + hand[declSuit-1].length;

			if ((tks<7)&&(maxSuitLength<5))
			{
				result.valid = false;
				result.shortSuit = true;
				result.combinedSuitLength = tks;
			}
		}

		if (line.tricks>=7)	// They made a contract in this suit, is it likely ?
		{
			var oppIndx1 = (dcl+1)%4;
			var oppIndx2 = (dcl+3)%4;

			var oppTks1 = getMakeableTricksForContract(bindex,line.contract,decl.charAt(oppIndx1));
			var oppTks2 = getMakeableTricksForContract(bindex,line.contract,decl.charAt(oppIndx2));

			if ((oppTks1>=9)||(oppTks2>=9))
			{
				result.valid = false;
				result.possibleSuitDeclError = true;
			}
		}

		if (line.lead!="")	// check lead card is consistent with declarer
		{
			var curlead = leadCard(line.lead).replace("10","T");

			var suit = curlead.charAt(1);
			var card = curlead.charAt(0);

			hand = g_hands.boards[bindex].Deal[leader];

			hand = hand.split(".");

			if (hand[suits.indexOf(suit)-1].indexOf(card)==-1)
			{
				var reason = "";
				var partner = leader + 2;
				partner = partner % 4;
				hand = g_hands.boards[bindex].Deal[partner];

				hand = hand.split(".");

				if (hand[suits.indexOf(suit)-1].indexOf(card)!=-1)
					result.possibleWrongPolarity = true;

				result.valid = false;
				result.leadDeclError = true;
				return result;
			}
			else
				return result;
		}
		else
			return result;
	}
	else
		return result;
}

function setFieldsFromTravellerLine(bindex,tline)
{
	g_hands.boards[bindex].Contract = tline.contract;
	g_hands.boards[bindex].Declarer = tline.played_by;
	g_hands.boards[bindex].PlayerNames = [];
	g_hands.boards[bindex].Played = [];
	g_hands.boards[bindex].Played[0] = tline.lead;
	g_hands.boards[bindex].Bids = [];
}

function setHandRecordFromLin(bindex,tline)
{
	var curBoard;
	var lin;

	if ((typeof tline.board)!="undefined")
	{
		curBoard = g_hands.boards[bindex];
		var board = tline.board;

		curBoard.PlayerNames = board.PlayerNames;
		curBoard.Dealer = board.Dealer;
		curBoard.Vulnerable = board.Vulnerable;
		curBoard.Deal = board.Deal;
		curBoard.Bids = board.Bids;
		curBoard.Played = board.Played;
		curBoard.Claimed = board.Claimed;
		curBoard.Score = board.Score;
		curBoard.Contract = board.Contract;
		curBoard.Declarer = board.Declarer;

		if (board.Played.length>0)
			curBoard.lead = board.Played[0];

		return curBoard;
	}
	else
	{
		setFieldsFromTravellerLine(bindex,tline);
		return g_hands.boards[bindex];
	}
}

function showComparison()
{
	g_sessionMode = "traveller";
	setButtonColor();

		// Display the information extracted from the traveller for the current board
	var i;

	setCurrentTraveller();

	if (g_currentTraveller!=null)
	{
		if (((typeof g_hands.boards[g_lastBindex].openingLeads)=="undefined")&&!g_backgroundFetchCompleted)
		{
			if ((typeof g_hands.boards[g_lastBindex].Deal)!="undefined")
			{
				var leadstr = getRequestedLeads(g_lastBindex);

				calculateMakeableContracts(loadTraveller_2,leadstr,g_lastBindex);
			}
			else	// No Hand Data available
			{
				this.bindex = g_lastBindex;
				loadTraveller_2("","","");
			}
		}
		else
		{
			this.bindex = g_lastBindex;
			loadTraveller_2("","","");
		}
	}
	else
	{
		hideAllPopups();
		$("#scoreandtraveller").hide();
		hideRanking();
		$("#scores").hide();
		$("#abuttons").show();

		displayErrorAbsPosition("Kein Boardzettel verfügbar",300,250);
	}
}

function showCurrentBoard()
{
	log("button=PlayItAgain");

	g_playItAgain = true;

	if ((typeof g_hands.boards[g_lastBindex].Deal)!="undefined")
	{
		hideRanking();
		$("#scores").hide();
		$("#comparison").hide();
		$("#checkListDiv").hide();
		$("#abuttons").hide();
		$("#scoreandtraveller").show();
		$("#mainTitle").show();
		g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);
		setupTraveller(g_lastBindex,true);
		enterPlayMode();
	}
	else
		displayErrorAbsPosition("Es gibt kein Handdiagramm für dieses Board",300,200);
}

function loadTraveller_2(data,statusText,jqXHR)
{
	if (data!="") dddLoadMakeable(data,statusText,jqXHR,this.bindex);

	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);
	var player1 = info.player1;
	var player2 = info.player2;

	var pdirection = 1; // Assume played this board as NS (for singlewinner movement can switch direction

	var pairs = g_travellers.event.participants.pair;
	var declarer_pair = false;

	var tlines = g_currentTraveller.traveller_line;

	var i;

	var found = false;

	for (i=0;i<tlines.length;i++)
	{
		var tline = tlines[i];

		if (played(tline))
		{
			if (info.pair_found)
			{
				var prole,found,pdirection,declarer_pair,first,opp_pair;

				prole = getPlayerAndRole(info,tline);
				found = prole.found;
				pdirection = prole.tdirection;
				declarer_pair = prole.declarer_pair;
				first = prole.first;
				opp_pair = prole.opp_pair;

				if (found)
				{
					switch(language)
					{
						case "de":
							if (declarer_pair)
							{
								if (first) declarer_name = info.player1;
								else declarer_name = info.player2;
							}

							var subHeading = document.getElementById("compSubHeading");
							var hstr = "";

							hstr = "Board " +  g_currentTraveller.board_no;

							var dirstr = "NS";

							if (pdirection==2) dirstr = "EW";

							if (info.singleWinner)
								hstr = hstr + ", Vergleich für Paar " + g_hands.pair_number + " auf " + dirstr;
							else
								hstr = hstr + ", Vergleich für " + dirstr + " Paar " + g_hands.pair_number;

							hstr = hstr + " (" + player1 + " und " + player2 + ")";

							subHeading.innerHTML = "<span style=\"font-size:12px;\">" + hstr + "</span>";

							g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);

							if (g_currow==-1) continue;	// Didn't play on this traveller

							var tline = g_currentTraveller.traveller_line[g_currow];

							var str;

							if (!validContract(g_hands.boards[g_lastBindex].Contract))
							{
								if (tline.contract=="Passed")
									str = "Board wurde durchgepasst.";
								else if (tline.contract=="NP")
									str = "Board wurde nicht gespielt.";
								else
									str = "Kein Kontrakt vorhanden.";
							}
							else
							{
								str = "Kontrakt war " + g_hands.boards[g_lastBindex].Contract + " von " + g_hands.boards[g_lastBindex].Declarer + " ";

								if (declarer_pair)
									str = str + "(" + declarer_name + ")";
								else
								{
									str = str + "(gegen " + player1.split(" ")[0] + " und " + player2.split(" ")[0] + ")";
								}

								var contractLevel = Number(g_hands.boards[g_lastBindex].Contract.charAt(0));
								var overtricks = tline.tricks - (contractLevel + 6);

								str = str + " mit " + tline.tricks + " Stichen";

								if (overtricks>0)
									str = str + " (" + overtricks + " Überstiche)";
								else if (overtricks<0)
									str = str + " (" + (-overtricks) + " Faller)";
							}

							var nspts = Number(tline.ns_match_points);
							var ewpts = Number(tline.ew_match_points);

							if (g_scoring!="IMP")
							{
								var percent = 100*(nspts/(nspts + ewpts));

								if (pdirection==2) percent = 100 - percent;

								percent = parseFloat(Math.round(percent * 100) / 100).toFixed(0);
								var pbar = document.getElementById("pbar");
								var width = Math.round((percent*150)/100);
								width = width + "px";
								pbar.style.width = width;
								pbar.style.minWidth = width;
								pbar.style.MaxWidth = width;
								pbar.style.backgroundColor = "#55ff55";	// green

								document.getElementById("percentValue").innerHTML = percent + "%";
								$("#percentValue").show();
								$("#ourPercentage").show();
							}
							else
							{
								$("#percentValue").hide();
								$("#ourPercentage").hide();
							}

							if (validContract(g_hands.boards[g_lastBindex].Contract))
							{
								if (((typeof g_hands.boards[g_lastBindex].DoubleDummyTricks)!="undefined")&&checkBoardValid(g_lastBindex))
								{
									var ntricks2 = getMakeableTricksForContract(g_lastBindex,g_hands.boards[g_lastBindex].Contract,g_hands.boards[g_lastBindex].Declarer);

									if (tline.tricks==ntricks2)
										str = str + ", die gleiche Zahl wie von der Double Dummy Analyse vorhergesagt."
									else if (tline.tricks<ntricks2)
									{
										var shortfall = ntricks2 - tline.tricks;
										str = str + ", " + shortfall + " weniger als von der Double Dummy Analyse vorhergesagt.";
									}
									else
									{
										var excess = tline.tricks - ntricks2;
										str = str + ", " + excess + " mehr als von der Double Dummy Analyse vorhergesagt.";
									}

								}
							}

							var ourscore = tline.score;
							var res = compareScores(g_travellers.event.board[getTravIndex(g_lastBindex)].traveller_line,ourscore,pdirection);

							if (res.adjusted>0)	// We received a percentage instead of score (don't say anything.
							{
							}
							else if ((res.lower==0)&&(res.higher==0)) str = str + " Das war ein ganz flaches Board.";
							else if (res.higher==0)
							{
								if (res.same==0) str = str + " Das war einsamer Top.";
								else str = str + " Das war ein geteilter Top mit " + res.same + " anderen Paaren.";
							}
							else if (res.lower==0)
							{
								if (res.same==0) str = str + " Das war ein einsamer Nuller."
								else str = str + " Das war ein geteilter Nuller mit " + res.same + " anderen Paaren.";
							}
							else
								str = str + " Es gab " + res.higher + " bessere und " + res.lower + " schlechtere Paare in diesem Board."

							var ns = "NS";
							var ew = "EW";
							var str2 = "";

								// Temporarily disable this output.
		/*
							if (((pdirection==1)&&(ns.indexOf(g_hands.boards[g_lastBindex].Declarer)!=-1))|
								((pdirection==2)&&(ew.indexOf(g_hands.boards[g_lastBindex].Declarer)!=-1)))
							{
									// we were declarer
								// *** need to change this line if used: checkHigherScoringPairs(g_currentTraveller.traveller_line,g_currow,pdirection);

							}*/

							document.getElementById("comparisonText").innerHTML = "<span style=\"font-size:12px;\">" + str + str2 + "</span>";

			//				getInfoForSimilarContracts(g_currow,g_hands.direction);
							break;
						default:
							if (declarer_pair)
							{
								if (first) declarer_name = info.player1;
								else declarer_name = info.player2;
							}

							var subHeading = document.getElementById("compSubHeading");
							var hstr = "";

							hstr = "Board " +  g_currentTraveller.board_no;

							var dirstr = "NS";

							if (pdirection==2) dirstr = "EW";

							if (info.singleWinner)
								hstr = hstr + ", comparison for pair " + g_hands.pair_number + " playing " + dirstr;
							else
								hstr = hstr + ", comparison for " + dirstr + " pair " + g_hands.pair_number;

							hstr = hstr + " (" + player1 + " and " + player2 + ")";

							subHeading.innerHTML = "<span style=\"font-size:12px;\">" + hstr + "</span>";

							g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);

							if (g_currow==-1) continue;	// Didn't play on this traveller

							var tline = g_currentTraveller.traveller_line[g_currow];

							var str;

							if (!validContract(g_hands.boards[g_lastBindex].Contract))
							{
								if (tline.contract=="Passed")
									str = "Board was passed out.";
								else if (tline.contract=="NP")
									str = "Board was not played.";
								else
									str = "Contract not available.";
							}
							else
							{
								str = "Contract was " + g_hands.boards[g_lastBindex].Contract + " by " + g_hands.boards[g_lastBindex].Declarer + " ";

								if (declarer_pair)
									str = str + "(" + declarer_name + ")";
								else
								{
									str = str + "(defended by " + player1.split(" ")[0] + " and " + player2.split(" ")[0] + ")";
								}

								var contractLevel = Number(g_hands.boards[g_lastBindex].Contract.charAt(0));
								var overtricks = tline.tricks - (contractLevel + 6);

								str = str + " making " + tline.tricks + " tricks";

								if (overtricks>0)
									str = str + " (" + overtricks + " overtricks)";
								else if (overtricks<0)
									str = str + " (" + (-overtricks) + " off)";
							}

							var nspts = Number(tline.ns_match_points);
							var ewpts = Number(tline.ew_match_points);

							if (g_scoring!="IMP")
							{
								var percent = 100*(nspts/(nspts + ewpts));

								if (pdirection==2) percent = 100 - percent;

								percent = parseFloat(Math.round(percent * 100) / 100).toFixed(0);
								var pbar = document.getElementById("pbar");
								var width = Math.round((percent*150)/100);
								width = width + "px";
								pbar.style.width = width;
								pbar.style.minWidth = width;
								pbar.style.MaxWidth = width;
								pbar.style.backgroundColor = "#55ff55";	// green

								document.getElementById("percentValue").innerHTML = percent + "%";
								$("#percentValue").show();
								$("#ourPercentage").show();
							}
							else
							{
								$("#percentValue").hide();
								$("#ourPercentage").hide();
							}

							if (validContract(g_hands.boards[g_lastBindex].Contract))
							{
								if (((typeof g_hands.boards[g_lastBindex].DoubleDummyTricks)!="undefined")&&checkBoardValid(g_lastBindex))
								{
									var ntricks2 = getMakeableTricksForContract(g_lastBindex,g_hands.boards[g_lastBindex].Contract,g_hands.boards[g_lastBindex].Declarer);

									if (tline.tricks==ntricks2)
										str = str + ", the same number predicted by double dummy analysis."
									else if (tline.tricks<ntricks2)
									{
										var shortfall = ntricks2 - tline.tricks;
										str = str + ", " + shortfall + " fewer than predicted by double dummy analysis.";
									}
									else
									{
										var excess = tline.tricks - ntricks2;
										str = str + ", " + excess + " more than predicted by double dummy analysis.";
									}

								}
							}

							var ourscore = tline.score;
							var res = compareScores(g_travellers.event.board[getTravIndex(g_lastBindex)].traveller_line,ourscore,pdirection);

							if (res.adjusted>0)	// We received a percentage instead of score (don't say anything.
							{
							}
							else if ((res.lower==0)&&(res.higher==0)) str = str + " This was a completely flat board.";
							else if (res.higher==0)
							{
								if (res.same==0) str = str + " This was an outright top score.";
								else str = str + " This was a joint top with " + res.same + " other pairs.";
							}
							else if (res.lower==0)
							{
								if (res.same==0) str = str + " This was an outright bottom score."
								else str = str + " This was a joint bottom with " + res.same + " other pairs.";
							}
							else
								str = str + " There were " + res.higher + " higher scoring and " + res.lower + " lower scoring pairs on this board."

							var ns = "NS";
							var ew = "EW";
							var str2 = "";

								// Temporarily disable this output.
		/*
							if (((pdirection==1)&&(ns.indexOf(g_hands.boards[g_lastBindex].Declarer)!=-1))|
								((pdirection==2)&&(ew.indexOf(g_hands.boards[g_lastBindex].Declarer)!=-1)))
							{
									// we were declarer
								// *** need to change this line if used: checkHigherScoringPairs(g_currentTraveller.traveller_line,g_currow,pdirection);

							}*/

							document.getElementById("comparisonText").innerHTML = "<span style=\"font-size:12px;\">" + str + str2 + "</span>";

			//				getInfoForSimilarContracts(g_currow,g_hands.direction);

					}
					break;
				}
			}
		}
	}

	if (!found)
	{
		var str = "The currently selected pair (" + player1 + " & " + player2 + ") did not play this board.";
		str = str + " Colour coding of table below is from point of view of NS pairs."
		document.getElementById("compSubHeading").innerHTML = str;
		document.getElementById("percentValue").textContent = "";
		$("#ourPercentage").hide();
		$("#comparisonText").hide();
	}
	else
	{
		if (g_scoring!="IMP")
			$("#ourPercentage").show();
		else
			$("#ourPercentage").hide();

		$("#comparisonText").show();
	}

	displayTraveller(pdirection);

	hideSpinner();
	hideAllPopups();
	$("#scoreandtraveller").hide();
	hideRanking();
	$("#scores").hide();
	$("#comparison").show();
	$("#checkListDiv").hide();
	$("#abuttons").show();
}

function loadTraveller_1(data,statusText,jqXHR,context)
{
/*	var players = new Array();*/

	hideSpinner();
	resetTimeout();

/*	if (g_hands.lin!=="")
	{
		try {
			var tmp = JSON.parse(linToJson(g_hands.lin));
			var bd = tmp.boards[0];
			if ((typeof bd.PlayerNames)!=="undefined")
			{
				for (var i=0;i<4;i++)
					players[i] = bd.PlayerNames[i];
			}
		} catch (e) {};
	}*/

	if (data!="")
	{
		if (g_travellers==null)
		{
			if (g_xml!="")
			{
				if (g_debug)
					alert(data);

				data = convertXML(data);	// convert it to json

				if (g_debug)
					alert(JSON.stringify(data));
			}

			g_travellers = JSON.parse(data);

			if ((typeof g_travellers.event.participants.pair)!="undefined")
			{
				var i;

				var pairs = g_travellers.event.participants.pair;

					// Standardise representation of direction.
				for (i=0;i<pairs.length;i++)
				{
					if (pairs[i].direction=="NS") pairs[i].direction="N";
					else if (pairs[i].direction=="EW") pairs[i].direction="E";
				}
			}

			getSessionInfo();	// Set up details of session.

			if (g_eventType=="Teams")
			{
				calculateCrossImps();
				calculateMaxImps();
				g_rankInfo = null;
				getRankingInfo();
			}
		}

		var i;

		for (i=0;i<g_travellers.event.participants.pair.length;i++)
		{
			var data = g_travellers.event.participants.pair[i];
		}

		for (var i=0;i<g_travellers.event.board.length;i++)
		{
			var tlines = g_travellers.event.board[i].traveller_line;

			for (var j=0;j<tlines.length;j++)
			{
				if ((typeof tlines[j].lindata)!="undefined")
				{
					if (typeof tlines[j].board=='undefined')	// If fetched from cache it may have been converted already
					{
						try {
							var lind = decodeURIComponent(tlines[j].lindata.replace(/\\'/g,"'"));
							var tmp = eval("(" + linToJson(lind) + ")");
							tlines[j].board = tmp.boards[0];

/*							if ((typeof tmp.boards[0].PlayerNames)!=="undefined")
							{
								try {
									if ((players.length>0)&&(players.length==tmp.boards[0].PlayerNames.length))
									{
										var found = true;

										for (var k=0;k<players.length;k++)
											if (players[k]!==tmp.boards[0].PlayerNames[k]) found = false;
									}

									if (found)
									{
										alert("found it: " + j);
										g_currow = j;
									}
								} catch (e) {};
							}*/
						} catch (e) {
							tlines[j].lindata = "";
						};
					}
				}
			}
		}

		setDefaultContracts();
	}

	context.callback(context);
}

function loadTraveller(data,statusText,jqXHR)
{
	try {
		localStorage.removeItem("bwjson");
		localStorage.setItem("bwtime","" + Date.now());
	} catch (e) {clearTravellersLocalStorage();};

	saveEventLocalStorage(data);
	loadTraveller_1(data,statusText,jqXHR,this);
}

function travellersNotFound(jqXHR,textStatus,errorThrown)
{
		// Travellers not found
	clearTravellersLocalStorage();
	hideSpinner();
	resetTimeout();
	this.callback();
}

function getTraveller(context)
{
			// Get the traveller data
		var turl = "";
		var data = "";

		if (g_test==1)
			turl = "data/" + g_hands.club + "_" + g_hands.event + ".json";
		else if ((g_xml!="")&&(g_xml!==1))
		{
			turl = g_xml;
		}

		if (g_travellers==null)
		{
			if (g_xml!==1) // xml string not supplied as parameter
			{
				if (data=="")
				{
					largeSpinner();
					doRequestHTMLasync(turl,loadTraveller,travellersNotFound,context);
				}
				else
				{
					loadTraveller_1(data,"","",context);
				}
			}
			else
			{
				loadTraveller_1(g_xmlstr,"","",context);
			}
		}
		else
			loadTraveller_1("","","",context);
}

function showCheckTraveller()
{
	drawMiniHand();
	var cp = document.getElementById("minihand").cloneNode(true);
	cp.removeAttribute("id");
	$(cp).find("*").removeAttr("id");

			// Should delete old cloned node if present
			// Should remove all the ids from the loned node first
	var cboard = document.getElementById("checkBoard");
	while (cboard.firstChild) cboard.removeChild(cboard.firstChild);
	cboard.appendChild(cp);
	$("#checkList").hide();

	var tlines = getTravellerForBoard(g_lastBindex).traveller_line;

	var table = document.getElementById("checkTraveller");
	var rows = table.rows;
	var i;

	for (i=rows.length-1;i>0;i--)
		table.deleteRow(-1);

	for (i=0;i<tlines.length;i++)
	{
		var tline = tlines[i];

		table.insertRow(-1);
		var row = table.rows[table.rows.length-1];

		row.insertCell(-1);
		row.cells[0].innerHTML = tline.ns_pair_number;
		row.insertCell(-1);
		row.cells[1].innerHTML = tline.ew_pair_number;
		row.insertCell(-1);
		row.cells[2].innerHTML = tline.contract.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
		row.insertCell(-1);
		row.cells[3].innerHTML = tline.played_by;
		row.insertCell(-1);
		row.cells[4].innerHTML = tline.lead.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
		row.insertCell(-1);
		row.cells[5].innerHTML = tline.tricks;
	}

	$("#checkTravellerDiv").show();
}

function checkAllContracts()
{
	var suits = "NSHDC";
	var i,j;

	g_sessionMode = "check";
	setButtonColor();

	hideAllPopups();
	hideRanking();
	$("#scoreandtraveller").hide();
	$("#scores").hide();
	$("#comparison").hide();
	$("#abuttons").show();
	$("#checkListDiv").show();
	$("#checkList").show();
	$("#checkTravellerDiv").hide();

	var table = document.getElementById("checkList");
	if (g_checkContracts.length>0) return;

	for (i=0;i<g_hands.boards.length;i++)
	{
		var traveller = getTravellerForBoard(i);

		var lines = traveller.traveller_line;

		for (j=0;j<lines.length;j++)
		{
			var result = checkContract(i,j);

			if (!result.valid)
			{
				var line = lines[j];

				var other = false;
				var k;

				for (k=0;k<lines.length;k++)
				{
					var oppLine = lines[k];

					if (k!=j)
					{
						if (validContract(oppLine.contract))
						{
							var oppSuit = suits.indexOf(oppLine.contract.charAt(1));

							if ((oppSuit==result.declSuit)&&(oppLine.played_by==line.played_by))
							{
								other = true;
								break;
							}
						}
					}
				}

				if (other)
				{
					result.shortSuit = false;
					result.possibleSuitDeclError = false;
				}

				if (result.leadDeclError||result.shortSuit||result.possibleSuitDeclError)
				{
					result.bindex = i;
					result.traveller = traveller;
					result.tindex = j;
					g_checkContracts[g_checkContracts.length] = result;
				}
			}
		}
	}

	var table = document.getElementById("checkList");

	for (i=0;i<g_checkContracts.length;i++)
	{
		table.insertRow(-1);

		var row = table.rows[table.rows.length-1];
		var data = g_checkContracts[i];
		var tline = data.traveller.traveller_line[data.tindex];

		row.insertCell(-1);
		row.cells[0].innerHTML = g_hands.boards[data.bindex].board;
		row.cells[0].onclick = function(){setLastBoardIndex(getTindexByName(g_hands.boards,this.innerHTML));showCheckTraveller();};
		row.cells[0].style.textAlign="right";
		row.cells[0].className = "myLink";
		row.insertCell(-1);
		row.cells[1].innerHTML = tline.ns_pair_number;
		row.insertCell(-1);
		row.cells[2].innerHTML = tline.ew_pair_number;
		row.insertCell(-1);
		row.cells[3].innerHTML = tline.contract.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
		row.insertCell(-1);
		row.cells[4].innerHTML = tline.played_by;
		row.insertCell(-1);
		row.cells[5].innerHTML = tline.lead.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
		row.insertCell(-1);
		row.cells[6].innerHTML = tline.tricks;
		row.insertCell(-1);

		var reason = "";

		switch(language)
		{
			case "de":
				if (data.leadDeclError)
					reason = "Ausspiel oder Alleinspieler stimmt nicht";
				else if (data.shortSuit)
					reason = "Überprüfen Sie die Trumpffarbe (kurze Länge)";
				else if (data.possibleSuitDeclError)
					reason = "Entweder Farbe oder Alleinspieler stimmt nicht";
				break;
			default:
				if (data.leadDeclError)
					reason = "Lead Card or Declarer is incorrect";
				else if (data.shortSuit)
					reason = "Check declarer suit (short length)";
				else if (data.possibleSuitDeclError)
					reason = "Either Suit or Declarer may be incorrect";
		}

		row.cells[7].textContent = reason;
	}
}

function reportBSOLNotSupported()
{
	switch(language)
	{
		case "de":
			document.body.innerHTML = "<div style='background-color:#ffff00;border:1px solid black;padding:5px 5px;width:400px;margin-top:25px;margin-left:25px;'><span style='font-size:18px;'>Dieser Browser unterstützt nicht die Funktionen, die vom Bridge Solver benötigt werden. Bitte versuchen Sie, wenn möglich eine neuere Version des Browsers zu installieren oder versuchen Sie einen anderen Browser.</span></div>";
			break;
		default:
			document.body.innerHTML = "<div style='background-color:#ffff00;border:1px solid black;padding:5px 5px;width:400px;margin-top:25px;margin-left:25px;'><span style='font-size:18px;'>This browser does not support the features required by Bridge Solver. Try upgrading to a more recent version of the browser, if possible, or try a different browser.</span></div>";
	}
}

function setButtonColor()
{
	document.getElementById("ascorecard").style.backgroundColor = "";
	document.getElementById("aranking").style.backgroundColor = "";
	document.getElementById("atraveller").style.backgroundColor = "";
	document.getElementById("acheck").style.backgroundColor = "";

	if (g_sessionMode=="scorecard") document.getElementById("ascorecard").style.backgroundColor = "#BBBB88";
	else if (g_sessionMode=="ranking") document.getElementById("aranking").style.backgroundColor = "#BBBB88";
	else if (g_sessionMode=="traveller") document.getElementById("atraveller").style.backgroundColor = "#BBBB88";
	else if (g_sessionMode=="check") document.getElementById("acheck").style.backgroundColor = "#BBBB88";
}

function showPlayAnalysis(bd)
{
	var ctx = g_scorecardContext[bd];
	var data=checkHigherScoringPairs(ctx.tlines,ctx.row,ctx.direction);
	setupResultReasons(ctx,data);
	var index = getTindexByName(g_hands.boards,bd);
	setupTraveller(index,false);

	if ((typeof g_hands.boards[g_lastBindex].Played)!="undefined")
		if (g_hands.boards[g_lastBindex].Played.length>1)
			playLinContract(true,1);
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function getDirectionForTline(tline,info)
{
}

function setDefaultContracts()
{
	var i,j;
	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);

	for (i=0;i<g_travellers.event.board.length;i++)
	{
		var bindex = getBoardIndex(i);

		if (bindex==null)
		{
			var newindex = g_hands.boards.length;
			g_hands.boards[newindex] = {};
			g_hands.boards[newindex].board = "" + g_travellers.event.board[i].board_no;
		}
	}

	for (j=0;j<g_hands.boards.length;j++)
	{
		var leadstr = getRequestedLeads(j);

		if (leadstr!="") g_hands.boards[j].requestedLeads = leadstr;

		var found = false;

		for (i=0;i<g_travellers.event.board.length;i++)
		{
			if (g_travellers.event.board[i].board_no==g_hands.boards[j].board)
			{
				var tlineData = getTlineForPair(j,info);

				if (tlineData!=null)
				{
					var tline = tlineData.tline;

					if (!setHandRecordFromLin(j,tline))
					{
						g_hands.boards[j].Declarer = tline.played_by;
						g_hands.boards[j].Contract = tline.contract;

						var played = [];
						var lead = leadCard(tline.lead).replace("10","T");

						if (lead.length==2)
							lead = lead.charAt(1) + lead.charAt(0);
						else
							lead = "  ";

						played[0] = lead;
						g_hands.boards[j].Played = played;
						g_hands.boards[j].Bids = [];
					}

					found = true;
					break;
				}
			}
		}

		if (!found)
		{
			delete g_hands.boards[j].Declarer;
			delete g_hands.boards[j].Contract;
		}
	}
}

function needToAnalyse()
{
	for (var i=0;i<g_hands.boards.length;i++)
	{
		if (checkBoardValid(i))
		{
			if (((typeof g_hands.boards[i].DoubleDummyTricks)=="undefined")||(g_hands.boards[g_lastBindex].DoubleDummyTricks == "********************")||(g_hands.boards[g_lastBindex].DoubleDummyTricks == "--------------------"))
				return true;

			if (((typeof g_hands.boards[i].OptimumScore)=="undefined")||(g_hands.boards[i].OptimumScore==""))
				return true;

			if (g_travellers!=null)
			{
				getRequestedLeads(i);
				if (g_travellersHaveLeads)
					return true;
			}
		}
	}
	return false;
}

