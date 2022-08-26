import unittest
import tempfile
import os
import shutil

from os import path

from indexer import *

class TestIndexer(unittest.TestCase):
    def test(self):
        self.assertTrue(True)

    def setUp(self):
        self.index_dir = tempfile.mkdtemp()
        self.idx = Indexer(self.index_dir, './reference/lan')

    def tearDown(self):
        shutil.rmtree(self.index_dir)

    def test_search_no_docs(self):
        self.assertEqual(len(self.idx.search("hello world")), 0)
        self.assertEqual(len(self.idx.suggest("hello")), 0)

    def test_indexed_search_caption(self):
        self.idx.index('/internet/self.md')
        
        results = self.idx.search('WAN')
        self.assertEqual(len(results), 1)
        self.assertEqual('🌐 WAN', results[0].caption)

    def test_indexed_search_content(self):
        self.idx.index('/internet/self.md')

        results = self.idx.search('aversum')
        self.assertEqual(len(results), 1)
        self.assertEqual('🌐 WAN', results[0].caption)

    def test_indexed_search_multitoken_adjacent(self):
        self.idx.index('/internet/self.md')

        results = self.idx.search('suspirat aversum')
        self.assertEqual(len(results), 1)
        self.assertEqual('🌐 WAN', results[0].caption)
        self.assertEqual('/internet/self.md', results[0].path)

    def test_indexed_search_multitoken_notadjacent(self):
        self.idx.index('/internet/self.md')

        results = self.idx.search('convicia aversum')
        self.assertEqual(len(results), 1)
        self.assertEqual('🌐 WAN', results[0].caption)
        self.assertEqual('/internet/self.md', results[0].path)

    def test_indexed_dir(self):
        self.idx.index_dir('internet')

        results = self.idx.search('convicia')
        self.assertEqual(len(results), 1)
        self.assertEqual('🌐 WAN', results[0].caption)
        self.assertEqual('/internet/self.md', results[0].path)

    def test_indexed_dir_nested(self):
        self.idx.index_dir('/')
        results = self.idx.search('convicia')
        self.assertEqual(len(results), 3)

    def test_suggest_items(self):
        self.idx.index_dir('/')
        results = self.idx.suggest(u'lore')
        self.assertIn('lorem', results)

    def test_suggest_keeps_preceeding_text(self):
        self.idx.index_dir('/')
        results = self.idx.suggest(u'whatevs something lore')
        self.assertIn('whatevs something lorem', results)

if __name__ == '__main__':
    unittest.main()