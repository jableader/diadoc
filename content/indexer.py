from os import listdir, walk
from os.path import join, dirname

import json

import whoosh
from whoosh import index
from whoosh.qparser import QueryParser
from whoosh.fields import Schema, TEXT, ID

SCHEMA = Schema( \
        path=ID(stored=True, unique=True, field_boost=2.0), \
        caption=TEXT(stored=True), \
        content=TEXT)

def read_file(path):
    with open(path, 'r', errors='ignore') as f:
        return f.read()

def meta_file(reference_dir):
    return join(reference_dir, 'meta.json')

def _get_or_create_index(dir):
    return index.create_in(dir, SCHEMA)

def _path_index(path):
    return path.strip('/').replace('/', ' ')

class Indexer:
    def __init__(self, index_dir, reference_dir):
        self.idx = _get_or_create_index(index_dir)
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
        return read_file(join(self._ref_to_filepath(path), 'self.md'))

    def index_dir(self, path):
        for fileroot, dirs, files in walk(self._ref_to_filepath(path)):
            refroot = self._filepath_to_ref(fileroot)
            
            if 'self.md' in files:
                self.index(refroot)

    def index(self, path):
        if not path.startswith('/'):
            raise Exception(f"Expected reference path, not filepath: {path}")

        m = self.meta_for_file(path)
        caption = m['caption'] if m else None
        content = self._read_reference_document(path)

        writer = self.idx.writer()
        writer.add_document(caption=caption, content=content, path=_path_index(path), _stored_path=path)
        writer.commit()

    def search(self, text):
        with self.idx.searcher() as searcher:
            q = QueryParser("content", schema=SCHEMA)
            query = q.parse(text)
            results = searcher.search(query)

            return [dict(r) for r in results]

    def lexicon(self):
        with self.idx.searcher() as searcher:
            all_words = []
            all_words.extend(searcher.lexicon('content'))
            all_words.extend(searcher.lexicon('path'))

            return [word.decode('utf8') for word in all_words]