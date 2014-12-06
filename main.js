// Module
var ig = {};

ig.vm = new function () {
    var vm = {};
    vm.init = function () {
        vm.description = m.prop("");
        
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
                key = key.split('%').join('%25');
                items_list.push( '/res/'+key+'.png' );
            }
        } 
        return items_list;
    }
    
    vm.test = function(a) {
        console.log("Items.length " + a.length);
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
                    return m("div.item_block", [
                        m("img.wikitable", {src: item})
                                     //style: {height: '50px'} })
                    ])
                })
            ]),
            m("a.tooltips", "Item Count: " + ig.vm.items().length, [
                m("span", "Tooltip text goes here!")
            ])
        ])
    ]);
};

//initialize the application
m.module(document.getElementById("mithril_app"), {controller: ig.controller, view: ig.view});