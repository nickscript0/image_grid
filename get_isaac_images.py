import urllib2
import urllib
import os
import os.path
import re
import json

import BeautifulSoup

# BOI wiki constants
BASE_URL = 'http://bindingofisaacrebirth.gamepedia.com'
MAIN_DIV_ID = "mw-content-text"

RESOURCE_PATH = 'res'
DESCRIPTIONS_FILE = 'descriptions.json'


        
def save_tables(bs=None):
    TABLE1_ID = "wikitable"
    
    if bs is None:
        bs = bs_from_url(BASE_URL+'/Collection_Page')
        
    # Loop through all wikitables on page
    div1 = bs.find('div', attrs={'id': MAIN_DIV_ID})
    current_table = div1.findNext('table', attrs={'class': TABLE1_ID})
    i = 1
    try:
        while(current_table != None):
            debug('Processing table ' + str(i))
            tds = current_table.findAll('td')
            desc_file = Desc()
            save_table(tds, desc_file)
            current_table = current_table.findNextSibling('table', attrs={'class': TABLE1_ID})
            i += 1
    finally:
        desc_file.write()
    
def save_table(table_tds, desc_file):
    already_saved = get_already_saved()
    # Loop through each table <td>
    skip_count = 0
    for td in table_tds:
        image_name = image_name_from_url(td.find('img')['src']).split('.')[0]
        if image_name not in already_saved:
            save_td(td, desc_file)
        else:
            skip_count += 1
    debug('Skipped %s already saved images.' %(skip_count))
        
def save_td(td, desc_file):
    # Get image
    img = td.find('img')
    img_url = img['src']
    save_image(img_url)
    
    # Get description
    image_name = image_name_from_url(img_url).split('.')[0]
    desc_rel_url = td.find('a')['href'] # Description page url
    save_description(desc_rel_url, image_name, desc_file)

def save_image(img_url):
    path = os.path.join(RESOURCE_PATH, image_name_from_url(img_url))
    urllib.urlretrieve(img_url, path)
    debug('Saved '+path)
    
def save_description(desc_relative_url, image_name, desc_file):
    #path = os.path.join(RESOURCE_PATH, name)
    #open(path, 'w').write(get_description(desc_relative_url))
    desc_file.current[image_name] = {'description': get_description(desc_relative_url)}

### Helpers
class Desc(object):
    """
    Loads the pre-existing description JSON from file, allowing app
    to write to it, then write it back to file.
    """
    path = os.path.join(RESOURCE_PATH, DESCRIPTIONS_FILE)
    
    def __init__(self):
        try:
            self.current = json.loads(open(self.path).read())
        except IOError:
            # File doesn't exist yet
            self.current = {}

    def write(self):
        """ Writes the current JSON back to file. """
        open(self.path, 'w').write(json.dumps(self.current, indent=4, sort_keys=True))

def get_already_saved():
    """
    Returns a set of img names already saved to disk.
    """
    files = os.listdir(RESOURCE_PATH)
    unique_names = set([x.split('.')[0] for x in files if x.find('.') != -1])
    return unique_names    
    
def get_description(desc_relative_url):
    """
    Give a rel url of an item page e.g. '/SomeName' return the description of the page
    """
    bs = bs_from_url(BASE_URL+desc_relative_url)
    
    # Location: The next sibling of the <h2> parent of <span id="Effect|Effects"> in MAIN_DIV
    div1 = bs.find('div', attrs={'id': MAIN_DIV_ID})

    re_effect = re.compile("[Ee]ffect[s]{0,1}")
    span = div1.find('span', attrs={'id': re_effect})
    
    # Find next sibling that is not a span
    try:
        parent_span = span.parent
    except AttributeError:
        debug('Error: unable to get description')
        return 'None'
    next_el = parent_span.findNextSibling()
    while(str(next_el.name) == 'span'):
        next_el = parent_span.findNextSibling()
    return next_el.text
    
def bs_from_url(url):
    """
    Given a url string requests and returns the corresponding BS object.
    """
    # Non-browser user-agent was giving 403 reponse
    req = urllib2.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    debug('Made Request: '+url)
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
    print "DEBUG: %s" %(s)