function getRowFromTraveller(pair,direction)
{
	var i;
	var info = getSessionInfo();
	var singleWinner = info.singleWinner;

	var tlines = g_currentTraveller.traveller_line;


	for (i=0;i<tlines.length;i++)
	{
		var line = tlines[i];

		if ((((direction==1)||singleWinner)&&(line.ns_pair_number==pair))||(((direction==2)||singleWinner)&&(line.ew_pair_number==pair)))
		{
//			alert("getRowFromTraveller: pair/direction/row: " + pair + "/" + direction + "/" + i + " " + JSON.stringify(line));
			return i;
		}
	}

	return -1;	// Indicates not found in any traveller
}