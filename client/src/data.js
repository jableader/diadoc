import graph from './graph'

var __referenceMetaData = null;

function searchForIds(searchQuery) {
    return fetch('/search?query=' + encodeURIComponent(searchQuery))
        .then(q => q.json())
        .then(results => results.map((r) => ({ id: graph.idForPath(r.path), snippet: r.caption })))
}

function getSuggestions(text) {
    return fetch('/suggest?prompt=' + encodeURIComponent(text))
        .then(r => r.json())
}

export default {
    searchSuggestions(text) {
        if (!__referenceMetaData)
            return [];

        return getSuggestions(text)
    },

    searchResults(text) {
        if (!__referenceMetaData)
            return [];

        return searchForIds(text);
    },

    fetchReferenceMetadata() {
        if (__referenceMetaData) {
            return new Promise((r) => r(__referenceMetaData))
        }

        return fetch('/reference/meta.json')
            .then(r => r.json())
            .then(function(m) {
                __referenceMetaData = m;
                return m;
            });
    },

    fetchReference(id) {
        if (!id) {
            return new Promise((g, b) => b("Null id"));
        }

        return fetch(`/reference/${id.path}/self.md`)
                .then(r => r.text());
    },
}