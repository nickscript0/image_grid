export const RES_PATH = '/res';
export const FILTERS = ['All', 'Items', 'Trinkets', 'Devil Room', 'Angel Room', 'Treasure Room', 'Shop', 'Cards'];

export class Items {
  constructor() {
    this.ordered_names = [];
    this.dict = {};
    this.raw_items = [];
    this.item_filter = 'All';
    //this._loadInput(items_json);

    this.filterItem = this.filterItem.bind(this);
  }

  loadInput(items_json) {
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
  }

  filterItem(name) {
    let item_key = this.dict[name].original_key;
    let filter_key = this.item_filter;
    let raw_items = this.raw_items;

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

}