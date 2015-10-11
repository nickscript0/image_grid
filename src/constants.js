/* @flow */
export const RES_PATH: string = '/res';
export const FILTERS: Array < string > = ['All', 'Items', 'Trinkets', 'Devil Room', 'Angel Room', 'Treasure Room', 'Shop', 'Cards'];

export const FILTER_ITEM = {
  'All': (): boolean => true,
  'Items': checkType('item'),
  'Trinkets': checkType('trinket'),
  'Devil Room': hasProp('room_devil'),
  'Angel Room': hasProp('room_angel'),
  'Treasure Room': hasProp('room_treasure'),
  'Shop': hasProp('room_shop'),
  'Cards': checkType('card')
};

function checkType(expected_type) {
  return (item: Object): boolean => item.type === expected_type;
}

function hasProp(expected_prop) {
  return (item: Object): boolean => item.hasOwnProperty(expected_prop);
}