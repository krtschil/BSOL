function identifyHonourCardSet(str)
{
	if ((str != "") && (typeof str != "undefined"))
	{
		var lang = "english";

		if (str.indexOf("R")!=-1)
			lang = "french";
		else if (str.indexOf("H")!=-1)
			lang = "dutch";
		else if (str.indexOf("D")!=-1)
			lang = "german";

		return lang;
	}

	return "english";
}

function convertToJQKA(str,lang)
{
	if (lang=="french")
	{
		str = str.replace(/V/g,"J");
		str = str.replace(/D/g,"Q");
		str = str.replace(/R/g,"K");
	}
	else if (lang=="german")
	{
		str = str.replace(/B/g,"J");
		str = str.replace(/D/g,"Q");
	}
	else if (lang=="dutch")
	{
		str = str.replace(/B/g,"J");
		str = str.replace(/V/g,"Q");
		str = str.replace(/H/g,"K");
	}

	return str;
}

function validateContract(pvalue)
{
	var suits = "NSHDC";

	if (pvalue.length>5) return false;

	var level = pvalue.charAt(0);

	if ((level<"1")||(level>"7")) return false;
	if (suits.indexOf(pvalue.charAt(1))==-1) return false;

	return true;
}

function checkDeal(board,polarity)
{
	var p = ["North","East","South","West"];
	var dir = p[polarity];
	var str = board.Deal[polarity].replace(/[23456789TAJQK]/g,"");
	var str2 = str.replace(/\./g,"");

	switch(language)
	{
		case "de":
			if (str2.length!=str.length-3) {alert(dir + " Hand enthält nicht genau 3 Trennzeichen für die Farben");return 0;}
			if (str2.length!=0) {alert(dir + " Hand enthält ungültige Zeichen");return 0;}
			break;
		default:
			if (str2.length!=str.length-3) {alert(dir + " Hand does not contain exactly 3 suit separators");return 0;}
			if (str2.length!=0) {alert(dir + " Hand contains invalid characters");return 0;}
	}
	return 1;
}

function checkForDuplicates(board)
{
	var cvalues = "23456789TJQKA";
	var cards = Array.from({length:4}, () => Array(13).fill(0));

	for (var i=0;i<4;i++)
	{
		var hand = board.Deal[i].split(".");

		for (var j=0;j<4;j++)
		{
			for (var k=0;k<hand[j].length;k++)
			{
				var cardIndex = cvalues.indexOf(hand[j][k]);

				if (cards[j][cardIndex]!=0)
				{
					alert(language=="de"
						? "Ungültige Teilung - doppelte Karte gefunden"
						: "Invalid Deal - duplicate card detected");
					return 0;
				}
				cards[j][cardIndex]++;
			}
		}
	}

	return 1;
}

function validateBoard(board)
{
	var required = language=="de"
		? ["Boardnummer nicht angegeben","Teiler nicht angegeben","Gefahrenlage nicht angegeben","Nordhand nicht angegeben","Osthand nicht angegeben","Südhand nicht angegeben","Westhand nicht angegeben"]
		: ["Board Number not specified","Dealer not specified","Vulnerability not specified","North hand not specified","East hand not specified","South hand not specified","West hand not specified"];
	var fields = ["board","Dealer","Vulnerable","Deal.0","Deal.1","Deal.2","Deal.3"];

	for (var i=0;i<fields.length;i++)
	{
		var value = fields[i].split(".").reduce((object,key) => object?.[key], board);
		if (typeof value=="undefined")
		{
			alert(required[i]);
			return 0;
		}
	}

	for (var polarity=0;polarity<4;polarity++)
		if (checkDeal(board,polarity)==0) return 0;

	return checkForDuplicates(board);
}

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

function generatePBN(all)
{
	var str="";
	var nboards = g_hands.boards.length;

	var suits = ["NT"," S"," H"," D"," C"];
	var declarer = "NSEW";
	var i,j,k;

	str += "% PBN 2.1\r\n";
	str += "% EXPORT\r\n";
	str += "%Content-type: text/x-pbn; charset=UTF-8\r\n";
	str += "%Creator: Bridge Solver Online\r\n";

	var lo = 0;
	var hi = nboards;

	if (all==false)
	{
		lo = g_lastBindex;
		hi = lo+1;
	}

	for (i=lo;i<hi;i++)
	{
		if (typeof(g_hands.boards[i].Contract) != "undefined")
		{
			var passed = (g_hands.boards[i].Contract).toUpperCase();
			if (passed.indexOf("PASS")!=-1) {
				passed = true;
			} else {
				passed = false;
			}
			if (typeof(g_hands.boards[i].Contract) == "undefined")
			{
				score = "";

			} else if (!passed)
			{
				var tricksOffset = calculateTricks(i);
				if (Number.isNaN(tricksOffset)) {
					tricksOffset = 0;
				}

				g_hands.boards[i].Score = g_hands.boards[i].Declarer + " " + g_hands.boards[i].Contract + tricksOffset ;

				//console.log("Playernames: " + g_hands.boards[i].PlayerNames);
				//console.log("Auction: " + g_hands.boards[i].Bids);

				var level;
				var suit;
				var trickstaken;
				var doubled = "";
				var ContractResult = g_hands.boards[i].Score; // e.g. "E 3NXX+1"
				ContractResult = ContractResult.toUpperCase();
				ContractResult = ContractResult.replace("!","");

				var vulnerable;
				var score;
				var tmp;

				if (ContractResult.indexOf("XX") !=-1){
					doubled="XX";
					ContractResult = ContractResult.replace("XX","");
				} else if (ContractResult.indexOf("X") !=-1){
					doubled = "X";
					ContractResult = ContractResult.replace("X","");
				}
				if (ContractResult.indexOf("NT")!=-1){
					ContractResult = ContractResult.replace("NT","N");
				}

				pos = ContractResult.indexOf(" ");
				level = ContractResult.substring(pos+1,pos+2);

				suit = ContractResult.substring(pos+2,pos+3); // e.g. "E 3N+1"

				if (ContractResult.length<5) {
					trickdiff = 0;
				} else {
					trickdiff = ContractResult.substring(4);
				}

				trickstaken = eval(level) + eval(trickdiff) + 6;

				g_hands.boards[i].Claimed = trickstaken;

				tmp = g_hands.boards[i].Vulnerable;
				var decl = g_hands.boards[i].Declarer;

				if (tmp=="All"){
					vulnerable = true;
				} else if ((tmp=="NS")&&((decl=="N")||(decl=="S"))){
					vulnerable = true;
				} else if ((tmp=="EW")&&((decl=="E")||(decl=="W"))){
					vulnerable = true;
				} else {
					vulnerable = false;
				}

				score = calculateBridgeScore({  // Calculate actual Score from play. Output is e.g. -430
					level: Number(level),
					suit: suit,
					doubled: doubled,
					declarerVulnerable: vulnerable,
					tricksTaken: trickstaken
				});

				if (g_hands.boards[i].Declarer == "E" || g_hands.boards[i].Declarer == "W"){
					score = -score;
				}

				score = "NS " + score;
			} else {
				score = "";
			}
		}

		if ((typeof g_hands.boards[i].Deal)=="undefined") continue;

		str += "[Event \"\"]\r\n";
		str += "[Site \"\"]\r\n";
		str += "[Date \"\"]\r\n";

		var boardName = g_hands.boards[i].board;

		str += "[Board \"" + boardName + "\"]\r\n";

		if (typeof(g_hands.boards[i].PlayerNames) != "undefined"){
			str += "[West \"" + g_hands.boards[i].PlayerNames[1] + "\"]\r\n";
			str += "[North \"" + g_hands.boards[i].PlayerNames[2] + "\"]\r\n";
			str += "[East \"" + g_hands.boards[i].PlayerNames[3] + "\"]\r\n";
			str += "[South \"" + g_hands.boards[i].PlayerNames[0] + "\"]\r\n";
		}
		/*
		str += "[West \"\"]\r\n";
		str += "[North \"\"]\r\n";
		str += "[East \"\"]\r\n";
		str += "[South \"\"]\r\n";
		*/
		str += "[Dealer \"" + g_hands.boards[i].Dealer + "\"]\r\n";
		str += "[Vulnerable \"" + g_hands.boards[i].Vulnerable + "\"]\r\n";

		var board = g_hands.boards[i];
		var deal = board.Deal;

		str += "[Deal \"" + g_hands.boards[i].Dealer.charAt(0) + ":";

		var dealer = g_hands.boards[i].Dealer.charAt(0);

		var index = 0;

		if (dealer=='N') index = 0;
		else if (dealer=='E') index = 1;
		else if (dealer=='S') index = 2;
		else index = 3;

		for (j=0;j<4;j++)
		{
			str += deal[index];

			if (j!=3) str += " ";

			index++;
			if (index==4) index=0;
		}

		str += "\"]\r\n";

		str += "[Scoring \"\"]\r\n";

		if (typeof(g_hands.boards[i].Contract) != "undefined")
		{
			str += "[Contract \"" + g_hands.boards[i].Contract + "\"]\r\n";

			if ((g_hands.boards[i].Contract).toUpperCase()!= "PASSED"){
				str += "[Declarer \"" + g_hands.boards[i].Declarer + "\"]\r\n";
				str += "[Result \"" + g_hands.boards[i].Claimed + "\"]\r\n";
				str += "[Score \"" + score + "\"]\r\n";
			} else {
				str += "[Declarer \"N\"]\r\n";
				str += "[Result \"0\"]\r\n";
				str += "[Score \"NS 0\"]\r\n";
			}
		}

		if ((typeof board.DoubleDummyTricks)!="undefined")
		{
			var doubleDummyTricks = board.DoubleDummyTricks;
			str += "[DoubleDummyTricks \"" + doubleDummyTricks + "\"]\r\n";
			str += "[OptimumResultTable \"Declarer;Denomination\\2R;Result\\2R\"]\r\n";

			for (j=0;j<4;j++)
			{
				for (k=0;k<5;k++)
				{
					str += declarer.charAt(j) + " " + suits[k] + " ";

					var tricksChar = doubleDummyTricks.charAt(5*j + k);
					var tricks = 0;
					var tricksStr = "";

					if ((tricksChar!='*')&&(tricksChar!='-'))
					{
						tricks = parseInt(tricksChar,16);
						tricksStr = "" + tricks;
						if (tricksStr.length<2) tricksStr = " " + tricksStr;
					}
					else
					{
						tricksStr = " 0";
					}

					str += tricksStr + "\r\n";
				}
			}

		}

		if ((typeof board.OptimumScore)!="undefined")
			str += "[OptimumScore \"" + board.OptimumScore + "\"]\r\n";

		if (typeof(g_hands.boards[i].Contract) != "undefined")
		{
			if (!passed){
				var bids = g_hands.boards[i].Bids;

				// Generate Notes from Auction
				var notes = [];
				var noteNumber = 0;
				var Notes = "";

				for (var j=0;j<bids.length;j++){
					if (bids[j].indexOf("|") != -1){
						notes[noteNumber] = bids[j].substring(bids[j].indexOf("|")+1);
						bids[j] = bids[j].substring(0,bids[j].indexOf("|")) + "=" + eval(noteNumber+1) + "=";
						noteNumber++;
					}
				}
				if (notes.length > 0){
					for (var j=0;j<notes.length;j++){
						Notes = Notes + "[Note \"" + eval(j+1) + ":" + notes[j] + "\"]\r\n";
					}
				}

				//

				if (typeof bids != "undefined") {
					str += "[Auction \"" + g_hands.boards[i].Dealer + "\"]";

					for (var j=0;j<bids.length;j+=4){
						str += "\r\n";
						if (j < bids.length) str+= (bids[j]).replaceAll(" ","&nbsp;") + " ";
						if (j+1 < bids.length) str+= (bids[j+1]).replaceAll(" ","&nbsp;") + " ";
						if (j+2 < bids.length) str+= (bids[j+2]).replaceAll(" ","&nbsp;") + " ";
						if (j+3 < bids.length) str+= (bids[j+3]).replaceAll(" ","&nbsp;");
					}

					str += "\r\n";

					// Add Notes for bidding if present
					if (Notes != "") {
						str += Notes;
					}

					// Fake play for passed hand so that the pass bids are displayed

					if (!passed){
						var played = g_hands.boards[i].Played;
					} else {
						var played = [];
						for (var k=0;k<52;k++){
							played[k] = "CA";
						}
					}

					str += "[Play \"" + g_hands.boards[i].Declarer + "\"]";

					if (typeof played != "undefined"){       // Auction present but Play is missing or empty
						for (var j=0;j<played.length;j+=4){
							str += "\r\n";
							if (j < played.length) str+= played[j] + " ";
							if (j+1 < played.length) str+= played[j+1] + " ";
							if (j+2 < played.length) str+= played[j+2] + " ";
							if (j+3 < played.length) str+= played[j+3];
						}
					}
					str += "\r\n";
				}
			} else { // Passed hand. Auction and Play are needed so that bidding is displayed
				str += "[Auction \"" + g_hands.boards[i].Dealer + "\"]";
				str += "\r\n" + "p p p p" + "\r\n";

				str += "[Play \"" + g_hands.boards[i].Declarer + "\"]";
				var played = [];
				for (var k=0;k<52;k++){
					played[k] = "CA";
				}
				str += "[Play \"" + g_hands.boards[i].Declarer + "\"]";
				for (var j=0;j<played.length;j+=4){
					str += "\r\n";
					if (j < played.length) str+= played[j] + " ";
					if (j+1 < played.length) str+= played[j+1] + " ";
					if (j+2 < played.length) str+= played[j+2] + " ";
					if (j+3 < played.length) str+= played[j+3];
				}
				str += "\r\n";

			}
		}
		str += "\r\n";
	}

	log("button=save");
	downloadFile(str, "text/pbn", "boards.pbn");
}

function pbnToJson(fileData)
{
		// Make sure there is a defined "trim" function (needed for IE8 and earlier)
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	  }
	}

	g_fullInfo = true;	// Assume makeable contracts table contains full information

	var defaultBoard = 1;

		// This routine only works for PBN files that conform to "Export Format"
		// First convert the different types of line endings to a single "\n"
		// [KK] Replace empty lines within comments of "[Result ". 5 empty lines are accepted
	fileData = fileData.replace(/\r\n/g,"\n");
	fileData = fileData.replace(/\r/g,"\n");
	fileData = fileData.replaceAll("{\n","{");
	fileData = fileData.replaceAll("{\n","{");
	fileData = fileData.replaceAll("{\n","{");
	fileData = fileData.replaceAll("{\n","{");
	fileData = fileData.replaceAll("{\n","{");
	fileData = stripComments(fileData);   // [KK] Comments after "[Result " are not stripped instead used for displaying board comments
	fileData = fileData.split("\n");

	var line = "";
	var outStr = "{\"boards\":[";

	var count = 0;

	var i,tmp;

	while (fileData.length>0)
	{
		var data = getPBNSegment(fileData);

		tmp=getLine(data,"[Board",true);

		if (tmp===null)
		{
			tmp = "" + defaultBoard++;
		}
		var playerN = "";
		var playerE = "";
		var playerW = "";
		var playerS = "";

		var contract = "";
		var declarer = "";
		var score = "";
		var result = "";
		var resultComment = "";
		var scoreTableH ="";
		var scoreTable = "";
		var notes = [];

		var dealer = getLine(data,"[Dealer",true);
		var vulStr = getLine(data,"[Vulnerable",true);
		var deal = getLine(data,"[Deal ",true);	// Include space to distinguish from "Dealer" keyword.
		playerN = getLine(data,"[North ",true);
		playerE = getLine(data,"[East ",true);
		playerS = getLine(data,"[South ",true);
		playerW = getLine(data,"[West ",true);
		contract = getLine(data,"[Contract ",true);
		declarer = getLine(data,"[Declarer ",true);
		score = getLine(data,"[Score ",true);
		result = getLine(data,"[Result ",true);
		resultComment = getLineFull(data,"[Result ");
		resultComment = resultComment.replaceAll("}","");
		notes = getLineNotes(data,"[Note ",true);
		scoreTableH = getLine(data,"[ScoreTable",true);
		if (scoreTableH !=null) scoreTableH = scoreTableH.replaceAll(/\\[A-Z0-9]*;?/g," ");

		scoreTable = getLineFull(data,"[ScoreTable",true);
		scoreTable = scoreTable.replaceAll(/PASS/g,"PAXX");
		scoreTable = scoreTable.replaceAll(/ SA /g," NT ");
		scoreTable = scoreTable.replaceAll(/S:/g,"Z:");
		scoreTable = scoreTable.replaceAll(/ S /g," Z ");
		scoreTable = scoreTable.replaceAll(/C/g,"&#9827;").replaceAll(/D/g,"<span style='color:red'>&#9830;</span>").replaceAll(/H/g,"<span style='color:red'>&#9829;</span>").replaceAll(/S/g,"&#9824;");
		scoreTable = scoreTable.replaceAll(/Z:/g,"S:");
		scoreTable = scoreTable.replaceAll(/ Z /g," S ");
		scoreTable = scoreTable.replaceAll(/ NT /g," SA ");
		scoreTable = scoreTable.replaceAll(/PAXX/g,"PASS");

		/*
		const fieldNames = ["Contract", "Declarer", "Tricks", "Score", "NS", "EW", "MP_NS", "MP_EW"];
		const lines = scoreTable
				.split("<br>")
				.map(line => line.trim())
				.filter(line => line.length > 0);

		const scores = lines.map(line => {
			const values = line.split(/\s+/);
			const obj = {};
			fieldNames.forEach((field, i) => {
				obj[field] = values[i];
				});
			return obj;
		});
		*/

		// Set title to the Event as given in the pbn file
		if ((g_hands.Title == "") || (typeof g_hands.Title == 'undefined')){
			if (getLine(data,"[Event ",true) !== null) {
				g_hands.Title = "<b>" + getLine(data,"[Event ",true) + "</b>";
			}
		}

		var auction = getLineFull(data,"[Auction ");
		if (auction !="") {
			auction = auction.replace(/\t/g, ' ');
			auction = auction.replace(/\s+/g, ' ');

			/*var n;
			if (notes != null){
				for (var k=1;k<notes.length;k++){
					n = notes[k];
					n = n.trim();
					auction = auction.replace(" =" + k + "= ","|" + n + " ");
				}
			}
			*/
			auction = auction.replace(/ =/g, '=');
			//auction = auction.replace(/= /g, '=');
			auction = auction.replace(/  /g, ' ');
			auction = auction.trim();
		}
		var playLeader = getLine(data,"[Play ",true);	// Who leads to the first trick (peek only, doesn't consume "data")
		var play = getLineFull(data,"[Play ");
		if (play != ""){
			play = play.replace(/\t/g, ' ');
			play = play.replace(/  /g, ' ');
			play = play.trim();
		}

		if ((dealer!==null)&&(vulStr!==null)&&(deal!==null))
		{
			if ((dealer!="")&&(vulStr!="")&&(deal!=""))
			{
				if (count!=0) outStr = outStr + ",";

				count++;
				outStr = outStr + "{\"board\":\"" + tmp + "\",";

				if ((playerN!=null) && (playerE !=null) && (playerS!=null) && (playerW!=null)){
					outStr = outStr + "\"PlayerNames\":[\"" + playerS + "\",\"" + playerW + "\",\"" + playerN + "\",\"" + playerE + "\"],";
				}

				outStr = outStr + "\"Dealer\":\"" + dealer + "\",";

				if ((vulStr=="Love")||(vulStr=="-")) vulStr = "None";
				if (vulStr=="Both") vulStr = "All";

				outStr = outStr + "\"Vulnerable\":\"" + vulStr + "\",";
				outStr = outStr + "\"Deal\":[";

				var first = deal.charAt(0);
				deal = deal.substring(deal.indexOf(':')+1).trim();

				var lang = identifyHonourCardSet(deal,lang);
				deal = convertToJQKA(deal,lang);

				var index = 0;

				if (first=='N')
					index = 0;
				else if (first=='S')
					index = 2;
				else if (first=='W')
					index = 3;
				else if (first=='E')
					index = 1;

				var hands2 = deal.split(" ");
				var hands = new Array(4);

				for (i=0;i<4;i++)
				{
					if (hands2[i].trim()=="-")
						hands2[i] = "...";	// Empty hand

					hands[index] = hands2[i];
					index++;

					if (index>3) index = 0;
				}

				for (i=0;i<4;i++)
				{
					outStr = outStr + "\"" + hands[i] + "\"";

					if (i!=3) outStr = outStr + ",";
				}

				outStr = outStr + "],";

				if (contract!=null){
					outStr = outStr + "\"Contract\":" + "\"" + contract + "\",";
				}

				if (declarer!=null){
					outStr = outStr + "\"Declarer\":" + "\"" + declarer + "\",";
				}

				if (result!=null){
					outStr = outStr + "\"Claimed\":" + "\"" + result + "\",";
				}

				if (resultComment!=null){
					outStr = outStr + "\"Explanation\":" + "\"" + resultComment + "\",";
				}

				if (score!=null){
					outStr = outStr + "\"Score\":\"" + score + "\",";
				}

				if (auction != ""){
					auction = auction.split(" ");
					outStr = outStr + "\"Bids\":[";
					for (var j=0;j<auction.length;j++){

						var n;
						var a = auction[j];

						/*
							If alerts contain the = character replace it with -
							Otherwise there is a collision with the second type of alerts
							marked by =1= and taken from the notes object
						*/
						if (a.indexOf("|") != -1)
						{
							a = a.replaceAll("=","-");
						}

						pos = a.indexOf("=");
						if (pos!=-1)
						{
							if (notes != null){
								for (var k=1;k<notes.length;k++){
									pos = a.indexOf("=" + k + "=");
									if (pos!=-1)
									{
										n = notes[k];
										n = n.trim();
										a = a.replace("=" + k + "=","|" + n);
										break;
									}

								}
							} else {  //if alerted but no explanations available (e.g. Realbridge)
								var anz = 1;
								while (a.indexOf("=")!=-1){
									a = a.replace("=" + anz + "=","|");
									anz++;
								}
							}
						}

						outStr = outStr + "\"" + a + "\"";
						if (auction.length == j+1){
							outStr = outStr + "],";
						} else {
							outStr = outStr + ",";
						}

					}
				}

				if (play != ""){
					play = play.split(" ");
					play = reorderPlaySequence(play,playLeader,contract);	// [KK] Re-derive true chronological play order from PBN's fixed-column layout
					outStr = outStr + "\"Played\":[";
					for (var j=0;j<play.length;j++){
						outStr = outStr + "\"" + play[j] + "\"";
						if (play.length == j+1){
							outStr = outStr + "],";
						} else {
							outStr = outStr + ",";
						}

					}
				}

				var ddum = "********************";

				var optScore = getLine(data.slice(0),"[OptimumScore",true);

				if (optScore!==null)
				{
					outStr = outStr + "\"OptimumScore\":\"" + optScore + "\",";
				}

				var optPresent = getLine(data,"[OptimumResultTable",false);

				if (optPresent!==null)
				{
					var trickCount = new Array(20);
					var idx = new Array(20);

					for (i=0;i<20;i++)
					{
						trickCount[i] = 0;
						idx[i] = 0;
					}

					for (i=0;i<20;i++)
					{
						var ctr;

						if (i<data.length)
							ctr = data[i];
						else	// end of file
						{
							break;
						}

						ctr = ctr.trim();

						if (ctr.length==0) continue;	// Ignore blank lines

						if (ctr.charAt(0)=='[')		// No more entries in table, rewind and start search for new board
						{
							break;
						}

						ctr = ctr.trim();
						var comp = ctr.split(/ +/);

						var decl = comp[0].trim().toUpperCase().charAt(0);

						if (decl=='N') idx[i] = 0;
						else if (decl=='S') idx[i] = 5;
						else if (decl=='E') idx[i] = 10;
						else if (decl=='W') idx[i] = 15;

						var cont = comp[1].trim().toUpperCase().charAt(0);

						if (cont=='N') idx[i] = idx[i] + 0;
						else if (cont=='S') idx[i] = idx[i] + 1;
						else if (cont=='H') idx[i] = idx[i] + 2;
						else if (cont=='D') idx[i] = idx[i] + 3;
						else if (cont=='C') idx[i] = idx[i] + 4;

						trickCount[i] = parseInt(comp[2]);
					}

					var fullInfo = false;	// Set true if full information is present in the table (not just for makeable contracts);

					for (i=0;i<20;i++)
					{
						if ((trickCount[i]>1)&&(trickCount[i]<7))
						{
								// 0 1nd 1 are often used to indicate number of tricks for a particular contract is not present, but any value
								// in range 2 to 7 inclusive suggests that full information is present.
							fullInfo = true;
							break;
						}
					}

					if (!fullInfo) g_fullInfo = false;

					for (i=0;i<20;i++)
					{
						if (!fullInfo)
							if (trickCount[i]<7) trickCount[i] = -1;

						if (trickCount[i]>=0)
							ddum = setCharAt(ddum,idx[i],parseInt(trickCount[i]).toString(16).trim().charAt(0));
						else
							ddum = setCharAt(ddum,idx[i],'-');
					}
				}
				else
				{
					g_fullInfo = false;
				}

				if (scoreTable != "")
				{
					outStr = outStr + "\"ScoreTable\":\"" + scoreTable + "\",";
				}

				if (scoreTableH != "")
				{
					outStr = outStr + "\"ScoreTableH\":\"" + scoreTableH + "\",";
				}

				outStr = outStr + "\"DoubleDummyTricks\":\"" + ddum + "\"}";
			}
		}
	}

	outStr = outStr + "]}";//console.log(outStr);
	return outStr;
}
