var types = {
    number: () => ({name: 'int'}),
    text: () => ({name: 'string'}),
    linkTo: (tableName) => ({name: 'link', to: tableName}),
};

function get_reference() {
    return {
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
    }
}
