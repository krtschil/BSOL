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

The converter uses only the Python standard library. It maps German suit and
direction codes, joins play rows with the PBN score tables to obtain declarers and
tricks, and adds participant names and final ranking data.

The generated JSON can be loaded in BSOL together with its PBN file using the normal
`file` and `xml` URL parameters.
