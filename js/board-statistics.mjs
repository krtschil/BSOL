export function calculateBoardStatistics(boards)
{
	function choose(n, k)
	{
		var result = 1;
		for (var i=1;i<=k;i++) result = result*(n-i+1)/i;
		return result;
	}

	var distributions = [];
	for (var a=13;a>=4;a--)
		for (var b=Math.min(a,13-a);b>=0;b--)
			for (var c=Math.min(b,13-a-b);c>=0;c--)
			{
				var d = 13-a-b-c;
				if (d<0 || d>c) continue;
				var lengths = [a,b,c,d];
				var multiplicities = {};
				lengths.forEach(function(length) { multiplicities[length] = (multiplicities[length] || 0)+1; });
				var permutations = 24;
				Object.values(multiplicities).forEach(function(count)
				{
					for (var i=2;i<=count;i++) permutations /= i;
				});
				distributions.push({
					shape: lengths.join("-"),
					count: 0,
					theoretical: 100*permutations*lengths.reduce((product,length) => product*choose(13,length),1)/choose(52,13),
				});
			}
	distributions.sort((a,b) => b.theoretical-a.theoretical);
	var byShape = new Map(distributions.map(row => [row.shape,row]));
	var points = [0,0,0,0];
	var validBoards = 0;
	var excludedBoards = 0;
	boards.forEach(function(board)
	{
		var deal = board.Deal;
		var seen = new Set();
		var valid = Array.isArray(deal) && deal.length==4 && deal.every(function(hand)
		{
			if (typeof hand!="string") return false;
			var suits = hand.split(".");
			if (suits.length!=4 || suits.join("").length!=13) return false;
			return suits.every(function(suit,index)
			{
				return /^[AKQJT2-9]*$/.test(suit) && [...suit].every(function(card)
				{
					var key = index+card;
					if (seen.has(key)) return false;
					seen.add(key);
					return true;
				});
			});
		});
		if (!valid)
		{
			excludedBoards++;
			return;
		}
		validBoards++;
		deal.forEach(function(hand,position)
		{
			var shape = hand.split(".").map(suit => suit.length).sort((a,b) => b-a).join("-");
			byShape.get(shape).count++;
			for (var card of hand) points[position] += ({A:4,K:3,Q:2,J:1})[card] || 0;
		});
	});
	var hands = validBoards*4;
	distributions.forEach(function(row) { row.observed = hands ? 100*row.count/hands : 0; });
	var total = points.reduce((sum,value) => sum+value,0);
	return {
		distributions, points, validBoards, excludedBoards, hands,
		nsPercent: total ? 100*(points[0]+points[2])/total : 0,
		ewPercent: total ? 100*(points[1]+points[3])/total : 0,
	};
}

export function showBoardStatistics()
{
	var panel = document.getElementById("boardStatistics");
	var content = document.getElementById("boardStatisticsContent");
	var de = language=="de";
	content.replaceChildren();
	var note = document.createElement("p");
	content.appendChild(note);
	if (g_hands.boards.length<=10)
	{
		note.textContent = de ? "Boardstatistik benötigt mehr als 10 Boards." : "Board statistics require more than 10 boards.";
		panel.hidden = false;
		return;
	}
	var stats = calculateBoardStatistics(g_hands.boards);
	note.textContent = de
		? stats.validBoards + " vollständige Boards, " + stats.hands + " Hände. Ausgeschlossene unvollständige/ungültige Boards: " + stats.excludedBoards
		: stats.validBoards + " complete boards, " + stats.hands + " hands. Excluded incomplete/invalid boards: " + stats.excludedBoards;
	var tables = document.createElement("div");
	tables.className = "board-statistics-tables";
	content.appendChild(tables);
	function table(title, headers, rows)
	{
		var section = document.createElement("section");
		tables.appendChild(section);
		var heading = document.createElement("h2");
		heading.textContent = title;
		section.appendChild(heading);
		var element = document.createElement("table");
		element.className = "ranking";
		var head = element.createTHead();
		headers.forEach(function(cells)
		{
			var row = head.insertRow(-1);
			cells.forEach(function(header)
			{
				var cell = document.createElement("th");
				cell.textContent = header.text;
				cell.colSpan = header.cols || 1;
				cell.rowSpan = header.rows || 1;
				cell.scope = header.cols ? "colgroup" : "col";
				row.appendChild(cell);
			});
		});
		var body = element.createTBody();
		rows.forEach(function(values)
		{
			var row = body.insertRow(-1);
			values.forEach(function(value) { row.insertCell(-1).textContent = value; });
		});
		section.appendChild(element);
	}
	var percent = value => value.toLocaleString(de ? "de-DE" : "en-GB", {minimumFractionDigits: 1, maximumFractionDigits: 1}) + " %";
	table(de ? "Verteilungen" : "Distributions", [
		[{text: de ? "Verteilung" : "Shape", rows:2}, {text: de ? "Häufigkeit" : "Frequency", cols:2}, {text: de ? "Theoretisch" : "Theoretical", rows:2}],
		[{text: de ? "Absolut" : "Count"}, {text:"%"}],
	], stats.distributions.map(row => [row.shape,row.count,percent(row.observed),percent(row.theoretical)]));
	table(de ? "Aufteilung der Figurenpunkte" : "High-card point distribution",
		[["","N",de ? "O" : "E","S","W","NS",de ? "OW" : "EW"].map(text => ({text}))],
		[[de ? "Figurenpunkte" : "High-card points",...stats.points,percent(stats.nsPercent),percent(stats.ewPercent)]]);
	document.getElementById("closeBoardStatistics").textContent = de ? "Schließen" : "Close";
	panel.hidden = false;
}
