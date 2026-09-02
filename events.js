function closetoolsSubMenuClose(event){
    document.getElementById('toolsSubMenu').style.display='none';
}


const btn = document.getElementById("toolsSubMenuClose");
btn.addEventListener("click",closetoolsSubMenuClose);

const ahelp = document.getElementById("ahelp");
ahelp.addEventListener("click",sessionHelp);

window.addEventListener("load",processRequest);

// Open local file
var loadfilectl = document.getElementById("loadFile");
loadfilectl.addEventListener("change", handleLoadFileSelect,false);

// Get clipboard data via the keyboard shortcut CTRL-V / CMD-V
// Check whether clipboard contains only one text object. 
// Only text data is accepted. Mixed content is rejected.

document.addEventListener('paste', (event) => {
	try {
		// Check for data type in clipboard
		const types = event.clipboardData.types;

		if ((types.includes("text/plain")) && types.length == 1)
		{
			const pastedData = event.clipboardData.getData('text');
			var clipBoardData = pastedData + "\n";  // To make sure boards are recognized
			processClipboardData(clipBoardData);
		}
		else
		{
			switch (language)
			{
				case "de":
					alert("Die Zwischenablage enthält keine PBN/LIN/DLM-Daten");
					break;
				default:
					alert("Clipboard does not contain PBN/LIN/DLM data");
			}
		}
	} catch (err) {
		console.error('Failed to read clipboard: ', err);
	}
});

// Call an empty pbn file to allow manual input of a hand
const Blank = document.getElementById("blankInput");
Blank.addEventListener('click', function() {
	window.location.href = "?file=blank.pbn&lang=" + language;
});

// Read the clipboard
const clipboard = document.getElementById("clipboard");
clipboard.addEventListener('click', readClipboard);

// Show general help
const showGeneralHelp = document.getElementById("showGeneralHelp");
showGeneralHelp.addEventListener('click', function() {
	showHelp(this,"generalHelp");
});

// Open video
const video = document.getElementById("video-i");
video.addEventListener('click', function() {
	window.open("https://training.krtschil.net/Video/DD-Video.mp4", "_blank");
});

// Go to author's website
const author = document.getElementById("author-reference-i");
author.addEventListener('click', function() {
	window.open("https://mirgo2.co.uk/bridgesolver/", "_blank");
});

// Open file
const loadFile1 = document.getElementById("loadFile1");
loadFile1.addEventListener('click', function() {
	exitHandEntryMode();startup();
	document.getElementById('loadFile').click();
});

// Switch language
const swDE = document.getElementById("switchGerman");
swDE.addEventListener('click', function() {
	localStorage.setItem("honourCardSet","BDKA");
	document.getElementById("honourCardSet").value = "BDKA";  // displayHands() depends on this value
	language = "de";
	changeLanguage(language);
	redrawMCTable(true);
	setupGeneralHelp();
	setupSettingsHelp();
	setupCommandHelp();
	setupPlayHelp();
	setupEditHelp();
	setupPlayMatchContractHelp();
	setupKRHelp();
	displayHands();
	if (g_handEntryMode)
	{
		document.getElementById("boardNumber").innerHTML = "<button id=setDealer class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Ändere<br>Teiler</button><br><button id=setVul class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Ändere<br>Gefahrenlage</button>";
		var table = document.getElementById("board");
		var cell = table.rows[0].cells[2];
		cell.innerHTML = "<span style=\"font-size:18px;color:red;\">Klicke auf die N,S,O,W Bereiche,<br>um die Karten für<br>diesen Spieler zu bearbeiten</span>";
		document.getElementById("setDealer").onclick = showDealerKeypad;
		document.getElementById("setVul").onclick = showVulnerabilityKeypad;		
	}
	
});

const swGB = document.getElementById("switchEnglish");
swGB.addEventListener('click', function() {
	localStorage.setItem("honourCardSet","JQKA");
	document.getElementById("honourCardSet").value = "JQKA";  // displayHands() depends on this value
	language = "en";
	changeLanguage(language);
	redrawMCTable(true);
	setupGeneralHelp();
	setupSettingsHelp();
	setupCommandHelp();
	setupPlayHelp();
	setupEditHelp();
	setupPlayMatchContractHelp();
	setupKRHelp();
	displayHands();
	if (g_handEntryMode)
	{
		document.getElementById("boardNumber").innerHTML = "<button id=setDealer class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Change<br>Dealer</button><br><button id=setVul class=doubleHeightMenuButton style=\"min-width:" + g_vulBarLength + "px;\">Change<br>Vul</button>";
		var table = document.getElementById("board");
		var cell = table.rows[0].cells[2];
		cell.innerHTML = "<span style=\"font-size:18px;color:red;\">Tap on N,S,E,W quadrants<br>to edit the cards<br>for that player</span>";
		document.getElementById("setDealer").onclick = showDealerKeypad;
		document.getElementById("setVul").onclick = showVulnerabilityKeypad;		
	}
	
});

// Dropping a file will be checked and processed if it contains hand record(s)
//
const dropzone = document.getElementById("dropzone");
const output = document.getElementById("output");

// styling (optional but useful)
/*dropzone.style.border = "2px dashed #888";
dropzone.style.padding = "40px";
//dropzone.style.textAlign = "center";
dropzone.style.marginBottom = "20px";
*/
// allow drop
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

// handle drop
dropzone.addEventListener("drop", async (e) => {
  e.preventDefault();

  const files = e.dataTransfer.files;

  if (files.length === 0) {
    output.textContent = "No file dropped.";
    return;
  }

  const file = files[0];

  // ✅ only allow text files
  const isTextFile =
    file.type.includes("text/plain") ||
    file.name.endsWith(".pbn") ||
    file.name.endsWith(".lin") ||
    file.name.endsWith(".dlm");

  if (!isTextFile) {
    //output.textContent = "Please drop a text file.";
	switch (language)
		{
			case "de":
				alert(file.name + " ist keine Datei mit PBN/LIN/DLM-Daten");
				break;
			default:
				alert(file.name + " is not a file with PBN/LIN/DLM data");
		}
    return;
  }

  try {
    const content = await file.text();
	processClipboardData(content);
  } catch (err) {
    output.textContent = "Failed to read file.";
    console.error(err);
  }
});