// Module
var ig = {};


// Models
ig.items = function (items_json) {
    // List of {image_url, description, name} objects
    this.list = m.prop([]);
    // Map of key=name, value=description
    this.dict = m.prop({});
    
    for (var key in items_json) {
        if (items_json.hasOwnProperty(key)) {
            // Escape % by appending '25', due to how python SimpleHTTPServer serves files
            escaped_key = key.split('%').join('%25');
            this.list().push( {image_url: '/res/'+escaped_key, 
                              description: items_json[key].description,
                              name: items_json[key].name} );
            this.dict()[items_json[key].name] = items_json[key].description;
        }
    }   
};

// This is not a standalone model as it references ig.vm.items, it is a vm helper
// TODO: could be refactored using a closure/currying and accept the items.dict as the first arg.
ig.addTooltip = function (element, isInitialized, context) {
    if (isInitialized) return;
    var name = element.alt; // img.alt
    var desc = ig.vm.items().dict()[element.alt];
    var text = '<h3>'+name+'</h3>'+desc;

    var myOpentip = new Opentip(element, text, {
        style: "dark", // Others: alert, dark, glass, drop
        showOn: 'mouseover',
        tipJoint: "top"
    });            
};    


ig.vm = new function () {
    var vm = {};
    
    // ig.items
    vm.items = m.prop({});
    
    // Init called by controller
    vm.init = function () {
        // Get items list
        vm.items = m.prop({});
        
        m.request({method: "GET", url: "/res/descriptions.json"}).then(function (a) {
            vm.items(new ig.items(a))
        });
        
    };
    return vm
}

// Controller
ig.controller = function() {
    ig.vm.init()
}

// Views
ig.view = function() {
    return m("html", [
        m("body", [
            m("div", [
                ig.vm.items().list().map(function (item, index){
                    // TODO: if we want a nice uniform grid look with no vertical spacing
                    // we should use a table with overflow set
                    return ig.hover(item)
                })
            ]),
            m("div", "Item Count: " + ig.vm.items().list().length)
        ])
    ]);
};

// Builds a hover text block
ig.hover = function (item) {   
    return m("div.item_block", [
        m("img.wikitable", {config: ig.addTooltip, src: item.image_url,
                           alt: item.name}),
    ])
}

//initialize the application
m.module(document.getElementById("ig_app"), {controller: ig.controller, view: ig.view});