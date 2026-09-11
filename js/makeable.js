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

