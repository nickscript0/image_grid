// Views
import {
  FILTERS
}
from "src/constants";


export function main_view(ctrl) {
  return m("div", [
    m('div.filter-buttons', view_filter_buttons(ctrl)),
    m("div", [
      search_view(ctrl),
      m("div#grid_holder", [
        ctrl.vm.items.ordered_names
        .filter(ctrl.vm.items.filterItem)
        .map(function(name) {
          // TODO: if we want a nice uniform grid look with no vertical spacing
          // we should use a table with overflow set
          return image_view(ctrl, name)
        })

      ]),
      m("div", "Item Count: " + ctrl.vm.item_count())
    ])
  ]);
};

function view_filter_buttons(ctrl) {
  return m('div.controls', FILTERS.map(function(filter_name) {
    return m('button', {
        class: helper_getButtonClass(filter_name, ctrl.vm.items.item_filter),
        onclick: function() {
          ctrl.vm.items.item_filter = filter_name;
          // Refresh the search filter
          ctrl.vm.updateSearch(ctrl.vm.search_term());
        }
      },
      filter_name);
  }))
}

// Determines button class
function helper_getButtonClass(name, filter_status) {
  var selected_class = 'pure-button pure-button-primary filter-button';
  var unselected_class = 'pure-button filter-button';
  return (name === filter_status) ? selected_class : unselected_class;
}

// search
function search_view(ctrl) {
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
      }, `Search (${ctrl.vm.item_count()} items)`),
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
        onkeyup: m.withAttr("value", ctrl.vm.updateSearch)
      })
    ])
  ])
}

// Builds an image block
function image_view(ctrl, name) {
  let item = ctrl.vm.items.dict[name];
  return m("div", {
    class: function() {
      // Changing class here instead of display because for some reason
      // setting the display: none to hide them, mithril wouldn't show them again
      return item.selected ? "item_block" : "item_block_hidden";
    }()
  }, [
    m.e("img.wikitable", {
      config: function(element, isInitialized, context) {
        aniFlyIn(ctrl, m.prop(0), aniDelayFromPosition(element))(element, isInitialized, context);
      },
      src: item.image_url,
      alt: item.name,
      scale: m.prop(1),
      opacity: m.prop(0),
      key: item.name
    }),
  ]);
}

// Adds a fly in animation to elements
function aniFlyIn(ctrl, prop, delay) {
  return function(el, isInitialized, context) {
    setTimeout(function() {
      m.animateProperties(el, {
        scale: 1,
        opacity: 1,
        //duration: "0.25s"
        duration: "1s"
      });
      addTooltip(el, isInitialized, ctrl.vm.items.dict[el.alt].description);
    }, delay * 25); //, delay * 50);
  };
};

// Given an image element, calculate an animation delay that would display in
// a diagonal top left to bottom left reveal
function aniDelayFromPosition(elem) {
  // TODO make calc numbers dynamic based on css sizes
  var x_pos = (elem.getBoundingClientRect().left + 210) / 64;
  var y_pos = (elem.parentElement.getBoundingClientRect().top - 41) / 62;
  return x_pos + y_pos;
};


// This is not a standalone model as it references ig.vm.items, it is a vm helper
// TODO: could be refactored using a closure/currying and accept the items.dict as the first arg.
function addTooltip(element, isInitialized, desc) {
  if (isInitialized) return;
  var name = element.alt; // img.alt
  var text = '<h3>' + name + '</h3>' + desc;

  var myOpentip = new Opentip(element, text, {
    style: "dark", // Others: alert, dark, glass, drop
    showOn: 'mouseover',
    tipJoint: "top"
  });
};