# DBF/PBN Traveller converter

This directory contains an internal conversion utility for importing the four-file
export from the German bridge scoring application into BSOL Traveller JSON.

The utility is intentionally not part of the published application. Keep
`dbf-traveller-to-json.py` and this README on the development branch only; do not
promote them to `main`.

## Usage

```sh
python3 scripts/dbf-traveller-to-json.py \
  --pbn event.pbn \
  --play-dbf play_2251.DBF \
  --participants-dbf tn_2251.dbf \
  --results-dbf res_2251a.dbf \
  --output traveller.json
```

The input files are:

- `--pbn`: board definitions and PBN `ScoreTable` data
- `--play-dbf`: contracts, results, scores, matchpoints and opening leads
- `--participants-dbf`: pair numbers and player names
- `--results-dbf`: final ranking, points and percentages
- `--output`: generated BSOL Traveller JSON

Before running the script, edit `INPUT_DIRECTORIES` near the top of the Python
file. Each input type can point to a different directory:

```python
INPUT_DIRECTORIES = {
    "pbn": Path("/data/turnier/pbn"),
    "play_dbf": Path("/data/turnier/play"),
    "participants_dbf": Path("/data/turnier/participants"),
    "results_dbf": Path("/data/turnier/results"),
}
```

The directory is prepended to the corresponding filename option. The output path
is not changed.

The converter uses only the Python standard library. It maps German suit and
direction codes, converts German card ranks (`D`/`B`) to BSOL's `Q`/`J`, joins
play rows with the PBN score tables to obtain declarers and tricks, and adds
participant names and final ranking data. Opening leads are written in BSOL's
rank-then-suit format, for example `4S` or `QD`.

The generated JSON can be loaded in BSOL together with its PBN file using the normal
`file` and `xml` URL parameters.

## BBO Extractor CSV

`bbo-csv-to-json.py` converts the CSV file downloaded by BBO Extractor directly
to BSOL Traveller JSON:

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
preserves BBO's encoded LIN play data, normalizes no-trump and doubled
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
  --pbn 20260903.pbn \
  --play-dbf play_2249.dbf \
  --participants-dbf tn_2249.dbf \
  --results-dbf res_2249a.dbf \
  --output team-traveller.json
```

The generated `TEAMS` JSON contains one participant per team and two Traveller
lines per played board (`*_H` and `*_V`). BSOL counts the board once per team,
while the ranking is taken from the team victory points in the result DBF.
Team conversion is experimental and remains development-only.
