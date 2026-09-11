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

function doRequestHTMLasync(fileref,ploadfunc,errorFunc,pcontext)
{
	$.ajax({
	  url:fileref,
	  data: "",
	  cache: false,
	  success: ploadfunc,
	  error: errorFunc,
	  dataType: "html",
	  context:pcontext
	});
}

function errorFunc(jqXHR,textStatus,errorThrown)
{
		// textStatus should be one of "timeout", "error", "abort", "parsererror".
		// errorThrown contains HTTP status if the error was an HTTP error.
	hideSpinner();
	resetTimeout();

	var errormsg;

	if (textStatus=="error")
	{
		if (errorThrown=="")
			errormsg = "Konnte den Webserver nicht erreichen";
		else
			errormsg = "Fehlermeldung des Webservers: " + errorThrown;
	}
	else if (textStatus=="timeout")
		errormsg = "Keine Antwort des Webservers, bitte versuchen Sie es später noch einmal";
	else
		errormsg = "Unbekannter Fehler";

	errormsg = "<div style=\"padding:10px;background-color:#FFEEEE;width:200px;\"><span style=\"font-size:16px;\">" + errormsg + "</span></div>";

	displayError(document.getElementById("boardNumber"),errormsg);
}