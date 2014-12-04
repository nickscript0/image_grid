// Module
var ig = {};

ig.vm = new function() {
    var vm = {}
    vm.init = function() {
        vm.description = m.prop("");
        
        // Get items list
        vm.items = m.prop([]);
        m.request({method: "GET", url: "/res/descriptions.json"}).then(vm.items);
        
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
    // Generate items grid
    items_obj = ig.vm.items();
    var items_list = [];
    for(var key in items_obj) {
        if (items_obj.hasOwnProperty(key)) {
            items_list.push( m("img", {src: '/res/'+key+'.png'}) );
        }
    }
    
    return m("html", [
        m("body", [
            m("div", items_list),
            m("div", "Item Count: " + items_list.length)
        ])
    ]);
};

//initialize the application
m.module(document, {controller: ig.controller, view: ig.view});