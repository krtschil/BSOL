function setRequestTimeout(override=false)
{
	if ((g_timeoutID=="")&&(override))	// Only put timeout if requests are being made to remote server, or we are in a card play sequence
		g_timeoutID = setTimeout(function(){g_timeoutID = "";}, 10000);
}

function resetTimeout()
{
	if (g_timeoutID!="")
	{
		clearTimeout(g_timeoutID);
		g_timeoutID = "";
	}
}

function requestPending()
{
	if (g_timeoutID!="")	// already a request in progress
	{
		return true;
	}

	return false;
}