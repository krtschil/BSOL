function setupPlayMatchContractHelp()
{
	switch(language)
	{
		case "de":
			var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\"><span style=\"font-size:16px;\">";
			help = help + "Ein gelb hervorgehobenes Gebot zeigt an, dass dieses alertiert wurde. Wenn die Maus darüber schwebt oder durch Klicken darauf, ";
			help = help + "kann man den Erklärung sehen.<br><br>";
			help = help + "Drücken Sie auf den 'Spiel'-Knopf unter der Reizung, um zu sehen, wie der Kontrakt gespielt wurde.<br><br>";
			help = help + "Alle spielbaren Karten werden markiert und die Anzahl der machbaren Stiche werden angegeben (dabei wird optimales Spiel ab diesem Zeitpunkt angenommen). Die Karte, die tatsächlich gespielt wurde, wird mit einem * angezeigt.<br><br>";
			help = help + "Zu jedem Zeitpunkt können Sie die markierte Karte spielen, um dem tatsächlichen erfolgten Abspiel zu folgen. Mit dem Knopf '>' können Sie die tatsächlich gespielte Sequenz durchlaufen.";
			help = help + "Wenn jedoch die gespielte Karte nicht die optimale war, können Sie eine andere Karte spielen, um ein alternatives Abspiel zu untersuchen.<br><br>";
			help = help + "In diesem Fall werden keine Karten mehr mit * markiert. Mit Hilfe des Knopfes '<' können Sie soweit zurückgehen, bis wieder das originale Abspiel erreicht ist.<br><br>";
			help = help + "Der 'Prä'-Knopf (Präzision des Abspiels) zeigt an, in welchem Umfang das Abspiel vom optimalen Double Dummy Abspiel abgewichen ist. "
			help = help + "Für jeden Spieler wird angezeigt, wie oft er vom optimalen Abspiel abgewichen ist.<br><br>";
			
			if (showTravellerRowButtons())
			{
				help = help + "Die '<' und '>' Knöpfe ermöglichen es, vorwärts und rückwärts durch die Anschriften zu blättern, um zu sehen, wie das Board an anderen Tischen gereizt und gespielt wurde.<br><br>";
			}
			
			help = help + "</span></div>";
			help = help + "<button id=hide_playMatchContractHelp style=\"cursor:pointer;\">Schließen</button>";
			break;
		default:
			var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\"><span style=\"font-size:16px;\">";
			help = help + "A yellow highlighted bid in the bidding box indicates an associated alert. Hover the cursor over the highlighted bid, ";
			help = help + "or click on it, in order to see the explanation.<br><br>";
			help = help + "Tap the play button located below the bidding table to see how the bid contract was played.<br><br>";
			help = help + "All playable cards at the current position are highlighted together with the total number of makeable tricks (assuming optimum play from this point onwards). The card that was actually played at each position is denoted with an * prefix.<br><br>";
			help = help + "At each point in the play you may choose to play the prefixed card, in order to follow how the contract was played. The button at the bottom of the display marked '>' provides a quick way of stepping through the played sequence.";
			help = help + " However, if the card played was non-optimal, you might choose to play a different card in order to investigate an alternate line of play.<br><br>";
			help = help + "Once you have deviated from the recorded line of play, no subsequent card will be prefixed with an *. You can use the button at the bottom of the display marked '<' to step back until you rejoin the original played sequence.<br><br>";
			help = help + "The 'Acc' button (Accuracy of Play) provides information on the extent to which the actual line of play differs from an optimal double dummy line of play. "
			help = help + "For each player it shows the number of cards played that were sub-optimal.<br><br>";
			
			if (showTravellerRowButtons())
			{
				help = help + "The '<' and '>' buttons in the top right panel of the board display enable you to step backwards and forwards through ";
				help = help + "the traveller rows to see how the same board was bid and played at other tables<br><br>";
			}
			
			help = help + "</span></div>";
			help = help + "<button id=hide_playMatchContractHelp style=\"cursor:pointer;\">Close</button>";
	}
	document.getElementById("playMatchContractHelp").innerHTML = help;
}

function setupEditHelp()
{
	switch(language)
	{
		case "de":
			var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\"><span style=\"font-size:16px;\">";
			help = help + "Karten, die noch keiner Hand zugewiesen wurden, werden Grün dargestellt. ";
			help = help + "Klicken Sie auf eine grüne Karte, um sie der aktuellen Hand zuzuweisen.<br><br>";
			help = help + "Karten, die der aktuellen Hand zugewiesen wurden, werden mit einem Haken markiert. ";
			help = help + "Klicken Sie auf eine angehakte Karte, um Sie von der aktuellen Hand zu entfernen. ";
			help = help + "Der 'Löschen'-Knopf entfernt alle Kartenzuweisungen für alle Hände.<br><br>";

			if ((g_test==1)|(g_xml!=""))
				help = help + "Benutze den Knopf 'Ändere Gefahrenlage', um die Gefahrenlage zu ändern. ";
			else
				help = help + "Benutze die Knöpfe 'Ändere Gefahrenlage' und 'Ändere Teiler', um die Gefahrenlage bzw. den Teiler zu ändern. ";

			help = help + "Machbare Kontrakte und optimale Kontrakte/Anschriften können durch Klicken auf 'Analyse' berechnet werden, nachdem Sie den Bearbeitungsmodus verlassen haben, ";
			help = help + "vorausgesetzt, dass alle 52 Karten zugewiesen wurden (das Ändern der Gefahrenlage kann den optimalen Kontrakt bzw. Anschrift beeinflussen).<br><br>";
			help = help + "Der 'Neu...'-Knopf fügt ein neues leeres Board zum vorhandenen Boardsatz hinzu.";
			help = help + "Sämtliche Änderungen, die am aktuellen Board vorgenommen wurden, bleiben dabei erhalten.<br><br>";
			help = help + "Der 'Löschen'-Knopf löscht das gerade bearbeitete Board. Gibt es nur ein Board, kann dieses nicht gelöscht werden.<br><br>";
			help = help + "Die '<'-, '>'- und 'Gehe zu'-Knöpfe erlauben die Navigation zwischen den Boards, ohne den Bearbeitungsmodus zu verlassen. ";
			help = help + "Sämtliche Änderungen, die am aktuellen Board vorgenommen wurden, bleiben dabei erhalten.<br><br>";
			help = help + "Verlassen Sie den Bearbeitungsmodus durch Klicken auf den 'Fertig'-Knopf oder spielen Sie die Hand durch Klicken auf einen Eintrag in der Tabelle der machbaren Kontrakte.<br><br>";
			help = help + "Hände können auch gespielt werden, wenn weniger als 52 Karten zugewiesen wurden, vorausgesetzt, jede Hand enthält dieselbe Anzahl an Karten.<br><br>";
			help = help + "</span></div>";
			help = help + "<button id=hide_editHelp style=\"cursor:pointer;\">Schließen</button>";
			break;
		default:
			var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\"><span style=\"font-size:16px;\">";
			help = help + "Cards not yet assigned to any quadrant are shown in green. ";
			help = help + "Click on a green card to assign it to the current quadrant.<br><br>";
			help = help + "Cards assigned to the hand in the current quadrant are shown with a check mark. ";
			help = help + "Click on a checked card to de-assign it. ";
			help = help + "The 'Clear' button de-assigns all cards from all quadrants.<br><br>";

			if ((g_test==1)|(g_xml!=""))
				help = help + "Use the 'Change Vulnerability' button to change the board vulnerability. ";
			else
				help = help + "Use the 'Change Vulnerability' and 'Change Dealer' buttons to change the board vulnerability and dealer. ";

			help = help + "Makeable contracts and optimum contracts/scores can be calculated by clicking the 'Analyse' button after exiting edit mode, ";
			help = help + "providing that all 52 cards have been assigned (changing the vulnerability can affect the optimum contract/score).<br><br>";
			help = help + "The 'New...' button adds a new empty board to the current set of boards.";
			help = help + "Any changes made to the board currently being edited are retained.<br><br>";
			help = help + "The 'Delete' button deletes the board currently being edited. If there is only a single board then it cannot be deleted.<br><br>";
			help = help + "The 'Prev', 'Next', and 'GoTo' buttons facilitate navigation between boards without leaving edit mode. ";
			help = help + "Any changes made to the board currently being edited are retained.<br><br>";
			help = help + "Exit from edit mode by clicking the 'Done' button, or play the hand by clicking a '-' entry in the makeable contracts table.<br><br>";
			help = help + "Hands can be played starting with less than 52 cards providing each quadrant contains the same number of cards.<br><br>";
			help = help + "</span></div>";
			help = help + "<button id=hide_editHelp style=\"cursor:pointer;\">Close</button>";
	}
	document.getElementById("editHelp").innerHTML = help;
}

function setupPlayHelp()
{
	switch(language)
	{
		case "de":
			var help = "<div style=\"float:left;word-wrap:break-word;\"><span style=\"font-size:16px;\">";
			help = help + "Klicken Sie auf eine grüne oder gelbe Karte, um sie zu spielen.<br><br>";
			help = help + "Eine Karte mit einem blauen Sternchen zeigt an, dass diese das aktuelle Ausspiel im gewählten Kontrakt war.<br><br>";
			help = help + "Die Ziffern bei grünen und gelben Karten zeigen an, wieviele Stiche erzielt werden können, sowohl für Alleinspieler als auch Gegner, wenn diese Karte gespielt wird und ";
			help = help + "alle folgenden vom Alleinspieler und Gegner gespielten Karten grüne sind. <br><br>";
			help = help + "Blau markierte Karten zeigen im aktuellen Stich gespielte Karten an.<br><br>";
			help = help + "Grau markierte Karten sind in einem vorherigen Stich gespielt worden.<br><br>";
			help = help + "Der '<'-Knopf nimmt gespielte Karten jeweils einzeln zurück.<br><br>";
			help = help + "Klicken Sie auf 'Stop', um das Abspiel zu verlassen.<br><br>";
			help = help + "</span></div>";
			help = help + "<button id=hide_playHelp style=\"cursor:pointer;\">Schließen</button>";
			break;
		default:
			var help = "<div style=\"float:left;word-wrap:break-word;\"><span style=\"font-size:16px;\">";
			help = help + "Click on a green or yellow card to play the card.<br><br>";
			help = help + "A card value preceded by a blue asterisk indicates the lead card that was actually played by the defender on lead in the selected contract.<br><br>";
			help = help + "The subscript on the green and yellow cards shows the number of tricks that will be made, by declarer or the defenders, if this card is played and ";
			help = help + "all subsequent cards played by declarer and the defenders are green cards. <br><br>";
			help = help + "Cards highlighted in blue are cards already played as part of the current trick.<br><br>";
			help = help + "Cards which are greyed out have been played as part of a previous trick.<br><br>";
			help = help + "The button marked with a '<' can be used to unplay one or more cards.<br><br>";
			help = help + "Click on 'Stop' to leave play mode.<br><br>";
			help = help + "</span></div>";
			help = help + "<button id=hide_playHelp style=\"cursor:pointer;\">Close</button>";

	}
	document.getElementById("playHelp").innerHTML = help;
}

function setupCommandHelp()
{
	switch(language)
	{
		case "de":
			var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:500px;\"><span style=\"font-size:16px;\">";
			help = help + "Drücken Sie auf den 'Analyse'-Knopf, um machbare Kontrakte und optimale Kontrakte/Anschriften für das angzeigte Board zu berechnen.<br><br>";
			help = help + "Drücken Sie den 'Bearbeiten'-Knopf, um das aktuelle Board zu bearbeiten, den Teiler oder die Gefahrenlage zu ändern oder um Boards hinzuzufügen oder zu löschen.<br><br>"
			help = help + "Um einen Kontrakt interaktiv abzuspielen, drücken Sie auf einen EIntrag in der Tabelle der machbaren Kontrakte (einschließlich solcher, die mit '-' oder '*' markiert sind)<br><br>";
			help = help + "Ein hellgelb markierter Eintrag in der Tabelle der machbaren Kontrakte zeigt den aktuell ";
			help = help + "im Turnier gespielten Kontrakt an.<br><br>";

			if ((g_test==1)|(g_xml!=""))
			{
				help = help + "Drücken Sie den 'Bearbeiten'-Knopf, um das aktuelle Board zu bearbeiten oder um die den Teiler oder die Gefahrenlage zu ändern.<br><br>"
				help = help + "Der 'Gehe zu'-Knopf dient der Auswahl irgendeines Boards aus dem geladenen Boardsatz.<br><br>";
				help = help + "Die '<'- und '>'-Knöpfe wechseln zwischen den Boards (rückwärts bzw. vorwärts).<br><br>";
				help = help + "Der 'Ergebnis-Analyse'-Modus analysierte Genauigkeit gegenüber Double Dummy und gegenüber anderen Paaren. Klicken Sie <a href=\"bsolhelp.htm\" target=_blank class=myLink>hier</a> für weitere Informationen<br><br>";    
			}
			else
			{
				help = help + "Drücken Sie den 'Bearbeiten'-Knopf, um das aktuelle Board zu bearbeiten oder um die den Teiler oder die Gefahrenlage zu ändern oder um Boards hinzuzufügen oder zu löschen.<br><br>"
				help = help + "Der 'Gehe zu'-Knopf, sofern vorhanden, dient der Auswahl irgendeines Boards aus dem geladenen Boardsatz.<br><br>";
				help = help + "Die '<'- und '>'-Knöpfe wechseln zwischen den Boards (rückwärts bzw. vorwärts).<br><br>";
				help = help + "Mit dem 'Speichern'-Knopf können Sie die Boards als PBN-Datei abspeichern.<br><br>";
				
				if ((typeof g_hands.lin)!="undefined")
					help = help + "Der 'Speichern als LIN'-Knopf speichert das aktuelle Board als Datei im LIN-Format ab, welches Spielernamen, Reizung und Abspiel enthält.<br><br>";
			}
			
			help += "'Mehr../Alle Boards analysieren' berechnet machbare/optimale Kontrakte für alle geladenen Boards<br><br>"; 
			help += "'Mehr../Matrix zur Spielgenauigkeit' berechnet und zeigt die Anzahl der Abweichungen gegenüber optimalem Double Dummy Abspiel für alle Spieler und alle Boards an. ";
			help += "Diese Funktion ist nur verfügbar, wenn ein Abspiel vorhanden ist (überlicherweise nur in online gespielten Turnieren).<br><br>"; 
			
			help = help + "</span></div>";
			help = help + "<div style=\"clear:both;\"><button id=hide_commandHelp style=\"cursor:pointer;\">Schließen</button></div>";
			break;
		default:
				var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\"><span style=\"font-size:16px;\">";
				help = help + "Press the 'Analyse' button to calculate makeable contracts and optimum contracts/scores for the displayed board.<br><br>";
				help = help + "Press the 'Edit' button to edit the current board, change dealer or vulnerability, or to add/delete boards.<br><br>"
				help = help + "Start playing a contract interactively by clicking on an entry in the makeable contracts table (including entries shown as '-' or '*')<br><br>";
				help = help + "A button highlighted bright yellow in the makeable contracts table designates the suit/declarer combination actually played ";
				help = help + "in a club game or tournament.<br><br>";

				if ((g_test==1)|(g_xml!=""))
				{
					help = help + "Press the 'Edit' button to edit the current board, or to change the dealer or vulnerability.<br><br>"
					help = help + "The 'Goto...' button allows any board to be selected from the set of boards for the current event.<br><br>";
					help = help + "The '<' and '>' buttons step backwards or forwards through the set of boards.<br><br>";
					help = help + "The 'Results Analysis' mode enables you to analyse your performance and card play against double dummy and against other pairs. Click <a href=\"bsolhelp.htm\" target=_blank class=myLink>here</a> for more information<br><br>";  
				}
				else
				{
					help = help + "Press the 'Edit' button to edit the current board, change dealer or vulnerability, or to add/delete boards.<br><br>"
					help = help + "The 'Goto...' button, if present, allows any board to be selected from the set of boards.<br><br>";
					help = help + "The '<' and '>' buttons, if present, step backwards or forwards through the set of boards.<br><br>";
					help = help + "The 'Save' button saves the set of boards as a PBN file.<br><br>";
					
					if ((typeof g_hands.lin)!="undefined")
						help = help + "The 'Save As LIN' button saves the current board as a LIN format file, including player names, auction and play data.<br><br>";
				}
				
				help += "'More../Analyse All Boards' calculates makeable contracts/optimum contracts for all boards in the current board set<br><br>"; 
				help += "'More../Show Player Accuracy Matrix' calculates and displays the number of deviations from optimal double dummy play for all players for all boards in the current board set. ";
				help += "This function is only available if the boards contain a record of the cards played (usually only available for events played online).<br><br>"; 
				
				help = help + "</span></div>";
				help = help + "<div style=\"clear:both;\"><button id=hide_commandHelp style=\"cursor:pointer;\">Close</button></div>";
	}
	document.getElementById("commandHelp").innerHTML = help;
}

function setupSettingsHelp()
{
	switch(language)
	{
		case "de":
			var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\"><span style=\"font-size:16px;\">";

			help = help + "Die Einstellung <b>'Alle Boards automatisch analysieren'</b> legt fest, ob die Berechnung der machbaren bzw. optimalen Kontrakte sofort durchgeführt werden sollen. "
			help = help + "Diese Berechnungen finden im Hingergrund statt und verhindern nicht, dass Hände ";
			help = help + "währenddessen abgespielt werden können.<br><br>";

			help = help + "</span></div>";
			help = help + "<div style=\"clear:both;\"><button id=hide_settingsHelp style=\"cursor:pointer;\">Schließen</button></div>";
		break;
		default:
			var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;\"><span style=\"font-size:16px;\">";

			help = help + "The <b>'Auto-Analyse Entire Board Set'</b> setting determines whether Bridge Solver will start calculating makeable contracts and ";
			help = help + "optimum contracts/scores for all boards when Bridge Solver is invoked. This takes place in the background and ";
			help = help + "does not prevent hands being played while the calculation is in progress.<br><br>";

			help = help + "</span></div>";
			help = help + "<div style=\"clear:both;\"><button id=hide_settingsHelp style=\"cursor:pointer;\">Close</button></div>";
	}
	document.getElementById("settingsHelp").innerHTML = help;
}

function setupGeneralHelp()
{
	var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;\"><div style=\"font-size:16px;\">";

	switch(language)
	{
		case "de":
			help = help + "<div style='float:right'>" + g_version + "</div><br>";
			help = help + "<b>Legende:</b><br> ";
			help = help + "<i>LoTT:</i> Law of total tricks: Gesetz von der Gesamtzahl der Stiche. Dies gibt an, ob und um wieviele Stiche die aktuelle Hand von diesem Gesetz abweicht (siehe <a href='https://en.wikipedia.org/wiki/Law_of_total_tricks' target='_blank'>englischer Artikel in der Wikipedia</a>).<p>&nbsp;</p>	";
			help = help + "Boards können auf mehrere Arten eingegeben werden:<br><ul>";
			help = help + "<li>Über 'Datei auswählen': <br>Dabei können mehrere Boards aus einer .pbn-Datei eingelesen und analysiert werden.</li>";
			help = help + "<li>Über 'Hand manuell eingeben': <br>Eine einzelne Hand kann durch Auswahl der jeweiligen Karten für jede Position eingegeben werden.</li>";
			//help = help + "<li>Über 'URL verwenden': wenn Sie einen Link zu einer .pbn-Datei haben, können Sie diese hier eingeben. Voraussetzung ist, dass der Webserver, von dem die .pbn geholt werden soll, dies auch erlaubt. Andernfalls erscheint eine Fehlermeldung.</li></ul>";
			help = help + "<li>Über 'Hole Boards aus der Zwischenablage':<br>PBN-Daten aus anderen Quellen können hierüber durch Copy&Paste übergeben werden.</li>";
			help = help + "<li>Mittels der Tastenkombination 'STRG-V / CMD-V' können PBN/LIN/DLM-Daten auch eingefügt werden.</li>";
			help = help + "<li>Eine Datei mit PBN/LIN/DLM-Daten kann auch per Drag&amp;Drop eingefügt werden.</li>";
			help = help + "</li></ul>Ein einzelnes Board kann auch über URL-Parameter eingegeben werden. <br>Folgende Parameter sind dazu erforderlich:<br> ";
			help = help + "<ul><li><b>board</b>: die Boardnummer</li><li><b>dealer</b>: Teiler (N, E, S oder W)</li><li><b>vul</b>: Gefahrenlage (none, both, NS, EW)</li><li><b>north, east, south, west</b>: alle 4 Hände müssen übergeben werden. <br>Farben werden durch einen . getrennt. </li></ul>";
			//	help = help + "Beispiel:<p>";
			help = help + "<a href='?vul=none&board=1&east=9864.JT2.954.A72&south=AK2..KT762.QT643&west=J53.KQ876.AJ.K98&north=QT7.A9543.Q83.J5&dealer=n' target='_blank'>Beispiel</a>, <a href='URL-Parameters.html' target=_blank>Liste aller Parameter</a> <p>&nbsp;</p>";
			help = help + "</div></div>";
			help = help + "<div style=\"clear:both;\"><button id=hide_generalHelp style=\"cursor:pointer;\">Schließen</button></div>";
			break;
		default:
			help = help + "<div style='float:right'>" + g_version + "</div><br>";
			help = help + "<b>Legend:</b><br> ";
			help = help + "<i>LoTT:</i> Law of total tricks: This indicates whether and by how many tricks the current hand deviates from this law (see <a href='https://en.wikipedia.org/wiki/Law_of_total_tricks'>Wikipedia</a>).<p>&nbsp;</p>	";
			help = help + "Boards can be entered in different ways:<br><ul>";
			help = help + "<li>'Open file': <br>Files can contain more than one board which are read and analyzed all.</li>";
			help = help + "<li>'Enter hand': <br>A single hand can be entered by selecting all cards for each position.</li>";
			//help = help + "<li>Über 'URL verwenden': wenn Sie einen Link zu einer .pbn-Datei haben, können Sie diese hier eingeben. Voraussetzung ist, dass der Webserver, von dem die .pbn geholt werden soll, dies auch erlaubt. Andernfalls erscheint eine Fehlermeldung.</li></ul>";
			help = help + "<li>'Get boards data from clipboard':<br>PBN data from other sources can be entered via copy & paste.</li>";
			help = help + "<li>You can also paste PBN/LIN/DLM data using the keyboard shortcut 'CTRL-V / CMD-V'.</li>";
			help = help + "<li>A file with PBN/LIN/DLM data can entered via drag&amp;drop.</li>";
			help = help + "</li></ul>A single board can also be given via URL parameters. <br>The following parameters are required:<br> ";
			help = help + "<ul><li><b>board</b>: board number</li><li><b>dealer</b>: dealer (N, E, S or W)</li><li><b>vul</b>: Vulnerability (none, both, NS, EW)</li><li><b>north, east, south, west</b>: all 4 hands must be provided. <br>Suits are separated by a dot. </li></ul>";
			//	help = help + "Beispiel:<p>";
			help = help + "<a href='?vul=none&board=1&east=9864.JT2.954.A72&south=AK2..KT762.QT643&west=J53.KQ876.AJ.K98&north=QT7.A9543.Q83.J5&dealer=n'>Example</a>, <a href='URL-Parameters.html' target=_blank>List of all parameters</a><p>&nbsp;</p>";
			help = help + "</div></div>";
			help = help + "<div style=\"clear:both;\"><button id=hide_generalHelp style=\"cursor:pointer;\">Close</button></div>";
	}
	
	document.getElementById("generalHelp").innerHTML = help;
}

 function setupKRHelp()
{
    switch(language)
    {
        case "de":
            var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;font-size:16px;\">";
            help += "Wenn das Kontrollkästchen KR aktiviert ist, werden die Ergebnisse einer Kaplan-Rubens-Blattbewertung angezeigt, gefolgt von den Figurenpunkten in Klammern.<br><br>";
            help += "KR ist einer von mehreren Algorithmen, die versuchen, die Bewertung der Stärke eines Blatts durch einen Experten zu emulieren,  ";
            help += "indem sie Merkmale wie die Blattverteilung und die Lage der Figuren berücksichtigen, anstatt einfach die Punkte der Figuren zu addieren.  ";
            help += "Es handelt sich dabei natürlich um eine isolierte Bewertung, bei der nicht berücksichtigt wird, ob das Blatt des Partners passt oder nicht.<br><br>";
            help += "Es gibt eine Reihe von leicht unterschiedlichen Varianten des KR-Algorithmus, aber die von Bridge Solver Online verwendete Version entspricht der ";
            help += " <a href='http://www.rpbridge.net/8j19.htm' target='_blank'> von Richard Pavlicek's Website</a>, die alle Schritte der Berechnung beschreibt.<br><br>";
            help += "RP's eigene Version der Berechnung finden Sie hier <a href='http://www.rpbridge.net/cgi-bin/xhe1.pl' target='_blank'>hier</a>."
            help = help + "</div>";
            help = help + "<br><br><button id=hide_krHelpText style=\"cursor:pointer;\">Schließen</button>";
            break;
        default:
            var help = "<div style=\"float:left;word-wrap:break-word;overflow:scroll;max-height:300px;font-size:16px;\">";
            help += "When the KR checkbox is ticked, the results of a Kaplan Rubens hand evaluation are displayed, followed by high card points in brackets.<br><br>";
            help += "KR is one of a number of algorithms which attempt to emulate an expert's evaluation of the strength of a hand, taking into account features ";
            help += "such as the hand distribution and location of the honour cards, rather than simply adding up high card points. ";
            help += "It is of course an evaluation in isolation which does not take into account the fit, or lack thereof, with partner's hand<br><br>";
            help += "There are a number of slightly different variants of the KR algorithm but the version used by Bridge Solver Online matches ";
            help += "the <a href='http://www.rpbridge.net/8j19.htm' target='_blank'> one described on Richard Pavlicek's website</a>, which details all the steps used in the calculation.<br><br>";
            help += "RP's own version of the calculator can be found <a href='http://www.rpbridge.net/cgi-bin/xhe1.pl' target='_blank'>here</a>."
            help = help + "</div>";
            help = help + "<br><br><button id=hide_krHelpText style=\"cursor:pointer;\">Close</button>";
    }
	
	document.getElementById("krHelpText").innerHTML = help;
}