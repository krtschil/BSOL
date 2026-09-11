function downloadFile(text, fileType, fileName) {
  var blob = new Blob([text], { type: fileType });
  var a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.click();
  a.remove();
}

function constructFilename()
{
	if ((typeof g_hands.evid)=="undefined")
		return g_hands.event + "_" + g_hands.club;
	else
		return g_hands.evid;
}