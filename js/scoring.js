function validContract(contract)
{
	var levels = "1234567";
	var suits = "CDHSN";

	if (contract==null) return false;
	if (contract.length<2) return false;

	if (levels.indexOf(contract.charAt(0))==-1) return false;
	if (suits.indexOf(contract.charAt(1))==-1) return false;

	return true;
}

function convertParContract(str)
{
	if (str.length<=2) return str;

	var firstNum = Number(str.charAt(0));
	var lastNum = Number(str.charAt(str.length-2));
	var diff = lastNum-firstNum;
	str = str.charAt(0) + str.charAt(str.length-1) + "+" + diff;
	return str;
}

function convertParContractString(str)
{
	var result="";
	var idx = 0;

	while (idx<str.length)
	{
		var ch = str.charAt(idx);
		if (!Number.isNaN(parseInt(ch,10)))
		{
			var firstIdx = idx;

			idx++;

			while (idx<str.length)
			{
				ch = str.charAt(idx);
				if (!Number.isNaN(parseInt(ch,10)))
				{
					idx++;
				}
				else
					break;
			}

			idx++;
			result = result + convertParContract(str.substring(firstIdx,idx));
		}
		else
		{
			result = result + str.charAt(idx);
			idx++;
		}
	}

	return result;
}

function convertVulStr(vulstr)
{
	var vul = ["None","All","NS","EW"];

	vulstr = vulstr.toUpperCase();

	for (var i=0;i<vul.length;i++)
	{
		if (vul[i].toUpperCase()==vulstr)
			return i;
	}

	return -1;
}

function getContractType(contract)
{
	var result = {};
	result.ctype = 0;	// assume part score
	result.str = "a part score";
	var minor = "CD";
	var major = "HS";
	var nt = "N";
	var level = Number(contract.charAt(0));
	var suit = contract.charAt(1);

	switch(language)
	{
		case "de":
			if (level==7)
			{
				result.ctype = 3;
				result.str = "ein Großschlemm";
				return result;
			}

			if (level==6)
			{
				result.ctype = 2;
				result.str = "ein Kleinschlemm";
				return result;
			}

			if (((level==5)&&(minor.indexOf(suit)!=-1))||((level>=4)&&(major.indexOf(suit)!=-1))||((level>=3)&&(nt==suit)))
			{
				result.ctype = 1;
				result.str = "Vollspiel";
				return result;
			}
			break;
		default:
			if (level==7)
			{
				result.ctype = 3;
				result.str = "a grand slam";
				return result;
			}

			if (level==6)
			{
				result.ctype = 2;
				result.str = "a small slam";
				return result;
			}

			if (((level==5)&&(minor.indexOf(suit)!=-1))||((level>=4)&&(major.indexOf(suit)!=-1))||((level>=3)&&(nt==suit)))
			{
				result.ctype = 1;
				result.str = "game";
				return result;
			}
	}

	return result;	// Part Score;
}

function comparePairNumbers(a,b)
{
	if ((!Number.isNaN(a))&&(!Number.isNaN(b)))	// The pair numbers are wholly numeric
	{
		a = Number(a);
		b = Number(b);
		if (b<a) return 1;
		else if (b==a) return 0;
		else return -1;
	}

	if ((a.indexOf("-")!=-1)||(b.indexOf("-")!=-1))	// Hyphenated pair number for team-player1-player2
	{
		a = a.split("-");
		b = b.split("-");

		if (a.length!=b.length) return 0;

		var i;

		for (i=0;i<a.length;i++)
		{
			if (Number.isNaN(a[i])||Number.isNaN(b[i])) return 0;
			var result = comparePairNumbers(a[i],b[i]);
			if (result!=0) return result;
		}

		return 0;
	}

		// The pair numbers contain a letter (is it a prefix or a suffix ?)
	if ((b.charAt(0)>'9')||(a.charAt(0)>'9')) // ACBL Score style (prefix letter)
	{
		if (b.charAt(0)<a.charAt(0)) return 1;
		else if (b.charAt(0)>a.charAt(0)) return -1;

		a = a.substring(1);
		b = b.substring(1);

		if ((a.length>0)&&(b.length>0))
			return comparePairNumbers(a,b);
		else return 0;
	}
	else	// Scorebridge style with prefix letter last.
	{
		if (b.substring(b.length-1)<a.substring(a.length-1)) return 1;
		else if (b.substring(b.length-1)>a.substring(a.length-1)) return -1;

		a = a.substring(0,a.length-1);
		b = b.substring(0,b.length-1);

		if ((a.length>0)&&(b.length>0))
			return comparePairNumbers(a,b);
		else return 0;
	}
}