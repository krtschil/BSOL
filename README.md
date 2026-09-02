# BSOL

## Bridge Solver Online
This is a fork of the original Bridge Solver authored by John Goacher (https://mirgo2.co.uk/bridgesolver/)

## Javscript 
Code has been split into several files:

- Function definitions into functsions.js
- Events into events.js
- Help text into helpText.js
- Inline javascript moved into the respective files
- Upgraded jQuery to newest version
- Main functionalities remain in `ddummy6.js`

## Language
To allow text (help text and display text) to appear in other languages the following concept has been applied:

- A language switcher has been created (changeLanguage()). Whereever possible displayed text is piped through this function
- Added flags to allow the switch of language
- Currently English and German are implemented
- The default language is defined in `ddummy6.js` (e.g. language="en"). Language codes follow the 2-character code (e.g. en, de)

## Functionality
### Layout and buttons
The frontpage has been changed such that navigational buttons are visible at all times.

### Loading of hands
Hands can be entered and analyzed in various ways:

- Choosing a local file by clicking the respective button on the frontpage
- Dropping a file onto the area on the frontpage covering the buttons
- Paste (CTRL-V on Windows/Linux, CMD-V on Mac) on the frontpage
- Using the respective button on the frontpage to retrieve data from the clipboard
- Manual input by using the respective button on the frontpage

Supported file formats:

- .pbn 
- .dlm
- .lin (BBO play and hand record files)

### Double Dummy Solver
Boards are analyzed using the double dummy solver authored by Bo Haglund / Sören Hein. 
The provided version is based on the DDS3 project (https://github.com/dds-bridge/dds) currently using the released version 3.1
