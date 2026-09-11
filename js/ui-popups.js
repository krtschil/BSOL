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