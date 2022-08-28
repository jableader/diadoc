import graph from './graph'

const content = process.env.CONFIG_URL ?? "http://localhost:5000";

const lazyFetch = function(url) {
    let result = null;
    return function() {
        if (result !== null)
            return new Promise((r) => r(result))

        return fetch(new URL(url, content))
            .then(r => r.json())
            .then(function(m) {
                result = m;
                return m;
            });
    }
};

var __referenceMetaData = lazyFetch('/reference/meta.json');
var __lexicon = lazyFetch('/lexicon');

function searchForIds(searchQuery) {
    return fetch(new URL('/search?query=' + encodeURIComponent(searchQuery), content))
        .then(q => q.json())
        .then(results => results.map((r) => ({ id: graph.idForPath(r.path), snippet: r.caption })))
}

function getFallbackSuggestions(lastWord, preceedingWords) {
    let advancedSearchSamples = [
        `caption:${lastWord}`,
        `path:'/${lastWord}'`,
        `${lastWord}*`,
        `*${lastWord}`,
    ]

    if (preceedingWords) {
        advancedSearchSamples.unshift(`OR ${lastWord}`);
    }

    if (lastWord.length >= 2) {
        var midlen = Math.min(lastWord.length / 2, 3);
        var firstHalf = lastWord.substring(0, midlen);
        var secondHalf = lastWord.substring(lastWord.length - midlen);

        advancedSearchSamples.unshift(`${firstHalf}*${secondHalf}`);
    }

    return advancedSearchSamples;
}

function getSuggestions(text) {
    const lastWordIndex = text.lastIndexOf(' ') + 1;
    const lastWord = lastWordIndex > 0 ? text.substring(lastWordIndex).toLowerCase() : text.toLowerCase();
    const preceedingWords = lastWordIndex > 0 ? text.substring(0, lastWordIndex) : '';

    return __lexicon()
        .then(function(allwords) {
            if (!preceedingWords && !lastWord) {
                return [];
            }

            const fallback = getFallbackSuggestions(lastWord, preceedingWords);
            if (lastWord.length < 2) {
                return fallback.map(word => preceedingWords + word);
            }

            return allwords
                .filter(word => word.indexOf(lastWord) >= 0)
                .sort((a, b) => a.indexOf(text) - b.indexOf(text))
                .concat(fallback)
                .slice(0, 20)
                .map(word => preceedingWords + word)
        });
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

    fetchReference(id) {
        if (!id) {
            return new Promise((g, b) => b("Null id"));
        }

        return fetch(new URL(`/reference/${id.path}/self.md`, content))
                .then(r => r.text());
    },
}