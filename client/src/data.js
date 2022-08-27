import graph from './graph'

const lazyFetch = function(url) {
    let result = null;
    return function() {
        if (result !== null)
            return new Promise((r) => r(result))

        return fetch(url)
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
    return fetch('/search?query=' + encodeURIComponent(searchQuery))
        .then(q => q.json())
        .then(results => results.map((r) => ({ id: graph.idForPath(r.path), snippet: r.caption })))
}

function getSuggestions(text) {
    const lastWordIndex = text.lastIndexOf(' ');
    const lastWord = lastWordIndex > 0 ? text.substring(lastWordIndex) : text;
    const preceedingWords = lastWordIndex > 0 ? text.substring(0, lastWordIndex + 1) : '';

    return __lexicon()
        .then(function(allwords) {
            return allwords
                .filter(word => word.indexOf(lastWord) >= 0)
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

        return fetch(`/reference/${id.path}/self.md`)
                .then(r => r.text());
    },
}