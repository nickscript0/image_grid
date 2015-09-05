
from lib.common import bs_from_url, BASE_URL, Desc,\
    get_already_saved, image_name_from_url, \
    tags_to_text, save_image


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
    trs = table.findAll('tr')

    already_saved_list = get_already_saved(desc_file.base_path)

    # Skip the header
    for tr in trs[1:]:
        tds = tr.findAll('td')
        item_name = tds[0].find('a')['title']
        img = tds[1].find('img')
        img_url = img['src']
        img_width = img['width']
        img_height = img['height']
        image_name = image_name_from_url(img_url)

        desc_with_tr = tags_to_text('a', tds[2])
        description = desc_with_tr.replace('<td>', '').replace('</td>', '')

        save_image(img_url, base_path, already_saved_list)
        desc_file.update_item(
            item_name, image_name, img_width, img_height,
            description, Desc.TYPE_TRINKET)
