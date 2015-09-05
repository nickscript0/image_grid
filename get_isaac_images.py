# Scrapes images and descriptions from BOI wiki
#
# Usage: import get_isaac_images as gi; gi.save_tables()
#  -- Assumes directory 'RESOURCE_PATH' exists.
#  -- Saves the images from the 'Collection_Page' to disk.
#  -- Saves the names/descriptions in a JSON file.

# Debug: reload(gi); gi.save_tables(base_path=path)

from lib.get_trinkets import save_trinkets
from lib.get_items import save_items


def main():
    # save_items()
    save_trinkets()

if __name__ == "__main__":
    main()
