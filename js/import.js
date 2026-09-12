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

function handsNotFound(jqXHR,textStatus,errorThrown)
{
	// Hands Not Found
	/*var msg = "Hand Record file could not be retrieved"; **KK** */
	switch(language)
	{
		case "de":
			var msg = "Die Datei konnte nicht geholt werden (Falsche URL oder CORS-Kopfzeile 'Access-Control-Allow-Origin' fehlt)";
			break;
		default:
			var msg = "Hand Record file could not be retrieved (wrong URL or CORS header 'Access-Control-Allow-Origin' missing)";
	}
	var errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:200px;position:absolute;top:100px;left:100px;\"><span style=\"font-size:16px;\">" + msg + "</span></div>";
	displayError(document.getElementById("boardNumber"),errormsg);
	clearPBNlocalStorage();
	getTraveller(this);
}



function loadHands(data,statusText,jqXHR,context)
{
	loadHands_1(data,statusText,jqXHR,this);
}

function loadHands_1(data,statusText,jqXHR,context)
{
	if ( typeof String.prototype.endsWith != 'function' ) {
	  String.prototype.endsWith = function( str ) {
		return this.substring( this.length - str.length, this.length ) === str;
	  }
	};

	if ((typeof context)!="undefined")
		if ((typeof context.callback)!="undefined")
			this.callback = context.callback;

	var hands;

	if (g_file!==1)	// If pbn data not supplied as string
	{
		if ((g_file=='')||(g_file.toUpperCase().endsWith('PBN')))
			hands = pbnToJson(data);
		else if (g_file.toUpperCase().endsWith('DLM'))
			hands = dlmToJson(data);
		else if (g_file.toUpperCase().endsWith('LIN'))
			hands = linToJson(data);
		else	// if pbn string was not supplied as explicit parameter
		{
			hideSpinner();
			switch(language)
			{
				case "de":
					alert("Nur PBN, DLM und LIN-Dateien von BBO werden unterstützt.");
					break;
				default:
					alert("Only PBN, DLM, and bridge base online LIN file types are supported.");
			}

			return;
		}
	}
	else
	{
		hands = data;
	}

	hands = JSON.parse(hands);

    var saved_boards = g_hands.boards;

	var i;
	var board = {};

	if (typeof g_hands.boards!=="undefined")
		board = g_hands.boards[g_lastBindex].board;
	else
		saved_boards = {};

	g_hands.boards = hands.boards;

	if ((typeof hands.PlayerNames)!="undefined")
		g_hands.PlayerNames = hands.PlayerNames;

    for (i=0;i<saved_boards.length;i++)
	{
		board = saved_boards[i];

		if ((typeof board.board)!="undefined")
		{
			if (board.board.toString().indexOf(".edited")!=-1)
			{
				g_hands.boards[g_hands.boards.length] = board;
			}
		}
	}

	var index = 0;

    if ((typeof board.board)!="undefined")
		index = getTindexByName(g_hands.boards,board.board);

	if ((g_file=='')||(g_xml!="")) // If request is from Bridgewebs, or if xml filename or xml string has been explicitly supplied
	{
		setLastBoardIndex(index);

		setupTraveller(g_lastBindex,true);
		getTraveller(this);
	}
	else
	{
		if (index!=-1)	// Shouldn't happen that index==-1 unless current hand is not in retrieved PBN file !!
		{
			setupTraveller(index,true);
			enterPlayMode();
		}
		else
		{
			hideSpinner();
			document.getElementById("bdy").style.display="none";
			switch(language)
			{
				case "de":
					alert("Board " + board.board + " gibt es nicht");
					break;
				default:
					alert("Board " + board.board + " does not exist");
			}
		}

		hideSpinner();
		resetTimeout();
		this.callback();
	}
}

function getHands(context)
{
		var data="";

		if (requestPending())
			return;	// Don't allow while there is a request in progress.
		else
			setRequestTimeout();

			// Get the hand records for this event
		var turl = "";

		if (g_file=='')	// No pbn url or pbn string supplied.
		{
			if (g_test==1)
				turl = "data/" + g_hands.club + "_" + g_hands.event + ".pbn";
		}
		else if (g_file!==1)	// filename supplied (1 would indicate pbn content supplied as a string parameter)
		{
			turl = g_file;
		}

		if ((data!=="")&&(g_loaded==false))
		{
			g_loaded = true;
			loadHands_1(data,"","",context);
		}
		else if ((turl!="")&&(g_loaded==false))
		{
			g_loaded = true;
			hideRanking();
			$("#scores").hide();
			$("#comparison").hide();
			$("#checkListDiv").hide();
			largeSpinner();
			doRequestHTMLasync(turl,loadHands,handsNotFound,context);
		}
		else if ((g_handstr!=="")&&(g_loaded==false))
		{
			var data = "";
			g_loaded = true;

			if (g_handstrType=="pbn")
				data = pbnToJson(g_handstr);
			else if (g_handstrType=="lin")
				data = linToJson(g_handstr);
			else if (g_handstrType=="dlm")
				data = dlmToJson(g_handstr);

			loadHands_1(data,"","",context);
		}
		else
			loadTraveller_1("","","",context);
}

function processClipboardData(text)
{
	var clipBoardData = text;  // + "\n";  // To make sure boards are recognized

	var result = {};
	result.handstr = clipBoardData;
	result.board=1;

	// For a [Deal the [Dealer and [Vulnerable entries are also needed. Add default values if missing
	// This way a single PBN line with a [Deal only is accepted
	if (result.handstr.includes("[Deal "))
	{
		if (!result.handstr.includes("[Vulnerable "))
			result.handstr = "[Vulnerable \"None\"\n" + result.handstr;
		if (!result.handstr.includes("[Dealer "))
			result.handstr = "[Dealer \"N\"\n" + result.handstr;
	}

	var isPBN = (result.handstr.includes("% PBN ") || ((result.handstr.includes("[Dealer ")) && (result.handstr.includes("[Deal ")) && (result.handstr.includes("[Vulnerable "))));
	var isLIN = result.handstr.includes("|md|");
	var isDLM = result.handstr.includes("[Document]");

	if (isPBN)
	{
		result.handstrType = "pbn";
		document.getElementById("filename").innerHTML = language=="de"
			? "<br>(PBN-Daten aus der Zwischenablage eingefügt)"
			: "<br>(PBN data pasted from clipboard)";
	}

	if (isLIN)
	{
		result.handstrType = "lin";
		document.getElementById("filename").innerHTML = language=="de"
			? "<br>(LIN-Daten aus der Zwischenablage eingefügt)"
			: "<br>(LIN data pasted from clipboard)";
	}

	if (isDLM)
	{
		result.handstrType = "dlm";
		document.getElementById("filename").innerHTML = language=="de"
			? "<br>(DLM-Daten aus der Zwischenablage eingefügt)"
			: "<br>(DLM data pasted from clipboard)";
	}

	if (isPBN || isLIN || isDLM)
	{
		buildPage(result,'{"options":{"ns":["true","false","false"],"ew":["true","false","false"],"mk":["true","false"],"auto":"true"}}');
	}
	else
	{
		alert(language=="de"
			? "Keine oder falsche PBN/LIN/DLM-Daten in der Zwischenablage gefunden: \n----------------\n" + clipBoardData
			: "No or wrong PBN/LIN/DLM data found in clipboard: \n----------------\n" + clipBoardData);
	}
}

// Read clipboard when pressing the respective button.
async function readClipboard()
{
	try
	{
		const items = await navigator.clipboard.read();

		for (const item of items)
		{
			if ((item.types.includes("text/plain")) && (item.types.length == 1))
			{
				const blob = await item.getType("text/plain");
				processClipboardData((await blob.text()) + "\n");
			}
			else
			{
				alert(language=="de"
					? "Die Zwischenablage enthält keine PBN/LIN/DLM-Daten"
					: "Clipboard does not contain PBN/LIN/DLM data");
			}
		}
	}
	catch (err)
	{
		console.error("Failed to read clipboard: ", err);
	}
}
