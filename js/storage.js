function localStorageSupported() {
	try {
		return "localStorage" in window && window["localStorage"] !== null;
	} catch (e) {
		return false;
	}
}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = encodeURIComponent(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substring(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substring(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return decodeURIComponent(y);
        }
    }
}

function saveEventLocalStorage(data)
{
	if (localStorageSupported())
	{
		try {
			localStorage.setItem("bwjson",data);
		} catch (e) {clearTravellersLocalStorage();};
	}
}

function clearPBNlocalStorage()
{
	if (localStorageSupported())
	{
		localStorage.removeItem("bwpbn");localStorage.removeItem("bwtimepbn");localStorage.removeItem("turlpbn");
	}
}

function clearTravellersLocalStorage()
{
	if (localStorageSupported())
	{
		localStorage.removeItem("bwjson");localStorage.removeItem("bwtime");localStorage.removeItem("turl");
	}
}