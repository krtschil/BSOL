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

function ddComparisonAll()
{
	var i,j,k;
	var rankInfo = getRankingInfo();
	var singleWinner = rankInfo.sessInfo.singleWinner;

	var ddNS = [];
	var ddEW = [];

	for (i=0;i<rankInfo.rankNS.length;i++)
	{
		var data = {};
		data.pair = rankInfo.rankNS[i].pair;
		data.ddUnderH = 0;
		data.ddOverH = 0;
		data.ddEqualsH = 0
		data.ddUnknown = 0;
		ddNS[data.pair] = data;
	}

	for (i=0;i<rankInfo.rankEW.length;i++)
	{
		var data = {};
		data.pair = rankInfo.rankEW[i].pair;
		data.ddUnderH = 0;
		data.ddOverH = 0;
		data.ddEqualsH = 0;
		data.ddUnknown = 0;
		ddEW[data.pair] = data;
	}

		// Fill in contract, lead card, declarer in all hand records.
	for (j=0;j<g_hands.boards.length;j++)
	{
		for (i=0;i<g_travellers.event.board.length;i++)
		{
			if (g_travellers.event.board[i].board_no==g_hands.boards[j].board)
			{
				var tlines = g_travellers.event.board[i].traveller_line;

				for (k=0;k<tlines.length;k++)
				{
					var tline = tlines[k];

					var ddUnknown = true;

					if (tline.tricks!="")
					{
						var ddmakeable = getMakeableTricksForContract(j,tline.contract,tline.played_by);

						if (ddmakeable>=0)
						{
							ddUnknown = false;

							var declarerOverTricks = tline.tricks - ddmakeable;
							var defenceOverTricks = -declarerOverTricks;
							var relTricks = tline.tricks - ddmakeable;

							var ETFMode = document.getElementById("ETFMode");

							if (ETFMode!=null)
							{
								if (ETFMode.selectedIndex==1)
								{
									var ltricks = getMakeableTricksForLead(j,tline);

									if (ltricks!=null)
										declarerOverTricks = tline.tricks - ltricks;
								}
							}

							var nsDeclarer = true;

							if ((tline.played_by=="E")||(tline.played_by=="W"))
								nsDeclarer = false;

							var pair = tline.ns_pair_number;
							var nsOverTricks = declarerOverTricks;

							if (!nsDeclarer) nsOverTricks = defenceOverTricks;

							if (nsOverTricks==0) ddNS[pair].ddEqualsH++;
							else if (nsOverTricks<0) ddNS[pair].ddUnderH++;
							else ddNS[pair].ddOverH++;

							pair = tline.ew_pair_number;
							var ewOverTricks = declarerOverTricks;

							if (nsDeclarer) ewOverTricks = defenceOverTricks;

							if (singleWinner)
							{
								if (ewOverTricks==0) ddNS[pair].ddEqualsH++;
								else if (ewOverTricks>0) ddNS[pair].ddOverH++;
								else ddNS[pair].ddUnderH++;
							}
							else
							{
								if (ewOverTricks==0) ddEW[pair].ddEqualsH++;
								else if (ewOverTricks>0) ddEW[pair].ddOverH++;
								else ddEW[pair].ddUnderH++;
							}
						}
					}

					if (played(tline)&&ddUnknown)	// Passed, percentage awarded or no data for double dummy contract
					{
						var pair = tline.ns_pair_number;

						if ((typeof ddNS[pair])!="undefined")	// Pair is a valid pair because it's in the ranking table
							ddNS[pair].ddUnknown++;

						pair = tline.ew_pair_number;

						if (!singleWinner)
						{
							if ((typeof ddEW[pair])!="undefined") ddEW[pair].ddUnknown++;
						}
						else
						{
							if ((typeof ddNS[pair])!="undefined") ddNS[pair].ddUnknown++;
						}
					}
				}
			}
		}
	}

	for (i=0;i<rankInfo.rankNS.length;i++)
	{
		rankInfo.rankNS[i].dd = ddNS[rankInfo.rankNS[i].pair];
	}

	for (i=0;i<rankInfo.rankEW.length;i++)
	{
		rankInfo.rankEW[i].dd = ddEW[rankInfo.rankEW[i].pair];
	}

	return rankInfo;
}

function checkHigherScoringPairs(traveller,prow,direction)
{
	var i,j;
	var result = {};
	var dirs = "NSEW";
	var suits = "CDHSN";
	result.playedSameSuit = 0;
	result.moreTricks = 0;
	result.moreTricksAtSameLevel = 0;
	result.bidGame = 0;
	result.bidAndMadeGame = 0;
	result.bidSmallSlam = 0;
	result.bidAndMadeSmallSlam = 0;
	result.bidGrandSlam = 0;
	result.bidAndMadeGrandSlam = 0;
	result.wereDoubled = 0;
	result.madeDoubled = 0;
	result.otherSuit = 0;
	result.defended = 0;
	result.declarer = 0;
	result.bidLowerLevel = 0;
	result.contractType = 0;
	result.matrix = [];

	for (i=0;i<4;i++)
	{
		result.matrix[i] = [];

		for (j=0;j<5;j++)
			result.matrix[i][j] = 0;
	}

	switch(language)
	{
		case "de":
			var ew = "OW";
			break;
		default:
			var ew = "EW";
	}

	var sign = 1;

	if (direction==2) sign = -1;

	var tline = traveller[prow];
	var score = Number(tline.score);
	var contract = tline.contract;
	var suit = contract.charAt(1);
	var level = Number(contract.charAt(0));
	var tricks = Number(tline.tricks);
	var ourctype = getContractType(contract).ctype;

	result.contractType = ourctype;

	for (i=0;i<traveller.length;i++)
	{
		var curLine = traveller[i];

		if ((i!=prow)&&(curLine.ns_pair_number!=""))
		{
				// was suit and direction the same ?
			var curContract = curLine.contract;
			var curSuit = curLine.contract.charAt(1);
			var curLevel = Number(curLine.contract.charAt(0));
			var curTricks = Number(curLine.tricks);
			var curDirection = 1;

			result.matrix[dirs.indexOf(curLine.played_by)][suits.indexOf(curSuit)]++;

			if (ew.indexOf(curLine.played_by)!=-1)
				curDirection = 2;

			if ((direction==curDirection)&&(suit==curSuit)) result.playedSameSuit++;

			var diff = (Number(curLine.score) - score)*sign;

			if (diff>0)		// they did better, why ?
			{
				result.declarer++;

				if (direction==curDirection)
				{
					if (suit!=curSuit)	// their contract was in a different suit
						result.otherSuit++;
					else
					{
						if (curTricks>tricks)
							result.moreTricks++;

						var cres = getContractType(curContract);
						var ctype = cres.ctype;

						if (ctype==ourctype)
						{
							if (curTricks>tricks) result.moreTricksAtSameLevel++;
						}
						else if (ctype>ourctype)
						{
							if (ctype==1)
							{
								result.bidGame++;

								if (curTricks>=(curLevel+6)) result.bidAndMadeGame++;
							}
							else if (ctype==2)
							{
								result.bidSmallSlam++;

								if (curTricks>=(curLevel+6)) result.bidAndMadeSmallSlam++;
							}
							else
							{
								result.bidGrandSlam++;

								if (curTricks>=(curLevel+6)) result.bidAndMadeGrandSlam++;
							}
						}
						else if ((curContract.indexOf("x")!=-1)||(curContract.indexOf("*")!=-1))
						{
							result.wereDoubled++;

							if (curTricks>=(curLevel+6)) result.madeDoubled++;
						}
						else if (curTricks<=tricks)
						{
							if (curLevel<level)
								result.bidLowerLevel++;
						}
					}
				}
				else
				{
					result.defended++;
				}
			}
		}
	}

//	var result = getHighestScoringMakeableContractForDirection(direction,g_hands.boards[g_lastBindex].Vulnerable);

	return result;
}

function setupRanking(keepScrollSetting)
{
	g_sessionMode = "ranking";
	setButtonColor();

	hideAllPopups();
	$("#scoreandtraveller").hide();
	$("#scores").hide();
	$("#comparison").hide();
	$("#checkListDiv").hide();
	$("#abuttons").show();

	setCurrentTraveller();

	if (keepScrollSetting===undefined) window.scroll(0,0);

	var sessInfo = getSessionInfo();
	var table = document.getElementById("rankingNS");
	var rows = table.rows;
	var winners = 2;

	if (sessInfo.singleWinner) winners = 1;

	var rankInfo = getRankingInfo();

	ddComparisonAll();

	if (table.rows[0].cells.length==5)
		colcount = 6;
	else
		colcount = 8;

	switch(language)
	{
		case "de":
			table.rows[0].cells[2].textContent = "Spieler";	// Change column heading that was in event.htm
			break;
		default:
			table.rows[0].cells[2].textContent = "Players";
	}

	if (g_eventType=="Teams") table.rows[0].cells[1].textContent = "Team";

	while (rows.length>1) table.deleteRow(-1);

	if (g_eventType=="Teams")
	{
		if (rows[0].cells.length==5)
		{
			rows[0].insertCell(3);
			rows[0].insertCell(3);
		}

		rows[0].cells[3].outerHTML = "<th>Total XImps</th>";
		rows[0].cells[4].outerHTML = "<th>Boards</th>";
		cellOffset = 2;	// Allow for extra column which has been inserted.
		rows[0].cells[3 + cellOffset].textContent = "XImps/Board";
	}

	if ((winners!="1")&&(g_eventType!="Teams"))
	{
			// Add extra heading row (avoids changing event.htm which might cause temporary caching issue)
		table.insertRow(-1);
		var row = table.rows[table.rows.length-1];
		var cell = document.createElement("th");
		row.appendChild(cell);
		row.cells[0].textContent = "North/South";
		row.cells[0].colSpan = colcount;
	}

	setupRankingTable(table,"NS",rankInfo,winners);

	//var rankingHeader = document.getElementById("rankingHeader");

	if ((winners!="1")&&(g_eventType!="Teams"))
	{
		table.insertRow(-1);
		var row = table.rows[table.rows.length-1];

		var cell = document.createElement("th");
		row.appendChild(cell);
		cell.colSpan = colcount;
		cell.textContent = "East/West";

		setupRankingTable(table,"EW",rankInfo,winners);
	}

	showRanking();
	$("#comparison").hide();
	$("#checkListDiv").hide();
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

function setupScorecard(keepScrollSetting)
{
	g_sessionMode = "scorecard";
	setButtonColor();

	hideAllPopups();
	hide("scoreandtraveller");
	$("#abuttons").show();

	setCurrentTraveller();

	if (keepScrollSetting===undefined) window.scroll(0,0);

	var j,n;
	var sessInfo = getSessionInfo();

		// Make sure pair number is valid, so that something is displayed even if none was supplied.
	if (g_hands.pair_number=="")
	{
		g_hands.pair_number = g_travellers.event.participants.pair[0].pair_number;

		if (g_travellers.event.participants.pair[0].direction=="N")
			g_hands.direction = 1;
		else
			g_hands.direction = 2;

		changeCurrentPair(g_hands.pair_number,g_hands.direction);
		setDefaultContracts();
	}

	var info = getPlayerInfo(g_hands.pair_number,g_hands.direction);
	var table = document.getElementById("scoring");
	var rows = table.rows;
	var stable = document.getElementById("scoring_summary");
	var srows = stable.rows;
	var winners = 2;
	var dirStr = "NS Pair ";
	var optNE = document.getElementById("pdiroptNE").checked;
	var optNW = document.getElementById("pdiroptNW").checked;
	var optSE = document.getElementById("pdiroptSE").checked;

	if (g_hands.direction==2) dirStr = "EW Pair ";

	switch(language)
	{
		case "de":
			document.getElementById("first_player_name").innerHTML = "<span style=\"font-weight:600;\">" + "Wähle Sitzposition für " + info.player1 + ":" + "</span>";
			break;
		default:
			document.getElementById("first_player_name").innerHTML = "<span style=\"font-weight:600;\">" + "Set direction for " + info.player1 + ":" + "</span>";
	}


	if (sessInfo.singleWinner)
	{
		winners = 1;
		switch(language)
		{
			case "de":
				dirStr = "Paar ";
				break;
			default:
				dirStr = "Pair ";
		}
		$("#player_direction").show();

		var startDirection = checkInitialDirection(g_hands.pair_number);

		if (startDirection==null)
		{
			$("#optNEdiv").show();
			$("#optNWdiv").show();
			$("#optSEdiv").show();
		}
		else if (startDirection=="N")
		{
			$("#optNEdiv").show();
			$("#optNWdiv").show();
			$("#optSEdiv").hide();

			if ((!optNE)&&(!optNW))
			{
				document.getElementById("pdiroptNE").checked = true;
				optNE = true;
			}
		}
		else	// Must be "E"
		{
			$("#optNEdiv").show();
			$("#optSEdiv").show();
			$("#optNWdiv").hide();

			if ((!optNE)&&(!optSE))
			{
				document.getElementById("pdiroptNE").checked = true;
				optNE = true;
			}
		}
	}
	else
	{
		$("#player_direction").hide();
	}

	while (srows.length>1) stable.deleteRow(-1);

	switch(language)
	{
		case "de":
			if (g_scoring=="IMP") rows[1].cells[6+g_ofs].textContent = "Punkte";
			if (g_eventType=="Teams") rows[1].cells[6+g_ofs].textContent = "Cross Imps";
			break;
		default:
			if (g_scoring=="IMP") rows[1].cells[6+g_ofs].textContent = "Points";
			if (g_eventType=="Teams") rows[1].cells[6+g_ofs].textContent = "Cross Imps";
	}

	var boards = g_travellers.event.board;

	document.getElementById("scPlayerNames2").innerHTML = info.player1 + " & " + info.player2 + " - " + dirStr + g_hands.pair_number;

	var etfRange = 0;

		// Calculate range for ETF tricks (to determine bar chart range).
	for (j=0;j<boards.length;j++)
	{
		var board = boards[j];
		var tlines = board.traveller_line;

		var i,prole,found,tdirection,declarer_pair,first;

		var opp_pair;

		for (i=0;i<tlines.length;i++)
		{
			var tline = tlines[i];

			if (info.pair_found)
			{
				prole = getPlayerAndRole(info,tline);
				found = prole.found;

				if (validContract(tline.contract))
				{
					if (played(tline))	// Otherwise board was not actually played
					{
						var overtricks = (tline.tricks - (6 + (Number(tline.contract.charAt(0)))));
						if (Math.abs(overtricks)>etfRange) etfRange = Math.abs(overtricks);
					}
				}
			}
		}
	}

	if (etfRange<4) etfRange = 4;	// Make this the minimum range for graph. Usually, overtricks and undertricks will not be higher than this.

	setupScorecard2(table,stable,boards,info,sessInfo,etfRange,false);

	var optRoles = (document.getElementById("sortMode").selectedIndex==0);

	if (!optRoles) setupScorecard2(table,stable,boards,info,sessInfo,etfRange,true);	// Display table sorted by board number

	$("#scores").show();
	hideRanking();
	$("#comparison").hide();
	$("#checkListDiv").hide();
}


