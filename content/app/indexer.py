from os import listdir, walk, mkdir
from os.path import join, basename, isdir

import json
import re

from whoosh import index
from whoosh.qparser import QueryParser
from whoosh.analysis import RegexTokenizer, LowercaseFilter
from whoosh.fields import Schema, TEXT, ID
from whoosh.sorting import TranslateFacet, FieldFacet

SCHEMA = Schema(
        content=TEXT,
        caption=TEXT(stored=True),
        path=ID(
            stored=True,
            unique=True,
            field_boost=2.0,
            sortable=True,
            analyzer=RegexTokenizer(r'[^\/]+') | LowercaseFilter())
        )

def read_file(path):
    with open(path, 'r', errors='ignore', encoding='utf8') as f:
        return f.read()

def meta_file(reference_dir):
    return join(reference_dir, 'meta.json')

def _get_or_create_index(dir, create):
    if create:
        if not isdir(dir):
            mkdir(dir)
    
        return index.create_in(dir, SCHEMA)

    return index.open_dir(dir)

def _sort_key(path):
    # First 3 chars are the depth, then alphabetical
    return u'%03d%s' % (path.count(b'/'), path)

def simplify(query):
  if hasattr(query, 'fieldname') and hasattr(query, 'text'):
    return [query]
  
  try:
    results = []
    for item in query:
      if hasattr(item, 'fieldname') and hasattr(item, 'text'):
        results.append(item)
    return results

  except NotImplementedError:
    pass

def get_text_around(regex, haystack, n=50):
  match = re.search(r'\b' + regex + r'\b', haystack, flags=re.IGNORECASE)
  if match:
    mid = (match.start(0) + match.end(0)) // 2
    return haystack[max(0, mid - n):min(mid + n, len(haystack))]


class Indexer:
    def __init__(self, index_dir, reference_dir, create=False):
        self.idx = _get_or_create_index(index_dir, create)
        self.reference_dir = reference_dir
        
        with open(meta_file(reference_dir), 'r') as f:
            self.meta = json.load(f)

    def meta_for_file(self, path):
        node = self.meta
        parts = path.strip('/').split('/')
        for p in parts:
            if not p in node:
                raise Exception(f"Path not in metadata: '{path}', at '{p}' in {str(parts)}")

            node = node[p]
        return node['__meta'] if '__meta' in node else None

    def _ref_to_filepath(self, path):
        return join(self.reference_dir, path.strip('/'))

    def _filepath_to_ref(self, filepath):
        if not filepath.startswith(self.reference_dir):
            raise Exception("Path not in ref dir: %s" % filepath)
        return filepath[len(self.reference_dir):]

    def _read_reference_document(self, path):
        return read_file(join(self._ref_to_filepath(path), 'index.md'))

    def index_dir(self, path):
        for fileroot, dirs, files in walk(self._ref_to_filepath(path)):
            refroot = self._filepath_to_ref(fileroot)
            
            if 'index.md' in files:
                self.index(refroot)

    def index(self, path):
        if not path.startswith('/'):
            raise Exception(f"Expected reference path, not filepath: {path}")

        m = self.meta_for_file(path)
        caption = m['caption'] if m and 'caption' in m else basename(path)
        content = self._read_reference_document(path)

        writer = self.idx.writer()
        writer.add_document(caption=caption, content=content, path=path)
        writer.commit()

    def get_context(self, path, item, query):
      content = None
      for part in simplify(query):
        if part.fieldname == 'content':
          if not content:
            content = self._read_reference_document(path)

          r = get_text_around(part.text, content)
          if r:
            return r
            
        elif part.fieldname in item:
          r = get_text_around(part.text, item[part.fieldname])
          if r:
            return r
      return None

    def search(self, text):
        with self.idx.searcher() as searcher:
            q = QueryParser("content", schema=SCHEMA)
            query = q.parse(text)

            sort = TranslateFacet(_sort_key, FieldFacet('path'))
            results = []
            for item in searcher.search(query, sortedby=sort):
              context = self.get_context(item['path'], item, query)
              results.append({
                'path': item['path'],
                'caption': item['caption'],
                'snippet': context
              })

            return results

    def lexicon(self):
        with self.idx.searcher() as searcher:
            all_words = []
            all_words.extend(searcher.lexicon('content'))
            all_words.extend(searcher.lexicon('path'))

            return [word.decode('utf8') for word in all_words]