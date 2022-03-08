import argparse, json, os, shutil, requests
from os import path

META_KEY = '__meta'

def generate_lorem():
    return requests.get('https://jaspervdj.be/lorem-markdownum/markdown.txt').text

def create_subtree(root, o):
    for k, v in o.items():
        if k == META_KEY:
            continue

        p = path.join(root, k)
        os.mkdir(p)
        with open(path.join(p, 'self.md'), 'w') as md:
            md.write('# ' + v[META_KEY]['caption'] + '\n' + generate_lorem())

        create_subtree(p, v)

def main(args):
    with open(args.meta, 'r') as f:
        meta = json.loads(f.read())

    root = args.out
    if not path.isdir(root):
        os.mkdir(root)

    with open(path.join(root, 'meta.json'), 'w') as outMeta:
        json.dump(meta, outMeta, indent=2)
    
    if not args.metaonly:
        create_subtree(root, meta)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate Lorem Ipsum from a diadocs meta.json')
    parser.add_argument('meta', help='Path to meta file')
    parser.add_argument('out', help='Output directory (meta will be copied)')
    parser.add_argument('--metaonly', action='store_true', help='Only regenerate meta')

    args = parser.parse_args()
    main(args)