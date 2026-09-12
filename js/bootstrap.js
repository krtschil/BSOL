/**********************************************************************************
   -- Copyright (C) 2014-2025 by John Goacher - All Rights Reserved
   - This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/.
***********************************************************************************/

function buildPage(data,options)
{
//document.body.style.transform = 'scale(' + $(window).width()/800 + ')';
//document.body.style['-o-transform'] = 'scale(' + $(window).width()/800 + ')';
//document.body.style['-webkit-transform'] = 'scale(' + $(window).width()/800 + ')';
//document.body.style['-moz-transform'] = 'scale(' + $(window).width()/800 + ')';
	g_file = "";
	g_handstr = "";
	g_handstrType = "";
	g_xml = "";
	g_xmlstr = "";
	g_loaded = false;
	g_travellers = null;
	g_currentTraveller = null;
	g_sessInfo = null;
	g_rankInfo = null;

	g_initial_data = data;
	g_initial_options = options;
	largeSpinner();
	console.log("start: " + (new Date).toUTCString());

	if (webAssemblySupported()&&workerSupported())
	{
		createMainWorker();
	}
	else
	{
		hideSpinner();
		reportBSOLNotSupported();
	}
}

function buildPage1(data,options)
{
	g_initialised = true;
	$("#largeSpinner").finish();

//	if (webAssemblySupported()&&workerSupported())	// Create background workers, even if "play it again" will user remote server
//		createBackgroundWorkers();

	var defaultOptions = getCookie("BSOL_options");

    g_protocol = location.protocol  || 'http:';

    if (g_protocol != 'https:')
    {
        g_protocol = 'http:';
    }

	hide("bsession");
	hide("bsessionHelp");
	hide("branking");
	hide("bscorecard");
	hide("btraveller");
	hideRanking();
	hide("scores");

	document.getElementById("northHand").style.whiteSpace = "nowrap";
	document.getElementById("eastHand").style.whiteSpace = "nowrap";
	document.getElementById("southHand").style.whiteSpace = "nowrap";
	document.getElementById("westHand").style.whiteSpace = "nowrap";
	document.getElementById("miniNorth").style.whiteSpace = "nowrap";
	document.getElementById("miniEast").style.whiteSpace = "nowrap";
	document.getElementById("miniSouth").style.whiteSpace = "nowrap";
	document.getElementById("miniWest").style.whiteSpace = "nowrap";

	var referrer = document.referrer;

	var idx = document.referrer.indexOf("testpbntojson");

	var sctable = document.getElementById("scoring");

	if (sctable.rows[1].cells.length<8) g_ofs = 0;

	var table = document.getElementById("rankingNS");
	table.rows[0].cells[4].id = "rankingDD";

	if (idx!=-1)
		g_test = 1;

	// A new file or clipboard import replaces any traveller source from the
	// previous session.
	g_file = "";
	g_handstr = "";
	g_handstrType = "";
	g_xml = "";
	g_xmlstr = "";
	g_loaded = false;
	g_travellers = null;
	g_currentTraveller = null;
	g_sessInfo = null;
	g_rankInfo = null;

	if ((typeof data.file)!="undefined")
		g_file = data.file;

	if ((typeof data.handstr)!="undefined")
	{
		g_file = 1;	// Indicate pbn has been supplied as a literal string
		g_handstr = data.handstr;
		g_handstrType = data.handstrType;
		delete data.handstr;
		delete data.handstrType;
	}

	if ((typeof data.xml)!="undefined")
		g_xml = data.xml;		// url of file containing travellers etc. has been providedg

	if ((typeof data.xmlstr)!="undefined")	// Indicate json has been supplied as a literal string
	{
		g_xml = 1;
		g_xmlstr = data.xmlstr;
		delete data.xmlstr;	// Delete field because it makes ajax requests containing g_hands very large
	}

	if ((typeof data.debug)!="undefined")
		if (data.debug=="true")
			g_debug = true;

	initSettings();

	if (defaultOptions === undefined)
		setOptions(options);
	else
		setOptions(defaultOptions);

	g_credits = "<span style=\"font-size:12px;\"><a href=\"https://mirgo2.co.uk/bridgesolver\" target=\"_blank\">Bridge Solver Online</a>:<br><span style=\"font-weight:bold\">John Goacher</span></span><br><br><span style=\"font-size:12px;\">Double Dummy Solver Module:<br><span style=\"font-weight:bold\">Bo Haglund</span></span>";

		// Make sure there is a defined "trim" function (needed for IE8 and earlier)
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	  }
	}

	$(window).on("orientationchange",function(event){
		window.t = setTimeout(function(){orientationChanged();},250);
	});

	$("#computeMakeable").keypress(function(e){
   			if(e.keyCode === 13){
       			e.preventDefault();
   			}});

	setDisplaySizing();

//	document.getElementById("scrollDiv").style.height = (height + 10) + "px";

	hideRanking();
	hide("scores");
	hide("scoreandtraveller");

	document.getElementById("northHand").onclick = function() {selectQuadrant(0);};
	document.getElementById("eastHand").onclick = function() {selectQuadrant(1);};
	document.getElementById("southHand").onclick = function() {selectQuadrant(2);};
	document.getElementById("westHand").onclick = function() {selectQuadrant(3);};
	document.getElementById("bsession").onclick = gotoSession;
	document.getElementById("computeMakeable").onclick = function () {calculateMakeableSingleBoard(g_lastBindex);};
	document.getElementById("gotoBoard").onclick = function() {getHands({callback:showBoardKeypad});};
	document.getElementById("newBoard").onclick = showNewBoardSelector;
	document.getElementById("deleteBoard").onclick = showDeleteConfirmation;

	if (document.getElementById("saveLIN")!=null) document.getElementById("saveLIN").onclick = function() {hideAllPopups();downloadFile(g_hands.lin,"text/lin","board.lin");};
	document.getElementById("saveBoards").onclick = function() {hideAllPopups();getHands({callback:generatePBN});};
//	document.getElementById("analyseAllBoards").onclick = calculateMakeableAllBoards;
//	document.getElementById("saveSingleBoard").onclick = function() {generatePBN(false);$("#toolsSubMenu").hide();};
//	document.getElementById("closetoolsSubMenu").onclick = function(){$("#toolsSubMenu").hide();};
	document.getElementById("aranking").onclick = function() {log("button=AllPairs");setupRanking();};
	document.getElementById("ascorecard").onclick = function() {log("button=Personal");setupScorecard();};
	document.getElementById("aacc").onclick = function() {log("button=showAccMatrix");callGetIndexedAcc();};
	document.getElementById("atraveller").onclick = function() {log("button=Traveller");showComparison();};
	document.getElementById("tools").onclick = function() {showtoolsSubMenu();};
	document.getElementById("analyseAllBoards").onclick = function() {getHands({callback:startAnalyseAll});};
	document.getElementById("showPlayerAcc").onclick = function() {getHands({callback:callGetIndexedAcc});};
	document.getElementById("showSettings").onclick = function() {getHands({callback:showSettings});};
	document.getElementById("showReleaseHistory").onclick = function() {window.open("releaseNotes.htm","_blank");};

	if (document.getElementById("aprev")!=null)
	{
		document.getElementById("aprev").onclick = function(){log('button=prevTraveller');setLastBoardIndex(getNextOrPrevBindex(false));showComparison();};
		document.getElementById("anext").onclick = function(){log('button=nextTraveller');setLastBoardIndex(getNextOrPrevBindex(true));showComparison();};
	}

	if (document.getElementById("acheck")!=null)
	{
//		document.getElementById("acheck").onclick = function(){log("button=check");checkAllContracts();};
		document.getElementById("acheck").style.display = "none";
	}

	document.getElementById("agotoboard").onclick = showTravellerKeypad;
	document.getElementById("aboard").onclick = showCurrentBoard;
	document.getElementById("rankcheck").onclick = function(){sortRanking(!document.getElementById("rankcheck").checked);setupRanking()};

	var cell = document.getElementById("scPlayerNames");

	switch(language)
	{
		case "de":
			cell.innerHTML = "<div style='float:left;'><select id='sortMode' name='sortMode' style='background-color:yellow;'><option value=0>Nach Rolle sortieren</option><option value=1>Nach Board sortieren</option></select></div><div style='float:left;vertical-align:middle;margin-left:10px;'><span id='scPlayerNames2' style='color:white;'></span></div>";
			break;
		default:
			cell.innerHTML = "<div style='float:left;'><select id='sortMode' name='sortMode' style='background-color:yellow;'><option value=0>Sort By Role</option><option value=1>Sort by Board</option></select></div><div style='float:left;vertical-align:middle;margin-left:10px;'><span id='scPlayerNames2' style='color:white;'></span></div>";
	}

	document.getElementById("sortMode").onchange = function(){log("operation=sortMode:"+this.selectedIndex);setupScorecard(true);};

	var krckbox = document.getElementById("krcalc");

	if (krckbox!==null)
	{
		krckbox.onchange = function(){
								var krck = document.getElementById("krcalc");

								if (localStorageSupported())
								{
									if (krck.checked)
										localStorage.setItem("krcalc","true");
									else
										localStorage.setItem("krcalc","false");
								}

								updatePointsDisplay();
							};
		setupKRHelp();
		document.getElementById("krhelp").onclick = function(){showHelp(this,"krHelpText");};
	}

	g_defaultTravellerWidth = document.getElementById("traveller").style.width;
	g_inactiveCards = new Array(4);
	g_playableCards = new Array(4);
	setCurrentTrickCards(new Array(4));

	for (i=0;i<4;i++)
	{
		g_playableCards[i] = new Array(13);
		g_inactiveCards[i] = new Array(13);
		g_currentTrickCards[i] = new Array(13);

		for (j=0;j<13;j++)
		{
			g_playableCards[i][j] = -1;
			g_inactiveCards[i][j] = 0;
			g_currentTrickCards[i][j] = 0;
		}
	}

	setHands(data);

//	g_hands.boards = pbnToJson(g_handstr);

	if ((typeof g_hands.lin)!=="undefined")
	{
		var linstr = linToJson(g_hands.lin);
		var linhands = JSON.parse(linstr);
		g_hands.boards = linhands.boards;
	}

		// Set defaults in case pair number and direction not provided.
	if ((typeof g_hands.pair_number)=="undefined") g_hands.pair_number = "";
	if ((typeof g_hands.direction)=="undefined") g_hands.direction = 1;
	if (g_hands.direction=="") g_hands.direction = 1;
	if (g_hands.direction=="NS") g_hands.direction = 1;
	else if (g_hands.direction=="EW") g_hands.direction = 2;

	if ((g_hands.pair_number=="")&&((typeof g_hands.lin)!=="undefined")) g_showAllControls = false;

	openIndexedDB();	// Will call getHands or buildPage2 from onsuccess callback
}

function buildpage2()
{
	var rank1button = document.getElementById("rank1");
	var rank2button = document.getElementById("rank2");

//	g_lastBindex = 0;
	hide("next");
	hide("prev");

	$("#allBoards").hide();
	$("#scoreandtraveller").hide();;

	var prev = document.getElementById("prev");
	prev.onclick = function(){log("button=prevBoard");getHands({callback:gotoPrevTraveller});}

	var next = document.getElementById("next");
	next.onclick = function(){log("button=nextBoard");getHands({callback:gotoNextTraveller});}

	if ((typeof g_hands.Title)!="undefined")
		g_title = g_hands.Title;

	const clean = DOMPurify.sanitize(g_title, { RETURN_DOM_FRAGMENT: true });
	document.getElementById("titleText").replaceChildren(clean); //innerHTML = g_title;

	setupCommandHelp();
	setupPlayHelp();
	setupEditHelp();
	setupSettingsHelp();
	setupPlayMatchContractHelp();
	showMainMenuItems();
	if (g_file=="") setupTraveller(g_lastBindex,true);
	enterPlayMode();	// Large version of traveller with clickable contracts

	g_playItAgain = true;

	var emptyHand = false;

	if ((typeof g_hands.display)=="undefined")
	{
		$("#mainTitle").show();

		if (g_hands.boards.length==1)
		{
			setLastBoardIndex(0);
			var board = g_hands.boards[g_lastBindex];
			var count = 0;

			for (i=0;i<4;i++)
			{
				count = count + board.Deal[i].length;
			}

			if (count==12)	// Only one board, and it's empty (just contains the suit separators), so go into edit mode.
			{
				emptyHand = true;

				if (g_xml=="")
					edit();	// Go into edit mode if no travellers
				else
					g_hands.display = "allpairs";
			}
		}

		if (!emptyHand)
			$("#scoreandtraveller").show();

		if ((typeof g_hands.forceAnalyse)!="undefined")	// Call "analyse" automatically.
		{
			calculateMakeableSingleBoard(g_lastBindex);
		}
		else
		{
			if (((g_hands.boards.length==1))&&(g_file==""))
				calculateMakeableSingleBoard(g_lastBindex); // Calculate them anyway if not defined
			else
			{
				if (document.getElementById("mkauto1").checked)
				{
					g_bgObj.fn = "analyseAll";

					createBackgroundWorkers();
				}
			}
		}
	}

	hideSpinner();

	if ((typeof g_hands.display)!="undefined")
	{
		g_playItAgain = false;

		var display = g_hands.display;
		log("button=analysis");

		if (display=="allpairs")
		{
		    g_sessionMode = "ranking";
			getHands({callback:setupRanking});
		}
		else if (display=="personal")
		{
		    g_sessionMode = "scorecard";
			getHands({callback:setupScorecard});
		}
		else if (display=="board")
		{
		    g_sessionMode = "traveller";
			getHands({callback:showComparison});
		}
		else if (display=="check")
		{
			g_sessionMode = "check";
			getHands({callback:checkAllContracts});
		}
		else
		{
			g_playItAgain = true;
		}
	}

	console.log("initialisation complete: " + (new Date).toUTCString());

	showNewFeaturesNotice();
}
