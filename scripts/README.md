# DBF / DAT Traveller converter

This directory contains an internal conversion utility for importing the
combined `exportid*.dat` export or the separate DBF tables from the German
bridge scoring application into BSOL Traveller JSON and USEBIO XML.
It is a command-line utility, not part of the browser UI.

## Usage

The combined export is the simplest input:

```sh
python3 scripts/dbf-traveller-to-json.py \
  --export-dat exportid2271.dat \
  --output traveller.json
```

The `.dat` file contains five tagged Visual FoxPro DBF tables: tournament
metadata (`u`), participants (`t`), ranking (`p`), play results (`r`) and board
deals (`b`). The converter checks table boundaries and markers, then uses the
same result conversion as for individual DBF files. It takes the tournament
date from `DATUM`, not the DBF header's last-update date. The format is detected
from the play table (pairs or teams); an optional `--mode` must agree.
Pair exports currently support `WERTUNG=0` (matchpoints); other values are
rejected rather than silently exported with the wrong scoring method.

The output is `traveller.json` plus `traveller.xml`. The embedded board-deal
table is not currently exported to PBN; continue using the corresponding PBN
file for the hands. No bidding or play sequence is invented from the deals.
The supplied pairs export has been verified; team export detection uses the
existing team DBF schema and should be checked with a real team `.dat` export.

`--export-dat` accepts a path directly, without `INPUT_DIRECTORIES`. It cannot
be combined with individual DBF inputs. The previous three-file invocation
remains supported:

```sh
python3 scripts/dbf-traveller-to-json.py \
  --play-dbf play_2251.DBF \
  --participants-dbf tn_2251.dbf \
  --results-dbf res_2251a.dbf \
  --output traveller.json
```

The input files are:

- `--play-dbf`: contracts, results, scores, matchpoints and opening leads;
  tricks and declarer are derived from this file's `CONTRACT`/`RESULT`/`NS_EW`
  fields
- `--participants-dbf`: pair numbers and player names
- `--results-dbf`: final ranking, points and percentages
- `--output`: generated BSOL Traveller JSON; also writes a sibling USEBIO XML
  file with the same basename (for example `traveller.json` and `traveller.xml`)

Before running the script, edit `INPUT_DIRECTORIES` near the top of the Python
file. Each input type can point to a different directory:

```python
INPUT_DIRECTORIES = {
    "play_dbf": Path("/data/turnier/play"),
    "participants_dbf": Path("/data/turnier/participants"),
    "results_dbf": Path("/data/turnier/results"),
}
```

The directory is prepended to the corresponding filename option. The output path
is not changed.

The converter uses only the Python standard library. It maps German suit and
direction codes, converts German card ranks (`D`/`B`) to BSOL's `Q`/`J`, derives
declarers and tricks from the play DBF, and adds participant names and final
ranking data. Opening leads are written in BSOL's rank-then-suit format, for
example `4S` or `QD`.

The generated JSON can be loaded in BSOL together with the tournament's PBN file
using the normal `file` and `xml` URL parameters.

## USEBIO XML output

Both converters always write two files: the existing BSOL JSON and a UTF-8 XML
file beside it, replacing the output filename's suffix with `.xml`. Continue
passing the JSON filename to `--output`. Both files can be loaded in BSOL, for
example `index.html?file=traveller.pbn&xml=traveller.xml`.

The JSON is BSOL's internal representation, inspired by USEBIO, not an official
USEBIO JSON standard. The XML export follows the
[USEBIO 1.2 structure and DTD](https://www.usebio.org/usebio-1.2.html):
`USEBIO Version="1.2"`, an `EVENT_TYPE` attribute, nested `PLAYER` elements,
`BOARD_NUMBER`, and scoring-specific traveller fields (`NS_MATCH_POINTS`,
`NS_CROSS_IMP_POINTS` or `NS_BUTLER_POINTS`, and their EW equivalents).
The XML declaration is followed by the same external DTD reference used by
Bridgewebs: `<!DOCTYPE USEBIO SYSTEM "https://www.ebu.co.uk/usebio/usebio_v1_2_ext.dtd">`.
Artificial adjusted scores such as `A5050` are exported without `CONTRACT`,
matching Bridgewebs. Writing `NP` there triggers a null-score error in the
legacy Bridgewebs "All pairs" analysis. BSOL restores its internal `NP` marker
when importing these adjusted results.
Teams are exported as `TEAM` participants with boards grouped under `MATCH`
elements, including direction, round, board IMPs and available match VPs.

LIN play data is written to the standard USEBIO `LIN_DATA` element and also
preserved in BSOL's `NOTES` extension for compatibility with the JSON
round-trip. Separate display scores, round information, Butler ranking/datums
and match cross tables are preserved as JSON prefixed with `BSOL:` inside
standard `NOTES` elements. BSOL reads these additional values back, but imports
LIN play data exclusively from `LIN_DATA`, never from `NOTES`. Older XML files
containing LIN data only in `NOTES` must be regenerated to retain play records.
Other USEBIO consumers may ignore the notes.

This is a traveller/results export, not a guaranteed complete federation
submission. BBO's `#Date` field is retained as ISO date (`YYYY-MM-DD`) in
`event.date` and exported as USEBIO `DATE` (`DD/MM/YYYY`). Missing dates are
omitted; invalid dates cause conversion to fail. Combined DAT exports supply
their tournament date from `DATUM`; the legacy three-DBF invocation still
provides no event date. The converters do not invent dates, federation IDs or master-point information.
DTD-valid structure alone does not guarantee acceptance by every USEBIO service.
The BSOL importer also remains a reader for supported results structures, not
an implementation of every USEBIO feature or version.

## BBO Extractor CSV

`bbo-csv-to-json.py` converts the CSV file downloaded by BBO Extractor directly
to BSOL Traveller JSON and a corresponding USEBIO XML file:

```sh
python3 scripts/bbo-csv-to-json.py \
  --csv 20260916-Mittag.csv \
  --output 20260916-Mittag.json
```

Load the generated JSON together with the PBN file downloaded for the same
tournament:

```text
index.html?file=20260916-Mittag.pbn&xml=20260916-Mittag.json
```

The converter reads the event ranking and the `#TravellerLines` section. It
preserves BBO's encoded LIN play data while repairing UTF-8 text that was
mistakenly re-encoded via Latin-1 or Windows-1252 (for example, `KÃ¼` becomes
`Kü` in alert explanations), normalizes no-trump and doubled
contracts, and handles passed-out boards and adjusted percentage scores such as
`A5050`. It uses only the Python standard library; the accompanying PBN file is
not needed during conversion.

Both Match Points (`nsMpts`/`ewMpts` columns, `#ScoringType,MATCH_POINTS`) and
Cross-IMPs pairs exports (`nsXimps`/`ewXimps` columns, `#ScoringType,CROSS_IMPS`)
are supported; the converter detects which pair of columns is present and
carries the scoring type through to the generated JSON.

## Team tournaments

Team DBF exports use a separate conversion mode. The participant DBF groups two
pairs under each team number, while each play record contains the home-table and
comparison-table game for one board:

```sh
python3 scripts/dbf-traveller-to-json.py \
  --mode teams \
  --play-dbf play_2249.dbf \
  --participants-dbf tn_2249.dbf \
  --results-dbf res_2249a.dbf \
  --output team-traveller.json
```

The generated `TEAMS` JSON contains one participant per team and two Traveller
lines per played board (`*_H` and `*_V`). BSOL counts the board once per team,
while the ranking is taken from the team victory points in the result DBF.
The result analysis also shows a match cross table between the ranking and
Butler table. Cells contain both teams' victory-point scores and match IMP
totals for each match; hovering over a team number shows the names of all four
team members.
Team individual results use one row per board with separate NS and EW contract,
declarer, lead and score columns. They also show the score difference, match
IMPs, datum and Butler IMPs for each pair, followed by the match result.
The converter preserves round numbers in Traveller lines and match summaries
(`event.team_matches`), and orders team participants with the NS pair first.
Team conversion is experimental and remains development-only.

The team JSON also contains a Butler ranking (`event.butler`), which BSOL shows
below the result ranking under the heading "Butlerwertung". For every board the
datum is the average of all table results (NS view), rounded to the nearest 10;
each NS pair scores the IMPs of its result against the datum, the opposing EW
pair the negative value. The pair that sat North/South is taken from the `NS`
flag (`T`) in the participant DBF. Pairs are ranked by IMPs per board, and each
board carries its datum in `butler_datum`.
