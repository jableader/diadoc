var __referenceMetaData = null;

function searchForTables(tables, searchQuery) {
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

export default {
    search(text) {
        if (!__referenceMetaData)
            return [];

        return searchForTables(__referenceMetaData.tables, text);
    },

    fetchReferenceMetadata() {
        if (__referenceMetaData) {
            return new Promise((r) => r(__referenceMetaData))
        }

        return fetch('/reference/meta.json')
            .then(r => r.json())
    },

    fetchReference(id) {
        if (!id) {
            return new Promise((g, b) => b("Null id"));
        }

        if (id.table && id.column) {
            return fetch(`/reference/tables/${id.table}/${id.column}.md`)
                .then(r => r.text());
        }

        if (id.table) {
            return fetch(`/reference/tables/${id.table}/self.md`)
                .then(r => r.text());
        }

        return new Promise((g, b) => b("Bad id"));
    }
}