/* @flow */
/* global m */
// "use strict";

// declare class m {
//   x: string;
//   static animateProperties(a: Object, b: Object): Object;
//   static prop(): Object;
//   static request(a: Object): Object;
//   constructor(): Object;
//   static Callable(): Object;
// }
// //declare function m(o: Object): Object;
//
// declare class Opentip {
//
// }

import {
  Items
}
from "src/models";

import {
  main_view
}
from "src/views";


class Controller {
  _items: Object;
  updateSearch: any;

  constructor() {

    this._items = new Items();
    this.updateSearch = this.updateSearch.bind(this);
  }
  updateSearch(term) {
    this._items.search(term);
  }

  get items() { // TODO: properly separate this from the view
    return this._items;
  }
}

//initialize the application
m.module(document.getElementById("ig_app"), {
  controller: Controller,
  view: main_view
});