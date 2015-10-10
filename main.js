"use strict";

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
  RES_PATH, FILTERS
}
from "src/constants";

import {
  main_view
}
from "src/views";
// Module
var ig = {};


class ViewModel {
  constructor() {
    this.items = null;
    this.item_count = m.prop();

    this.load = this.load.bind(this);
    this.updateSearch = this.updateSearch.bind(this);
  }

  init() {
    this.items = new Items();

    m.request({
      method: "GET",
      url: RES_PATH + "/descriptions.json"
    }).then(this.load);
  }

  load(response) {
    this.items.loadInput(response);
    this.item_count(this.items.ordered_names.length);
  }

  updateSearch(term) {
    this.items.search_term = term;
    this.item_count(this.items.search(this.items.dict));
  }

}

// Controller
ig.controller = function() {
  ig.vm.init()
}

class Controller {
  constructor() {
    this.vm = new ViewModel();
    this.vm.init();
  }
}

//initialize the application
m.module(document.getElementById("ig_app"), {
  controller: Controller,
  view: main_view
});;