function getPBNSegment(data)
{
		// Return information for one board from the PBN data and also remove these lines from the original array
	var i;

	for (i=0;i<data.length;i++)
	{
		if (data[i].trim().length==0)
			break;
	}

		//Return rows up to and including i, and remove them from the data array,
	return data.splice(0,i+1);
}

function getLineNotes(data,s) // read Notes (explanation for alerts)
{		// Used by pbnToJson function
	var line;
	var i;
	var noteNr;
	var notes = [];
	var found = 0;

	for (i=0;i<data.length;i++)
	{
		line = data[i];
		var pos = line.indexOf(s);

		if (pos!=-1)
		{
			found = 1;

			line = line.replaceAll("\\\"","");

			line = line.substring(s.length);
			pos = line.indexOf('"');
			line = line.substring(pos+1);
			pos = line.indexOf('"');
			line = line.substring(0,pos);

			noteNr = line.substring(0,1);
			pos = line.indexOf(':');
			line = line.substring(pos+1);

			notes[noteNr] = line;
		}

	}
	if (found==1) {
		return notes;
	} else {
		return null;
	}
}

function getLineFull(data,s,pre) // read multi line data (Auction and Play in pbn)
{
	// Used by pbnToJson function
	var line;
	var rline = "";
	var i;

	for (i=0;i<data.length;i++)
	{
		line = data[i];
		var pos = line.indexOf(s);

		if (pos!=-1)
		{
			i++;
			line = data[i];
			while ( typeof line != 'undefined' && (line.substring(0,1)!="[") && (line !=""  )){
				//if (i+1<data.length) i++;
				if (pre)
				{
					rline = rline + "<br>" + data[i];
				} else {
					rline = rline + " " + data[i];
				}

				i++;
				line = data[i];
			}

			return rline;
		}
	}
	return "";
}

function getLine(data,s,resetFlag)
{
		// Used by pbnToJson function
	var line;
	var i;

	for (i=0;i<data.length;i++)
	{
		line = data[i];
		var pos = line.indexOf(s);

		if (pos!=-1)
		{
			line = line.substring(s.length);
			pos = line.indexOf('"');
			line = line.substring(pos+1);
			pos = line.indexOf('"');
			line = line.substring(0,pos);
			if (!resetFlag) data.splice(0,i+1);

			if (line!="?" && line!=""){
				return line;
			} else {
				return null;
			}
			return line;
		}
	}

	return null;
}

function evaluateTrickWinner(chronoTrick, trumpSuit)
{
		// chronoTrick: 4 card tokens (e.g. "CA") in the actual order they were played, leader first.
		// trumpSuit: "C","D","H","S", or "N" for no-trump.
		// Returns the 0..3 offset (from the leader) of the winning card.
	var rankOrder = "23456789TJQKA";

	function isTrumpCard(card) { return (trumpSuit!=="N") && (card.charAt(0)===trumpSuit); }
	function rank(card) { return rankOrder.indexOf(card.charAt(1)); }

	var winIdx = 0;

	for (var i=1;i<4;i++)
	{
		var cur = chronoTrick[i];
		var win = chronoTrick[winIdx];

		if (isTrumpCard(cur) && !isTrumpCard(win))
			winIdx = i;	// trump always beats a non-trump card
		else if (isTrumpCard(cur)===isTrumpCard(win))
		{
				// Both trump, or both not: only relevant if following the same suit as the current winner
			if ((cur.charAt(0)===win.charAt(0)) && (rank(cur)>rank(win)))
				winIdx = i;
		}
			// else: cur is a non-trump card of a different suit than the current winner - can never win
	}

	return winIdx;
}

function reorderPlaySequence(rawTokens,firstLeader,contract)
{
		// PBN "Export Format" [Play] data uses fixed table-position columns: column k of every
		// trick-row always represents the same seat (the rotation starting at firstLeader), NOT
		// "whoever leads this particular trick". "-" marks a position not (yet) played in an
		// unfinished last trick. The rest of this application (replay, calculateTricks, etc.)
		// expects the cards in true chronological play order (actual leader first, per trick),
		// so this re-derives that order by tracking who actually wins - and therefore leads - each trick.
	var clockwise = "NESW";

	if ((clockwise.indexOf(firstLeader)===-1) || !validContract(contract))
		return rawTokens;	// Not enough information to reorder safely - return unchanged.

	var trumpSuit = contract.charAt(1);	// "N" for NT contracts ("3NT" etc.), else C/D/H/S
	var startPos = clockwise.indexOf(firstLeader);
	var slotIdentities = [0,1,2,3].map(function(k){ return clockwise.charAt((startPos+k)%4); });

	var result = [];
	var currentLeader = firstLeader;

	for (var t=0; t*4<rawTokens.length; t++)
	{
		var trickTokens = rawTokens.slice(t*4,t*4+4);
		var leaderSlotIdx = slotIdentities.indexOf(currentLeader);

		var chronoTrick = [];
		for (var k=0;k<4;k++)
		{
			var tok = trickTokens[(leaderSlotIdx+k)%4];
			if ((tok!==undefined) && (tok!=="-")) chronoTrick.push(tok);
		}

		result = result.concat(chronoTrick);

		if (chronoTrick.length===4)
		{
			var winOffset = evaluateTrickWinner(chronoTrick,trumpSuit);
			currentLeader = clockwise.charAt((clockwise.indexOf(currentLeader)+winOffset)%4);
		}
		else
			break;	// Incomplete trick - nothing more to reorder.
	}

	return result;
}

function convertHand(cards,hand)
{
	var str = "";
	var suits = "SHDC";
	var values = "23456789TJQKA";
	var suitIndex = 0;
	var currentHand = [];
	var i,j;

	for (i=0;i<4;i++)
	{
		currentHand[i] = [];

		for (j=0;j<13;j++)
			currentHand[i][j] = 0;
	}

	for (i=0;i<hand.length;i++)
	{
		var cchar = hand.charAt(i);

		if ((cchar=='S')||(cchar=='H')||(cchar=='D')||(cchar=='C'))
		{
			suitIndex = suits.indexOf(cchar);
			if (cchar!='S') str = str + ".";
		}
		else
		{
			currentHand[suitIndex][values.indexOf(cchar)] = 1;
			cards[suitIndex][values.indexOf(cchar)] = 1;
		}
	}

	str = "";

	for (i=0;i<4;i++)
	{
		for (j=12;j>=0;j--)
		{
			if (currentHand[i][j]!=0)
				str = str + values.charAt(j);
		}

		if (i!=3)
			str = str + ".";
	}

	return str;
}

function inferHand(cards)
{
	var suits = "SHDC";
	var values = "23456789TJQKA";
	var suitIndex = 0;
	var hand = "";
	var i,j;

	for (i=0;i<4;i++)
	{
		hand = hand + suits.charAt(i);

		for (j=0;j<13;j++)
		{
			if (cards[i][j]==0)
			{
				hand = hand + values.charAt(j);
			}
		}
	}

	return convertHand(cards,hand);
}

function stripComments(fileData)
{
	var outData = "";
	var inbComment = false; // for comments preceded by a curly bracket
	var insComment = false; // for comments preceded by a semicolon
	var bJustEnded = false;
	var escChar = true;
	var i;

	for (i=0;i<fileData.length;i++)
	{
		var c = fileData.charAt(i);

		if (bJustEnded)
		{
			bJustEnded = false;

			if (c=="\n")
			{
						// Don't write new line terminator if removing comment has left an empty line.
				if ((outData.length!=0)&&(outData.charAt(outData.length-1)!="\n"))
					outData += "\n";

				escChar = true;
				continue;
			}
		}

		if (insComment)
		{
			if (c=="\n")
			{
				insComment = false;

					// Don't write new line terminator if removing comment has left an empty line.
				if ((outData.length!=0)&&(outData.charAt(outData.length-1)!="\n"))
					outData += "\n";

				escChar = true;
				continue;
			}
		}

		if (inbComment)
		{
			if (c=="}")
			{
				inbComment = false;
				bJustEnded = true;
				escChar = false;
				continue;
			}
		}

		if ((!inbComment)&&(!insComment))
		{
			if ((c==';')&&escChar)
				insComment = true;
			else if ((c=='{')&&escChar)
				inbComment = false; //inbComment = true; //KK: To keep comments preceded with a curly bracket, used in [Result ""] as Explanations for the board
			else
			{
				outData += c;

				if ((c==' ')||(c=='\n'))
					escChar = true;
				else
					escChar = false;
			}
		}
	}

	return outData;
}