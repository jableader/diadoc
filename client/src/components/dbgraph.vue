<template>
	<joint-paper
        ref="jointWrapper"
        :selected-cell="selectedCell"
        @select-requested="requestSelect"
        @init="build" />

</template>

<script>
import JointPaper from './joint-paper.vue'
import Graph from '@/graph.js';

const shapeColor = 'rgba(176, 178, 230, 0.2)';
const shapeStroke = 'rgba(139, 133, 255, 0.6)';

function get_position() {
    return {x: Math.random() * 1920, y: Math.random() * 1080};
}

function findLinks(reference_data) {
    var links = [];
    Graph.walk(reference_data, function(id, node) {
        var link =  node?.['__meta']?.link;
        if (link) {
            links.push({ from: id, to: Graph.idForPath(link.to) });
        }

        return true;
    });

    return links;
}

function fetchChildCaptions(node) {
    const children = []

    Graph.walk(node, function(id, n) {
        if (n != node) {
            const c = n['__meta']?.caption;
            if (c)
                children.push(c);
        }

        return true;            
    });

    return children;
}

const ShapeBuilders = {
    uml: function (joint, node) {
        const caption = node.__meta.caption;
        
        let attrs = fetchChildCaptions(node);

        const headerHeight = 20;
        const attrHeight = 16;

        const longestAttr = attrs.reduce((l, r) => Math.max(l, r.length), 0);
        const width = Math.max(100, Math.min(500, longestAttr * 10));
        const height = headerHeight + attrHeight * attrs.length;

        return new joint.shapes.uml.State({
            position: get_position(),
            size: { width, height },
            name: caption,
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
}

function findNearestJointJs(shapes, id) {
    let keys = Object.keys(shapes);
    let closest = Graph.closestPath(keys, id);

    return shapes[closest];
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
        if (newValue)
            this.selectedCell = findNearestJointJs(this.shapes, newValue);
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

        var shapes = {}; // id.path: shape
        var joint = this.$joint;

        Graph.walk(this.reference, function(id, node) {
            var shapeName = node?.["__meta"]?.shape;
            if (shapeName) {
                if (shapeName in ShapeBuilders) {
                    var shape = ShapeBuilders[shapeName](joint, node);
                    shapes[Graph.pathForId(id)] = shape;
                    
                    graph.addCell(shape);
                }
                else {
                    console.log("Invalid shape at " + id + ": " + shape);
                }

            }

            return true;
        });

        var relations = findLinks(this.reference).map(function(l) {
                return new joint.shapes.uml.Generalization({ 
                    source: { id: findNearestJointJs(shapes, l.from).id },
                    target: { id: findNearestJointJs(shapes, l.to).id },
                });
            }
        );

        relations.forEach(r => graph.addCell(r));
        this.shapes = shapes;
    },

    idFromCell(cell) {
        for (const path in this.shapes) {
            if (this.shapes[path].id == cell.id) {
                return Graph.idForPath(path);
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
