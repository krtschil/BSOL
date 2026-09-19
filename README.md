# BSOL

## Bridge Solver Online
This is a fork of the original Bridge Solver Online authored by John Goacher (https://mirgo2.co.uk/bridgesolver/)

## JavaScript
The application remains a static browser application, but its code is organized as
native ES modules:

- `js/startup.mjs` initializes the application.
- `js/bootstrap.mjs` builds the page and parses URL parameters.
- `js/events.mjs` wires the main user-interface events.
- `js/import.mjs`, `js/pbn.mjs`, and `js/xml.mjs` handle supported input formats.
- `js/board-renderer.mjs`, `js/hand-renderer.mjs`, and `js/play.mjs` render and play boards.
- `js/scoring.mjs`, `js/scorecard.mjs`, `js/ranking.mjs`, and `js/traveller.mjs` handle results.
- `js/workers.mjs` manages the main and background DDS workers.
- `js/worker/` contains the worker wrapper, DDS JavaScript runtime, and `dds.wasm`.
- `js/ui-popups.mjs` contains shared popup, dialog, and spinner behavior.

The modules use explicit imports and exports. Temporary `window` bridges preserve
compatibility for remaining global call sites and should be removed only when all callers
of a bridged API use imports. `js/shared/bridge-utils.js` intentionally remains a classic
script because the classic DDS worker loads it with `importScripts()`.

## Language
To allow text (help text and display text) to appear in other languages the following concept has been applied:

- A language switcher has been created (`changeLanguage()`). Whereever possible displayed text is piped through this function
- Added flags on the frontpage to allow the switch of language
- Currently English and German are implemented
- The default language is initialized in `js/startup.mjs` (e.g. `language="de"`). Language codes follow the 2-character code (e.g. en, de)

## Styles
The main stylesheet is `ddummy.css`. It contains:

- the responsive layout for the import controls, board, results, dialogs, and tables;
- the shared Verdana-based application typography and softer Arial typography for the board/play view;
- the teal application palette, with calmer read-only legends and stronger action-button colors;
- keyboard focus indicators and reduced-motion support.

## HTML
- The browser continues to load the generated static `index.html`.
- Maintain the source fragments in `html/` (`head.html`, `start.html`, `main-view.html`,
  `overlays.html`, and `footer.html`), not the generated file.
- Run `npm run build:html` after changing a fragment. The versioned pre-commit hook
  rebuilds and stages `index.html` automatically.
- HTML is validated with `npm run validate:html`.

## Functionality
### Layout and buttons
The layout is fluid up to a 1000px content width. Import and navigation controls wrap
inside their fieldsets when necessary. Wide board and Traveller content scrolls within
its local container instead of causing page-level overflow. Dialogs and progress
overlays are constrained to the viewport on narrow screens.

Interactive controls have accessible names, visible keyboard focus, live status updates,
and reduced-motion behavior. The language switcher, file input, dialogs, board number,
and current play position expose appropriate labels or ARIA semantics.


### Loading of hands
Hands can be entered and analyzed in various ways:

- Choosing a local file by clicking the respective button on the frontpage
- Dropping a file onto the area on the frontpage covering the buttons
- Paste (CTRL-V on Windows/Linux, CMD-V on Mac) on the frontpage
- Using the respective button on the frontpage to retrieve data from the clipboard (requires user consent to read from the clipboard)
- Manual input of single hands by using the respective button on the frontpage
- Loading a remote file via an URL parameter (e.g. `?file=https://example.com/tournament.pbn`). 
The remote server has to allow loading data via HTTP header `Header set Access-Control-Allow-Origin *` or more specific `Header set Access-Control-Allow-Origin "https://thedomain.com"`.
- Loading additional traveller data (if available) is possible through the URL parameter `xml`. (e.g. `?file=https://example.com/tournament.pbn&xml=https://example.com/tournament.json`). A live example can be found here: [Live example](https://krtschil.github.io/BSOL/?file=hands/sample-traveller.pbn&xml=hands/sample-traveller.json).
- Board data can be provided completely with URL paramters
- For an overview of all available URL parameters see the file `URL-Parameters.html`

Supported file formats:

- .pbn 
- .dlm
- .lin (BBO play and hand record files)

### Handling of content in .pbn files
The `[Result ` section of a .pbn file can optionally contain plain text enclosed in curly brackets. 
If present the text contained within is displayed at the bottom of the respective board in a highlighted box.
The text may contain HTML markup for styling purposes.

-   When present in a `.pbn` file Play, Auction, Playerlist, Contract and Score have been added to the display similar
    to the handling of respective content in `.lin` files.

### URL parameters

Two additional URL parameters have been implemented. For a full list of parameters see [list of URL parameters](URL-Parameters.html)

- `lang`:  sets the language for displayed text including help text. Language is a two-character code, e.g. `lang=de`.
- `nav`:   turns on/off the navigation buttons, e.g. `nav=0` hides the navigation buttons.

### Double Dummy Solver
Boards are analyzed using the double dummy solver authored by Bo Haglund / Sören Hein and implemented as a WebAssembly module.
The analysis runs completely in the browser (no server component necessary).

The provided version is based on the DDS3 project (https://github.com/dds-bridge/dds) currently using the released version 3.1.

The sources for the WebAssembly module can be downloaded from here: https://github.com/krtschil/bsol-wasm/releases.

DDS/WASM runtime failures and browser Worker errors are reported through the application
UI. Main-worker failures and background-analysis failures are handled separately; failed
background workers are stopped so that an analysis cannot remain silently stuck.

## Development

Install the development dependencies and run the checks:

```sh
npm ci
npm test
npm run build:html
npm run validate:html
```

The regression suite is in `test/regression.test.js` and currently covers the migrated
module behavior as well as important compatibility bridges. The browser-only XML parser
smoke test is `test/xml-smoke.html`. CI also checks JavaScript syntax, generated HTML
freshness, HTML validity, and the XML smoke test.

## ==TODO==
Board display: 
- Upper right quadrant: for BBO tournaments the bidding shows `<` and `>` buttons that allow navigation to 
the bidding of the next pair. For passed out hands the buttons are not visible. Must be corrected.

Traveller display: 
- Hover popup of opponent's pair number is always misplaced far above the table. Should be 
more flexible just above or to the right of the hovered pair number
- "Contract was 4C": the suit name should be replaced by the respective symbol

## AI support
Claude/Sonnet 5 and GitHub/Copilot helped in analyzing and fixing code where necessary.
