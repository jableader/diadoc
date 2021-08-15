var __referenceMetaData = null;

function searchForIds(tables, searchQuery) {
    const r = new RegExp(searchQuery, "g");
    function hasMatchingCaption(name, captions) {
        if (name.match(r))
            return true;
            
        for (const caption of captions) {
            if (caption.match(r))
                return true;
        }

        return false;
    }

    var results = [];
    
    for (const tableName in tables) {
        const table = tables[tableName];
        if (hasMatchingCaption(tableName, table.captions)) {
            results.push({
                table: tableName,
                captions: table.captions,
            })
        }

        for (const columnName in table.columns) {
            const column = table.columns[columnName];
            if (hasMatchingCaption(columnName, column.captions)) {
                results.push({
                    table: tableName,
                    column: columnName,
                    captions: column.captions
                });
            }
        }
    }

    return results;
}

function suggestNameAndCaption(id, descriptor, r, name, captions) {
    var results = captions
        .filter(c => c.match(r))
        .map(c => ({query: c, caption: `Caption of ${descriptor} ${friendlyId(id)}`}));

    if (name.match(r))
        results.push({query: name, caption: `Name of ${descriptor} ${friendlyId(id)}`});
    
    return results;
}

function searchForSuggestions(tables, searchQuery) {
    const r = new RegExp(searchQuery, "gi");
    
    var results = []
    for (const tableName in tables) {
        const table = tables[tableName];
        var tableSuggestions = suggestNameAndCaption({table: tableName}, 'table', r, tableName, table.captions);
        results = results.concat(tableSuggestions);

        for (const columnName in table.columns) {
            const column = table.columns[columnName];
            var columnSuggestions = suggestNameAndCaption({table: tableName, columns: columnName}, 'column', r, columnName, column.captions);
            results = results.concat(columnSuggestions);
        }
    }

    return results;
}

function friendlyId(id) {
    if (!id) return "";
    if (id.table && id.column) return `tables/${id.table}/columns/${id.column}`;
    if (id.table) return `tables/${id.table}`;
}

export default {
    friendlyId,

    searchSuggestions(text) {
        if (!__referenceMetaData)
            return [];

        return searchForSuggestions(__referenceMetaData.tables, text)
    },

    searchResults(text) {
        if (!__referenceMetaData)
            return [];

        return searchForIds(__referenceMetaData.tables, text);
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

        if (id.table && id.column) {
            return fetch(`/reference/tables/${id.table}/columns/${id.column}.md`)
                .then(r => r.text());
        }

        if (id.table) {
            return fetch(`/reference/tables/${id.table}/self.md`)
                .then(r => r.text());
        }

        return new Promise((g, b) => b("Bad id"));
    }
}