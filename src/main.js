/* @flow */
/* global m */

import {
  main_view
}
from "./lib/views";

import {
  Items
}
from "./lib/models";

/* The following class runs into 2 limitations of flowtype currently:
 *  1. I have a separate interface definition in interfaces.js for this class
 *     so that views.js (which is passed the class, not imported) can typecheck.
 *     Because the interface isn't bound to the class definition they can become out of sync
 *     More about this problem here: https://github.com/facebook/flow/issues/833
 *
 *  2. Binding methods to 'this' in the constructor isn't allowed unless you use
 *     the non-restrictive 'any' type e.g. see 'this.updateSearch' below
 */
class Controller {
  items: Object;
  updateSearch: any;

  constructor() {
    this.items = new Items();
    this.updateSearch = this.updateSearch.bind(this);
  }
  updateSearch(term) {
    this.items.search(term);
  }
}

//initialize the application
m.module(document.getElementById("app"), {
  controller: Controller,
  view: main_view
});