# Item Grid
A single page app displaying a grid of items with search, tooltips, and filters. Built with ES6, Mithril.js, flowtype.org, and purecss.io.

## Build
### Load data (one time)
```bash
cd scripts
pip install -r requirements.txt
python get_isaac_items.py
```

### Run app
```bash
jspm init
sh run.sh
```

## Notes
- *Flow and ES6 (jspm) imports:* I had to modify ES6 imports to be relative imports for Flow to work. e.g., change ```import { RES_PATH } from "js/lib/constants";``` to ```import { RES_PATH } from "./constants";```
- *Why am I not using ES6 imports for external dependencies?* Opentip and mithril.animate don't work out of the box with system.js (e.g., mithril.animate.js monkey patches mithril.js), so external dependencies are imported by html script tags instead of ES6 imports.
- *Missing feature of Flow type: Tying a class declaration to its implementation*: See https://github.com/facebook/flow/issues/833
