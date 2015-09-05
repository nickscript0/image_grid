# Helpers

import os
import json
import collections
import urllib
import urllib2
import re

import BeautifulSoup

# BOI wiki constants
BASE_URL = 'http://bindingofisaacrebirth.gamepedia.com'
MAIN_DIV_ID = "mw-content-text"

RESOURCE_PATH = 'test'
DESCRIPTIONS_FILE = 'descriptions.json'

MAX_IMAGES = None  # Debugging max number of images to process


class DescTableRow(object):

    """ This parses a common table row format found on Trinkets and Item_Pool pages.
        TODO: no relation to Desc class, need to clarify this. """

    def __init__(self, tr):
        self.item_name = None
        self.image_name = None
        self.image_url = None
        self.image_width = None
        self.image_height = None
        self.description = None

        self._parse(tr)

    def _parse(self, tr):
        tds = tr.findAll('td')
        self.item_name = tds[0].find('a')['title']
        img = tds[1].find('img')
        self.image_url = img['src']
        self.image_width = img['width']
        self.image_height = img['height']
        self.image_name = image_name_from_url(self.image_url)

        desc_with_tr = tags_to_text('a', tds[2])
        self.description = desc_with_tr.replace(
            '<td>', '').replace('</td>', '')

    @classmethod
    def parseTable(cls, table):
        """ Given a Trinkets style page BS table element, return a list of
            DescTableRow corresponding to each table row"""

        trs = table.findAll('tr')
        rows = [DescTableRow(tr) for tr in trs[1:]]
        return rows


class Desc(object):

    """
    Loads the pre-existing description JSON from file, allowing app
    to write to it, then write it back to file.
    """

    TYPE_ITEM = 'item'
    TYPE_TRINKET = 'trinket'

    ROOM_DEVIL = 'room_devil'
    ROOM_ANGEL = 'room_angel'

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

    def update_item(self, item_name, image_name, image_width, image_height,
                    description, item_type):
        self.current[image_name] = {
            'name': item_name, 'description': description,
            'type': item_type,
            'image_width': image_width,
            'image_height': image_height}

    def tagRoom(self, image_name, room_tag):
        self.current[image_name][room_tag] = True

    def write(self):
        """ Writes the current JSON back to file. """
        open(self.path, 'w').write(json.dumps(self.current, indent=4))


def save_image(img_url, base_path, already_saved_list):
    img_name = image_name_from_url(img_url)
    if img_name not in already_saved_list:
        path = os.path.join(base_path, RESOURCE_PATH, img_name)
        urllib.urlretrieve(img_url, path)
        debug('Saved ' + path)
    else:
        debug('Skipped %s, already saved.' % (img_name))


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
