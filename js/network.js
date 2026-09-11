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

function failSilently(jqXHR,textStatus,errorThrown)
{
    // Just ignore the error.
    alert("error: " + textStatus);
	resetTimeout();
}

function makeHttpObject() {
  try {return new XMLHttpRequest();}
  catch (error) {}
  try {return new ActiveXObject("Msxml2.XMLHTTP");}
  catch (error) {}
  try {return new ActiveXObject("Microsoft.XMLHTTP");}
  catch (error) {}

  throw new Error("Could not create HTTP request object.");
}