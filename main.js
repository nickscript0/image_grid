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
  RES_PATH
}
from "src/constants";

import {
  main_view
}
from "src/views";

class ViewModel {
  constructor() {
    this.items = new Items();

    this.load = this.load.bind(this);
    this.updateSearch = this.updateSearch.bind(this);
  }

  // init() {
  //   this.items = new Items();
  //
  //   m.request({
  //     method: "GET",
  //     url: RES_PATH + "/descriptions.json"
  //   }).then(this.load);
  // }

  load(response) {
    this.items.loadInput(response);
  }

  updateSearch(term) {
    this.items.search(term);
  }

}

class Controller {
  constructor() {
    this.vm = new ViewModel();
    //this.vm.init();
  }
}

//initialize the application
m.module(document.getElementById("ig_app"), {
  controller: Controller,
  view: main_view
});