# Retrieves Trinkets
from lib.common import bs_from_url, BASE_URL, Desc,\
    get_already_saved, save_image, DescTableRow


def save_trinkets(base_path='', bs=None):
    if bs is None:
        bs = bs_from_url(BASE_URL + '/Trinkets')

    desc_file = Desc(base_path)
    try:
        _save_trinkets(base_path, bs, desc_file)
    finally:
        desc_file.write()


def _save_trinkets(base_path, bs, desc_file):
    table = bs.find('table')
    rows = DescTableRow.parseTable(table)

    already_saved_list = get_already_saved(desc_file.base_path)

    # Skip the header
    for row in rows:
        save_image(row.image_url, base_path, already_saved_list)
        desc_file.update_item(
            row.item_name, row.image_name, row.image_width, row.image_height,
            row.description, Desc.TYPE_TRINKET)
