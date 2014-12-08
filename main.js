// Module
var ig = {};


// Models
ig.items = function (items_json) {
    // List of {image_url, description, name} objects
    this.ordered_names = m.prop([]);
    // Map of key=name, value=description
    this.dict = m.prop({});
    
    for (var key in items_json) {
        if (items_json.hasOwnProperty(key)) {
            // Escape % by appending '25', due to how python SimpleHTTPServer serves files
            escaped_key = key.split('%').join('%25');
            this.ordered_names().push(items_json[key].name);
            this.dict()[items_json[key].name] = {image_url: '/res/'+escaped_key, 
                                                 description: items_json[key].description,
                                                 name: items_json[key].name,
                                                 selected: true // true when matching search term
                                                };
        }
    }   
};

ig.search = function (term, dict) {
    var matches = [];
    console.log("Search term: "+term+', term==="" ? '+(term===''));
    for (var key in dict) {
        if (dict.hasOwnProperty(key)) {
            if (term === '')
                dict[key].selected = true;
            else if (key.search(term) > -1)
                dict[key].selected = true;
            else
                dict[key].selected = false;
        }
    }
}

// This is not a standalone model as it references ig.vm.items, it is a vm helper
// TODO: could be refactored using a closure/currying and accept the items.dict as the first arg.
ig.addTooltip = function (element, isInitialized, context) {
    if (isInitialized) return;
    var name = element.alt; // img.alt
    var desc = ig.vm.items().dict()[element.alt].description;
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
    
    vm.search_text = m.prop();
    
    // Init called by controller
    vm.init = function () {
        // Get items list
        vm.items = m.prop({});
        
        m.request({method: "GET", url: "/res/descriptions.json"}).then(function (a) {
            vm.items(new ig.items(a))
        });   
    };
    
    vm.updateSearch = function(term) {
        ig.search(term, vm.items().dict());
    }
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
            ig.search_view(),
            m("div", [
                ig.vm.items().ordered_names().map(function (name, index){
                    // TODO: if we want a nice uniform grid look with no vertical spacing
                    // we should use a table with overflow set
                    return ig.image_view(ig.vm.items().dict()[name])
                })
            ]),
            m("div", "Item Count: " + ig.vm.items().ordered_names().length)
        ])
    ]);
};

// search
ig.search_view = function() {
    return m("div", {style: {border: "1px solid grey", margin: "3px", 
                             paddingBottom: "5px", paddingTop: "5px",
                            "text-align": "center"}}, [
        m("div.abc", {style: {margin: "0 auto", display: "inline-block"}}, [
            m("div", {style: {display: "inline-block", paddingRight: "10px"}}, "Search"),
            m("input", {style: {border: "1px solid black", "background-color": "#eadede"},
                        size: 100,
                        onkeyup: m.withAttr("value", ig.vm.updateSearch)})
        ])
    ])
}

// Builds an image block
ig.image_view = function (item) {   
    return m("div.item_block", {style: {display: function () {
                                if (item.selected) 
                                    return "block-inline";
                                else 
                                    return "none";
    }() }}, [
        m("img.wikitable", {config: ig.addTooltip, src: item.image_url,
                            alt: item.name
                           }),
    ])
}

//initialize the application
m.module(document.getElementById("ig_app"), {controller: ig.controller, view: ig.view});