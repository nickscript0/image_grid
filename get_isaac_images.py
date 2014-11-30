import BeautifulSoup
import urllib2

BASE_URL = 'http://bindingofisaacrebirth.gamepedia.com/Collection_Page'
RESOURCE_PATH = 'scripts/isaac_grid/res'

def get_table(bs=None):
    DIV1_ID = "mw-content-text"
    TABLE1_ID = "wikitable"
    
    if bs is None:
        res = make_request(BASE_URL)
        bs = BeautifulSoup.BeautifulSoup(res)
    
    # Parse one table
    # TODO parse all six tables
    div1 = bs.find('div', attrs={'id': DIV1_ID})
    t1 = div1.find('table', attrs={'class': TABLE1_ID})
    els = t1.findAll('td')
    
    # Get image
    img_url = els[0].find('img')['src'] # Image path
    urllib.urlretrieve(els[0].find('img')['src'], RESOURCE_PATH+parse_image_name_from_url(img_url))
    
    # Get description
    els[0].find('a')['href'] # Description page url
                
    
    #debug('div1=%s' %(div1))
    return t1
            
            
def make_request(url):
    req = urllib2.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib2.urlopen(req).read()

def parse_image_name_from_url(s):
    """
    Converts: http://hydra-media.cursecdn.com/bindingofisaacrebirth.gamepedia.com/1/1a/The_Sad_Onion_Icon.png?version=9b2daa8d246033e451ae7527dae14f9d
    To: The_Sad_Onion_Icon.png
    
    *Not safe, doesn't use urllib encoding just simple string search*
    """
    if s.find('?') != -1:
        s = s.split('?')[0]
    s = s.split('/')[-1]
    return s
    

def debug(s):
    print "DEBUG: %s" %(s)