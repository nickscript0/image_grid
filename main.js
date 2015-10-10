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
  RES_PATH, FILTERS, Items
}
from "src/models";

// Module
var ig = {};

// Models
ig.filterItem = function(name) {
  var item_key = ig.vm.items.dict[name].original_key;
  var filter_key = ig.vm.item_filter();
  var raw_items = ig.vm.items.raw_items;

  if (raw_items.length === 0) {
    return false
  }

  // TODO: this shouldn't be redeclared each time this function is called
  var FILTER_ITEM = {
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



// Adds a fly in animation to elements
ig.aniFlyIn = function(prop, delay) {
  return function(el, b, c) {
    setTimeout(function() {
      m.animateProperties(el, {
        scale: 1,
        opacity: 1,
        //duration: "0.25s"
        duration: "1s"
      });
      ig.addTooltip(el, b, c);
    }, delay * 25); //, delay * 50);
  };
};

// Given an image element, calculate an animation delay that would display in
// a diagonal top left to bottom left reveal
ig.aniDelayFromPosition = function(elem) {
  // TODO make calc numbers dynamic based on css sizes
  var x_pos = (elem.getBoundingClientRect().left + 210) / 64;
  var y_pos = (elem.parentElement.getBoundingClientRect().top - 41) / 62;
  return x_pos + y_pos;
};

ig.search = function(dict) {
  var matches = [];
  var term = ig.vm.search_term();
  console.log("Search term: " + term + ', term==="" ? ' + (term === ''));
  var visible_count = 0;
  term = term.toLowerCase();



  var filtered_keys = Object.getOwnPropertyNames(dict).filter(ig.filterItem);
  // Following line being red is acceptable as it works in ES5 latest browsers and will be accepted when I add ES6 linter
  for (var key of filtered_keys) {
    if (term === '') {
      dict[key].selected = true;
      visible_count += 1;
    } else if (key.toLowerCase().search(term) > -1) {
      dict[key].selected = true;
      visible_count += 1;
    } else {
      dict[key].selected = false;
    }

  }
  console.log(visible_count + ' items visible');
  return visible_count;
}

// This is not a standalone model as it references ig.vm.items, it is a vm helper
// TODO: could be refactored using a closure/currying and accept the items.dict as the first arg.
ig.addTooltip = function(element, isInitialized, context) {
  if (isInitialized) return;
  var name = element.alt; // img.alt
  var desc = ig.vm.items.dict[element.alt].description;
  var text = '<h3>' + name + '</h3>' + desc;

  var myOpentip = new Opentip(element, text, {
    style: "dark", // Others: alert, dark, glass, drop
    showOn: 'mouseover',
    tipJoint: "top"
  });
};


ig.vm = new function() {
  var vm = {};

  // ig.items
  vm.items = new Items(); //m.prop({});
  vm.item_count = m.prop();
  vm.item_filter = m.prop('All');
  vm.search_term = m.prop('');

  // Init called by controller
  vm.init = function() {
    // Get items list
    //vm.items = m.prop({});

    vm.items = new Items();

    m.request({
      method: "GET",
      url: RES_PATH + "/descriptions.json"
    }).then(function(a) {
      //vm.items(new ig.items(a));
      vm.items.loadInput(a); // = new Items(a);
      vm.item_count(vm.items.ordered_names.length);
    });
  };

  vm.updateSearch = function(term) {
    vm.search_term(term);
    vm.item_count(ig.search(vm.items.dict));
  }
  return vm
}

// Controller
ig.controller = function() {
  ig.vm.init()
}

// Views
ig.view_filter_buttons = function(ctrl) {
  return m('div.controls', FILTERS.map(function(filter_name) {
    return m('button', {
        class: ig.helper_getButtonClass(filter_name, ig.vm.item_filter()),
        onclick: function() {
          ig.vm.item_filter(filter_name);
          // Refresh the search filter
          ig.vm.updateSearch(ig.vm.search_term());
        }
      },
      filter_name);
  }))
}

// Determines button class
ig.helper_getButtonClass = function(name, filter_status) {
  var selected_class = 'pure-button pure-button-primary filter-button';
  var unselected_class = 'pure-button filter-button';
  return (name === filter_status) ? selected_class : unselected_class;
}

ig.view = function() {
  return m("div", [
    m('div.filter-buttons', ig.view_filter_buttons()),
    m("div", [
      ig.search_view(),
      m("div#grid_holder", [
        ig.vm.items.ordered_names
        .filter(ig.filterItem)
        .map(function(name) {
          // TODO: if we want a nice uniform grid look with no vertical spacing
          // we should use a table with overflow set
          return ig.image_view(ig.vm.items.dict[name])
        })

      ]),
      m("div", "Item Count: " + ig.vm.item_count())
    ])
  ]);
};

// search
ig.search_view = function() {
  return m("div", {
    style: {
      margin: "3px",
      paddingBottom: "5px",
      paddingTop: "5px",
      "text-align": "center"
    }
  }, [
    m("div", {
      style: {
        margin: "0 auto",
        display: "inline-block",
        width: "100%"
      }
    }, [
      m("div", {
        style: {
          display: "inline-block",
          paddingRight: "10px"
        }
      }, `Search (${ig.vm.item_count()} items)`),
      m("input", {
        style: {
          border: "1px solid black",
          "background-color": "#fff",
          width: "70%",
          display: "inline-block"
        },
        config: function(el, init) {
          el.focus(); // This gives the search box focus after each render
        },
        autofocus: 'autofocus', // Not sure what this is from? it seems to have no meaning
        onkeyup: m.withAttr("value", ig.vm.updateSearch)
      })
    ])
  ])
}

// Builds an image block
ig.image_view = function(item) {
  return m("div", {
    class: function() {
      // Changing class here instead of display because for some reason
      // setting the display: none to hide them, mithril wouldn't show them again
      return item.selected ? "item_block" : "item_block_hidden";
    }()
  }, [
    m.e("img.wikitable", {
      config: function(element, isInitialized, context) {
        ig.aniFlyIn(m.prop(0), ig.aniDelayFromPosition(element))(element, isInitialized, context);
      },
      src: item.image_url,
      alt: item.name,
      scale: m.prop(1),
      opacity: m.prop(0),
      key: item.name
    }),
  ]);
}

//initialize the application
m.module(document.getElementById("ig_app"), {
  controller: ig.controller,
  view: ig.view
});;