function getPBNSegment(data)
{
		// Return information for one board from the PBN data and also remove these lines from the original array
	var i;

	for (i=0;i<data.length;i++)
	{
		if (data[i].trim().length==0)
			break;
	}

		//Return rows up to and including i, and remove them from the data array,
	return data.splice(0,i+1);
}

function getLineNotes(data,s) // read Notes (explanation for alerts)
{		// Used by pbnToJson function
	var line;
	var i;
	var noteNr;
	var notes = [];
	var found = 0;

	for (i=0;i<data.length;i++)
	{
		line = data[i];
		var pos = line.indexOf(s);

		if (pos!=-1)
		{
			found = 1;

			line = line.replaceAll("\\\"","");

			line = line.substring(s.length);
			pos = line.indexOf('"');
			line = line.substring(pos+1);
			pos = line.indexOf('"');
			line = line.substring(0,pos);

			noteNr = line.substring(0,1);
			pos = line.indexOf(':');
			line = line.substring(pos+1);

			notes[noteNr] = line;
		}

	}
	if (found==1) {
		return notes;
	} else {
		return null;
	}
}

function getLineFull(data,s,pre) // read multi line data (Auction and Play in pbn)
{
	// Used by pbnToJson function
	var line;
	var rline = "";
	var i;

	for (i=0;i<data.length;i++)
	{
		line = data[i];
		var pos = line.indexOf(s);

		if (pos!=-1)
		{
			i++;
			line = data[i];
			while ( typeof line != 'undefined' && (line.substring(0,1)!="[") && (line !=""  )){
				//if (i+1<data.length) i++;
				if (pre)
				{
					rline = rline + "<br>" + data[i];
				} else {
					rline = rline + " " + data[i];
				}

				i++;
				line = data[i];
			}

			return rline;
		}
	}
	return "";
}

function getLine(data,s,resetFlag)
{
		// Used by pbnToJson function
	var line;
	var i;

	for (i=0;i<data.length;i++)
	{
		line = data[i];
		var pos = line.indexOf(s);

		if (pos!=-1)
		{
			line = line.substring(s.length);
			pos = line.indexOf('"');
			line = line.substring(pos+1);
			pos = line.indexOf('"');
			line = line.substring(0,pos);
			if (!resetFlag) data.splice(0,i+1);

			if (line!="?" && line!=""){
				return line;
			} else {
				return null;
			}
			return line;
		}
	}

	return null;
}