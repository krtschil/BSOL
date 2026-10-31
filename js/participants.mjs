export function isIndividual()
{
	return typeof g_travellers!="undefined" &&
		String(g_travellers?.event?.event_type).toUpperCase()=="INDIVIDUAL";
}

export function playerSeat(line,number)
{
	if (!line.player_numbers) return null;
	return ["N","E","S","W"].find(seat => String(line.player_numbers[seat])==String(number)) || null;
}

export function sidePlayers(line,direction)
{
	if (line.player_numbers)
		return (direction==1 ? ["N","S"] : ["E","W"]).map(seat => line.player_numbers[seat]);
	return [direction==1 ? line.ns_pair_number : line.ew_pair_number];
}

export function playerName(number)
{
	const participant = g_travellers.event.participants.pair.find(entry =>
		String(entry.pair_number)==String(number));
	if (!participant) throw new Error("Unknown participant " + number);
	return participant.player[0].player_name;
}

export function sideNames(line,direction)
{
	const numbers = sidePlayers(line,direction);
	return {player1: playerName(numbers[0]), player2: playerName(numbers[1])};
}
