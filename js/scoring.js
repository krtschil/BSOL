function validContract(contract)
{
	var levels = "1234567";
	var suits = "CDHSN";

	if (contract==null) return false;
	if (contract.length<2) return false;

	if (levels.indexOf(contract.charAt(0))==-1) return false;
	if (suits.indexOf(contract.charAt(1))==-1) return false;

	return true;
}

function convertParContract(str)
{
	if (str.length<=2) return str;

	var firstNum = Number(str.charAt(0));
	var lastNum = Number(str.charAt(str.length-2));
	var diff = lastNum-firstNum;
	str = str.charAt(0) + str.charAt(str.length-1) + "+" + diff;
	return str;
}

function convertParContractString(str)
{
	var result="";
	var idx = 0;

	while (idx<str.length)
	{
		var ch = str.charAt(idx);
		if (!Number.isNaN(parseInt(ch,10)))
		{
			var firstIdx = idx;

			idx++;

			while (idx<str.length)
			{
				ch = str.charAt(idx);
				if (!Number.isNaN(parseInt(ch,10)))
				{
					idx++;
				}
				else
					break;
			}

			idx++;
			result = result + convertParContract(str.substring(firstIdx,idx));
		}
		else
		{
			result = result + str.charAt(idx);
			idx++;
		}
	}

	return result;
}

function getContractType(contract)
{
	var result = {};
	result.ctype = 0;	// assume part score
	result.str = "a part score";
	var minor = "CD";
	var major = "HS";
	var nt = "N";
	var level = Number(contract.charAt(0));
	var suit = contract.charAt(1);

	switch(language)
	{
		case "de":
			if (level==7)
			{
				result.ctype = 3;
				result.str = "ein Großschlemm";
				return result;
			}

			if (level==6)
			{
				result.ctype = 2;
				result.str = "ein Kleinschlemm";
				return result;
			}

			if (((level==5)&&(minor.indexOf(suit)!=-1))||((level>=4)&&(major.indexOf(suit)!=-1))||((level>=3)&&(nt==suit)))
			{
				result.ctype = 1;
				result.str = "Vollspiel";
				return result;
			}
			break;
		default:
			if (level==7)
			{
				result.ctype = 3;
				result.str = "a grand slam";
				return result;
			}

			if (level==6)
			{
				result.ctype = 2;
				result.str = "a small slam";
				return result;
			}

			if (((level==5)&&(minor.indexOf(suit)!=-1))||((level>=4)&&(major.indexOf(suit)!=-1))||((level>=3)&&(nt==suit)))
			{
				result.ctype = 1;
				result.str = "game";
				return result;
			}
	}

	return result;	// Part Score;
}

function comparePairNumbers(a,b)
{
	if ((!Number.isNaN(a))&&(!Number.isNaN(b)))	// The pair numbers are wholly numeric
	{
		a = Number(a);
		b = Number(b);
		if (b<a) return 1;
		else if (b==a) return 0;
		else return -1;
	}

	if ((a.indexOf("-")!=-1)||(b.indexOf("-")!=-1))	// Hyphenated pair number for team-player1-player2
	{
		a = a.split("-");
		b = b.split("-");

		if (a.length!=b.length) return 0;

		var i;

		for (i=0;i<a.length;i++)
		{
			if (Number.isNaN(a[i])||Number.isNaN(b[i])) return 0;
			var result = comparePairNumbers(a[i],b[i]);
			if (result!=0) return result;
		}

		return 0;
	}

		// The pair numbers contain a letter (is it a prefix or a suffix ?)
	if ((b.charAt(0)>'9')||(a.charAt(0)>'9')) // ACBL Score style (prefix letter)
	{
		if (b.charAt(0)<a.charAt(0)) return 1;
		else if (b.charAt(0)>a.charAt(0)) return -1;

		a = a.substring(1);
		b = b.substring(1);

		if ((a.length>0)&&(b.length>0))
			return comparePairNumbers(a,b);
		else return 0;
	}
	else	// Scorebridge style with prefix letter last.
	{
		if (b.substring(b.length-1)<a.substring(a.length-1)) return 1;
		else if (b.substring(b.length-1)>a.substring(a.length-1)) return -1;

		a = a.substring(0,a.length-1);
		b = b.substring(0,b.length-1);

		if ((a.length>0)&&(b.length>0))
			return comparePairNumbers(a,b);
		else return 0;
	}
}

function makeColor(value)
{
	var r = 64 + Math.round((1-value)*192);
	var g = 64 + Math.round(value*192);
	var diff = g-r;

	if (diff<0) diff = -diff;

	r = Math.round(r+(192-diff)*r/192);
	g = Math.round(g+(192-diff)*g/192);

	var color = "rgb(" + r + "," + g + ",0)";
	return color;
}

function convertAdjustmentToCrossImps(tline,dir)
{
	var nssc1 = tline.score;
	var ewsc1 = tline.score;

	if (nssc1.toString().charAt(0)=="A")
	{
		nssc1 = nssc1.toString().substring(1,3);
		ewsc1 = ewsc1.toString().substring(3,5);
	}
	else
	{
		nssc1 = tline.ns_score.toString().replace("%","");
		ewsc1 = ewsc1.ew_score.toString().replace("%","");
	}

	var pc = nssc1;

	if (dir==2) pc = ewsc1;

	var percent = Number(pc);
	percent = (percent - 50)/10;
	return 2*percent;
}

function isValidCrossImps(tline)
{
	var valid = true;

	if ((typeof tline.ns_cross_imp_points)!=="undefined")
		if (tline.ns_cross_imp_points==="") valid = false;

	return valid;
}

function scoreContainsAdjustment(tline)
{

	if (tline.ns_score == null) tline.ns_score = "";
	if (tline.ew_score == null) tline.ew_score = "";

	if ((tline.ns_score.toString().indexOf("%")!=-1)||(tline.ew_score.toString().indexOf("%")!=-1)||(tline.score.toString().indexOf("A")!=-1))
		return true;
	else
		return false;
}

function convertScoreToImps(score1,score2)
{
	var diff = Number(score1) - Number(score2);

	var absdiff = diff;
	if (absdiff<0) absdiff = -diff;

	var i;

	for (i=0;i<g_scoreToImps.length;i++)
	{
		var range = g_scoreToImps[i];

		if ((absdiff>=Number(range[0]))&&(absdiff<=Number(range[1])))
		{
			if (diff>=0) return Number(range[2]);
			else return -Number(range[2]);
		}
	}

	return null;
}

function returnPoints(tline,sign)
{
	var nspts = Number(tline.ns_match_points);
	var ewpts = Number(tline.ew_match_points);

	if (g_eventType=="Teams")
	{
		nspts = Number(tline.crossImpsNS);
		ewpts = Number(tline.crossImpsEW);
	}

	if (sign==-1) return ewpts;
	else return nspts;
}

function calcPercentage(tline,sign)
{
	var nspts = Number(tline.ns_match_points);
	var ewpts = Number(tline.ew_match_points);

	var percent = 100*(nspts/(nspts + ewpts));

	if (sign==-1) percent = 100 - percent;

	percent = parseFloat(Math.round(percent * 100) / 100).toFixed(0);
	return Number(percent);
}

function substituteSuitSymbol(contract)
{
		// Adjust the contract string depending on the number of tricks actually made, e.g. 11 tricks in 3NT becomes 3NT+2
		// Also inserts suit symbols in place of letters in the contract and specifies a monospaced font for displaying the contract.
	var symbolHeight = Math.floor((g_sectionHeight)/8) + "px";
	var cardSymbols = ["<img alt=\"Spade\" style=\"height:" + symbolHeight + "\" src=\"pics/spade.gif\">","<img alt=\"Heart\" style=\"height:" + symbolHeight + "\" src=\"pics/heart.gif\">","<img alt=\"Diamond\" style=\"height:" + symbolHeight + "\" src=\"pics/diamond.gif\">","<img alt=\"Club\" style=\"height:" + symbolHeight + "\" src=\"pics/club.gif\">"];
	var suit = contract.charAt(1);

	if (suit=="S")
		suit = 0;
	else if (suit=="H")
		suit = 1;
	else if (suit=="D")
		suit = 2;
	else if (suit=="C")
		suit = 3;
	else
		suit = -1;

	if (suit!=-1)
	{
		if (contract.length>2)
			return contract.charAt(0) + "<span style=\"font-size:17px;\">" + cardSymbols[suit] + "</span>" + contract.substring(2);
		else
			return contract.charAt(0) + "<span style=\"font-size:17px;\">" + cardSymbols[suit] + "</span>";
	}
	else
		return contract;
}

function calcScoreForMakeable(suit,tricks,vulnerable)
{
		// N.B This calculates basic score for a non-doubled contract.
	var suits = "CDHSN";
	var score = 0;
	var minor = false;
	var nt = false;

	var level = Number(tricks)-6;

	if (suits.indexOf(suit)==4)
		nt = true;
	else if (suits.indexOf(suit)<2)
		minor = true;

	score = 50;	// Basic score for making contract

	if (nt) score = score + 10;

	var perTrick = 20;

	if (!minor) perTrick = 30;

	score = score + level*perTrick;

	if ((nt&&level>=3)||((!minor)&&level>=4)||(minor&&(level>=5)))
	{
		if (vulnerable)
			score = score + 450;
		else
			score = score + 250;

		if (level==6)
		{
			if (vulnerable)
				score = score + 750;
			else
				score = score + 500;
		}
		else if (level==7)
		{
			if (vulnerable)
				score = score + 1500;
			else
				score = score + 1000;
		}
	}

	return score;
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

function leadCard(lead)
{
	// lead card can be supplied as, for example, AS, or SA. This function returns the value of
	// the lead card field in the AS format.
	var cards = "23456789TJQKA";
	var suit = "CHDS";
	var pvalue = lead.toUpperCase();
	pvalue = pvalue.replace("10","T");

	var validCard = true;

	if (pvalue.length!=2)
		return lead;
	else
	{
		var cvalue = pvalue.charAt(0);

		if (cards.indexOf(cvalue)==-1)	// Try reversing it to see if it's the other way around.
		{
			var c1 = pvalue.charAt(0);
			var c2 = pvalue.charAt(1);

			cvalue = c2;

			if (cards.indexOf(cvalue)==-1)	// Not this way either, just return the original
				return pvalue.replace("T","10");

			pvalue = c2 + c1;
		}

		if (suit.indexOf(pvalue.charAt(1))==-1)
			return pvalue.replace("T","10");
	}

	return pvalue.replace("T","10");
}


function getLeadsIdx(contract,declarer)
{
	var decl = "WNES";
	var suits = "NCDHS";
	var idx;

	var suit = contract.charAt(1);
	var leaderIdx = decl.indexOf(declarer);
	var suitIdx = suits.indexOf(suit);
	var idx = 4*suitIdx + leaderIdx;

	return idx;
}

function played(tline)
{
	if ((tline.ns_score=="Bye")||(tline.ew_score=="Bye")) return false;

	if (tline.contract!="NP") return true;
	else if (scoreContainsAdjustment(tline))
		return true;
	else
		return false;
}

function passed(tline)
{
	if (tline.contract=="Passed") return true;
	else return false;
}

function compareScores(tlines,ourscore,pdirection)
{
	var res = {};
	res.adjusted = 0;
	res.lower = 0;
	res.higher = 0;
	res.same = 0;
	var sign = 1;
	var i;

	if (ourscore.toString().indexOf("A")!=-1)
	{
		res.adjusted++;
		return res;
	}

	if (pdirection==2) sign = -1;

	for (i=0;i<tlines.length;i++)
	{
		var tline = tlines[i];

		if (played(tline))
		{
			var score = tline.score;
			var diff = sign*(score-ourscore);

			if (diff>0) res.higher++;
			else if (diff<0) res.lower++;
			else res.same++;
		}
	}

	res.same--;	// Deduct one for our own traveller line.

	return res;
}

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

function returnAccCount(acc,direction)
{
	direction = (direction + 2) % 4;
	return acc[direction];
}

function returnName(names,direction,firstNameOnly=true)
{
		// Direction for names array starts with South rather than North
	var namesDirection = (direction + 2) % 4;

	if (firstNameOnly)
		return names[namesDirection].split(" ")[0];	// First name only
	else
		return names[namesDirection];
}

function getCardIndex(card)
{
	if (card=="A")
	{
		return 12;
	}
	else if (card=="K")
	{
		return 11;
	}
	else if (card=="Q")
	{
		return 10;
	}
	else if (card=="J")
	{
		return 9;
	}
	else if (card=="T")
	{
		return 8;
	}
	else
	{
		return Number(card) - 2;
	}
}

function calcMCTableIndex(suit,leadDirection)
{
	var suits = "NSHDC";
	var dir = "EWSN";

	var index = 5*(dir.indexOf(leadDirection.toUpperCase())) + suits.indexOf(suit.toUpperCase());
	return index;
}

function makeDealKey(dealstr,vul,leadstr)
{
	var vulArray = ["None","All","NS","EW"];
	var idx = 0;

	for (var i=0;i<4;i++)
	{
		if (vulArray[i]==vul)
		{
			idx = i;
			break;
		}
	}

	return idx + "." + dealstr + "_" + leadstr;
}

function getTindexByName(boards,boardName)
{
		// Find the index of the hand corresponding to a particular traveller in the boards array
	var i;

	for (i=0;i<boards.length;i++)
	{
		if (boards[i].board.split(".").join("") == boardName.split(".").join(""))
		{
			return i;
		}
	}

	return -1;
}

function getTindex(boards,traveller)
{
		// Find the index of the hand corresponding to a particular traveller in the boards array
	var i;

	for (i=0;i<boards.length;i++)
	{
		if (boards[i].board == (traveller+1))
		{
			return i;
		}
	}

	return -1;
}
