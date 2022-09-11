import graph from './graph'

const contentBaseUrl = process.env.CONFIG_URL ?? "http://localhost:5000";

const lazyFetch = function(url) {
    let cached = null;
    return async function() {
        if (cached !== null)
            return new Promise((r) => r(cached))

      const response = await fetch(new URL(url, contentBaseUrl));
      cached = await response.json();
      return cached;
    }
};

var __referenceMetaData = lazyFetch('/ref/meta.json');
var __lexicon = lazyFetch('/api/lexicon');

async function searchForIds(searchQuery) {
  const q = await fetch(new URL('/api/search?query=' + encodeURIComponent(searchQuery), contentBaseUrl));
  const results = await q.json();
  return results.map((r) => ({ id: graph.idForPath(r.path), caption: r.caption, snippet: r.snippet }));
}

function getFallbackSuggestions(lastWord, preceedingWords) {
    const advancedSearchSamples = [
        `caption:${lastWord}`,
        `path:'/${lastWord}'`,
        `${lastWord}*`,
        `*${lastWord}`,
    ]

    if (preceedingWords) {
        advancedSearchSamples.unshift(`OR ${lastWord}`);
    }

    if (lastWord.length >= 2) {
        const midlen = Math.min(lastWord.length / 2, 3);
        const firstHalf = lastWord.substring(0, midlen);
        const secondHalf = lastWord.substring(lastWord.length - midlen);

        advancedSearchSamples.unshift(`${firstHalf}*${secondHalf}`);
    }

    return advancedSearchSamples;
}

async function getSuggestions(text) {
  const lastWordIndex = text.lastIndexOf(' ') + 1;
  const lastWord = lastWordIndex > 0 ? text.substring(lastWordIndex).toLowerCase() : text.toLowerCase();
  const preceedingWords = lastWordIndex > 0 ? text.substring(0, lastWordIndex) : '';

  const allwords = await __lexicon();
  if (!preceedingWords && !lastWord) {
    return [];
  }
  
  const fallback = getFallbackSuggestions(lastWord, preceedingWords);
  if (lastWord.length < 2) {
    return fallback.map(word => preceedingWords + word);
  }

  return allwords
    .filter(word_1 => word_1.indexOf(lastWord) >= 0)
    .sort((a, b) => a.indexOf(text) - b.indexOf(text))
    .concat(fallback)
    .slice(0, 20)
    .map(word_2 => preceedingWords + word_2);
}

function urlOf(id) {
  const fileSpecified = id.path.match(/\.\w+$/g);
  if (fileSpecified) {
    return `/ref/${id.path}`
  }

  const fixed = id.path.replace(/^\/+|\/+$/gm, '');
  return `/ref/${fixed}/index.md`
}

export default {
    searchSuggestions(text) {
        return getSuggestions(text)
    },

    searchResults(text) {
        return searchForIds(text);
    },

    fetchReferenceMetadata() {
        return __referenceMetaData();
    },

    async fetchReference(id) {
        if (!id) {
            return new Promise((g, b) => b("Null id"));
        }

      const r = await fetch(new URL(urlOf(id), contentBaseUrl));
      return await r.text();
    },
}