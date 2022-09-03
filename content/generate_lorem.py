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

def create_subtree(root, o, fetch_md, fetch_neighbours):
    for k, v in o.items():
        if k == META_KEY:
            continue

        p = path.join(root, k)
        os.mkdir(p)

        seed = seed_from_path(p)
        files = [path.join(p, f) for f in ['index.md', *fetch_neighbours(seed)]]
        
        for f in files:
          with open(f, 'w') as md:
              print("Generating %s" % p)
              
              fseed = seed_from_path(f)
              md.write('# ' + get_caption(v, k) + '\n' + fetch_md(fseed))

        create_subtree(p, v, fetch_md, fetch_neighbours)

def create_lorem_array(n):
  lorem = []
  for i in range(1, n+1):
    print(f'\r {i} / {n}', end='')
    lorem.append(generate_lorem())
  return lorem

def fetch_neighbours(seed, names, min, max):
  num = seed % (max - min)
  if num == 0:
    return []
  
  return [names[(i * seed) % len(names)] for i in range(1, num+1)]

def genmd(args):
    lorem = load_json(args.lorem)
    meta = load_json(args.meta)

    fetch_md = lambda seed: generate_lorem()
    if lorem:
      fetch_md = lambda seed: lorem[seed % len(lorem)]

    neighbours=lambda seed: fetch_neighbours(seed, args.neighbour_list, args.min_neighbours, args.max_neighbours)
    root = args.out
    if not path.isdir(root):
        os.mkdir(root)

    with open(path.join(root, 'meta.json'), 'w') as outMeta:
        json.dump(meta, outMeta, indent=2)
    
    if not args.metaonly:
        create_subtree(root, meta, fetch_md, neighbours)

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
    parser_genmd.add_argument('--neighbour_list', nargs='+', default=['other.md', 'refd.md', 'something_else.md'], help='Selection of path names for neighbour files')
    parser_genmd.add_argument('--min_neighbours', default=0, type=int, help='Min neighbour files for directory')
    parser_genmd.add_argument('--max_neighbours', default=2, type=int, help='Max number of neighbours')
    parser_genmd.set_defaults(main=genmd)

    args = parser.parse_args()
    args.main(args)