function getPosition(element) {
		// Find location of an element (for display of popup messages at cursor location)
    var xPosition = 0;
    var yPosition = 0;

    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }

	xPosition += document.body.scrollLeft;
	yPosition += document.body.scrollTop;

    return { x: xPosition, y: yPosition };
}

function displayErrorAbsPosition(message,x,y)
{
	var popup = document.getElementById("popup_box");
	popup.style.top = y + "px";
	popup.style.left = x  + "px";
	const clean = DOMPurify.sanitize(message, { RETURN_DOM_FRAGMENT: true });
	popup.replaceChildren(clean); //innerHTML = message;
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").delay(100).fadeIn(200).delay(2000).fadeOut(100);
}

function displayError(element,message)
{
	var popup = document.getElementById("popup_box");
	popup.style.top = ((getPosition(element).y) - 20) + "px";
	popup.style.left = getPosition(element).x  + "px";
	const clean = DOMPurify.sanitize(message, { RETURN_DOM_FRAGMENT: true });
	popup.replaceChildren(clean); //innerHTML = message;
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").delay(100).fadeIn(200).delay(5000).fadeOut(100);
}

function doPopup(pelement,text)
{
		// Display popup box containing specified text at location of this element
	var y = ((getPosition(pelement).y) - 20) + "px";
	var x = getPosition(pelement).x  + "px";
	doPopupAt(text,x,y);
}

function doPopupAt(text,px,py)
{
		// Display popup box containing specified text at location of this element
	var popup = document.getElementById("popup_box");
	popup.style.top = py + "px";
	popup.style.left = px  + "px";
	popup.innerHTML = text;
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").delay(100).fadeIn(200).delay(4000).fadeOut(100);  // Display for 4 seconds
}

function doPopupNoTimeout(pelement,htmltext,posx,posy)
{
		// Display popup box containing specified html at location of this element
	var popup = document.getElementById("popup_box");
	popup.style.top = Number(posy) + "px";
	popup.style.left = Number(posx) + "px";
	popup.style.padding = "10px";
	popup.style.backgroundColor = "#FFFFDD";
	popup.innerHTML = htmltext;
	$("#popup_box").finish();
	popup.style.display="none";
	$("#popup_box").show();
}

function hideAllPopups()
{
	$("#popup_box").hide();
	$("#optionsBox").hide();
	$("#progressDiv").hide();
	hideHelp();
	$("#toolsSubMenu").hide();
	$("#settings").hide();
}

function hideHelp()
{
	if (g_helpId!="")
	{
		$("#"+g_helpId).hide();
		g_helpId = "";
	}
}

function showSettings()
{
	hideAllPopups();
	document.getElementById("settingsHide").onclick = hideAllPopups;
	document.getElementById("showSettingsHelp").onclick = function (){showHelp(this,'settingsHelp')};
	$("#settings").show();
}

function showOptions(pthis)
{
		// Respond to the HELP button
	var popup = document.getElementById("optionsBox");
	popup.style.top = 20 + "px";
	popup.style.left = 100  + "px";
	document.getElementById("optionsClose").onclick = function()
		{
			$("#optionsBox").hide();
            $("#optionsSaveFeedback").hide();
		}

	document.getElementById("optionsSave").onclick = function()
		{
			var ns1 = document.getElementById("nsrad1").checked;
			var ns2 = document.getElementById("nsrad2").checked;
			var ns3 = document.getElementById("nsrad3").checked;
			var ew1 = document.getElementById("ewrad1").checked;
			var ew2 = document.getElementById("ewrad2").checked;
			var ew3 = document.getElementById("ewrad3").checked;
			var mk1 = document.getElementById("mkrad1").checked;
			var mk2 = document.getElementById("mkrad2").checked;

			var string = "{\"options\":{\"ns\":[\"" + ns1 + "\",\"" + ns2 + "\",\"" + ns3 + "\"],\"ew\":[\"" + ew1 + "\",\"" + ew2 + "\",\"" + ew3 + "\"],\"mk\":[\"" + mk1 + "\",\"" + mk2 + "\"]}}";
			setCookie("BSOL_options",string,20*365);

			var sel = document.getElementById("honourCardSet");

			if (sel!=null)
			{
				if (localStorageSupported())
				{
					localStorage.setItem("honourCardSet",sel.value);
				}
			}

			/*if (remoteState!==document.getElementById("mkuseremote").checked)
				startStopMainWorker();*/
            $("#optionsSaveFeedback").show();
		}

	document.getElementById("nsrad1").onclick = document.getElementById("nslab1").onclick = document.getElementById("nsrad1").ontouchstart = document.getElementById("nslab1").ontouchstart = function() {document.getElementById("nsrad1").checked=true;displayHands();};
	document.getElementById("nsrad2").onclick = document.getElementById("nslab2").onclick = document.getElementById("nsrad2").ontouchstart = document.getElementById("nslab2").ontouchstart = function() {document.getElementById("nsrad2").checked=true;displayHands();};
	document.getElementById("nsrad3").onclick = document.getElementById("nslab3").onclick = document.getElementById("nsrad3").ontouchstart = document.getElementById("nslab3").ontouchstart = function() {document.getElementById("nsrad3").checked=true;displayHands();};
	document.getElementById("ewrad1").onclick = document.getElementById("ewlab1").onclick = document.getElementById("ewrad1").ontouchstart = document.getElementById("ewlab1").ontouchstart = function() {document.getElementById("ewrad1").checked=true;displayHands();};
	document.getElementById("ewrad2").onclick = document.getElementById("ewlab2").onclick = document.getElementById("ewrad2").ontouchstart = document.getElementById("ewlab2").ontouchstart = function() {document.getElementById("ewrad2").checked=true;displayHands();};
	document.getElementById("ewrad3").onclick = document.getElementById("ewlab3").onclick = document.getElementById("ewrad3").ontouchstart = document.getElementById("ewlab3").ontouchstart = function() {document.getElementById("ewrad3").checked=true;displayHands();};
	document.getElementById("mkrad1").onclick = document.getElementById("mklab1").onclick = document.getElementById("mkrad1").ontouchstart = document.getElementById("mklab1").ontouchstart = function() {document.getElementById("mkrad1").checked=true;redrawMCTable(true);};
	document.getElementById("mkrad2").onclick = document.getElementById("mklab2").onclick = document.getElementById("mkrad2").ontouchstart = document.getElementById("mklab2").ontouchstart = function() {document.getElementById("mkrad2").checked=true;redrawMCTable(true);};

	try {
		document.getElementById("honourCardSet").onchange = displayHands;
	} catch (e) {};

	$("#optionsBox").show();
}

function showtoolsSubMenu()
{
	$("#toolsSubMenu").show();
}

function showHelp(pthis,detailedHelp)
{
		// Respond to the HELP button
	if ((g_helpId!="")&&(g_helpId!=detailedHelp))
	{
		hideHelp();
	}

	g_helpId = detailedHelp;
	var popup = document.getElementById(detailedHelp);
	popup.style.top = 10 + "px";
	popup.style.left = 150  + "px";
	document.getElementById("hide_"+detailedHelp).onclick = function()
		{
			$("#"+g_helpId).hide();
		}

	$("#"+detailedHelp).show();
}

function hideSpinner()
{
	$("#spinner").finish();
	$("largeSpinner").finish();
	document.getElementById("spinner").style.display="none";
	document.getElementById("largeSpinner").style.display="none";
}

function largeSpinner()
{
	var spinner = document.getElementById("spinner");
	var largeSpinner = document.getElementById("largeSpinner");
	$("#spinner").finish();
	spinner.style.display="none";
	$("#largeSpinner").finish();
	largeSpinner.style.display="none";
	$("#largeSpinner").fadeIn(1);
}

function spinnerNoDelay(pthis)
{
	var spinner = document.getElementById("spinner");
	spinner.style.top = ((getPosition(pthis).y) - 20) + "px";
	spinner.style.left = getPosition(pthis).x  + "px";
	$("#spinner").finish();
	spinner.style.display="none";
	$("#spinner").fadeIn(1);
}

function spinnerNoDelayAbs(pthis,px,py)
{
	var spinner = document.getElementById("spinner");
	spinner.style.top = py;
	spinner.style.left = px;
	$("#spinner").finish();
	spinner.style.display="none";
	$("#spinner").fadeIn(1);
}

function spinner(pthis){
	var spinner = document.getElementById("spinner");
	spinner.style.top = ((getPosition(pthis).y) - 20) + "px";
	spinner.style.left = getPosition(pthis).x  + "px";
	$("#spinner").finish();
	spinner.style.display="none";
	$("#spinner").delay(500).fadeIn(200);
}

function showBoardKeypad()
{
	var boardThreshold = 36; // Show a scroll bar if more boards than this
	switch(language)
	{
		case "de":
			var htmltext = "<span style=\"font-weight:bold;\">Wähle Board Nummer...</span><br>";
			break;
		default:
			var htmltext = "<span style=\"font-weight:bold;\">Go to Board Number...</span><br>";
	}
	var i;

	if (g_hands.boards.length>boardThreshold) htmltext += "<div style=\"overflow:scroll;max-height:300px;\">";

	for (i=0;i<g_hands.boards.length;i++)
	{
		if ((typeof g_hands.boards[i].Deal)!="undefined")
		{
			var board = g_hands.boards[i].board;
			htmltext = htmltext + "<button onclick=\"log('button=gotoBoard');gotoTravellerByIndex(" + i + ");\" style=\"width:50px;cursor:pointer;font-size:14px;padding:1px;text-align:center\">" + makeBoardNameString(board) + "</button>";
		}

		if ((i%10)==9) htmltext = htmltext + "<br>";
	}

	if (g_hands.boards.length>boardThreshold) htmltext += "</div>";

	switch(language)
	{
		case "de":
			htmltext = htmltext + "</div><br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Schließen</button>";
			break;
		default:
			htmltext = htmltext + "</div><br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Close</button>";
	}

	hideAllPopups();
	doPopupNoTimeout(document.getElementById("gotoBoard"),htmltext,100,50);
}

function showNewBoardSelector()
{
	switch(language)
	{
		case "de":
			var htmltext = "<span style=\"font-weight:bold;\">Wählen Sie eine Boardnummer im Bereich 1 bis 99 (bereits verwendete Nummern werden nicht angzeigt)</span><br><br>";
			break;
		default:
			var htmltext = "<span style=\"font-weight:bold;\">Choose A Number For New Board in range 1 to 99 (numbers in use are not shown)</span><br><br>";
	}

	var i;
	var buttonCount = 0;

	for (i=1;i<100;i++)
	{
	    var j;
	    var inUse = false;

	    for (j=0;j<g_hands.boards.length;j++)
	    {
	        if (g_hands.boards[j].board==i) {inUse = true;break;}
	    }

        if (!inUse)
        {
            buttonCount++;
		    htmltext = htmltext + "<button onclick=\"log('button=newBoard');newBoard(" + i + ");gotoTraveller(\'" + i + "\');terminateSession();edit();\" style=\"width:50px;font-size:14px;padding:1px;text-align:center\">" + i + "</button>";
        }

		if ((buttonCount%12)==11) htmltext = htmltext + "<br>";
	}

	switch(language)
	{
		case "de":
			htmltext = htmltext + "<br><br><button onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Schließen</button>";
			break;
		default:
			htmltext = htmltext + "<br><br><button onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Close</button>";
	}

	$("#optionsBox").hide();
	hideHelp();
	doPopupNoTimeout(document.getElementById("newBoard"),htmltext,100,50);
}

function showTravellerKeypad()
{
	switch(language)
	{
		case "de":
			var htmltext = "<span style=\"font-weight:bold;\">Wähle Board Nummer ...</span><br>";
			break;
		default:
			var htmltext = "<span style=\"font-weight:bold;\">Go to Board Number...</span><br>";
	}
	var i;
	var str = "";

	if (g_handEntryMode!=0) str = "edit();";

	for (i=0;i<g_hands.boards.length;i++)
	{
		var board = g_hands.boards[i].board.toString();
		htmltext = htmltext + "<button onclick=\"$('#popup_box').hide();log('button=gototraveller');setLastBoardIndex(getTindexByName(g_hands.boards,'" + board + "'));showComparison();\" style=\"width:50px;cursor:pointer;font-size:14px;padding:1px;text-align:center\">" + makeBoardNameString(board) + "</button>";

		if ((i%10)==9) htmltext = htmltext + "<br>";
	}

	switch(language)
	{
		case "de":
			htmltext = htmltext + "<br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Schließen</button>";
			break;
		default:
			htmltext = htmltext + "<br><button style=\"cursor:pointer;\" onclick=\"$(\'#popup_box\').hide();document.getElementById('popup_box').style.display='none';\">Close</button>";
	}

	hideAllPopups();
	doPopupNoTimeout(document.getElementById("gotoBoard"),htmltext,100,50);
}

function initSettings()
{
	if (localStorageSupported())
	{
		if (document.getElementById("mkauto1").checked)
		{
			res = localStorage.getItem("mkauto1");

			if (res!==null)
			{
				document.getElementById("mkauto1").checked = (res==="true");
			}
			else
			{
				document.getElementById("mkauto1").checked = true;
			}
		}

		document.getElementById("mkauto1").onclick = document.getElementById("mkautolab1").onclick = function(){localStorage.setItem("mkauto1",document.getElementById("mkauto1").checked);};

		var krck = document.getElementById("krcalc");

		if (krck!==null)
		{
			res = localStorage.getItem("krcalc");

			if (res!==null)
			{
				if (res=="true")
					krck.checked  = true;
				else
					krck.checked = false;
			}
		}
	}
}

function setOptions(optionsStr)
{
		//*** This function is only called at startup, from buildPage1
	try {
		if (optionsStr!==null)
		{
			var options = JSON.parse(optionsStr);
			document.getElementById("nsrad1").checked = options.options.ns[0]==="true";
			document.getElementById("nsrad2").checked = options.options.ns[1]==="true";
			document.getElementById("nsrad3").checked = options.options.ns[2]==="true";
			document.getElementById("ewrad1").checked = options.options.ew[0]==="true";
			document.getElementById("ewrad2").checked = options.options.ew[1]==="true";
			document.getElementById("ewrad3").checked = options.options.ew[2]==="true";
			document.getElementById("mkrad1").checked = options.options.mk[0]==="true";
			document.getElementById("mkrad2").checked = options.options.mk[1]==="true";
		}

		var sel = document.getElementById("honourCardSet");

		if (sel!=null)
		{
			if (localStorageSupported())
			{
				var value = localStorage.getItem("honourCardSet");
				if (value!=null) sel.value = value;
			}
		}
	} catch (err) {alert(err);};
}

function hideMenuItems()
{
	hide("prev");
	hide("showBoards");
	hide("gotoBoard");
	if (document.getElementById("saveLIN")!=null) hide("saveLIN");
	hide("saveBoards");
	hide("backPlay");
	hideForwardPlay();
	hide("play");
	hide("deleteBoard");
	hide("newBoard");
	hide("editHand");
	hide("clearHand");
	hide("options");
	hide("help");
	hide("computeMakeable");
	hide("tools");
	hide("bsession");
	hide("bsessionHelp");
	hide("next");
	hideAllPopups();
	$('#popup_box').hide();
	document.getElementById('popup_box').style.display='none';
}

function showMainMenuItems()
{
//	if ((typeof g_hands.lin)=="undefined")
	if ((g_hands.boards.length>1)||(g_test==1)||(g_xml!=""))
	{
		show("prev");
		show("gotoBoard");
		show("next");

		if (g_file=='')
		{
			show("bsession");
			show("bsessionHelp");
		}
	}

	if ((g_test!=1)&&(g_xml==""))
	{
		if ((typeof g_hands.lin)!=="undefined")
			if (document.getElementById("saveLIN")!=null) show("saveLIN");

		//document.getElementById("saveBoards").innerHTML = "Speichern";	// **** Remove this assignment when html is no longer cached.
		show("saveBoards");
	}

	show("play");
	show("editHand");
	show("options");
	show("computeMakeable");
	show("tools");
}

function showEmptyProgressBar(text)
{
	$("#toolsSubMenu").hide();
	document.getElementById("saveBoards").setAttribute("disabled","");
	document.getElementById("editHand").setAttribute("disabled","");

	g_title = "<div id=outerProgress style='float:left;width:800px;height:15px;'><div id=progress style='float:left;width:0px;height:15px;background-color:#88ff88;text-align:left;color:blue;'>" + text + "</div></div>";
	
	const clean = DOMPurify.sanitize(g_title, { RETURN_DOM_FRAGMENT: true });
	document.getElementById("titleText").replaceChildren(clean); //innerHTML = g_title;
	document.getElementById("outerProgress").width = "800px";
	document.getElementById("progress").width = "0px";
}

