<template>
	<joint-paper
        ref="jointWrapper"
        :selected-cell="selectedCell"
        :background="background"
        :grid-size="gridSize"
        :draw-grid="drawGrid"
        @select-requested="requestSelect"
        @init="build" />

</template>

<script>
import JointPaper from './joint-paper.vue'

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

export default {
  name: 'Graph',
  components: {
    'joint-paper': JointPaper
  },
  props: {
      reference: {
          type: Object,
          required: true
      },
      selectedReference: {
          type: Object,
          required: false
      }
  },
  watch: {
      selectedReference(newValue) {
        if (newValue && newValue.table)
            this.selectedCell = this.classes[newValue.table];
        else
            this.selectedCell = null
      }
  },
  data(){
    return {
        selectedCell: null
    }
  },
  methods: {
    build(graph) {
        var classes = {};
        for (const tableName in this.reference.tables) {
            classes[tableName] = asUml(this.$joint, tableName, this.reference.tables[tableName]);
            graph.addCell(classes[tableName]);
        }

        var relations = findLinks(this.reference).map(l => 
            new this.$joint.shapes.uml.Generalization({ 
                source: { id: classes[l.from].id },
                target: { id: classes[l.to].id },
            })
        );

        relations.forEach(r => graph.addCell(r));
        
        this.classes = classes;
    },
    idFromCell(cell) {
        for (const tableName in this.classes) {
            if (cell.id == this.classes[tableName].id) {
                return {table: tableName}
            }
        }
        return null;
    },
    requestSelect(item) {
        if (!item) {
            return;
        }

        const id = this.idFromCell(item);
        if (id) {
            this.$emit('reference-requested', id);
        }
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
