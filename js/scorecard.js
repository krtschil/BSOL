function setBars(cells,value,cellindex,range,colorL,colorR,width)
{
		// Graphical indication of percentages
	var halfRange = range/2;
	var plus = ((2*width*(value-halfRange))/range) + "px";
	var minus = ((2*width*(halfRange-value))/range) + "px";;

	if (plus<0) plus = 0;
	if (minus<0) minus = 0;

	var cellWidth = width + "px";

	var pbar = "<div style=\"margin:0px;border:none;position:relative;height:12px;width:100%;min-width:" + width + "px;max-width:100%;background-color:white;\">";

	cells[cellindex+1].style.padding = "0px";
	cells[cellindex+1].style.backgroundColor = "#FFFFFF";
	cells[cellindex+1].innerHTML = pbar +  "<div align=left style=\"position: relative; border:none;bottom: 0; float: left; width: " + minus + ";max-width:" + minus + ";min-width:" + minus + ";height: 12px; background-color: " + colorR + "; margin: 0px;\"></div>" + "</div>";
	cells[cellindex+1].style.borderLeft="1px solid #CCCCCC";
	cells[cellindex+1].style.borderRight="1px solid #CCCCCC";
	cells[cellindex+1].align = "left";

	cells[cellindex+1].align = "right";
	cells[cellindex].style.padding = "0px";
	cells[cellindex].style.backgroundColor = "#FFFFFF";
	cells[cellindex].innerHTML = pbar + "<div align=right style=\"position: relative; border:none;bottom: 0; float: right; width: " + plus + ";max-width:" + plus + ";min-width:" + plus + ";height: 12px; background-color: " + colorL + "; margin: 0px;\"></div>" + "</div>";
	cells[cellindex].style.borderRight="1px solid #CCCCCC";
	cells[cellindex].style.borderLeft="1px solid #CCCCCC";
}

function addSummaryRow(stable,text)
{
	stable.insertRow(-1);
	srow = stable.rows[stable.rows.length-1];
	srow.insertCell(-1);
	srow.insertCell(-1);
	srow.cells[0].style.textAlign = "right";
	srow.cells[0].innerHTML = text;
	return srow;
}

function addSummarySection(stable,playedInRole,sumOfPercent,sumOfCrossImps,crossImpBoards,etfAchieved,etfBoards,etfTotal)
{
	var srow = addSummaryRow(stable,"Boards:");
	srow.cells[1].innerHTML = playedInRole;

	if (g_scoring!="IMP")
	{
		srow = addSummaryRow(stable,"Avg Percentage:");

		if (playedInRole!=0)
		{
			srow.cells[1].innerHTML = parseFloat(Math.round((100*sumOfPercent)/playedInRole) / 100).toFixed(0) + "%";
		}
		else
			srow.cells[1].textContent = "N/A";
	}
	else
	{
		if (g_eventType=="Teams")
			srow = addSummaryRow(stable,"Avg Cross Imps Per Board:");
		else
			srow = addSummaryRow(stable,"Average Per Board");

		if (playedInRole!=0)
		{
			if (crossImpBoards!=0)
				srow.cells[1].innerHTML = parseFloat(Math.round((100*sumOfCrossImps)/crossImpBoards) / 100).toFixed(2);
			else
				srow.cells[1].textContent = "";
		}
		else
			srow.cells[1].textContent = "N/A";
	}

	srow = addSummaryRow(stable,"% of Boards with ETF >=0 :");

	if (etfBoards>0)
	{
		var etfPercent = (Math.round(100*etfAchieved/etfBoards)).toFixed(0);
		srow.cells[1].innerHTML = etfPercent.toString() + "%";
	}
	else
	{
		srow.cells[1].textContent = "No Data";
	}

	srow = addSummaryRow(stable,"Avg ETF:");

	if (etfBoards>0)
	{
		var etfAvg = (Math.round(100*etfTotal/etfBoards)/100).toFixed(2);
		srow.cells[1].innerHTML = etfAvg;
	}
	else
	{
		srow.cells[1].textContent = "No Data";
	}
}

function drawHighLowSame(res)
{
	var dhwidth = (100*res.higher)/(res.higher+res.lower+res.same);
	var dswidth = (100*res.same)/(res.higher+res.lower+res.same);
	var dlwidth = (100*res.lower)/(res.higher+res.lower+res.same);

	var divstart = "<div style='clear:both;border:none;min-width:300px;width:300px;'><div style='clear:both;float:left;border:1px solid black;min-width:100px;width:100px;background-color:white;'><div style='clear:both;height:16px;background-color:grey;width:";
	var divend = "px;'></div></div>";
	var result =  divstart+dhwidth+divend+"<div style='float:left;max-width:190px;'>&nbsp;" + res.higher+" Paare erzielten einen höheren Score"+"</div></div>";
	var result = result + divstart+dswidth+divend+"<div style='float:left;max-width:190px;'>&nbsp;" + res.same+" Paare erzielten denselben Score"+"</div></div>";
	var result = result + divstart+dlwidth+divend+"<div style='float:left;max-width:190px;'>&nbsp;" + res.lower+" Paare erzielten einen niedrigeren Score"+"</div></div>";
	return result;
}

function drawBoxedBar(value,vmax,width,height,bcolor,leftBorder)
{
	var rbd = "";
	var wth = width + "px";
	var hgt = height + "px";
	var dwth = 0;

	if (vmax>0)
		dwth = Math.round((width*value)/vmax);
	else if (leftBorder)
	{
		dwth = 0;
	}

	var baseWidth = dwth;

	dwth = dwth + "px";

	var lbd = "none";

	if (leftBorder) lbd = "1px solid grey";

	var str = "";

//	if (Math.round(baseWidth)>0)
	{
		str = "<div style=\"display:inline-block;background-color:" + bcolor + ";height:" + hgt + ";min-height:" + hgt + ";border-left:" + lbd + ";border-top:1px solid grey;border-bottom:1px solid grey;border-right:1px solid grey;width:" + dwth + ";min-width:" + dwth + ";max-width:" + dwth + ";\">";
		str = str + "</div>";
	}

	return str;
}

function drawBar(value,vmax,width,height,gradColor)
{
	var wth = width + "px";
	var hgt = height + "px";
	var dwth = Math.round((width*value)/vmax) + "px";

	var color = "blue";

	if (gradColor)
		color = makeColor(value/vmax);

	var str = "<div style=\"border:1px solid black;min-height:" + hgt + ";height:" + hgt + ";max-height:" + hgt + ";width:" + wth + ";min-width:" + wth + ";max-width:" + wth + ";\">";
	str = str + "<div style=\"background-color:" + color + ";height:100%;min-height:100%;border:none;width:" + dwth + ";min-width:" + dwth + ";max-width:" + dwth + ";\">";
	str = str + "</div></div>";

	return str;
}

function mergeScorecardRows(table,nrows,col)
{
		// Merge column cells in adjacent rows of scorecard when pair number and names are shared, and
		// apply alternate shading to groups of rows.
	var pair = table.rows[1].cells[col].innerHTML;
	var first = 0;
	var last = 0;
	var alt = 0;
	var shaded = 1;

	while (first<nrows)
	{
		for (last=first;last<=nrows;last++)
		{
			if ((table.rows[1+last].cells[col].innerHTML!=pair)||(last==nrows))
			{
				if ((table.rows[1+last].cells[col].innerHTML!=pair))
				{
					last--;
				}

				if  ((1 + last - first)>0)
				{
					table.rows[1+first].cells[col].rowSpan = 1 + last - first;
				}

				if (shaded!=0)
				{
					table.rows[1+first].className = "results_tr_grey";
				}

				for (j=first+1;j<=last;j++)
				{
					table.rows[1+j].deleteCell(col);

					if (shaded!=0)
						table.rows[1+j].className = "results_tr_grey";
				}

				if (shaded == 0)
					shaded = 1;
				else
					shaded = 0;

				first = last + 1;

				if (first<nrows)
				{
					pair = table.rows[1+first].cells[col].innerHTML;
				}

				break;
			}
		}
	}
}

function setLeadForScorecardRow(bnum,row,tline,declarer)
{
	var j;
	var colorPlus = "#ffff00";

	row.cells[4].innerHTML = leadCard(tline.lead.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;"));

	if (g_openingLeadsPresent&&((typeof g_hands.boards[bnum].DoubleDummyTricks)!=null)&&((typeof g_hands.boards[bnum].openingLeads)!="undefined"))
	{
		var relDDLead = "";

		if (tline.lead!="")
		{
			var idx = getLeadsIdx(tline.contract,tline.played_by);
			var leads = g_hands.boards[bnum].openingLeads[idx];

			var ltricks;

			var validLeadCard = false;

			for (j=0;j<leads.length;j++)
			{
				var cl = leads[j];

				if (cl[0].replace("T","10")==leadCard(tline.lead))
				{
					validLeadCard = true;
					var score = Number(cl[1]);

					if ((13-score)!=getMakeableTricksForContract(bnum,tline.contract,tline.played_by))
					{
						if (declarer)
							row.cells[4].style.backgroundColor = "#00ff00";
						else
							row.cells[4].style.backgroundColor = "#ff0000";

						break;
					}
				}
			}

			//if (!validLeadCard) row.cells[4].style.backgroundColor = "#888888";
		}
	}
}

function setupResultReasons(ctx,result)
{
	var suit = "CDHSN";
	var dir = "NSEW";
	var tlines = ctx.tlines;
	var tline = tlines[ctx.row];
	var board = ctx.board;
	var contractStr = ["Teilkontrakt","Vollspiel","Großschlemm","Kleinschlemm"];
	var i,j;
	var count = 0;
	var aveScores = [];

	var acount = 0;
	var adir = "";
	var aObj;
	var playerInfo = null;
	var declName = "";
	var ourVul = false;
	var declDir = 1;
	var ourDir = -1;
	var oppsDir = -1;
	var oppsVul = false;

	var ourInfo = getPlayerInfo(g_hands.pair_number,g_hands.direction);
	var role = getPlayerAndRole(ourInfo,tline);
	var ourDir = role.tdirection;
	if (ourDir==1) oppsDir = 2; else oppsDir = 1;

	ourVul = false;

	var ourShortNames = ourInfo.player1.split(" ")[0] + "/" + ourInfo.player2.split(" ")[0];

	var oppsShortNames = "";
	var oppsInfo = "";

	if (oppsDir==1)
		oppsInfo  = getPlayerInfo(tline.ns_pair_number,1);
	else
		oppsInfo = getPlayerInfo(tline.ew_pair_number,2);

	oppsShortNames = oppsInfo.player1.split(" ")[0] + "/" + oppsInfo.player2.split(" ")[0];

	if (((ctx.Vulnerable=="NS")||(ctx.Vulnerable=="All"))&&(ourDir==1))
		ourVul = true;
	else if (((ctx.Vulnerable=="EW")||(ctx.Vulnerable=="All"))&&(ourDir==2))
		ourVul = true;

	if (((ctx.Vulnerable=="NS")||(ctx.Vulnerable=="All"))&&(oppsDir==1))
		oppsVul = true;
	else if (((ctx.Vulnerable=="EW")||(ctx.Vulnerable=="All"))&&(oppsDir==2))
		oppsVul = true;

	if ((tline.played_by=="N")||(tline.played_by=="S"))
	{
		declDir = 1;
		playerInfo = getPlayerInfo(tline.ns_pair_number,1);
	}
	else
	{
		declDir = 2;
		playerInfo = getPlayerInfo(tline.ew_pair_number,2);
	}

	if ((tline.played_by=="N")||(tline.played_by=="E"))
		declName = playerInfo.player1;
	else
		declName = playerInfo.player2;

	document.getElementById("resultReasons").textContent = "";

	for (i=0;i<tlines.length;i++)
	{
		var ctline = tlines[i];

		if (played(ctline))
		{
			if (adir=="")
			{
				aObj = {};
				aObj.higherScoreCount = 0;
				aObj.moreTricks = 0;
				aObj.count = 1;
				aObj.contract = ctline.contract;
				aObj.played_by = ctline.played_by;
				aObj.total = Number(ctline.tricks);
				adir = ctline.played_by;

				if ((Number(ctline.score)>Number(tline.score))&&(ctx.direction==1))
					aObj.higherScoreCount++;
				else if ((Number(ctline.score)<Number(tline.score))&&(ctx.direction==2))
					aObj.higherScoreCount++;

				if ((ctline.contract.charAt(1)==tline.contract.charAt(1))&&(Number(ctline.tricks)>Number(tline.tricks))) aObj.moreTricks++;
			}
			else
			{
				if ((aObj.contract==ctline.contract)&&(aObj.played_by==ctline.played_by))
				{
					aObj.count++;
					aObj.total = aObj.total + Number(ctline.tricks);

					if ((Number(ctline.score)>Number(tline.score))&&(ctx.direction==1))
						aObj.higherScoreCount++;
					else if ((Number(ctline.score)<Number(tline.score))&&(ctx.direction==2))
						aObj.higherScoreCount++;

					if ((ctline.contract.charAt(1)==tline.contract.charAt(1))&&(Number(ctline.tricks)>Number(tline.tricks))) aObj.moreTricks++;
				}
				else
				{
					adir = ctline.played_by;
					aObj.average = aObj.total/aObj.count;
					aveScores[acount] = aObj;
					acount++;

					aObj = {};
					aObj.moreTricks = 0;
					aObj.higherScoreCount = 0;
					aObj.count = 1;
					aObj.contract = ctline.contract;
					aObj.played_by = ctline.played_by;
					aObj.total = Number(ctline.tricks);

					if ((Number(ctline.score)>Number(tline.score))&&(ctx.direction==1))
						aObj.higherScoreCount++;
					else if ((Number(ctline.score)<Number(tline.score))&&(ctx.direction==2))
						aObj.higherScoreCount++;

					if ((ctline.contract.charAt(1)==tline.contract.charAt(1))&&(Number(ctline.tricks)>Number(tline.tricks))) aObj.moreTricks++;
				}
			}
		}
	}

	aObj.average = aObj.total/aObj.count;
	aveScores[acount] = aObj;

	for (i=0;i<tlines.length;i++)
		if (played(tlines[i])) count++;

	var bidx = getTindexByName(g_hands.boards,""+board);//var bidx = getTindexByName(g_hands.boards,JSON.stringify(board));

	var tricksOffset = 0;
	var tricksTarget = tline.contract.charAt(0);
	var offsetStr = "";

	if (!Number.isNaN(tricksTarget))
	{
		tricksOffset = tline.tricks - (Number(tricksTarget)+6);

		if (tricksOffset>0)
			offsetStr = "+" + tricksOffset;
		else if (tricksOffset<0)
			offsetStr = tricksOffset;
	}

//	tricksOffset = calculateTricks(bidx);
	var contractPlayer = "";

	if (tline.contract.toUpperCase().charAt(0)!=='P')
		contractPlayer = " by " + tline.played_by + " (" + declName + ")";

	var str2 = "Board " + board + ", Contract " + tline.contract + offsetStr + contractPlayer + "<br><br>";

	str2 = str2 + "<div id=accuracy style=\"float:left;\"></div>";

	str2 += "<div style=\"float:left;clear:both;margin-top:10px;\">";

	var tmp = getHighestScoringMakeableContractForDirection(bidx,ourDir,ourVul);

	if (tmp==null)
		str2 += "No theoretical makeable contract by " + ourShortNames + "<br><br>";
	else if ((tmp.contract.charAt(0)=="0"))
		str2 += "No theoretical makeable contract by " + ourShortNames + "<br><br>";
	else
		str2 += "Highest scoring makeable contract by " + ourShortNames + " is: " + tmp.contract + " by " + tmp.declarer + "<br><br>";

	tmp = getHighestScoringMakeableContractForDirection(bidx,oppsDir,oppsVul);

	if (tmp==null)
		str2 += "No theoretical makeable contract by " + oppsShortNames + "<br><br>";
	else if (tmp.contract.charAt(0)=="0")
		str2 += "No theoretical makeable contract by " + oppsShortNames + "<br><br>";
	else
		str2 += "Highest scoring makeable contract by " + oppsShortNames + " is: " + tmp.contract + " by " + tmp.declarer + "<br><br>";

	var curbd = g_hands.boards[bidx];

	if ((typeof curbd.OptimumScore)!="undefined")
		str2 += "[OptimumScore \"" + curbd.OptimumScore + "\"]<br><br>";

	var ourscore = tline.score;
	var res = compareScores(tlines,ourscore,ctx.direction);

	str2 = str2 + "<br>";

	var str5 = "<table cols=5 class=ranking style='border:1px solid gray;border-spacing:0px;'>";
	str5 = str5 + "<tr style='border:1px solid grey;'><th>Contract</th><th>Decl</th><th>Ave Tks</th><th colspan=2>No Of Pairs</th><th colspan=2>Higher Scores</th></tr>";

	for (i=0;i<aveScores.length;i++)
	{
		aObj = aveScores[i];
		var hcount = aObj.higherScoreCount;
		if (hcount==0) hcount = "";

		var moreTricks = aObj.moreTricks;
		if (moreTricks==0) moreTricks = "";

		var bcolor = "";

		if (tline.contract==aObj.contract)
		{
			bcolor = "background-color:#cccccc;";
		}

		str5 = str5 + "<tr style='border:1px solid grey;" + bcolor + "'><td>" + aObj.contract + "</td><td>" + aObj.played_by + "</td><td>" + aObj.average.toFixed(2) + "</td><td>" + aObj.count + "</td><td><div style='height:12px;border:1px solid black;width:50px;'><div style='height:12px;background-color:blue;width:" + ((50*aObj.count)/count)+ "px;'></div></div></td><td>" + hcount + "</td><td><div style='height:12px;border:1px solid black;width:50px;'><div style='height:12px;background-color:blue;width:" + ((50*hcount)/count)+ "px;'></div></div></td></tr>";
	}

	str2 = str2 + str5 + "</table></div>";

	str2 = str2 + "<div style='width:30%;float:left;'><div id=popupHand style='width:100%;margin-left:10px;float:left;'></div><div id=popupMakeable style='float:right;clear:both;'></div></div>";

	var str = "";

	str = str2 + "<div style='float:left;clear:both;'>" + str + "</div>";

	var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:520px;width:600px;\"><span style=\"font-size:16px;\">";
	help = help + str;
	help = help + "</span></div><br>";
	help = help + "<button id=hide_resultReasons style=\"cursor:pointer;\">CLOSE</button>";

	document.getElementById("resultReasons").innerHTML = help;

	var saveBindex = g_lastBindex;

	setLastBoardIndex(getTindexByName(g_hands.boards,String(board)));

	drawMiniHand();
	$("#minihand").hide();
	var cp = document.getElementById("minihand").cloneNode(true);
	cp.removeAttribute("id");
	$(cp).find("*").removeAttr("id");

	document.getElementById("popupHand").appendChild(cp);

	var cp = document.getElementById("miniMakeableContracts").cloneNode(true);
	cp.removeAttribute("id");
	$(cp).find("*").removeAttr("id");

	document.getElementById("popupMakeable").appendChild(cp);

	setLastBoardIndex(saveBindex);

	drawMiniHand();	// Draw the original board in case user clicks on the Board button.
}

function makeScoreClickFunction(tline)
{
	return function(){var row=this.parentNode;var bd=row.cells[0].innerHTML;log('button=acc2');getCachedAcc(tline);};
}

function setupScorecard2(table,stable,boards,info,sessInfo,etfRange,sortedBoards)
{
	var j,n;
	var playedInRoleCombined = 0;
	var sumOfPercentCombined = 0;
	var sumOfCrossImpsCombined = 0;
	var crossImpBoardsCombined = 0;
	var etfTotalCombined = 0;
	var etfBoardsCombined = 0;
	var etfAchievedCombined = 0;
	var oppDir;
	var oppInfo;
	var ctx = {};

	g_scorecardContext = [];

	var rows = table.rows;
	var srows = stable.rows;
	while (rows.length>2) table.deleteRow(-1);

	var upperLimit;

	var mPlayer1 = info.player1.trim().split(" ");
	if (mPlayer1.length>1) mPlayer1 = mPlayer1[0] + " " + mPlayer1[1].charAt(0); else mPlayer1 = mPlayer1[0];

	var mPlayer2 = info.player2.trim().split(" ");
	if (mPlayer2.length>1) mPlayer2 = mPlayer2[0] + " " + mPlayer2[1].charAt(0); else mPlayer2 = mPlayer2[0];

	if (sortedBoards) upperLimit =1; else upperLimit = 5;

	for (n=0;n<upperLimit;n++)
	{
		var lineCount=0;
		var playedInRole = 0;
		var sumOfPercent = 0;
		var sumOfCrossImps = 0;
		var crossImpBoards = 0;	// Note this number can be fewer than "playedInRole" (some may not count for cross imps in Teams events)
		var etfTotal = 0;
		var etfBoards = 0;
		var etfAchieved = 0;
		var lastOppPair = -1;

		for (j=0;j<boards.length;j++)
		{
			ctx = {};
			var board = boards[j];
			var tlines = board.traveller_line;

			sortTravellerLines(tlines,1);

			ctx.tlines = tlines;

			var i,prole,found,tdirection,dirChars,declarer_pair,first;

			var opp_pair;

			for (i=0;i<tlines.length;i++)
			{
				var tline = tlines[i];

				if (info.pair_found)
				{
					prole = getPlayerAndRole(info,tline);
					found = prole.found;
					tdirection = prole.tdirection;
					declarer_pair = prole.declarer_pair;
					first = prole.first;
					opp_pair = prole.opp_pair;

					if (sessInfo.singleWinner)
					{
						if (tdirection==1) dirChars = " (EW)"; else dirChars = " (NS)"; // Playing direction of opponents
					}
					else
						dirChars = "";

					if (found)
					{
						ctx.row = i;
						ctx.direction = tdirection;

						if ((lineCount==0)&&!sortedBoards)
						{
							table.insertRow(-1);
							var row = table.rows[table.rows.length-1];
							row.insertCell(-1);
							row.cells[0].colSpan = 13;
							row.cells[0].style.backgroundColor = "#FFFF88";
							row.cells[0].style.borderRight = "1px solid #cccccc";

							stable.insertRow(-1);
							var srow = stable.rows[stable.rows.length-1];
							srow.insertCell(-1);
							srow.cells[0].colSpan = 2;
							srow.cells[0].style.backgroundColor = "#FFFF88";
							srow.cells[0].style.borderRight = "1px solid black";
							srow.cells[0].style.textAlign = "center";

							var str;

							switch(language)
							{
								case "de":
									if (n==0)
										str = "Alleinspieler - " + mPlayer1;
									else if (n==1)
										str = "Alleinspieler - " + mPlayer2;
									else if (n==2)
										str = "Gegenspiel - " + mPlayer1 + " spielt aus";
									else if (n==3)
										str = "Gegenspiel - " + mPlayer2 + " spielt aus";
									else
										str = "Durchgepasst oder kein Kontrakt vorhanden";
									break;
								default:
									if (n==0)
										str = "Declarer - " + mPlayer1;
									else if (n==1)
										str = "Declarer - " + mPlayer2;
									else if (n==2)
										str = "Defending - " + mPlayer1 + " on lead";
									else if (n==3)
										str = "Defending - " + mPlayer2 + " on lead";
									else
										str = "Passed, or no contract available";
							}

							row.cells[0].innerHTML = "<span style=\"font-weight:600;\">" + str + "</span>";
							srow.cells[0].innerHTML = "<span style=\"font-weight:bold;\">" + str + "</span>";
						}

						lineCount++;

						if (sortedBoards||(validContract(tline.contract)&&(((n==0)&&declarer_pair&&first)||((n==1)&&declarer_pair&&!first)||((n==2)&&first&&!declarer_pair)||((n==3)&&!first&&!declarer_pair)))||((n==4)&&!validContract(tline.contract)))
						{
							if (played(tline)||sortedBoards)	// Otherwise board was not actually played
							{
								playedInRole++;

								table.insertRow(-1);
								var row = table.rows[table.rows.length-1];

								if (sortedBoards)
									if (opp_pair!=lastOppPair)
									{
										row.style.borderTop = "1px solid #cccccc";
									}

								lastOppPair = opp_pair;

								var k;

								for (k=0;k<12+g_ofs;k++)
								{
									row.insertCell(-1);
								}

								row.cells[0].innerHTML = board.board_no;
								row.cells[0].onclick = function(){log("operation=selectBoardFromScorecard");setLastBoardIndex(getTindexByName(g_hands.boards,this.innerHTML));showComparison();};
								row.cells[0].className = "myLink";

								ctx.board = board.board_no;
								g_scorecardContext[board.board_no] = ctx;

								if (g_currentTraveller!=null)
									if (board.board_no==g_currentTraveller.board_no)
										row.cells[0].style.backgroundColor = "pink";

								if (g_hands.direction==1) oppDir = 2; else oppDir = 1;

								oppInfo = getPlayerInfo(opp_pair,oppDir);

								var p1 = oppInfo.player1.trim().split(" ");
								var p2 = oppInfo.player2.trim().split(" ");

								if (sortedBoards)
									row.cells[1].innerHTML = opp_pair + dirChars + "<br>(" + p1[0] + " & " + p2[0] + ")";
								else
								{
									row.cells[1].innerHTML = opp_pair;
									row.cells[1].className = "myLink";

									if (tdirection==2)
										row.cells[1].onclick = row.cells[1].onmouseover = function(){showNames(this,1);};
									else
										row.cells[1].onclick = row.cells[1].onmouseover = function(){showNames(this,2);};
								}

								row.cells[1].style.borderRight = "1px solid black";
								row.cells[1].style.textAlign = "middle";

								row.cells[1].onmouseout = function(){
										var popup = document.getElementById("popup_box");
										popup.textContent = "";
										popup.style.display="none";
										$("#popup_box").finish();
									}

								if (validContract(tline.contract))
								{
									var contractLevel = Number(tline.contract.charAt(0));
									var overtricks = tline.tricks - (contractLevel + 6);
								}

								var value;

								var nspts = Number(tline.ns_match_points);
								var ewpts = Number(tline.ew_match_points);

								if (g_scoring!="IMP")
									value = 100*(nspts/(nspts + ewpts));
								else
								{
									if (g_eventType!="Teams")
										value = 50*(1 + nspts/g_maxImps);
									else
									{
										if (tdirection==1)	// Played NS
											value = 50*(1 + (Number(tline.crossImpsNS))/g_maxImps);
										else
											value = 50*(1 + (Number(tline.crossImpsEW))/g_maxImps);
									}
								}

								if ((tdirection==2)&&(g_eventType!="Teams")) value = 100 - value;

								sumOfPercent = sumOfPercent + value;

								if (g_scoring!="IMP")
								{
									value = parseFloat(Math.round(value * 100) / 100).toFixed(0);
									row.cells[9+g_ofs].innerHTML = value + "%";
								}
								else
								{
									var showResultBars = true;

									if (g_eventType!="Teams")
									{
										if (tdirection==1)
										{
											row.cells[9+g_ofs].innerHTML = nspts;
											sumOfCrossImps += nspts;	// Add to this total for summary section in case cross imp or aggregate scoring used
											crossImpBoards++;
										}
										else
										{
											row.cells[9+g_ofs].innerHTML = ewpts;	// Add to this total for summary section in case cross imp or aggregate scoring used
											sumOfCrossImps += ewpts;
											crossImpBoards++;
										}
									}
									else
									{
										if (tdirection==1)
										{
											row.cells[9+g_ofs].innerHTML = tline.crossImpsNS;
											sumOfCrossImps += Number(tline.crossImpsNS);

											if (tline.crossImpsNS!=="")
												crossImpBoards++;
										}
										else
										{
											row.cells[9+g_ofs].innerHTML = tline.crossImpsEW;
											sumOfCrossImps += Number(tline.crossImpsEW);

											if (tline.crossImpsEW!=="")
												crossImpBoards++;
										}
									}
								}

								row.cells[9+g_ofs].style.textAlign = "right";

								try {
									if ((typeof tline.board)!="undefined")
									{
										row.cells[9+g_ofs].onclick = function(){var row=this.parentNode;var bd=row.cells[0].innerHTML;log('button=acc2');showPlayAnalysis(bd);};
										row.cells[9+g_ofs].className = "myLink";
									}
								} catch (err) {};

								row.cells[2].style.textAlign = "right";

								var width = (100*value)/100;

								setBars(row.cells,100-width,10+g_ofs,100,"#FF0000","#00FF00",50);

								if (validContract(tline.contract))
								{
									row.cells[2].innerHTML = tline.contract.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
									row.cells[3].innerHTML = tline.played_by;

									row.cells[2].style.textAlign = "left";

										//************* change to deal with non-contract (e.g. Passed Out, or Not Played)
									if (tline.tricks!="")
									{
										var overtricks = (tline.tricks - (6 + (Number(tline.contract.charAt(0)))));
										if (overtricks>=0) overtricks = "+" + overtricks;

										if (overtricks!=0)
											row.cells[5+g_ofs].innerHTML = overtricks;
										else
											row.cells[5+g_ofs].textContent = "=";

										row.cells[4+g_ofs].style.textAlign = "right";

										var backColor = "white";

										row.cells[4+g_ofs].innerHTML = tline.tricks;
//										row.cells[4+g_ofs].style.backgroundColor = backColor;

										row.cells[5+g_ofs].style.textAlign = "right";
										row.cells[5+g_ofs].style.borderRight = "1px solid black";
									}

									if (g_ofs==1)
									{
										setLeadForScorecardRow(j,row,tline,declarer_pair);
//										row.cells[4].className = "myLink";
										row.cells[4].style.textAlign = "right";
//										row.cells[4].onclick = function(){var row=this.parentNode;var contract=row.cells[2].innerHTML;var declarer=row.cells[3].innerHTML;var idx = getLeadsIdx(contract,declarer);alert(JSON.stringify(g_hands.boards[getTindexByName(g_hands.boards,row.cells[0].innerHTML)].openingLeads[idx]))};
									}

									var hindex = getBoardIndex(j);

									if (hindex!=null)
									{
										if ((typeof g_hands.boards[hindex].DoubleDummyTricks)!="undefined")
										{
											var ntricks2 = getMakeableTricksForContract(hindex,g_hands.boards[hindex].Contract,g_hands.boards[hindex].Declarer);
											var ETFMode = document.getElementById("ETFMode");

											if (ETFMode!=null)
											{
												if (document.getElementById("ETFMode").selectedIndex==1)
												{
													var ltricks = getMakeableTricksForLead(hindex,tline);

													if ((declarer_pair)&&(ltricks!=null))
														if (ltricks!=ntricks2)
															ntricks2 = ltricks;
												}
											}

											backColor = "white";

											if (ntricks2>=0)
											{
												var relDD = tline.tricks - ntricks2;

												if (declarer_pair)
												{
													if (relDD>0) backColor = "#00FF00";
													else if (relDD<0) backColor = "#FF0000";
												}
												else
												{
													relDD = -relDD;
													if (relDD>0) backColor = "#FF0000";
													else if (relDD<0) backColor = "#00FF00";
												}

												if (relDD==0) backColor = "#88FF88";	// Light Green

												etfTotal += relDD;
												etfBoards++;	// Number of boards for which ETF available.

												if (relDD>=0) etfAchieved++;

												var ddStr = relDD.toString();

												if (relDD==0) ddStr = "=";
												else if (relDD>0) ddStr = "+" + relDD;

												row.cells[6+g_ofs].innerHTML = ddStr;
												row.cells[6+g_ofs].style.textAlign = "right";
												row.cells[6+g_ofs].style.borderLeft = "1px solid #cccccc";
												setBars(row.cells,etfRange-Number(relDD),7+g_ofs,2*etfRange,"#FF0000","#00FF00",40);
											}
											else
											{
												setBars(row.cells,etfRange,7+g_ofs,2*etfRange,"#FF0000","#00FF00",40);
												row.cells[6+g_ofs].colSpan = 2;
												row.cells[6+g_ofs].textContent = "No Data";
												row.cells[6+g_ofs].style.borderLeft = "1px solid #cccccc";
												row.deleteCell(7+g_ofs);
											}
										}
										else
										{
											setBars(row.cells,etfRange,7+g_ofs,2*etfRange,"#FF0000","#00FF00",40);
											row.cells[6+g_ofs].colSpan = 2;
											row.cells[6+g_ofs].style.borderLeft = "1px solid #cccccc";
											row.cells[6+g_ofs].textContent = "No Data";
											row.deleteCell(7+g_ofs);
										}
									}
								}
								else
								{
									if (passed(tline))
										row.cells[2].textContent = "Passed";
									else
										row.cells[2].textContent = "N/A";

									row.cells[7+g_ofs].style.backgroundColor = "white";
									row.cells[8+g_ofs].style.backgroundColor = "white";
									row.cells[7+g_ofs].style.borderLeft = "1px solid #CCCCCC";
									row.cells[8+g_ofs].style.borderLeft = "1px solid #CCCCCC";
								}

								row.cells[8+g_ofs].style.borderRight = "1px solid black";

								var ourscore = tline.score;
								var comment = "";
							}

							break;
						}
					}
				}
			}
		}

		playedInRoleCombined += playedInRole;
		sumOfPercentCombined += sumOfPercent;
		sumOfCrossImpsCombined += sumOfCrossImps;
		crossImpBoardsCombined += crossImpBoards;
		etfAchievedCombined += etfAchieved;
		etfBoardsCombined += etfBoards;
		etfTotalCombined += etfTotal;

		if (!sortedBoards) addSummarySection(stable,playedInRole,sumOfPercent,sumOfCrossImps,crossImpBoards,etfAchieved,etfBoards,etfTotal);
	}

	if (!sortedBoards)
	{
		stable.insertRow(-1);
		srow = stable.rows[stable.rows.length-1];
		srow.insertCell(-1);
		srow.cells[0].colSpan = 2;
		srow.cells[0].style.backgroundColor = "#FFFF88";
		srow.cells[0].style.borderRight = "1px solid black";
		srow.cells[0].style.textAlign = "center";

		switch(language)
		{
			case "de":
				str = "<span style=\"font-weight:600;\">" + "Gesamtergebnis:" + "</span>";
				break;
			default:
				str = "<span style=\"font-weight:600;\">" + "Overall Result:" + "</span>";
		}
		srow.cells[0].innerHTML = str;

		addSummarySection(stable,playedInRoleCombined,sumOfPercentCombined,sumOfCrossImpsCombined,crossImpBoardsCombined,etfAchievedCombined,etfBoardsCombined,etfTotalCombined);
	}

	if (sortedBoards) mergeScorecardRows(table,table.rows.length-2,1);

	table.insertRow(-1);
	row = table.rows[table.rows.length-1];
	row.insertCell(-1);
	row.cells[0].colSpan=12+g_ofs;
	row.cells[0].style.whiteSpace = "normal";
	row.cells[0].style.borderTop = "1px solid black";
	row.cells[0].style.borderRight = "1px solid #cccccc";
	switch(language)
	{
		case "de":
			row.cells[0].innerHTML = "<div style=\"max-width:400px;float:left;text-align:left;\"><span style=\"font-size:10px;font-style:italic;\">ETF ist die Zahl der vom aktuellen Paar erzielten Stiche, als Allein- oder Gegenspieler, relativ zur Double Dummy Analyse für einen bestimmten Kontrakt. Angepasstes ETF wird relativ zur Double Dummy Analyse berechnet, bezogen auf das aktuelle Ausspiel der Gegenspieler in einem Kontrakt.</span></div>";
			break;
		default:
			row.cells[0].innerHTML = "<div style=\"max-width:400px;float:left;text-align:left;\"><span style=\"font-size:10px;font-style:italic;\">ETF is the number of tricks made by the current pair, as declarer or defenders, relative to the double dummy target for a particular contract. Adjusted ETF is calculated relative to a revised double dummy target that depends on the actual lead made by the defenders of a contract.</span></div>";
	}

}

