# BSOL

## Bridge Solver Online
This is a fork of the original Bridge Solver Online authored by John Goacher (https://mirgo2.co.uk/bridgesolver/)

## Javascript 
Code has been split into several files:

- Function definitions into `functions.js`
- Events into `events.js`
- Help text into `helpText.js`
- Inline javascript moved into the respective files
- Upgraded jQuery to `jquery-4.0.0.min.js`
- Main functionalities remain in `ddummy6.js`

## Language
To allow text (help text and display text) to appear in other languages the following concept has been applied:

- A language switcher has been created (`changeLanguage()`). Whereever possible displayed text is piped through this function
- Added flags on the frontpage to allow the switch of language
- Currently English and German are implemented
- The default language is defined in `ddummy6.js` (e.g. language="en"). Language codes follow the 2-character code (e.g. en, de)

## Styles
Inline Styles have been removed and added to the respective style sheet

## HTML
- HTML has been corrected to comply with W3C standards.
- Frontpage renamed to `index.html`

## Functionality
### Layout and buttons
The frontpage has been changed such that navigational buttons are visible at all times.


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
- `nav`:   turns on/off the navigation buttons. `nav=0` hides the navigation buttons.

### Double Dummy Solver
Boards are analyzed using the double dummy solver authored by Bo Haglund / Sören Hein and implemented as a WebAssembly module.
The analysis runs completely in the browser (no server component necessary).

The provided version is based on the DDS3 project (https://github.com/dds-bridge/dds) currently using the released version 3.1.

The sources for the WebAssembly module can be downloaded from here: https://github.com/krtschil/bsol-wasm/releases.

## AI support
Claude/Sonnet 5 helped in analyzing and fixing code when necessary.
