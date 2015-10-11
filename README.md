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
- *Why is it not using ES6 imports for external dependencies?* Opentip and mithril.animate don't work out of the box with system.js (e.g., mithril.animate.js monkey patches mithril.js), so external dependencies are imported by html script tags instead of ES6 imports.
- *Missing feature of Flow type*: I defined a class interface in interfaces.js called 'Ctrl' so that the Controller object passed to the view would be type checked. This is brittle as the declaration could get out of sync with the implementation, it would be nice if Flow supported tying a Class declaration to its implementation (see https://github.com/facebook/flow/issues/833)
