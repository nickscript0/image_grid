// Module
var ig = {};


// Models
ig.vm = new function () {
    var vm = {};
    
    // Init called by controller
    vm.init = function () {
        // Get items list
        vm.items = m.prop([]);
        m.request({method: "GET", url: "/res/descriptions.json"}).then(vm.itemsToUrls).then(vm.items);
        
    };
    
    // Converts the 'items' object to an Array of image urls
    vm.itemsToUrls = function (items) {
        var items_list = [];
        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                // Escape % by appending '25', due to how python SimpleHTTPServer serves files
                escaped_key = key.split('%').join('%25');
                items_list.push( {image_url: '/res/'+escaped_key, 
                                  description: items[key].description,
                                  name: items[key].name} );
            }
        } 
        return items_list;
    }

    // Builds a hover text block
    vm.buildHover = function (item) {
        return m("div.thumb.item_block", [
            m("img.wikitable", {src: item.image_url}),
            m("div", [
                m("div.thumb_pane", [
                    m("h2", item.name),
                    // The descriptions are html, trusting scripts have been removed
                    m("p", m.trust(item.description))
                ])
            ])
        ])
    }
    
    return vm
}

// Controller
ig.controller = function() {
    ig.vm.init()
}

// View
ig.view = function() {
    return m("html", [
        m("body", [
            m("div", [
                ig.vm.items().map(function (item, index){
                    // TODO: if we want a nice uniform grid look with no vertical spacing
                    // we should use a table with overflow set
                    return ig.vm.buildHover(item)
                })
            ]),
            m("div", "Item Count: " + ig.vm.items().length)
        ])
    ]);
};

//initialize the application
m.module(document.getElementById("ig_app"), {controller: ig.controller, view: ig.view});