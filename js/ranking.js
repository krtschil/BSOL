function comparePositions(a,b)
{
	if (Number.isNaN(a)&&!Number.isNaN(b)) return 1;
	if (Number.isNaN(b)&&!Number.isNaN(a)) return -1;
	if (Number.isNaN(a)&&Number.isNaN(b)) return 0;
	a = Number(a);
	b = Number(b);
	if (a>b) return 1;
	else if (a<b) return -1;
	else return 0;
}

function getPairObject(pair,direction,rankNS,rankEW)
{
	var sessInfo = getSessionInfo();
	var i;

	if ((direction==1)||sessInfo.singleWinner)
	{
		for (i=0;i<rankNS.length;i++)
			if (rankNS[i].pair==pair) return rankNS[i];
	}

	if (direction==2)
	{
		for (i=0;i<rankEW.length;i++)
			if (rankEW[i].pair==pair) return rankEW[i];
	}

	return null;
}

function checkForUniquePairNumbers()
{
		// N.B This function should only be called for Teams events

	var pairs = g_travellers.event.participants.pair;

	if (g_uniquePairNumbers==="")
	{
		var singleWinner = true;	// By default assume pair numbers are unique

			// Check whether pair numbers are unique
		var checkKeys = [];

		for (i=0;i<pairs.length;i++)
			if (typeof checkKeys[pairs[i].pair_number] === 'undefined')
			{
				checkKeys[pairs[i].pair_number] = 1;
			}
			else
			{
				singleWinner = false;
				break;
			}

			// If pair numbers are unique across NS&EW make sure the directions in the pairs array are all recorded as "N"
			// (because the code relies on the fact that for single winner events all pair numbers are recorded as direction "N" in the json file)
		if (singleWinner)
			for (i=0;i<pairs[i].length;i++)
				pairs[i].direction = "N";

		g_uniquePairNumbers = singleWinner;
	}
	else
		singleWinner = g_uniquePairNumbers;

	return singleWinner;
}

function getSessionInfo()
{
	if (g_sessInfo!=null) return g_sessInfo;

		// Return number of NS pairs, number of EW pairs, and single winner indicator (in which case all pairs are designated NS)
	var sessInfo = {};
	var i;
	var singleWinner = false;

	var evtype = g_travellers.event.event_type;

	if ((evtype.toUpperCase()=="TEAMS")||(evtype.toUpperCase()=="SWISS_TEAMS"))
		g_eventType = "Teams";
	else
		g_eventType = "Paarturnier";

	var pairs = g_travellers.event.participants.pair;

		// For Teams, treat as a two winner event, because there are two pairs with the same number
	if ((g_travellers.event.winner_type==1)&&(g_eventType!="Teams"))
		singleWinner = true;
	else if (g_eventType=="Teams")
	{
			// For teams we use same code as for 2 winner or single winner pairs events depending whether or not
			// the pair numbers are unique across NS and EW. In either case we produce a single cross imps ranking list
			// even if pairs always play in the same direction.
		singleWinner = checkForUniquePairNumbers();
	}

	var percentPresent = false;

	for (i=0;i<pairs.length;i++)
	{
		if (pairs[i].percentage!="")
		{
			if (pairs[i].percentage.charAt(0)=="-")	// Heuristic to cope with Scorebridge
			{
				g_scoring = "IMP";
				percentPresent = false;
				break;
			}
			else
				percentPresent = true;	// Carry on with the loop in case a negative "percentage" is encoutered.
		}
	}

	g_validPercentageFields = percentPresent;

	if (g_validPercentageFields)
		g_scoring = "MatchPoints";
	else
	{
		if (g_eventType!="Teams")	// If Teams, defer until cross-imps have been calculated
			calculateMaxImps();

		if (g_scoring!="IMP")
			g_scoring = "VP";
	}

	sessInfo.singleWinner = singleWinner;

	g_sessInfo = sessInfo;
	return sessInfo;
}

function addRankPositions(data)
{
	var i;

	for (i=0;i<data.length;i++)
	{
		data[i].samePosition = "";
	}

	var sameCount = 0;
	var ximpsPos = 1;

	for (i=0;i<data.length;i++)
	{
		if (i==0) data[i].crossImpsPosition = ximpsPos;

		if (i>0)
		{
			if (g_eventType!="Teams")
			{
				if (data[i].position==data[i-1].position)
				{
					data[i].samePosition = "=";
					data[i-1].samePosition = "=";
				}
			}
			else
			{
				if (data[i].boardsPlayed>0)
				{
					if (Number(data[i].crossImpsPerBoard.toFixed(2))==Number(data[i-1].crossImpsPerBoard).toFixed(2))
					{
						data[i].crossImpsPosition = ximpsPos;
						data[i].samePosition = "=";
						data[i-1].samePosition = "=";
						sameCount++;
					}
					else
					{
						ximpsPos += 1 + sameCount;
						data[i].crossImpsPosition = ximpsPos;
						sameCount = 0;
					}
				}
			}
		}
	}
}

function sortRanking(orderByRank)
{
		// This function sorts entries either by position in ranking, or by pair number order.
	if (g_rankInfo==null) return;

	if (orderByRank) // sort by position
	{
		if (g_eventType!="Teams")
		{
			g_rankInfo.rankNS.sort(function(a,b){
						return comparePositions(a.position,b.position);
				});

			g_rankInfo.rankEW.sort(function(a,b){
						return comparePositions(a.position,b.position);
				});
		}
		else
		{
			g_rankInfo.rankNS.sort(function(a,b){
						if (b.crossImpsPerBoard>a.crossImpsPerBoard) return 1;
						else if (b.crossImpsPerBoard<a.crossImpsPerBoard) return -1;
						else return 0;
				});

			g_rankInfo.rankEW.sort(function(a,b){
						if (b.crossImpsPerBoard>a.crossImpsPerBoard) return 1;
						else if (b.crossImpsPerBoard<a.crossImpsPerBoard) return -1;
						else return 0;
				});

			g_rankInfo.rankCombined.sort(function(a,b){
						if (b.crossImpsPerBoard>a.crossImpsPerBoard) return 1;
						else if (b.crossImpsPerBoard<a.crossImpsPerBoard) return -1;
						else return 0;
				});
		}
	}
	else	// sort by pair number
	{
		g_rankInfo.rankNS.sort(function(a,b){
					return comparePairNumbers(a.pair,b.pair);
			});

		g_rankInfo.rankEW.sort(function(a,b){
					return comparePairNumbers(a.pair,b.pair);
			});

		g_rankInfo.rankCombined.sort(function(a,b){
					return comparePairNumbers(a.pair,b.pair);
			});
	}
}

function getRankingInfo()
{
	if (g_rankInfo!=null)
		return g_rankInfo;

	var sessInfo = getSessionInfo();

	var pairs = g_travellers.event.participants.pair;

	var rankNS = [];
	var rankEW = [];
	var rankCombined = [];		// Used for Teams event re-scored as Cross Imps

	var i,j;
	var maxPlayed = 0;	// Max boards played by any pair.

	for (i=0;i<pairs.length;i++)
	{
		var pair = pairs[i].pair_number;

		if ((pair!="")&&(pair!=null))
		{
			var data = {};

			data.plusMpts =0;
			data.minusMpts = 0;

			if ((typeof pairs[i].totalCrossImps)!="undefined")
			{
				data.totalCrossImps = Number(pairs[i].totalCrossImps);
				data.crossImpsPerBoard = pairs[i].crossImpsPerBoard;
			}

			data.boardsPlayed = 0;
			data.crossImpsBoardsPlayed = pairs[i].crossImpsBoardsPlayed;	// In a Teams event, sometimes some boards are excluded from cross-imps calculations
			data.pair = pairs[i].pair_number;

			try {
				var cpos = Number((pairs[i].place + "").replace(/\=/g,""));	// Position in Ranking Table
				data.position = cpos;
			} catch (e) {};

			data.percentage = pairs[i].percentage;
			data.total_score = pairs[i].total_score;

			if ((pairs[i].direction)=="N")
				data.direction = 1;
			else
				data.direction = 2;

			data.dd = {};

			if ((pairs[i].direction=="N")||sessInfo.singleWinner)
				rankNS[rankNS.length] = data;
			else
				rankEW[rankEW.length] = data;
		}
	}

	for (i=0;i<g_travellers.event.board.length;i++)
	{
		var tlines = g_travellers.event.board[i].traveller_line;

		for (j=0;j<tlines.length;j++)
		{
			var tline = tlines[j];
			var pairNS = tline.ns_pair_number;
			var pairEW = tline.ew_pair_number;

			if (played(tline))
			{
					// Note nsObj and ewObj will both be from rankNS array if singleWinner event
				var nsObj = getPairObject(pairNS,1,rankNS,rankEW);
				var ewObj = getPairObject(pairEW,2,rankNS,rankEW);

				if ((nsObj!=null)&&(ewObj!=null))
				{
					nsObj.plusMpts += Number(tline.ns_match_points);
					nsObj.minusMpts += Number(tline.ew_match_points);
					nsObj.boardsPlayed++;

					if (nsObj.boardsPlayed>maxPlayed) maxPlayed = nsObj.boardsPlayed;

					ewObj.plusMpts += Number(tline.ew_match_points);
					ewObj.minusMpts += Number(tline.ns_match_points);
					ewObj.boardsPlayed++;
					if (ewObj.boardsPlayed>maxPlayed) maxPlayed = ewObj.boardsPlayed;
				}
			}
		}
	}

	var nsHigh = -65535;
	var nsLow = 65535;
	var ewHigh = -65535;
	var ewLow = 65535;

		// Calculate percentages, and high/low points for all positions
	for (i=0;i<rankNS.length;i++)
	{
		if (g_scoring!="IMP") rankNS[i].percent = (100*rankNS[i].plusMpts)/(rankNS[i].plusMpts + rankNS[i].minusMpts);
		else
		{
			rankNS[i].plusMpts = (maxPlayed*rankNS[i].plusMpts)/rankNS[i].boardsPlayed;
			rankNS[i].minusMpts = (maxPlayed*rankNS[i].minusMpts)/rankNS[i].boardsPlayed;
			rankNS[i].percent = (100*rankNS[i].plusMpts)/g_maxImps;
		}

		rankNS[i].percent = Math.round(100*rankNS[i].percent)/100;

		if (rankNS[i].plusMpts>nsHigh) nsHigh = rankNS[i].plusMpts;
		if (rankNS[i].plusMpts<nsLow) nsLow = rankNS[i].plusMpts;
	}

	for (i=0;i<rankEW.length;i++)
	{
		if (g_scoring!="IMP") rankEW[i].percent = (100*rankEW[i].plusMpts)/(rankEW[i].plusMpts + rankEW[i].minusMpts);
		else
		{
			rankEW[i].plusMpts = (maxPlayed*rankEW[i].plusMpts)/rankEW[i].boardsPlayed;
			rankEW[i].minusMpts = (maxPlayed*rankEW[i].minusMpts)/rankEW[i].boardsPlayed;
			rankEW[i].percent = (100*rankEW[i].plusMpts)/g_maxImps;
		}

		rankEW[i].percent = Math.round(100*rankEW[i].percent)/100;

		if (rankEW[i].plusMpts>ewHigh) ewHigh = rankEW[i].plusMpts;
		if (rankEW[i].plusMpts<nsLow) ewLow = rankEW[i].plusMpts;
	}

	var highMpts,lowMpts;

	if (ewHigh>nsHigh) highMpts = ewHigh;
	else highMpts = nsHigh;

	if (ewLow<nsLow) lowMpts = ewLow;
	else lowMpts = nsLow;

	if (g_scoring=="IMP")
	{
		for (i=0;i<rankNS.length;i++)
		{
			rankNS[i].percent = (100*(rankNS[i].plusMpts - lowMpts))/(highMpts-lowMpts);
		}

		for (i=0;i<rankEW.length;i++)
		{
			rankEW[i].percent = (100*(rankEW[i].plusMpts - lowMpts))/(highMpts-lowMpts);
		}
	}

	if (g_eventType=="Teams")
	{
			// Generate conbined array, but only include entries where crossImpsPerBoard is defined.
			// Otherwise, it means the pair did not play any boards so should not be included.
		var offset = 0;

		for (i=0;i<rankNS.length;i++)
			if ((typeof rankNS[i].crossImpsPerBoard)!="undefined")
			{
				rankCombined[offset] = rankNS[i];
				offset++;
			}

		for (i=0;i<rankEW.length;i++)
			if ((typeof rankEW[i].crossImpsPerBoard)!="undefined")
			{
				rankCombined[offset] = rankEW[i];
				offset++;
			}
	}

	var rankInfo = {};
	rankInfo.sessInfo = sessInfo;
	rankInfo.rankNS = rankNS;
	rankInfo.rankEW = rankEW;
	rankInfo.rankCombined = rankCombined;
	rankInfo.maxPlayed = maxPlayed;		// Max boards played by any pair.
	rankInfo.highMpts = highMpts;
	rankInfo.lowMpts = lowMpts;

	g_rankInfo = rankInfo;

	sortRanking(true);	// Sort by rank before adding the rank positions to the elements

	if (g_eventType!="Teams")
	{
		addRankPositions(rankInfo.rankNS);
		addRankPositions(rankInfo.rankEW);
	}
	else
	{
		addRankPositions(rankInfo.rankCombined);
	}

	return rankInfo;
}

function getPlayerInfo(pair,direction)
{
		// Gets player information for the current pair from the travellers record, using the information
		// passed to ddummy.htm in the pair_number and direction fields.
	var info = {};
	var pair_found = false;
	var pairs = g_travellers.event.participants.pair;
	var player1 = "";
	var player2 = "";
	var singleWinner = true;

	var i;

		// First check whether it;s a single winner movement (in which case pair numbers are unique but a particular
		// pair may sometimes be NS and sometimes EW
	var sessInfo = getSessionInfo();
	singleWinner = sessInfo.singleWinner;

	for (i=0;i<pairs.length;i++)
	{
		if (((pairs[i].direction=="N")&&((direction==1)||singleWinner))&&pair==pairs[i].pair_number)
		{
			pair_found = true;
			player1 = pairs[i].player[0].player_name;
			player2 = pairs[i].player[1].player_name;
			break;
		}
		else if (((pairs[i].direction=="E")&&((direction==2)||singleWinner))&&pair==pairs[i].pair_number)
		{
			pair_found = true;
			player1 = pairs[i].player[0].player_name;
			player2 = pairs[i].player[1].player_name;
			break;
		}
	}

	if (pair_found)
	{
		if (player1==null) player1 = "noname noname";
		if (player2==null) player2 = "noname noname";
		info.player1 = player1;
		info.player2 = player2;
		info.pair_found = true;
		info.pair_number = pair;
		info.pair_index = i;	// Index to entry for this pair in g_travellers.event.participants.pair;
		info.direction = direction;	// Only relevant here if not single winner movement.
		info.singleWinner = singleWinner;
	}
	else
		info.pair_found = false;	// error

	return info;
}

function checkInitialDirection(pair)
{
	var i;
	var pairs = g_travellers.event.participants.pair;
	var found = false;

	for (i=0;i<pairs.length;i++)
	{
		if (pairs[i].direction=="E") // the data distinguishes between pairs who started NS and EW
		{
			found = true;
			break;
		}
	}

	if (found)
	{
		for (i=0;i<pairs.length;i++)
		{
			if (pair==pairs[i].pair_number)
			{
				return pairs[i].direction;
			}
		}
	}

	return null;
}

function getTlineForPair(boardIndex,info)
{
		// Return traveller line containing data for this pair playing this board. Also returns direction in which
		// the pair were sitting when playing the board. Returns null if the pair didn't play this board.
	var k;
	var result = {};

	var tindex = getTravIndex(boardIndex);

	if (tindex==null) return null;

	var tlines = g_travellers.event.board[tindex].traveller_line;

	for (k=0;k<tlines.length;k++)
	{
		var tline = tlines[k];
		var x = tline.ns_pair_number;

		if (((info.pair_number==tline.ns_pair_number)&&((info.direction==1)||info.singleWinner)))
		{
			result.direction = 1;
			result.tline = tline;
			return result;
		}
		else if (((info.pair_number==tline.ew_pair_number)&&((info.direction==2)||info.singleWinner)))
		{
			result.direction = 2;
			result.tline = tline;
			return result;
		}
	}

	return null;
}

function showRanking()
{
	var str = g_title;

	var sessInfo = getSessionInfo();

		// If all pair numbers are recorded as NS pairs, then pair numbers are unique, so we can tell which direction they played
	if ((g_eventType=="Teams")&&!sessInfo.singleWinner)
		str = str + "<br><span style=\"font-size;12px;color:#ff4444;\">Calculated cross imp ranking for individual pairs (assumes NS and EW pairs do not switch direction during the event)</span>";

	const clean = DOMPurify.sanitize(str, { RETURN_DOM_FRAGMENT: true });
	document.getElementById("titleText").replaceChildren(clean); //innerHTML = str;
	$("#ranking").show();
	$("#rcheckdiv").show();
}

function hideRanking()
{
	const clean = DOMPurify.sanitize(g_title, { RETURN_DOM_FRAGMENT: true });
	document.getElementById("titleText").replaceChildren(clean); //innerHTML = g_title;
	
	$("#ranking").hide();
	$("#rcheckdiv").hide();
}

function changeCurrentPair(pair,direction)
{
	getRankingInfo();

	var data = getPairObject(g_hands.pair_number,g_hands.direction,g_rankInfo.rankNS,g_rankInfo.rankEW);

	if (data!=null)
	{
			// find which radio button is checked, out of the direction buttons
		var button = document.getElementById("pdiroptNW");
		if (button.checked)
			data.dirChoice = button;
		else
		{
			button = document.getElementById("pdiroptNE");
			if (button.checked) data.dirChoice = button;
			else
			{
				data.dirChoice = document.getElementById("pdiroptSE");
			}
		}
	}

	g_hands.pair_number = pair;
	g_hands.direction = direction;

	data = getPairObject(g_hands.pair_number,g_hands.direction,g_rankInfo.rankNS,g_rankInfo.rankEW);

		// Possibly direction is incorrect, so reverse it. If caller consistently supplies wrong direction, but same pair number range is used
		// NS and EW, then this cannot be detected.
	if (data==null)
	{
		if (g_hands.direction==1) g_hands.direction = 2;
		else g_hands.direction = 1;

		data = getPairObject(g_hands.pair_number,g_hands.direction,g_rankInfo.rankNS,g_rankInfo.rankEW);
	}

	if (g_currentTraveller!=null)
	{
		g_currow = getRowFromTraveller(g_hands.pair_number,g_hands.direction);
		if (g_currow==-1) g_currow = 0;
	}

	if ((typeof data.dirChoice)!="undefined")
	{
		data.dirChoice.checked = true;
	}
}

function setClickFunctionForNames(cell,pair,direction)
{
	cell.onclick = function(){log("operation=selectScorecardForNamedPair");changeCurrentPair(pair,direction);setDefaultContracts();setupScorecard();};
}

function setupRankingTable(table,dir,rankInfo,winners)
{
	var i,j;
	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);
	var rangeMax = -32767;
	var rangeMin = 32767;

	if (g_eventType!="Teams")
	{
		if (dir=="NS")
		{
			pairs = rankInfo.rankNS;
		}
		else
		{
			pairs = rankInfo.rankEW;
		}
	}
	else
	{
		pairs = rankInfo.rankCombined;
	}

	var rows = table.rows;

	if ((g_scoring=="IMP")||(g_scoring=="VP"))	// Change Percentage Column Header
	{
		switch(language)
		{
			case "de":
				rows[0].cells[3].textContent = "Punkte";
				break;
			default:
				rows[0].cells[3].textContent = "Points";
		}

		for (i=0;i<g_travellers.event.participants.pair.length;i++)
		{
			var tvalue;

			if (g_eventType!="Teams")
				tvalue = g_travellers.event.participants.pair[i].total_score;
			else
				tvalue = g_travellers.event.participants.pair[i].crossImpsPerBoard;

			if (tvalue!="")
			{
				tvalue =Number(tvalue);

				if (!Number.isNaN(tvalue))
				{
					if (tvalue<rangeMin) rangeMin = tvalue;
					if (tvalue>rangeMax) rangeMax = tvalue;
				}
			}
		}
	}

	var cellOffset = 0;

	if (g_eventType=="Teams")
	{
		rows[0].cells[3].textContent = "Total XImps";
		rows[0].cells[4].textContent = "Bds";
		cellOffset = 2;	// Allow for extra column which has been inserted.
	}

	var shaded = 0;

	for (i=0;i<pairs.length;i++)
	{
		if (pairs[i].boardsPlayed==0) continue;

		table.insertRow(-1);
		var row = table.rows[table.rows.length-1];

		if (shaded!=0)
		{
			row.className = "results_tr_grey";
			shaded = 0;
		}
		else
		{
			shaded = 1;
		}

		for (j=0;j<6+cellOffset;j++)
		{
			row.insertCell(-1);
		}

		if (g_eventType!="Teams")
			row.cells[0].innerHTML = pairs[i].samePosition + pairs[i].position;
		else
		{
			row.cells[0].innerHTML = pairs[i].samePosition + pairs[i].crossImpsPosition;
		}

		row.cells[0].style.textAlign = "right";

		row.cells[1].innerHTML = pairs[i].pair;

		var direction = 1;

		if (dir=="EW") direction = 2;

		if (g_eventType!="Teams")
		{
			if (((dir=="NS")&&((info.direction==1)||info.singleWinner))&&pairs[i].pair==info.pair_number)
			{
				row.cells[2].style.backgroundColor = "pink";
			}

			if (((dir=="EW")&&(info.direction==2))&&pairs[i].pair==info.pair_number)
			{
				row.cells[2].style.backgroundColor = "pink";
			}
		}
		else
		{
			if ((pairs[i].pair==info.pair_number)&&(pairs[i].direction==g_hands.direction))
				row.cells[2].style.backgroundColor = "pink";
		}

		var pairInfo = getPlayerInfo(pairs[i].pair,pairs[i].direction);

		setClickFunctionForNames(row.cells[2],pairs[i].pair,pairs[i].direction);
		row.cells[2].innerHTML = pairInfo.player1 + " & " + pairInfo.player2;
		row.cells[2].style.textAlign="left";
		row.cells[2].className = "myLink";

		if (g_eventType!="Teams")
		{
			if (g_validPercentageFields)
				row.cells[3+cellOffset].innerHTML = pairs[i].percentage;
			else
				row.cells[3+cellOffset].innerHTML = Number(pairs[i].total_score).toFixed(2);
		}
		else
		{
			row.cells[3].innerHTML = (Number(pairs[i].totalCrossImps)).toFixed(2);
			row.cells[3].style.textAlign = "right";
			row.cells[4].innerHTML = pairs[i].crossImpsBoardsPlayed;
			row.cells[4].style.textAlign = "right";
			row.cells[4].style.borderRight = "1px solid black";
			row.cells[3+cellOffset].innerHTML = (Number(pairs[i].crossImpsPerBoard)).toFixed(2);
		}

		var backColor = "#6666FF";

		if ((g_validPercentageFields)&&(g_eventType!="Teams"))	// Sometimes percentage field is erroneously non-blank for Teams
		{
			var width = (100*pairs[i].percent.toFixed(0))/100;
			width = width + "px";
			var pbar = "<div style=\"float:left;align:left;width:100px;min-width;100px;max-width:100px;height:16px;border:none;background-color:white;\">";
			pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\">";
			pbar = pbar + "</div></div>";

			row.cells[4+cellOffset].style.minWidth = "100px";
			row.cells[4+cellOffset].innerHTML = pbar;
			row.cells[4+cellOffset].style.backgroundColor = "white";
		}
		else
		{
			var width;

			if (g_eventType=="Teams")
				width = ((100*(pairs[i].crossImpsPerBoard - rangeMin))/(rangeMax - rangeMin)).toFixed(0);
			else
				width = (100*(pairs[i].total_score - rangeMin).toFixed(0))/(rangeMax - rangeMin);

			if (width<1) width = 1;	// Fudge factor so that we always see a minimal bar (otherwise bar chart looks as though entry is missing)

			width = width + "px";
			var pbar = "<div style=\"float:left;align:left;width:100px;min-width;100px;max-width:100px;height:16px;border:none;background-color:white;\">";
			pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\">";
			pbar = pbar + "</div></div>";

			row.cells[4+cellOffset].style.minWidth = "100px";
			row.cells[4+cellOffset].innerHTML = pbar;
			row.cells[4+cellOffset].style.backgroundColor = "white";

		}

		var nboards = pairs[i].boardsPlayed;
		var pbar = "<div style=\"float:left;align:left;width:141px;min-width;141px;max-width:141px;height:16px;border:none;background-color:white;\">";

		var dd = pairs[i].dd;

		var backColor = "#00CC00";	// Green
		var width = (140*dd.ddOverH)/(nboards);
		width = width + "px";
		pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\"></div>";


		var backColor = "#88FF88";	// Light Green
		var width = (140*dd.ddEqualsH)/(nboards);
		width = width + "px";
		pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\"></div>";

		var backColor = "#FF0000";	// Red
		var width = (140*dd.ddUnderH)/(nboards);
		width = width + "px";
		pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\"></div>";

		var backColor = "#ccccff";	// Light Blue
		var width = (140*dd.ddUnknown)/(nboards);
		width = width + "px";
		pbar = pbar + "<div style=\"float:left;position:absolute:top:0px;left:0px;height:100%;width:" + width + ";min-width:" + width + ";max-width:" + width + ";background-color:" + backColor + ";\"></div>";

		pbar = pbar + "</div>";

		row.cells[5+cellOffset].style.minWidth = "100px";
		row.cells[5+cellOffset].innerHTML = pbar;
		row.cells[5+cellOffset].style.backgroundColor = "white";

/*		row.insertCell(-1);

		var str="";

		str += getPlayerAcc(pairInfo.player1) + "/";
		str += getPlayerAcc(pairInfo.player2);

		row.cells[row.cells.length-1].innerHTML = str;*/
	}
}


