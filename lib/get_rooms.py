# Retrieve metadata on which items map to which rooms
from lib.common import bs_from_url, BASE_URL, Desc, DescTableRow, debug

# Key: wiki page, val: Desc object constant
ROOMS = {
    'Devil_Room': Desc.ROOM_DEVIL,
    'Angel_Room': Desc.ROOM_ANGEL
}


def save_rooms(base_path='', bs=None):
    if bs is None:
        bs = bs_from_url(BASE_URL + '/Item_Pool')

    desc_file = Desc(base_path)
    try:
        for room_id in ROOMS:
            _save_room(bs, desc_file, room_id)
    finally:
        desc_file.write()


def _save_room(bs, desc_file, room_id):
    tables = bs.find('div', attrs={'id': room_id}).findAll('table')
    rows = []
    for table in tables:
        rows.extend(DescTableRow.parseTable(table))

    for row in rows:
        desc_file.tagRoom(row.image_name, ROOMS[room_id])
    debug('Updated %s tags' % (room_id))
