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

