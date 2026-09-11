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