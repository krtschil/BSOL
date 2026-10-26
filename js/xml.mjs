export function getAttribute(node,attributeName)
{
	try {
		var attributes = node.attributes;
		var txt = attributes.getNamedItem(attributeName).nodeValue;
	} catch (ex) {return "";};
	
	return txt;
}

export function getNodeValue(node)
{
	try {
		var childNodes = node.childNodes;
		var txt = childNodes[0].nodeValue;
	} catch (ex) {return "";};
	
	return txt;
}

export function getNodeValueByName(node,name)
{
	try {
		var cnode = node.getElementsByTagName(name)[0];
		var childNodes = cnode.childNodes;
		var txt = childNodes[0].nodeValue;
	} catch (ex) {return "";};
	
	return txt;
}

function readBsolNotes(node, target, keys)
{
	for (var child of node.childNodes)
	{
		if (child.nodeName !== "NOTES" || !child.textContent.startsWith("BSOL:"))
			continue;
		var extra = JSON.parse(child.textContent.slice(5));
		for (var key of keys)
			if (Object.prototype.hasOwnProperty.call(extra, key))
				target[key] = extra[key];
	}
}

export function convertXML(data)
{
	var bdindices = [];
	var i,j;
	var tximps = false; // true if cross imp fields present for teams events
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(data,"text/xml");
	if (xmlDoc.getElementsByTagName("parsererror").length)
		throw new Error("Invalid USEBIO XML");
	var evNode = xmlDoc.getElementsByTagName("EVENT")[0];
	if (!evNode)
		throw new Error("USEBIO XML contains no EVENT");
	
	var txt = getNodeValue(evNode);
	
	var json = {};
	json.event = {};
	var eventDate = getNodeValueByName(evNode,"DATE");
	if (eventDate)
	{
		var dateParts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(eventDate);
		json.event.date = dateParts ? dateParts[3] + "-" + dateParts[2] + "-" + dateParts[1] : eventDate;
	}
	
	json.event.event_type = getAttribute(evNode,"EVENT_TYPE");
	
	if ((json.event.event_type=="TEAMS")||(json.event.event_type=="TEAMS_OF_FOUR")||(json.event.event_type=="KO"))
		json.event.event_type = "Teams";
	else if (json.event.event_type=="SWISS_TEAMS")
		json.event.event_type = "Swiss_Teams";
	else
		json.event.event_type = "Pairs";
	var teams = (json.event.event_type=="Teams")||(json.event.event_type=="Swiss_Teams");
	readBsolNotes(evNode, json.event, ["ranking_method", "cross_table", "team_matches", "butler"]);
	var boardMetadata = {};
	readBsolNotes(evNode, boardMetadata, ["board_datums"]);
	var match_scoring_method = getNodeValueByName(evNode,"MATCH_SCORING_METHOD");
	if (match_scoring_method)
		json.event.match_scoring_method = match_scoring_method;
	if (teams && match_scoring_method=="VPS")
		json.event.ranking_method = "VICTORY_POINTS";
		
	if ((json.event.event_type=="Teams")||(json.event.event_type=="Swiss_Teams"))
	{
		var ximpnodes = evNode.getElementsByTagName("NS_CROSS_IMP_POINTS");
		
		if (ximpnodes.length!=0)
			tximps = true;			// This event contains cross imp information for a Teams event
	}
	
	json.event.board_scoring_method = "";
	
	var board_scoring_method = getNodeValueByName(evNode,"BOARD_SCORING_METHOD");
	
	if (board_scoring_method=="MATCH_POINTS")
	{
		json.event.board_scoring_method = "MatchPoints";
		json.event.match_scoring_method = "MatchPoints";
	}
	else if ((board_scoring_method=="IMPS")||(board_scoring_method=="CROSS_IMPS")||(board_scoring_method=="BUTLER_IMPS"))
	{
		json.event.board_scoring_method = "IMP";
	}
	else
	{
		json.event.board_scoring_method = board_scoring_method;
	}
	
	var pximps = false;
	
	if ((json.event.event_type=="Pairs")&(json.event.board_scoring_method=="IMP"))
		pximps = true;
		
	json.event.winner_type = getNodeValueByName(evNode,"WINNER_TYPE");
	
	if (json.event.winner_type.length==0)
		json.event.winner_type = 1;
	else
		json.event.winner_type = Number(json.event.winner_type);
	
	var participants = {};
	json.event.participants = participants;
	var pair = [];
	participants.pair = pair;
	
	var participants = evNode.getElementsByTagName("PARTICIPANTS")[0];
	var pnodes = participants.getElementsByTagName(teams ? "TEAM" : "PAIR");
	if (teams && pnodes.length==0)
		pnodes = participants.getElementsByTagName("PAIR");
	
	for (i=0;i<pnodes.length;i++)
	{
		var cpnode = pnodes[i];
		var cpair = {};
		
		if (json.event.winner_type==1)
			cpair.direction = "N";
		else
		{
			cpair.direction = getNodeValueByName(cpnode,"DIRECTION").charAt(0);
			
			if (cpair.direction=="")
			{
				cpair.direction = "N";
				json.event.winner_type = 1;	// Probably a double howell event, so chage winner_type to 1
			}
		}
		
		cpair.pair_number = teams && cpnode.nodeName=="TEAM" ?
			getAttribute(cpnode,"TEAM_ID") : getNodeValueByName(cpnode,"PAIR_NUMBER");
		cpair.place = getNodeValueByName(cpnode,"PLACE").replace("=","");
		cpair.percentage = getNodeValueByName(cpnode,"PERCENTAGE");
		if (cpair.percentage=="") cpair.percentage = "-";	// As used by Scorebridge to indicate percentage N/A
		cpair.total_score = getNodeValueByName(cpnode,"TOTAL_SCORE"); // ****?????
		
		var playerNodes = cpnode.getElementsByTagName("PLAYER_NAME");
		var players = [];
		players[0] = {};
		players[0].player_name = getNodeValue(playerNodes[0]);
		players[1] = {};
		players[1].player_name = getNodeValue(playerNodes[1]);
		cpair.player = players;
		readBsolNotes(cpnode, cpair, ["player", "team_points"]);
		if (teams && !Object.prototype.hasOwnProperty.call(cpair, "team_points"))
			cpair.team_points = cpair.total_score;
		pair.push(cpair);
	}
	
	var boardNodes = evNode.getElementsByTagName("BOARD");
	
	var board = [];
	json.event.board = board;
	
	for (i=0;i<boardNodes.length;i++)
	{
		var cnode = boardNodes[i];
		var boardno = getNodeValueByName(cnode,"BOARD_NUMBER");
		var cboard;
		var tlines;
		
		if ((typeof bdindices[boardno])!=="undefined")
		{
			cboard = bdindices[boardno];
			tlines = cboard.traveller_line;
		}
		else
		{
			cboard = {};
			cboard.board_no = boardno;
			bdindices[boardno] = cboard;
			tlines = [];
			cboard.traveller_line = tlines;
			board.push(cboard);
		}
		if (boardMetadata.board_datums &&
			Object.prototype.hasOwnProperty.call(boardMetadata.board_datums, boardno))
			cboard.butler_datum = boardMetadata.board_datums[boardno];
		
		var nodeTlines = cnode.getElementsByTagName("TRAVELLER_LINE");
		
		for (j=0;j<nodeTlines.length;j++)
		{
			var cnTline = nodeTlines[j];
			var tline = {};
			
			tline.lead = getNodeValueByName(cnTline,"LEAD");	// Should reverse this 
			tline.contract = getNodeValueByName(cnTline,"CONTRACT");
			tline.lindata = getNodeValueByName(cnTline,"LIN_DATA");
			
			if (tline.contract.length!=0)
			{
				if (tline.contract.toUpperCase()=="PASSED")
				{
					tline.contract = "Passed";
				}
			}
			
			var score = getNodeValueByName(cnTline,"SCORE");
			
			tline.score = score;
			
			var adjusted = /^A(\d{2})(\d{2})$/i.exec(score);
			if (adjusted)
			{
				if (tline.contract=="")
					tline.contract = "NP";
				tline.ns_score = adjusted[1] + "%";
				tline.ew_score = adjusted[2] + "%";
			}
			else if (score>0)
			{
				tline.ns_score = score;
				tline.ew_score = "";
			}
			else
			{
				tline.ew_score = -score;
				tline.ns_score = "";
			}
			
			if (!pximps)
			{
				tline.ns_match_points = getNodeValueByName(cnTline,"NS_MATCH_POINTS");
				tline.ew_match_points = getNodeValueByName(cnTline,"EW_MATCH_POINTS");
			}
			else
			{
				tline.ns_match_points = getNodeValueByName(cnTline,"NS_CROSS_IMP_POINTS");
				tline.ew_match_points = getNodeValueByName(cnTline,"EW_CROSS_IMP_POINTS");
				
				if (tline.ns_match_points=="")	// No Cross-Imps, so assume Butler Imps
				{
					tline.ns_match_points = getNodeValueByName(cnTline,"NS_BUTLER_POINTS");
					tline.ew_match_points = getNodeValueByName(cnTline,"EW_BUTLER_POINTS");
				}
			}
			
			if (tximps)
			{
				tline.ns_cross_imp_points = getNodeValueByName(cnTline,"NS_CROSS_IMP_POINTS");
				tline.ew_cross_imp_points = getNodeValueByName(cnTline,"EW_CROSS_IMP_POINTS");
			}
			
			tline.ns_pair_number = getNodeValueByName(cnTline,"NS_PAIR_NUMBER");
			tline.played_by = getNodeValueByName(cnTline,"PLAYED_BY");
			tline.tricks = getNodeValueByName(cnTline,"TRICKS");
			tline.ew_pair_number = getNodeValueByName(cnTline,"EW_PAIR_NUMBER")
			if (teams && cnode.parentNode.nodeName=="MATCH")
			{
				var match = cnode.parentNode;
				var home = getNodeValueByName(match,"TEAM");
				var away = getNodeValueByName(match,"OPPOSING_TEAM");
				var homeNS = getNodeValueByName(cnTline,"DIRECTION")=="NS";
				tline.ns_pair_number = homeNS ? home : away;
				tline.ew_pair_number = homeNS ? away : home;
				tline.round = Number(getNodeValueByName(match,"ROUND_NUMBER"));
			}
			readBsolNotes(cnTline, tline, ["ns_score", "ew_score", "round",
				"ns_pair_number", "ew_pair_number", "ns_match_points", "ew_match_points"]);
			tlines.push(tline);
		}
	}
	
	json.event.board.sort(function(a,b){
		try {
			 if (Number(a.board_no)>Number(b.board_no))
				return 1;
			 else if (Number(a.board_no)==Number(b.board_no))
				return 0;
			 else
				return -1;
		} catch (ex) {return 0;};	// if non-numeric board number
	});
	
	data = json;
	
	return JSON.stringify(data);
}

// Window-bridge: expose these functions as globals so legacy classic
// scripts (traveller.js) can keep calling them unchanged. Remove
// entries here once every caller has been migrated to `import`.
if (typeof window !== "undefined")
{
	Object.assign(window, {
		getAttribute,
		getNodeValue,
		getNodeValueByName,
		convertXML,
	});
}
