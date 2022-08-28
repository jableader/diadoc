import unittest
import tempfile
import os
import shutil

from os import path

from indexer import *

def all_substrings_in(s, subs):
    for sub in subs:
        if sub not in s:
            return False
    return True

class TestIndexer(unittest.TestCase):
    def test(self):
        self.assertTrue(True)

    def setUp(self):
        self.index_dir = tempfile.mkdtemp()
        self.idx = Indexer(self.index_dir, './test-reference/lan')

    def tearDown(self):
        shutil.rmtree(self.index_dir)

    def test_search_no_docs(self):
        self.assertEqual(len(self.idx.search("hello world")), 0)
        self.assertEqual(len(self.idx.lexicon()), 0)

    def test_indexed_search_caption(self):
        self.idx.index('/internet')
        
        results = self.idx.search('WAN')
        self.assertEqual(len(results), 1)
        self.assertEqual('🌐 WAN', results[0]['caption'])

    def test_indexed_search_content(self):
        self.idx.index('/internet')

        results = self.idx.search('aversum')
        self.assertEqual(len(results), 1)
        self.assertEqual('🌐 WAN', results[0]['caption'])

    def test_indexed_search_noresult(self):
        self.idx.index('/internet')

        results = self.idx.search('asdsajkndklandjksd')
        self.assertEqual(len(results), 0)

    def test_indexed_search_multitoken_adjacent(self):
        self.idx.index('/internet')

        results = self.idx.search('suspirat aversum')
        self.assertEqual(len(results), 1)
        self.assertEqual('🌐 WAN', results[0]['caption'])
        self.assertEqual('/internet', results[0]['path'])

    def test_indexed_search_multitoken_notadjacent(self):
        self.idx.index('/internet')

        results = self.idx.search('convicia aversum')
        self.assertEqual(len(results), 1)
        self.assertEqual('🌐 WAN', results[0]['caption'])
        self.assertEqual('/internet', results[0]['path'])

    def test_indexed_dir(self):
        self.idx.index_dir('internet')

        results = self.idx.search('convicia')
        self.assertEqual(len(results), 1)
        self.assertEqual('🌐 WAN', results[0]['caption'])
        self.assertEqual('/internet', results[0]['path'])

    def test_indexed_dir_nested(self):
        self.idx.index_dir('/')
        results = self.idx.search('convicia')
        self.assertEqual(len(results), 3)

    def test_lexicon_items_includes_content(self):
        self.idx.index_dir('/')
        results = self.idx.lexicon()
        self.assertIn(u'lorem', results)
        self.assertIn(u'wan', results)
    
    def test_lexicon_items_includes_path(self):
        self.idx.index_dir('/')
        results = self.idx.lexicon()

        path_components = u'first-lan/server/docker'.split('/')
        for p in path_components:
            self.assertIn(p, results)

        for r in results:
            self.assertFalse(all_substrings_in(r, path_components), msg=f"Dodgy looking token: '{r}'")

    def test_search_by_path(self):
        self.idx.index_dir('/first-lan')
        results = self.idx.search('path:/first-lan')

        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]['path'], '/first-lan')

    def test_prefer_low_depth_over_alphabetical(self):
        self.idx.index_dir('')
        results = [r['path'] for r in self.idx.search("path:server")]

        self.assertEqual(results[0], '/first-lan/server')
        self.assertEqual(results[1], '/first-lan/server/docker')
        self.assertEqual(results[2], '/first-lan/server/filesystem')

    def test_meta_exists_without_indexed_fields(self):
        self.idx.meta['internet']['__meta'] = {'whatever': None}
        self.idx.index('/internet')
        results = self.idx.search("wan")

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['path'], '/internet')

if __name__ == '__main__':
    unittest.main()