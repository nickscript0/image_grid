# Retrieves items
from lib.common import bs_from_url, BASE_URL, Desc, debug, save_image, \
    get_already_saved, MAX_IMAGES, image_name_from_url, get_description


def save_items(base_path='', bs=None):
    TABLE1_ID = "wikitable"

    if bs is None:
        bs = bs_from_url(BASE_URL + '/Collection_Page')

    # Loop through all wikitables on page
    wikitables = bs.findAll('table', attrs={'class': TABLE1_ID})
    desc_file = Desc(base_path)
    i = 1
    try:
        for current_table in wikitables:
            debug('Processing table ' + str(i))
            tds = current_table.findAll('td')
            save_table(tds, desc_file)
            i += 1
    finally:
        desc_file.write()


def save_table(table_tds, desc_file):
    already_saved = get_already_saved(desc_file.base_path)
    # Loop through each table <td>
    skip_count = 0
    i = 0
    for td in table_tds:
        i += 1
        if (MAX_IMAGES and (i > MAX_IMAGES)):
            debug("Stopped at MAX_IMAGES: " + str(i))
            return
        img_item = td.find('img')
        # Last table ends with a td elemnt with no img, skip it
        if img_item is None:
            continue
        image_name = image_name_from_url(img_item['src'])
        if image_name not in already_saved:
            save_td(td, desc_file, already_saved)
        else:
            skip_count += 1
    debug('Skipped %s already saved images.' % (skip_count))


def save_td(td, desc_file, already_saved_list):
    # Get image
    img = td.find('img')
    img_url = img['src']
    img_width = img['width']
    img_height = img['height']
    save_image(img_url, desc_file.base_path, already_saved_list)

    # Get description
    image_name = image_name_from_url(img_url)
    desc_rel_url = td.find('a')['href']  # Description page url
    item_name, description = get_description(desc_rel_url)
    desc_file.update_item(item_name, image_name, img_width, img_height,
                          description, Desc.TYPE_ITEM)
