<template>
	<joint-paper
    ref="jointWrapper"
    :background="background"
    :grid-size="gridSize"
    :draw-grid="drawGrid"
    @init="build" />

</template>

<script>
import JointPaper from './joint-paper.vue'

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

function get_position() {
    return {x: Math.random() * 500, y: Math.random() * 500};
}

function asUml(joint, name, table) {
    let attrs = [];
    for (const columnName in table.columns) {
        let column = table.columns[columnName];
        attrs.push(`${column.type.name}: ${columnName}`);
    }

    return new joint.shapes.uml.Class({
        position: get_position(name),
        size: { width: 240, height: 100 },
        name: name,
        attributes: attrs,
    });
}

function findLinks(reference_data) {
    var links = []
    for (const tableName in reference_data.tables) {
        let table = reference_data.tables[tableName];
        for (const columnName in table.columns) {
            var type = table.columns[columnName].type;
            if (type.name === "link") {
                links.push({from: tableName, to: type.to});
            }
        }
    }

    return links;
}

function buildGraph(joint, graph, reference_data) {
    var classes = {};
    for (const tableName in reference_data.tables) {
        classes[tableName] = asUml(joint, tableName, reference_data.tables[tableName]);
        graph.addCell(classes[tableName]);
    }

    var relations = findLinks(reference_data).map(l => 
        new joint.shapes.uml.Generalization({ 
            source: { id: classes[l.from].id },
            target: { id: classes[l.to].id },
        })
    );

    relations.forEach(r => graph.addCell(r));
}

export default {
  name: 'Graph',
  components: {
    'joint-paper': JointPaper
  },
  data(){
    return get_reference()
  },
  methods: {
    build(graph) {
      buildGraph(this.$joint, graph, get_reference());
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
