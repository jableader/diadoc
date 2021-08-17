<template>
	<joint-paper
        ref="jointWrapper"
        :selected-cell="selectedCell"
        @select-requested="requestSelect"
        @init="build" />

</template>

<script>
import JointPaper from './joint-paper.vue'

const shapeColor = 'rgba(176, 178, 230, 0.2)';
const shapeStroke = 'rgba(139, 133, 255, 0.6)';

function get_position() {
    return {x: Math.random() * 1920, y: Math.random() * 1080};
}

function asUml(joint, name, table) {
    let attrs = [];
    for (const columnName in table.columns) {
        let column = table.columns[columnName];
        attrs.push(`${column.type.name}: ${columnName}`);
    }

    const headerHeight = 20;
    const attrHeight = 16;

    const longestAttr = attrs.reduce((l, r) => Math.max(l, r.length), 0);
    const width = Math.max(100, Math.min(500, longestAttr * 10));
    const height = headerHeight + attrHeight * Object.keys(table.columns).length;

    return new joint.shapes.uml.State({
        position: get_position(),
        size: { width, height },
        name: name,
        events: attrs,
        attrs: {
            '.uml-state-body': {
                fill: shapeColor,
                stroke: shapeStroke,
                'stroke-width': 1.5
            },
            '.uml-state-separator': {
                stroke: shapeStroke,
            }
        }
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
          type: [Object, null],
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
    },
    reference() {
        this.build();
    }
  },
  data(){
    return {
        selectedCell: null
    }
  },
  methods: {
    build() {
        var graph = this.$refs.jointWrapper.graph;
        if (!this.reference || !graph) {
            return; // Nothing to build
        }

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
