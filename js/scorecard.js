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