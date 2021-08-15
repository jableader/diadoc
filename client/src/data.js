const types = {
    number: () => ({name: 'int'}),
    text: () => ({name: 'string'}),
    linkTo: (tableName) => ({name: 'link', to: tableName}),
};

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
        return searchForTables(this.referenceMetaData.tables, text);
    },

    referenceMetaData: {
        tables: {
            address: {
                captions: ["Address", "address", "Residential Address"],
                description: "Stores an address",
                columns: {
                    houseNumber: {
                        type: types.number(),
                        captions: ["House Number"]
                    },
                    streetName: {
                        type: types.text(),
                        captions: ["Street Address", "Address 1"]
                    },
                    town: {
                        type: types.text(),
                        captions: ["Town"]
                    }
                }
            },
            person: {
                captions: ["Person", "Member", "Staff"],
                description: "Represents a single person",
                columns: {
                    address: {
                        type: types.linkTo('address'),
                        captions: ["Address"],
                    },
                    name: {
                        type: types.text(),
                        captions: ["Full Name", "Name"]
                    }
                }
            }
        }
    },
}