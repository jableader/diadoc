from os import path
from pathlib import Path
import json

system_tags = set(['captions', 'type'])
def needs_folder(d):
    if type(d) != dict:
        return False
    
    if len(d.keys() - system_tags) > 0:
        return True
    
    return False

def create_subdirs(root, d):
    for k,v in d.items():
        if k in system_tags:
            continue

        if (needs_folder(v)):
            p = path.join(root, k)
            Path(p).mkdir(exist_ok=True)
            ref = path.join(p, 'self.md')
            Path(ref).touch()

            create_subdirs(p, v)
        else:
            Path(path.join(root, k + '.md')).touch()

with open('meta.json', 'r') as fin:
    create_subdirs('./', json.loads(fin.read()))