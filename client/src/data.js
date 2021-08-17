var __referenceMetaData = null;

function searchForIds(root, searchQuery) {
    const r = new RegExp(searchQuery, "g");
    
    var results = [];
    function searchIds(path, node) {
        if (typeof(node) !== "object") {
            if (node.match && node.match(r)) {
                results.push({
                    id: { "path": path },
                    "snippet": `Found on ${path}`
                });
            }

            return;
        }

        var meta = node["__meta"];
        if (meta) {
            for (const m in meta) {
                if (meta[m] && meta[m].match && meta[m].match(r)) {
                    results.push({
                        id: { "path": path },
                        snippet: `${m} of ${path}`
                    });
                }
            }
        }

        for (const name in node) {
            if (name != '__meta') {
                if (name.match(r)) {
                    const id = { path: `${path}/${name}` };
                    results.push({
                        id,
                        snippet: `Collection at ${id.path}`
                    });
                }

                searchIds(path + '/' + name, node[name]);
            }
        }
    }

    searchIds('', root);

    return results;
}

const searchForSuggestions = (function() {
    function buildWords(root) {
        var wordMatches = JSON.stringify(root).matchAll(/\w+/g);
        var results = new Set();
    
        for (const word of wordMatches)
            results.add(word[0]);
    
        results.delete("__meta");
        results.delete("caption");
    
        return [...results];
    }

    var __words = null;
    return function(root, text, max=20) {
        var results = [];
        var r = new RegExp(text, "gi");
        var words = __words ?? (__words = buildWords(root));
        for (const w of words) {
            if (w.match(r)) {
                results.push(w)
                if (results.length >= max) {
                    return results;
                }
            }
        }

        return results;
    }
})();

function friendlyId(id) {
    return id.path;
}

export default {
    friendlyId,

    searchSuggestions(text) {
        if (!__referenceMetaData)
            return [];

        return searchForSuggestions(__referenceMetaData, text)
    },

    searchResults(text) {
        if (!__referenceMetaData)
            return [];

        return searchForIds(__referenceMetaData, text);
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

    collect(id) {
        const result = [ __referenceMetaData ];
        function _collect(node, subpath) {
            if (!node) {
                console.log("Attempting to navigate to falsy")
                return node;
            }

            if (!subpath) {
                return node;
            }

            var nextPath = subpath.split('/', 1)[0];
            const next = node[nextPath];
            if (!next || typeof(next) != "object") {
                console.log("Invalid path provided")
                return node;
            }

            result.push(next);
            _collect(next, subpath.substring(nextPath.length + 1));
        }

        _collect(__referenceMetaData, id.path.substring(1));
        return result;
    },

    getRelated(id) {
        if (!id) {
            return []
        }

        var parent = id.path.split('/');
        parent.pop();
        parent = parent.join('/');
        
        var results = [];
        if (parent && parent != '/') {
            results.push({path: parent});
        }

        var nodes = this.collect(id);
        var node = nodes[nodes.length - 1];
        for (const child in node) {
            results.push({ path: id.path + '/' + child });
        }

        return results;
    },

    fetchReference(id) {
        if (!id) {
            return new Promise((g, b) => b("Null id"));
        }

        return fetch(`/reference/${id.path}/self.md`)
                .then(r => r.text());
    }
}