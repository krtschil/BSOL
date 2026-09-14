import { displayError, hideSpinner } from "./ui-popups.mjs";

export function setRequestTimeout(override=false)
{
	if ((g_timeoutID=="")&&(override))	// Only put timeout if requests are being made to remote server, or we are in a card play sequence
		g_timeoutID = setTimeout(function(){g_timeoutID = "";}, 10000);
}

export function resetTimeout()
{
	if (g_timeoutID!="")
	{
		clearTimeout(g_timeoutID);
		g_timeoutID = "";
	}
}

export function requestPending()
{
	if (g_timeoutID!="")	// already a request in progress
	{
		return true;
	}

	return false;
}

export function failSilently(jqXHR,textStatus,errorThrown)
{
    // Just ignore the error.
    alert("error: " + textStatus);
	resetTimeout();
}

export function makeHttpObject() {
  try {return new XMLHttpRequest();}
  catch (error) {}
  try {return new ActiveXObject("Msxml2.XMLHTTP");}
  catch (error) {}
  try {return new ActiveXObject("Microsoft.XMLHTTP");}
  catch (error) {}

  throw new Error("Could not create HTTP request object.");
}

export function doRequestHTMLasync(fileref,ploadfunc,errorFunc,pcontext)
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

export function errorFunc(jqXHR,textStatus,errorThrown)
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

export function log(pstr)
{
	if (g_logging)
	{
		var requestStr = "log.htm?" + pstr + "&uniqueTID=" + new Date().getTime();
		doRequestHTMLasync(requestStr,doNothing,doNothing,{"para":"log"});
	}
}

export function doNothing()
{
}

// Window-bridge: expose these functions as globals so legacy classic
// scripts (accuracy.js, board-renderer.js, bootstrap.js, hand-entry.js,
// import.js, play.js, ranking.js, session.js, storage.js, traveller.js,
// ui-popups.js, workers.js) can keep calling them unchanged. Remove
// entries here once every caller has been migrated to `import`.
if (typeof window !== "undefined")
{
	Object.assign(window, {
		setRequestTimeout,
		resetTimeout,
		requestPending,
		failSilently,
		makeHttpObject,
		doRequestHTMLasync,
		errorFunc,
		log,
		doNothing,
	});
}
