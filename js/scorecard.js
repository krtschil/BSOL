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

