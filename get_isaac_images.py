# Scrapes images and descriptions from BOI wiki
#
# Usage: import get_isaac_images as gi; gi.save_tables()
#  -- Assumes directory 'RESOURCE_PATH' exists.
#  -- Saves the images from the 'Collection_Page' to disk.
#  -- Saves the names/descriptions in a JSON file.

# Debug: reload(gi); gi.save_tables(base_path=path)

import urllib2
import urllib
import os
import os.path
import re
import json
import collections

import BeautifulSoup

# BOI wiki constants
BASE_URL = 'http://bindingofisaacrebirth.gamepedia.com'
MAIN_DIV_ID = "mw-content-text"

RESOURCE_PATH = 'test'
DESCRIPTIONS_FILE = 'descriptions.json'

MAX_IMAGES = None  # Debugging max number of images to process


def save_trinkets(base_path='', bs=None):
    if bs is None:
        bs = bs_from_url(BASE_URL + '/Trinkets')
    table = bs.find('table')
    desc_file = Desc(base_path)

    trs = table.findAll('tr')

    # Skip the header
    for tr in trs[1:]:
        tds = tr.findAll('td')
        item_name = tds[0].find('a')['title']
        img_url = tds[1].find('img')['src']
        image_name = image_name_from_url(img_url)
        description = tags_to_text('a', tds[2])

        save_image(img_url, base_path)
        desc_file.update_item(
            item_name, image_name, description, Desc.TYPE_TRINKET)

    desc_file.write()


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
            save_td(td, desc_file)
        else:
            skip_count += 1
    debug('Skipped %s already saved images.' % (skip_count))


def save_td(td, desc_file):
    # Get image
    img = td.find('img')
    img_url = img['src']
    save_image(img_url, desc_file.base_path)

    # Get description
    image_name = image_name_from_url(img_url)
    desc_rel_url = td.find('a')['href']  # Description page url
    item_name, description = get_description(desc_rel_url)
    desc_file.update_item(item_name, image_name, description, Desc.TYPE_ITEM)


def save_image(img_url, base_path):
    path = os.path.join(base_path, RESOURCE_PATH, image_name_from_url(img_url))
    urllib.urlretrieve(img_url, path)
    debug('Saved ' + path)


# Helpers


class Desc(object):

    """
    Loads the pre-existing description JSON from file, allowing app
    to write to it, then write it back to file.
    """

    TYPE_ITEM = 'item'
    TYPE_TRINKET = 'trinket'

    def __init__(self, base_path=''):
        self.base_path = base_path
        self.path = os.path.join(
            self.base_path, RESOURCE_PATH, DESCRIPTIONS_FILE)

        try:
            self.current = json.loads(open(self.path).read(),
                                      object_pairs_hook=collections.OrderedDict)
        except IOError:
            # File doesn't exist yet
            self.current = collections.OrderedDict()  # {}

    def update_item(self, item_name, image_name, description, item_type):
        self.current[image_name] = {
            'name': item_name, 'description': description,
            'type': item_type}

    def write(self):
        """ Writes the current JSON back to file. """
        open(self.path, 'w').write(json.dumps(self.current, indent=4))


def get_already_saved(base_path):
    """
    Returns a set of img names already saved to disk.
    """
    files = os.listdir(os.path.join(base_path, RESOURCE_PATH))
    # Filter items with a dot (files)
    unique_names = set([x for x in files if x.find('.') != -1])
    return unique_names


def get_description(desc_relative_url):
    """
    Give a rel url of an item page e.g. '/SomeName'
    return (name, description)
    """
    bs = bs_from_url(BASE_URL + desc_relative_url)

    # Find image title
    # Location: <span itemprop="name">
    item_name = bs.find('span', attrs={'itemprop': 'name'}).text

    # Find image description
    # Location: The next sibling of the <h2> parent of <span
    # id="Effect|Effects"> in MAIN_DIV
    div1 = bs.find('div', attrs={'id': MAIN_DIV_ID})

    re_effect = re.compile("[Ee]ffect[s]{0,1}")
    span = div1.find('span', attrs={'id': re_effect})

    # Find next sibling that is not a span
    try:
        parent_span = span.parent
        next_el = parent_span.findNextSibling()
        while(str(next_el.name) == 'span'):
            next_el = parent_span.findNextSibling()
    except AttributeError:
        debug('Error: unable to get description')
        next_el = BeautifulSoup.BeautifulSoup('None')

    # Remove any script tags
    res = remove_tags('script', next_el)
    # Convert <a> tags to text
    # but return html instead of text to preserve formatting in the output
    return (item_name, tags_to_text('a', res))


def tags_to_text(tag_name, html):
    """ Replaces any <tag_name> tags in html, with the plaintext equivalent. """
    tags = html.findAll(tag_name)
    for t in tags:
        t.replaceWith(t.text)
    return str(html)


def remove_tags(tag_name, html):
    """ Removes any <tag_name> tags from html. """
    tags = html.findAll(tag_name)
    for t in tags:
        t.replaceWith('')
    return html


def bs_from_url(url):
    """
    Given a url string requests and returns the corresponding BS object.
    """
    # Non-browser user-agent was giving 403 reponse
    req = urllib2.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    debug('Made Request: ' + url)
    res = urllib2.urlopen(req).read()
    return BeautifulSoup.BeautifulSoup(res)


def image_name_from_url(s):
    """
    Converts: http://hydra-media.cursecdn.com/bindingofisaacrebirth.gamepedia.com/1/1a/The_Sad_Onion_Icon.png?version=9b2daa8d246033e451ae7527dae14f9d
    To: The_Sad_Onion_Icon.png

    *Not robust, doesn't use urllib encoding just simple string search*
    """
    if s.find('?') != -1:
        s = s.split('?')[0]
    s = s.split('/')[-1]
    return s


def debug(s):
    print "DEBUG: %s" % (s)


def main():
    # save_items()
    save_trinkets()

if __name__ == "__main__":
    main()
