import argparse, json, os, hashlib, requests
from os import path

META_KEY = '__meta'
LOREM_POOL=[]

def generate_lorem():
    return requests.get('https://jaspervdj.be/lorem-markdownum/markdown.txt').text

def get_caption(node, fallback):
    if META_KEY in node and 'caption' in node[META_KEY]:
        return node[META_KEY]['caption']
    return fallback

def load_json(f, fallback=None):
  if f:
    with open(f, 'r') as fin:
      return json.loads(fin.read())
  return fallback

def seed_from_path(p):
  n = 0
  hash = hashlib.md5(p.encode('utf8'))
  for c in hash.digest():
    n = n * 7 + int(c)
  return n

def create_subtree(root, o, fetch_md):
    for k, v in o.items():
        if k == META_KEY:
            continue

        p = path.join(root, k)
        f = path.join(p, 'index.md')
        os.mkdir(p)

        with open(f, 'w') as md:
            print("Generating %s" % p)
            seed = seed_from_path(f)
            
            md.write('# ' + get_caption(v, k) + '\n' + fetch_md(seed))

        create_subtree(p, v, fetch_md)

def create_lorem_array(n):
  lorem = []
  for i in range(1, n+1):
    print(f'\r {i} / {n}', end='')
    lorem.append(generate_lorem())
  return lorem

def genmd(args):
    lorem = load_json(args.lorem)
    meta = load_json(args.meta)

    fetch_md = lambda seed: generate_lorem()
    if lorem:
      fetch_md = lambda seed: lorem[seed % len(lorem)]

    root = args.out
    if not path.isdir(root):
        os.mkdir(root)

    with open(path.join(root, 'meta.json'), 'w') as outMeta:
        json.dump(meta, outMeta, indent=2)
    
    if not args.metaonly:
        create_subtree(root, meta, fetch_md)

def genlorem(args):
  print("Generating lorem")
  lorem = create_lorem_array(args.n)
  
  print()
  print("Saving")
  with open(args.out, 'w') as fout:
    json.dump(lorem, fout, indent=2)

  print("Done")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate Lorem Ipsum from a diadocs meta.json')
    subparsers = parser.add_subparsers(help='sub-command help')

    parser_genlorem = subparsers.add_parser('gen-lorem', help='Generate JSON array of lorem text')
    parser_genlorem.add_argument('out', help='Output file')
    parser_genlorem.add_argument('-n', type=int, default=5, help='Amount of lorem filetext to generate')
    parser_genlorem.set_defaults(main=genlorem)

    parser_genmd = subparsers.add_parser('gen-md', help='Generate lorem text matching a meta file')
    parser_genmd.add_argument('meta', help='Path to meta file')
    parser_genmd.add_argument('out', help='Output directory (meta will be copied)')
    parser_genmd.add_argument('--lorem', default=None, help='Lorem file to use')
    parser_genmd.add_argument('--metaonly', action='store_true', help='Only regenerate meta')
    parser_genmd.set_defaults(main=genmd)

    args = parser.parse_args()
    args.main(args)