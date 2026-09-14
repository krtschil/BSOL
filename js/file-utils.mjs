export function downloadFile(text, fileType, fileName) {
  var blob = new Blob([text], { type: fileType });
  var a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.click();
  a.remove();
}

export function constructFilename()
{
	if ((typeof g_hands.evid)=="undefined")
		return g_hands.event + "_" + g_hands.club;
	else
		return g_hands.evid;
}

// Window-bridge: expose these functions as globals so legacy classic
// scripts (accuracy.js, bootstrap.js) can keep calling them unchanged.
// Remove entries here once every caller has been migrated to `import`.
if (typeof window !== "undefined")
{
	Object.assign(window, {
		downloadFile,
		constructFilename,
	});
}