function findPlayedCardDir(bindex,card)
{
	var suits = "SHDC";
	var curBoard = g_hands.boards[bindex];
	var deal = curBoard.Deal;
	var i,suitIndex;

	var suit = card.toUpperCase().charAt(0);
	var value = card.toUpperCase().charAt(1);

	suitIndex = suits.indexOf(suit);

	for (i=0;i<4;i++)
	{
		var holding = deal[i].split(".");

		if (holding[suitIndex].indexOf(value)!=-1)
			return i; //0,1,2,3 = N,E,S,W
	}

	return -1;
}

function calculateTricks(bindex)
{
	var sequence = "23456789TJQKA";
	var trumpSuit;
	var i,j;
	var nstricks = 0;
	var ewtricks = 0;
	var tricks;
	var tricksuit,card;
	var winnerDir = -1;
	var contract = g_hands.boards[bindex].Contract;

	if (validContract(contract))
	{
			// Get trump suit
		trumpsuit = contract.charAt(1).toUpperCase();

		var curBoard = g_hands.boards[bindex];
		var played = curBoard.Played;

		if (curBoard.Claimed=="")
		{
			if (played.length==52)
			{
				for (i=0;i<played.length-3;i=i+4)
				{
					tricksuit = played[i].charAt(0).toUpperCase();
					trickdir = findPlayedCardDir(bindex,played[i]);
					trickvalue = sequence.indexOf(played[i].charAt(1).toUpperCase());

					for (j=1;j<4;j++)
					{
						card = played[i+j];
						cardsuit = card.charAt(0).toUpperCase();
						carddir = findPlayedCardDir(bindex,card);

						if (cardsuit==tricksuit)
						{
							if (sequence.indexOf(card.charAt(1))>trickvalue)
							{
								trickvalue = sequence.indexOf(card.charAt(1));
								trickdir = carddir;
							}
						}
						else if ((trumpsuit!="N")&&(cardsuit==trumpsuit))
						{
							tricksuit = trumpsuit;	// After first ruff, subsequent cards have to be in trumpsuit to beat it
							trickvalue = sequence.indexOf(card.charAt(1));
							trickdir = carddir;
						}
					}

					if ((trickdir==0)||(trickdir==2))
						nstricks++;
					else
						ewtricks++;
				}

				if ((curBoard.Declarer=="N")||(curBoard.Declarer=="S"))
					tricks = nstricks;
				else
					tricks = ewtricks;
			}
			else
			{
				return "";
			}
		}
		else
		{
			tricks = curBoard.Claimed;
		}

		var target = Number(contract.charAt(0)) + 6;

		if (tricks==target)
			return "";
		else if (tricks>target)
			return "+" + (tricks-target);
		else
			return tricks-target;
	}
}