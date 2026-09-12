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