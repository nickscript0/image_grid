import BeautifulSoup
import urllib2

# BOI wiki constants
BASE_URL = 'http://bindingofisaacrebirth.gamepedia.com'
MAIN_DIV_ID = "mw-content-text"

RESOURCE_PATH = 'scripts/isaac_grid/res'

def get_table(bs=None):
    TABLE1_ID = "wikitable"
    
    if bs is None:
        bs = bs_from_url(BASE_URL+'/Collection_Page')
    
    # Parse one table
    # TODO parse all six tables
    div1 = bs.find('div', attrs={'id': MAIN_DIV_ID})
    t1 = div1.find('table', attrs={'class': TABLE1_ID})
    els = t1.findAll('td')
    
    # Get image
    img_url = els[0].find('img')['src'] # Image path
    urllib.urlretrieve(els[0].find('img')['src'], RESOURCE_PATH+image_name_from_url(img_url))
    
    # Get description
    els[0].find('a')['href'] # Description page url
                
    
    #debug('div1=%s' %(div1))
    return t1
            
def get_description(desc_relative_url):
    bs = bs_from_url(BASE_URL+desc_relative_url)
    
    # Location: The first <p> after the first <h2> in MAIN_DIV
    div1 = bs.find('div', attrs={'id': MAIN_DIV_ID})
    return div1.find('h2').findNext('p').text
    
def bs_from_url(url):
    """
    Given a url string requests and returns the corresponding BS object.
    """
    # Non-browser user-agent was giving 403 reponse
    req = urllib2.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
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