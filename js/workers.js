/**********************************************************************************
   -- Copyright (C) 2014-2025 by John Goacher - All Rights Reserved
   - This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/.
***********************************************************************************/

function listener(event,workerType)
{
	if (event.data && event.data.type=="worker-error")
	{
		handleWorkerError(event.data.message,workerType);
		return;
	}

	if ((event.data!=="initialised")&&(event.data!=="failed"))
	{
		if (!event.data || typeof event.data.context!="object" || !event.data.context)
		{
			handleWorkerError("Worker returned an invalid response",workerType);
			return;
		}

		var request = event.data.context.request;

		if (request=="m")
			dddLoadMakeable(event.data.result,"","",event.data.context.bindex);
		else if (request=="a")
		{
			if (event.data.context.requestSubType=="b")	// Background acc request
			{
				var result = JSON.parse(event.data.result);

				if ((typeof result.sess.status)!="undefined")
					console.log("error from background acc request, status code: " + result.sess.status);
				else
					storeAcc(result,event.data.context);

				var names = event.data.context.names;
				var tid = event.data.context.tid;

				var nameFound = false;

				for (var i=0;i<4;i++)
				{
					delete g_accTrans[names[i]].transList[tid];
				}

				if (allAccsProcessed())
				{
					finishBackgroundOperation();
					log('button=showPlayerAccMatrix');
					showPlayerAccMatrix();
				}
			}
			else
				load(event.data.result,null,null,event.data.context);
		}
		else if (request=="b")
		{
			dddLoadMakeable(event.data.result,"","",event.data.context.bindex);
		}
		else
		{
			if (event.data.context.para=="benchmark")
			{
				var res = JSON.parse(event.data.result);

				if (localStorageSupported())
					localStorage.setItem("benchmark",String(res.sess.deltaElapsed));

				console.log("benchmark time was " +  res.sess.deltaElapsed + " seconds");

				if (Number(res.sess.deltaElapsed)>0.12)
				{
				}

				buildPage1(g_initial_data,g_initial_options);
			}
			else
			{
				dddloadfunc(event.data.result,null,null,event.data.context);
			}
		}
	}
	else if (event.data=="failed")
	{
		hideSpinner();
		reportBSOLNotSupported();
		return;
	}
	else	// worker creation succeeded
	{
//				g_workerInitCount++;
		if (workerType=="main")
		{
			if (!g_initialised)	// buildPage1 hasn't run yet
			{
				if (localStorageSupported())
					var tmp = localStorage.getItem("benchmark");
				else
					tmp = null;

				if (tmp==null)
				{
						// generate benchmarking request
					var dealstr = "W:.AKQT954.KJ64.72xAKJ8.82.A8.KJT64x97652.76.Q92.AQ8xQT43.J3.T753.953";

					var msg = {};
					msg.request = "g";
					msg.pbn = dealstr;
					msg.trumps = "H";
					msg.leader = "n";
					msg.requesttoken = 1;
					msg.sockref = 1;

					var context = {};
					context.request = msg.request;
					context.para = "benchmark";
					msg.context = context;

					g_worker.postMessage(msg);
				}
				else
				{
					buildPage1(g_initial_data,g_initial_options);
				}
			}
		}
		else	// Background worker
		{
			g_workerInitCount++;
			console.log("initcount: " + g_workerInitCount);

			if (g_workerInitCount==g_mworkers.length)
			{
				if (g_bgObj.fn=="processAccs")
				{
					processAccs();
					return;
				}
			}

			if ((g_workerInitCount==g_mworkers.length))
			{
				if (g_bgObj.fn=="analyseAll")
				{
					g_bgObj.fn = "";
					console.log("calculate makeable all boards");
					calculateMakeableAllBoards();
				}
			}
		}
	}
}

function handleWorkerError(message,workerType)
{
	var prefix;

	if (workerType=="background" && g_mworkers.length==0)
		return;
	if (workerType=="main" && g_worker==null)
		return;

	if (language=="de")
	{
		prefix = workerType=="main" ? "Die Berechnung des Boards ist fehlgeschlagen" : "Die Hintergrundberechnung ist fehlgeschlagen";
	}
	else
	{
		prefix = workerType=="main" ? "Board calculation failed" : "Background calculation failed";
	}

	console.error(prefix + ": " + message);
	hideSpinner();

	if (workerType=="background")
		stopBackgroundWorkers();
	else
		g_worker = null;

	var text = prefix + ". " + message;
	var escaped = text.replace(/[&<>"']/g,function(character) {
		return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[character];
	});

	if (typeof displayErrorAbsPosition=="function")
		displayErrorAbsPosition("<div style=\"padding:10px;background-color:#FFEEEE;border:1px solid black;max-width:360px;\"><span style=\"font-size:16px;\">" + escaped + "</span></div>",100,100);
}

function listenerMain(event)
{
	listener(event,"main");
}

function listenerBackground(event)
{
	listener(event,"background");
}

function workerSupported()
{
	if (typeof(Worker)!=="undefined")
		return true;
	else
		return false;
}

function webAssemblySupported()
{
	try {
		if (typeof WebAssembly === "object"&& typeof WebAssembly.instantiate === "function") {
			const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
			if (module instanceof WebAssembly.Module)
				return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
		}
	} catch (e) {}

    return false;
}

function createBackgroundWorkers()
{
	var nworkers = 4;	// Make this the maximum number of concurrent worker threads for makeable contracts
	/*
	if (navigator.hardwareConcurrency<nworkers)
		nworkers = navigator.hardwareConcurrency;
	*/
	if (navigator.hardwareConcurrency) {
		nworkers = Math.floor(navigator.hardwareConcurrency/2);
	}
	console.log("Cores: " + navigator.hardwareConcurrency + " Workers: " + nworkers);

	for (var i=0;i<nworkers;i++)
	{
		var worker = new Worker("js/worker/calldds.js");
		worker.addEventListener("message",listenerBackground);
		worker.addEventListener("error",function(event) {
			handleWorkerError(event.message || "Worker failed to execute", "background");
		});
		g_mworkers.push(worker);
	}

	g_nextmworker = 0;
}

function stopBackgroundWorkers()
{
	console.log("stopping background worker threads");

	for (var i=0;i<g_mworkers.length;i++)
	{
		g_mworkers[i].terminate();
	}

	g_mworkers = [];

	g_workerInitCount = 0;
	g_nextmworker = 0;
	resetAnalyseAllBoards();
}

function createMainWorker()
{
	if (g_worker==null)
	{
		if ((g_hands!=null)&&(g_session!==0)) exitCardPlay();	// g_hands may not have been initialised yet when createMainWorker is called at startup
		console.log("creating main worker thread");
		g_worker = new Worker("js/worker/calldds.js");
		g_worker.addEventListener("message",listenerMain);
		g_worker.addEventListener("error",function(event) {
			handleWorkerError(event.message || "Worker failed to execute", "main");
		});
	} else {
        /* **KK**
         * Initializing necessary to allow files to be uploaded again (initially a second upload failed)
         * */
      g_worker = null;
      setHands(null);

      g_initialised = false;
      g_loaded = false;
      console.log("creating main worker thread again");
      g_worker = new Worker("js/worker/calldds.js");
      g_worker.addEventListener("message",listenerMain);
      g_worker.addEventListener("error",function(event) {
			handleWorkerError(event.message || "Worker failed to execute", "main");
		});
    }
}

function restartBackgroundWorkers()
{
		console.log("terminate then restart background workers");

		stopBackgroundWorkers();
		createBackgroundWorkers();	// Recreate them
}
