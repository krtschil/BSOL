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

function openIndexedDB()
{
	if ("indexedDB" in window)
	{
		console.log("indexedDB functionality is available in this browser");
		const request = indexedDB.open('cacheData', 1);

		request.onerror = function(event) {
		  console.log("Database error: " + event.target.errorCode);
		};

		request.onupgradeneeded = function(event) {
		  g_db = event.target.result;
		  const objectStore = g_db.createObjectStore("ddCache", { keyPath: "deal" });
		  objectStore.createIndex("time", "time", { unique: false });
		  const objectStore2 = g_db.createObjectStore("accCache", { keyPath: "key" });
		  objectStore2.createIndex("time", "time", { unique: false });
		};

		request.onsuccess = function(event) {
			g_db = event.target.result;
			invoke_buildPage2();
		}
	}
	else
	{
		console.log("indexedDB functionality is NOT available in this browser");
		invoke_buildPage2();
	}
}

function invoke_buildPage2()
{
	if (g_file!='')	// If a pbn or dlm filename was supplied.
		getHands({callback:buildpage2});
	else
		buildpage2();
}

