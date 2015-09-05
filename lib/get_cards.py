# Retrieves Cards
# TODO:  get_trinkets, get_rooms, get_cards all follow a pattern can be
# refactored much more concisely
from lib.common import bs_from_url, BASE_URL, Desc,\
    get_already_saved, save_image, DescTableRow


def save_cards(base_path='', bs=None):
    if bs is None:
        bs = bs_from_url(BASE_URL + '/Tarot_cards')

    desc_file = Desc(base_path)
    try:
        _save_cards(base_path, bs, desc_file)
    finally:
        desc_file.write()


def _save_cards(base_path, bs, desc_file):
    tables = bs.findAll('table')
    rows = []
    for table in tables:
        rows.extend(DescTableRow.parseTable(table))

    already_saved_list = get_already_saved(desc_file.base_path)

    # Skip the header
    for row in rows:
        save_image(row.image_url, base_path, already_saved_list)
        desc_file.update_item(
            row.item_name, row.image_name, row.image_width, row.image_height,
            row.description, Desc.TYPE_CARD)
