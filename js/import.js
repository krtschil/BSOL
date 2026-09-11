function dlmToJson(data)
{
	var dealerPattern = "NESW";
	var vulnerabilityPattern = ["None","NS","EW","All","NS","EW","All","None","EW","All","None","NS","All","None","NS","EW"];
	var cards = "AKQJT98765432";
	var hands = [];
	var quadrant = [];

		// Make sure there is a defined "trim" function (needed for IE8 and earlier)
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	  }
	}

	g_fullInfo = false;	// Board set does not contain full double dummy tricks information.

		// This routine only works for PBN files that conform to "Export Format"
	data = data.split("\n");

	var line = "";
	var outStr = "{\"boards\":[";

	var count = 0;

	var i,j,k,tmp;
	var first=1;
	var last=0;

	var j = 0;

	for (k=j;k<data.length;k++)
	{
		tmp = data[k];

		if (tmp.length==0) break;
		if (!(tmp.indexOf("From board=")==0)) continue;
		tmp = tmp.substring(11);
		first = Number(tmp);
		break;
	}

	j = k+1;

	for (k=j;k<data.length;k++)
	{
		tmp = data[k];

		if (tmp.length==0) break;
		if (!(tmp.indexOf("To board=")==0)) continue;
		tmp = tmp.substring(9);
		last = Number(tmp);
		break;
	}

	j = k+1;

	var line = "";
	var count = 0;

	for (k=j;k<data.length;k++)
	{
		tmp=data[k];

		if (tmp.length==0) break;
		if (!(tmp.indexOf("Board ")==0)) continue;

		tmp = tmp.substring(6);

		var num = tmp.substring(0,2);
		var encodedDeal = tmp.substring(3);

		if (num.charAt(0)=='0') num = num.substring(1,2);

		var boardNum = Number(num);

		if (boardNum>last) break;

		if (count!=0) outStr = outStr + ",";
		count++;

		outStr = outStr + "{\"board\":\"" + boardNum + "\",";
		outStr = outStr + "\"Dealer\":\"" + dealerPattern.charAt((boardNum-1)%4) + "\",";
		outStr = outStr + "\"Vulnerable\":\"" + vulnerabilityPattern[(boardNum-1)%16] + "\",";

		for (i=0;i<4;i++)
			hands[i] = "";

		for (i=0;i<26;i++)
		{
			var x = encodedDeal.charCodeAt(i) - 97;
			quadrant[2*i] = x>>2;
			quadrant[2*i + 1] = x&3;
		}

		for (i=0;i<52;i++)
		{
			if ((i!=0)&&((i%13)==0))
			{
				for (j=0;j<4;j++)
				{
					hands[j] = hands[j] + ".";
				}
			}

			hands[quadrant[i]] = hands[quadrant[i]] + cards.charAt(i%13);
		}

		outStr = outStr + "\"Deal\":[";

		for (i=0;i<4;i++)
		{
			outStr = outStr + "\"" + hands[i] + "\"";
			if (i!=3) outStr = outStr + ",";
		}

		outStr = outStr + "],";

		outStr = outStr + "\"DoubleDummyTricks\":\"********************\"}";
	}

	outStr = outStr + "]}";

	return outStr;
}

function writeLinHand(boardStr,dealer,vul,north,south,east,west,bids,played,claimed,pnames,pnames_g,score,explanation)
{
	var outStr = "";
	var direction = "NESW";
	var i;
	var namOffset = 0;
	var names = [];

	if ((boardStr.indexOf(".Closed")!=-1)&&(pnames_g.length==8)) namOffset = 4;

	if (pnames.length>0)
		names = pnames;
	else if (pnames_g.length>0)
	{
		for (var i=0;i<4;i++)
			names[i] = pnames_g[i+namOffset];
	}

	outStr = outStr + "{\"board\":\"" + boardStr + "\",";

	if (names.length>0)
	{
		outStr += "\"PlayerNames\":[";

		for (i=0;i<names.length;i++)
		{
			if (i!=0) outStr += ",";
			var pname = names[i].trim();
			if (pname.indexOf("~~")==0) pname = pname + " (Robot)";
			outStr += "\"" + pname + "\"";

			var entry = {};
			entry.transList = {};
			g_accTrans[pname] = entry;
		}

		outStr += "],";
	}

	outStr = outStr + "\"Dealer\":\"" + dealer + "\",";
	outStr = outStr + "\"Vulnerable\":\"" + vul + "\",";

	outStr = outStr + "\"Deal\":[";

	outStr = outStr + "\"" + north + "\"," + "\"" + east + "\"," + "\"" + south + "\"," + "\"" + west + "\"";

	outStr = outStr + "],";

	outStr = outStr + "\"Bids\":[";

	for (i=0;i<bids.length;i++)
	{
		outStr = outStr + "\"" + bids[i] + "\"";
		if (i<bids.length-1) outStr = outStr + ",";
	}

	outStr = outStr + "],";

	outStr = outStr + "\"Played\":[";

	for (i=0;i<played.length;i++)
	{
		outStr = outStr + "\"" + played[i] + "\"";
		if (i<played.length-1) outStr = outStr + ",";
	}

	outStr = outStr + "],";

	outStr = outStr + "\"Claimed\":\"" + claimed + "\",";
	outStr = outStr + "\"Score\":\"" + score + "\",";

	var contract = "";
	var doubled = false;
	var redoubled = false;

	var relPosition = 0;

	for (i=bids.length-1;i>=0;i--)
	{
		var bd = bids[i];

		bd = bd.toUpperCase();

		if ((!doubled)&&(!redoubled))
		{
			if (bd.charAt(0)=="D") doubled = true;
			if (bd.charAt(0)=="R") redoubled = true;
		}

		if ((!(bd.charAt(0)=="P"))&&(!(bd.charAt(0)=="R"))&&(!(bd.charAt(0)=="D")))
		{
			bd = bd.split("|");

			contract = bd[0];

			if (doubled) contract = contract + "x";
			if (redoubled) contract = contract + "xx";

			relPosition = i;
			break;
		}
	}

	if (!(contract==""))
	{
		var suitChar = contract.toUpperCase().charAt(1);

			// Identify who was first to bid this suit
		for (i=relPosition;i>=0;i=i-2)	// Step down by 2 because only looking at own bids and partner's bids
		{
			var bd = bids[i].toUpperCase();

			if (bd.length>1)
				if (suitChar==bd.charAt(1))
					relPosition = i;
		}
	}
	else
	{
		contract = "Passed";
	}

	var position = direction.indexOf(dealer) + relPosition;
	var declarer = "" + direction.charAt(position % 4);

	outStr = outStr + "\"Contract\":\"" + contract + "\",";
	outStr = outStr + "\"Declarer\":\"" + declarer + "\",";

	if (explanation != "")
		{
			outStr = outStr + "\"Explanation\":" + "\"" + explanation + "\",";
		}

	var doubleDummyTricks = "********************";
	outStr = outStr + "\"DoubleDummyTricks\":\"" + doubleDummyTricks + "\"}";

	return outStr;
}

function linToJson(str)
{
		// Make sure there is a defined "trim" function (needed for IE8 and earlier)
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	  }
	}

	var dealerSelect = ["S","W","N","E"];
	var bids = [];
	var played = [];
	var playerNames = [];
	var boardDealt = false;
	var outStr = "";
	var i,j;
	var inHeader = true;

	str = str.replace(/[\"\[\]]/g,"");  // Filter out characters which won't survive conversion of the final json string to a json object

//		try {
		outStr += "{\"boards\":[";

		// Remove all lines that start with %, which is a comment in LIN
		if (str.startsWith('%')) {
			str = str.replaceAll(/^%.*(?=\r?\n)/g, '');
			//str = str.replace(/^%.*\n?/, '');
		}
		//

		str = str.replace(/\n/g,"");
		str = str.replace(/\r/g,"");

		var pairs = str.split("|");

		var boardStr = "";
		var board=-1;
		var vul="";
		var dealer="";
		var deal="";
		var north = "";
		var south = "";
		var west = "";
		var east = "";
		var claimed = "";
		var score = "";
		var pnames = [];
		var count = 0;
		var explanation = "";

		for (i=0;i<pairs.length/2;i++)
		{
			var index = 2*i;

			var command = pairs[index];
			var para = pairs[index+1];

			if (command=="st")	// Marks start of new board ?
			{
				inHeader = false;

				if (boardDealt)
				{
					if (count!=0) outStr = outStr + ",";
					count++;

					outStr += writeLinHand(boardStr,dealer,vul,north,south,east,west,bids,played,claimed,pnames,playerNames,score,explanation);
					pnames = [];

					bids = [];
					played = [];
					vul="";
					dealer="";
					deal="";
					boardDealt = false;
					claimed = "";
					score = "";
				}
			}
			else if (command=="at")
			{
				explanation = para;
			}
			else if (command=="qx")
			{
				inHeader = false;

				if (boardDealt)
				{
					if (count!=0) outStr += ",";

					count++;

					outStr += writeLinHand(boardStr,dealer,vul,north,south,east,west,bids,played,claimed,pnames,playerNames,score,explanation);
					pnames = [];
					bids = [];
					played = [];
					vul="";
					dealer="";
					deal="";
					boardDealt = false;
					claimed = "";
					score = "";
				}

//						board = Integer.valueOf(boardStr);
				boardStr = para;

				if (boardStr.charAt(0)=='o')
					boardStr = boardStr.substring(1) + ".Open";
				else if (boardStr.charAt(0)=='c')
					boardStr = boardStr.substring(1) + ".Closed";
			}
			else if (command=="mb")
			{
				inHeader = false;
				bids[bids.length] = para;
			}
			else if (command=="an")	// Alert (announcement)
			{
				if (bids.length>0)
				{
					bids[bids.length-1] += "|" + para;	// Append the alert explanation to the last bid
				}
			}
			else if (command=="pc")
			{
				inHeader = false;
				played[played.length] = para.toUpperCase();
			}
			else if (command=="ah")	// An alternative command for expressing the board number
			{
				inHeader = false;

				if (para.indexOf(" ")!=-1)
				{
					var fields = para.split(" ");
					para = fields[1].trim();

					boardStr = para;
				}
				else
				{
					if (para.toUpperCase().startsWith("BOARD"))
						boardStr = para.substring(5);
					else
						boardStr = "NA";
				}
			}
			else if (command=="md")
			{
				inHeader = false;
				para = para.toUpperCase();
				var dnum = Number(para.substring(0,1));

				if (!(para.substring(1,2)==","))
				{
					boardDealt = true;
					dealer = dealerSelect[dnum-1];
					deal = para.substring(1);

					var hands  = deal.split(",");
					var cards = [];

					for (j=0;j<4;j++)
					{
						cards[j] = [];

						for (k=0;k<13;k++)
							cards[j][k]=0;
					}

					south = convertHand(cards,hands[0]);
					west = convertHand(cards,hands[1]);
					north = convertHand(cards,hands[2]);

					if (hands.length>3)
					{
						if (hands[3].trim().length!=0)
							east = convertHand(cards,hands[3]);
						else
							east = inferHand(cards);
					}
					else
					{
						east = inferHand(cards);
					}
				}
			}
			else if (command=="pn")
			{
				if (inHeader)
					playerNames = para.split(",");
				else
					pnames = para.split(",");
			}
			else if (command=="sv")
			{
				inHeader = false;
				para = para.toUpperCase();
				if ((para=="O")||(para=="0")) vul = "None";
				else if (para=="N") vul = "NS";
				else if (para=="E") vul = "EW";
				else if (para=="B") vul = "All";
			}
			else if (command=="mc")
			{
				inHeader = false;
				claimed = para;
			}
			else if (command=="zz")
			{
				score = para;
			}
			else if (command=="vg") // Use this as the title. Usually it contains the event. E.g. BBO .lin files
			{
				g_title = para;
				g_hands.Title = "<b>" + g_title + "</b>";
			}

		}

		if (boardDealt)
		{
			if (count!=0) outStr += ",";
			count++;

			outStr += writeLinHand(boardStr,dealer,vul,north,south,east,west,bids,played,claimed,pnames,playerNames,score,explanation);
			pnames = [];
		}

		outStr += "]";

/*		if (playerNames.length>0)
		{
			outStr += ",\"PlayerNames\":[";

			for (i=0;i<playerNames.length;i++)
			{
				if (i!=0) outStr += ",";
				var pname = playerNames[i].trim();
				if (pname.indexOf("~~")==0) pname = "Robot";
				outStr += "\"" + pname + "\"";
			}

			outStr += "]";
		}*/

		outStr += "}";
//		} catch (e) {alert("lin file conversion error");};
		//console.log(outStr);
	return outStr;
}