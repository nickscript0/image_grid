/* @flow */
/* global m */

import {
  main_view
}
from "./src/views";

import {
  Items
}
from "./src/models";

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
m.module(document.getElementById("ig_app"), {
  controller: Controller,
  view: main_view
});
