/* @flow */
/* global m */

import {
  RES_PATH
}
from "./constants";

export class Items {
  ordered_names: Array < string > ;
  dict: Object;
  raw_items: Object;
  item_filter: string;
  search_term: string;
  item_count: ? number;

  filterItem: any;
  loadInput: any;
  constructor() {
    this.ordered_names = [];
    this.dict = {};
    this.raw_items = {};
    this.item_filter = 'All';
    this.search_term = '';
    this.item_count = null;
    //this._loadInput(items_json);

    this.filterItem = this.filterItem.bind(this);
    this.loadInput = this.loadInput.bind(this);

    this._requestAndLoadData();
  }

  _requestAndLoadData() {
    m.request({
      method: "GET",
      url: RES_PATH + "/descriptions.json"
    }).then(this.loadInput);
  }

  loadInput(items_json: Object) {
    this.raw_items = items_json;

    for (let key in items_json) {
      if (items_json.hasOwnProperty(key)) {
        // Escape % by appending '25', due to how python SimpleHTTPServer serves files
        let escaped_key = key.split('%').join('%25');
        this.ordered_names.push(items_json[key].name);

        this.dict[items_json[key].name] = {
          image_url: RES_PATH + '/' + escaped_key,
          image_width: items_json[key].image_width,
          image_height: items_json[key].image_height,
          description: items_json[key].description,
          name: items_json[key].name,
          selected: true, // true when matching search term
          original_key: key
        };
      }
    }

    this.item_count = this.ordered_names.length;
  }

  filterItem(name: string): boolean {
    let item_key = this.dict[name].original_key;
    let filter_key = this.item_filter;
    let raw_items = this.raw_items;

    if (raw_items.length === 0) {
      return false;
    }

    // TODO: this shouldn't be redeclared each time this function is called
    let FILTER_ITEM = {
      'All': true,
      'Items': (raw_items[item_key].type === 'item'),
      'Trinkets': (raw_items[item_key].type === 'trinket'),
      'Devil Room': raw_items[item_key].hasOwnProperty('room_devil'),
      'Angel Room': raw_items[item_key].hasOwnProperty('room_angel'),
      'Treasure Room': raw_items[item_key].hasOwnProperty('room_treasure'),
      'Shop': raw_items[item_key].hasOwnProperty('room_shop'),
      'Cards': (raw_items[item_key].type === 'card')
    };

    return FILTER_ITEM[filter_key] || false;
  }

  search(term: string) {
    this.search_term = term;
    console.log("Search term: " + term + ', term==="" ? ' + (term === '').toString());
    let visible_count = 0;
    term = term.toLowerCase();

    let filtered_keys = Object.getOwnPropertyNames(this.dict).filter(this.filterItem);
    for (let key of filtered_keys) {
      if (term === '') {
        this.dict[key].selected = true;
        visible_count += 1;
      } else if (key.toLowerCase().search(term) > -1) {
        this.dict[key].selected = true;
        visible_count += 1;
      } else {
        this.dict[key].selected = false;
      }

    }
    console.log(visible_count + ' items visible');
    this.item_count = visible_count;
  }

}