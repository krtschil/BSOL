function comparePositions(a,b)
{
	if (Number.isNaN(a)&&!Number.isNaN(b)) return 1;
	if (Number.isNaN(b)&&!Number.isNaN(a)) return -1;
	if (Number.isNaN(a)&&Number.isNaN(b)) return 0;
	a = Number(a);
	b = Number(b);
	if (a>b) return 1;
	else if (a<b) return -1;
	else return 0;
}