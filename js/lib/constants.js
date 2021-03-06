/* @flow */
export const RES_PATH: string = '/res';
export const FILTERS: Array < string > = ['All', 'Items', 'Trinkets', 'Devil Room', 'Angel Room', 'Treasure Room', 'Shop', 'Cards'];

export function FILTER_ITEM(item_category: string, item: Object): boolean {
  return FILTER_ITEM_MAP[item_category](item);
}

const FILTER_ITEM_MAP = {
  'All': (): boolean => true,
  'Items': checkType('item'),
  'Trinkets': checkType('trinket'),
  'Devil Room': hasProp('room_devil'),
  'Angel Room': hasProp('room_angel'),
  'Treasure Room': hasProp('room_treasure'),
  'Shop': hasProp('room_shop'),
  'Cards': checkType('card')
};

function checkType(expected_type: string): Function {
  return (item: Object): boolean => item.type === expected_type;
}

function hasProp(expected_prop: string): Function {
  return (item: Object): boolean => item.hasOwnProperty(expected_prop);
}