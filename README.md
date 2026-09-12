# BSOL

## Bridge Solver Online
This is a fork of the original Bridge Solver Online authored by John Goacher (https://mirgo2.co.uk/bridgesolver/)

## Javascript 
The application remains a static browser application, but its code is split into focused files:

- `js/startup.js` initializes the application.
- `js/bootstrap.js` builds the page and parses URL parameters.
- `js/events.js` wires the main user-interface events.
- `js/import.js`, `js/pbn.js`, and `js/xml.js` handle supported input formats.
- `js/board-renderer.js`, `js/hand-renderer.js`, and `js/play.js` render and play boards.
- `js/scoring.js`, `js/scorecard.js`, `js/ranking.js`, and `js/traveller.js` handle results.
- `js/workers.js` manages the main and background DDS workers.
- `js/worker/` contains the worker wrapper, DDS JavaScript runtime, and `dds.wasm`.
- `js/ui-popups.js` contains shared popup, dialog, and spinner behavior.

The browser still loads classic global scripts rather than ES modules. Keep the script
order in `html/head.html` unchanged unless all dependent globals are updated together.

## Language
To allow text (help text and display text) to appear in other languages the following concept has been applied:

- A language switcher has been created (`changeLanguage()`). Whereever possible displayed text is piped through this function
- Added flags on the frontpage to allow the switch of language
- Currently English and German are implemented
- The default language is initialized in `js/startup.js` (e.g. `language="de"`). Language codes follow the 2-character code (e.g. en, de)

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
- Loading a remote file via an URL parameter (e.g. `?file=https://example.com/tournament.pbn)`). 
The remote server has to allow loading data via HTTP header `Header set Access-Control-Allow-Origin *` or more specific `Header set Access-Control-Allow-Origin "https://thedomain.com"`.
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

The regression suite is in `test/regression.test.js`. The browser-only XML parser smoke
test is `test/xml-smoke.html`. CI also checks JavaScript syntax, generated HTML freshness,
HTML validity, and the XML smoke test.

## AI support
Claude/Sonnet 5 and GitHub/Copilot helped in analyzing and fixing code where necessary.
