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