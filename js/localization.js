/* UI localization */
function changeLanguage(l) {
	switch(l)
	{
		case "de":
			document.getElementById("loadFile1").value = "Datei auswählen";
			//document.getElementById("manuell").value = "Hand manuell eingeben";
			document.getElementById("blankInput").textContent = "Hand manuell eingeben";
			document.getElementById("showGeneralHelp").textContent = "Allgemeine Hilfe";
			document.getElementById("aranking").textContent = "Alle Paare";
			document.getElementById("flegend").innerHTML = "<b>Analysiere Bridgehände (PBN/LIN/DLM): Datei/manuell eingeben/Paste/Drop</b>";
			document.getElementById("gotoBoard").textContent = "Gehe zu";
			document.getElementById("saveBoards").textContent = "Speichern";
			document.getElementById("editHand").textContent = "Bearbeiten";
			document.getElementById("play").textContent = "Spielen";
			document.getElementById("options").textContent = "Optionen";
			document.getElementById("help").textContent = "Hilfe";
			document.getElementById("computeMakeable").textContent = "Analyse";
			document.getElementById("tools").textContent = "Mehr..";


			document.getElementById("optionsClose").textContent = "Schließen";
			document.getElementById("toolsSubMenuClose").innerHTML = "<span class=\"font-bold\">Schließen</span>";
			document.getElementById("optionsSave").textContent = "Als Standard speichern";
			//document.getElementById("input-manuell").action = "?file=blank.pbn&lang=" + language;
			document.getElementById("clearHand").textContent = "Leeren";
			document.getElementById("deleteBoard").textContent = "Löschen";
			document.getElementById("newBoard").textContent = "Neu...";

			document.getElementById("toolsChoose").textContent = "Wähle aus:";
			document.getElementById("analyseAllBoards").textContent = "Alle Boards analysieren";
			document.getElementById("showPlayerAcc").textContent = "Matrix zur Spielgenauigkeit";
			document.getElementById("showSettings").textContent = "Einstellungen...";
			document.getElementById("showReleaseHistory").textContent = "Versionshinweise...";
			document.getElementById("toolsSubMenuClose").textContent = "Schließen";

			document.getElementById("nslab1").textContent = "Zahlen und Farben";
			document.getElementById("nslab2").textContent = "Nur Farben";
			document.getElementById("nslab3").textContent = "Weder Farben noch Zahlen";
			document.getElementById("ewlab1").textContent = "Zahlen und Farben";
			document.getElementById("ewlab2").textContent = "Nur Farben";
			document.getElementById("ewlab3").textContent = "Weder Farben noch Zahlen";

			document.getElementById("mklab1").textContent = "Zeige machbare Kontrakte";
			document.getElementById("mklab2").textContent = "Zeige Stichzahl";
			document.getElementById("shorts").textContent = "Kürzel für die Figuren:";
			document.getElementById("table_makeable").textContent = "Tabelle der machbaren Kontrakte:";
			document.getElementById("nsshow_playable").textContent = "N/S: Anzeige für spielbare Karten:";
			document.getElementById("ewshow_playable").textContent = "O/W: Anzeige für spielbare Karten:";
			document.getElementById("showGeneralHelp").style.display = "";

			document.getElementById("mkautolab1").textContent = "Alle Boards automatisch analysieren";
			document.getElementById("settingsHide").textContent = "Schließen";
			document.getElementById("showSettingsHelp").textContent = "Hilfe";
			document.getElementById("settingsT").textContent = "URL verwenden:";
			//document.getElementById("useURL").value = "URL verwenden";
			//document.getElementById("useURLTooltip").title = "Bitte eine gültige URL eingeben";
			document.getElementById("bsession").textContent = "Ergebnisanalyse";

			document.getElementById("aboard").textContent = "Nochmal spielen";
			document.getElementById("aacc").textContent = "Genauigkeit";
			document.getElementById("agotoboard").textContent = "Gehe zu..";
			document.getElementById("ahelp").textContent = "Hilfe";
			document.getElementById("acheck").textContent = "Überprüfen";
			document.getElementById("atraveller").textContent = "Board";

			document.getElementById("scoring1").textContent = "Bd";
			document.getElementById("scoring2").textContent = "Vs";
			document.getElementById("scoring3").textContent = "Kontr";
			document.getElementById("scoring4").textContent = "von";
			document.getElementById("scoring5").textContent = "Aussp";
			document.getElementById("scoring6").textContent = "Stiche";
			document.getElementById("scoring7").textContent = "DD Stiche (ETF)";
			document.getElementById("scoring8").textContent = "Prozent";

			document.getElementById("travellerTable1").textContent = "Paare";
			document.getElementById("travellerTable2").textContent = "Kontrakt";
			document.getElementById("travellerTable3").textContent = "Zu erfüllen";
			document.getElementById("travellerTable4").textContent = "Double Dummy";
			document.getElementById("travellerTable5").textContent = "Anschrift";
			document.getElementById("travellerTable6").textContent = "Prozent";

			document.getElementById("travellerTable7").textContent = "NS";
			document.getElementById("travellerTable8").textContent = "OW";
			document.getElementById("travellerTable9").textContent = "Kontr";
			document.getElementById("travellerTable10").textContent = "von";
			document.getElementById("travellerTable11").textContent = "Aussp";
			document.getElementById("travellerTable12").textContent = "Stiche";
			document.getElementById("travellerTable13").textContent = "Über";
			document.getElementById("travellerTable14").textContent = "Ziel";
			document.getElementById("travellerTable15").textContent = "Erfüllt";
			document.getElementById("travellerTable16").textContent = "(NS)";
			document.getElementById("travellerTable17").textContent = "NS";
			document.getElementById("travellerTable18").textContent = "OW";

			document.getElementById("contractTable1").textContent = "Kontrakt";
			document.getElementById("contractTable2").textContent = "Alleinspieler";
			document.getElementById("contractTable3").textContent = "Frequenz";
			document.getElementById("contractTable4").textContent = "Durchschnitt %";

			document.getElementById("ranking1").textContent = "Pos";
			document.getElementById("ranking2").textContent = "Paar";
			document.getElementById("ranking3").textContent = "N/S Spielernamen";
			document.getElementById("rankingDD").textContent = "Dbl Dummy";
			document.getElementById("rankcheck1").textContent = "Tabellen nach Paarnummer sortieren";

			document.getElementById("scoring_summary1").textContent = "Zusammenfassung";

			document.getElementById("ascorecard").textContent = "Persönlich";

			document.getElementById("video-i").textContent = "Erklärvideo";
			document.getElementById("clipboard").textContent = "Hole Boards aus der Zwischenablage";
			document.getElementById("optionsSaveFeedback").textContent = "Auswahl gespeichert";

			break;
		default:
			document.getElementById("loadFile1").value = "Open file";
			//document.getElementById("manuell").value = "Enter hand";
			document.getElementById("blankInput").textContent = "Enter hand";
			document.getElementById("showGeneralHelp").textContent = "General help";
			document.getElementById("aranking").textContent = "All Pairs";
			document.getElementById("flegend").innerHTML = "<b>Analyse Bridge hands (PBN/LIN/DLM): file/manual entry/paste/drop file</b>";
			document.getElementById("gotoBoard").textContent = "Go To";
			document.getElementById("saveBoards").textContent = "Save...";
			document.getElementById("editHand").textContent = "Edit";
			document.getElementById("play").textContent = "Play";
			document.getElementById("options").textContent = "Options";
			document.getElementById("help").textContent = "Help";
			document.getElementById("computeMakeable").textContent = "Analyse";
			document.getElementById("tools").textContent = "More..";

			document.getElementById("optionsClose").textContent = "Close";
			document.getElementById("toolsSubMenuClose").innerHTML = "<span  class=\"font-bold\">Close</span>";
			document.getElementById("optionsSave").textContent = "Save As Default";
			//document.getElementById("input-manuell").action = "?file=blank.pbn&lang=" + language;
			document.getElementById("clearHand").textContent = "Clear";
			document.getElementById("deleteBoard").textContent = "Delete";
			document.getElementById("newBoard").textContent = "New...";

			document.getElementById("toolsChoose").textContent = "Select a Function:";
			document.getElementById("analyseAllBoards").textContent = "Analyse All Boards";
			document.getElementById("showPlayerAcc").textContent = "Show Player Accuracy Matrix";
			document.getElementById("showSettings").textContent = "Settings...";
			document.getElementById("showReleaseHistory").textContent = "Release Notes...	";
			document.getElementById("toolsSubMenuClose").textContent = "Close";

			document.getElementById("nslab1").textContent = "Subscripts and Colours";
			document.getElementById("nslab2").textContent = "Colours Only";
			document.getElementById("nslab3").textContent = "No Subscripts or Colours";
			document.getElementById("ewlab1").textContent = "Subscripts and Colours";
			document.getElementById("ewlab2").textContent = "Colours Only";
			document.getElementById("ewlab3").textContent = "No Subscripts or Colours";

			document.getElementById("mklab1").textContent = "Show makeable contracts";
			document.getElementById("mklab2").textContent = "Show number of tricks";
			document.getElementById("shorts").textContent = "Honour Card Display:";
			document.getElementById("table_makeable").textContent = "Makeable Contracts Table:";
			document.getElementById("nsshow_playable").textContent = "N/S Playable Card Display:";
			document.getElementById("ewshow_playable").textContent = "E/W Playable Card Display:";
			//document.getElementById("showGeneralHelp").style.display = "none";

			document.getElementById("mkautolab1").textContent = "Auto-Analyse Entire Board Set";
			document.getElementById("settingsHide").textContent = "Close";
			document.getElementById("showSettingsHelp").textContent = "Help";
			document.getElementById("settingsT").textContent = "Settings:";
			//document.getElementById("useURL").value = "Enter URL";
			//document.getElementById("useURLTooltip").title = "Please enter a valid URL";
			document.getElementById("bsession").textContent = "Results Analysis";

			document.getElementById("aboard").textContent = "Play It Again";
			document.getElementById("aacc").textContent = "Accuracy";
			document.getElementById("agotoboard").textContent = "Go To..";
			document.getElementById("ahelp").textContent = "Help";
			document.getElementById("acheck").textContent = "Check";
			document.getElementById("atraveller").textContent = "Board";

			document.getElementById("scoring1").textContent = "Bd";
			document.getElementById("scoring2").textContent = "Vs";
			document.getElementById("scoring3").textContent = "Bid";
			document.getElementById("scoring4").textContent = "by";
			document.getElementById("scoring5").textContent = "Ld";
			document.getElementById("scoring6").textContent = "Tricks";
			document.getElementById("scoring7").textContent = "DD Tricks (ETF)";
			document.getElementById("scoring8").textContent = "Percentage";

			document.getElementById("travellerTable1").textContent = "Pairs";
			document.getElementById("travellerTable2").textContent = "Contract";
			document.getElementById("travellerTable3").textContent = "Making";
			document.getElementById("travellerTable4").textContent = "Double Dummy";
			document.getElementById("travellerTable5").textContent = "Score";
			document.getElementById("travellerTable6").textContent = "Percentage";
			document.getElementById("travellerTable7").textContent = "NS";
			document.getElementById("travellerTable8").textContent = "EW";
			document.getElementById("travellerTable9").textContent = "Bid";
			document.getElementById("travellerTable10").textContent = "by";
			document.getElementById("travellerTable11").textContent = "Lead";
			document.getElementById("travellerTable12").textContent = "Tricks";
			document.getElementById("travellerTable13").textContent = "Over";
			document.getElementById("travellerTable14").textContent = "Target";
			document.getElementById("travellerTable15").textContent = "Made";
			document.getElementById("travellerTable16").textContent = "(NS)";
			document.getElementById("travellerTable17").textContent = "NS";
			document.getElementById("travellerTable18").textContent = "EW";

			document.getElementById("contractTable1").textContent = "Contract";
			document.getElementById("contractTable2").textContent = "Declarer";
			document.getElementById("contractTable3").textContent = "Frequency";
			document.getElementById("contractTable4").textContent = "Average %";

			document.getElementById("ranking1").textContent = "Pos";
			document.getElementById("ranking2").textContent = "Pair";
			document.getElementById("ranking3").textContent = "N/S Playernames";
			document.getElementById("rankingDD").textContent = "Dbl Dummy";
			document.getElementById("rankcheck1").textContent = "Sort tables by pair number";

			document.getElementById("scoring_summary1").textContent = "Summary";

			document.getElementById("ascorecard").textContent = "Personal";

			document.getElementById("video-i").textContent = "Video";
			document.getElementById("clipboard").textContent = "Get boards data from clipboard";
			document.getElementById("optionsSaveFeedback").textContent = "Selection saved";

	}
}

