<template>
	<svg-layout
        ref="jointWrapper"
        :shapes="shapes"
        :links="links"
        :selection="selectedReference"
        @shape-selected="requestSelect" />
</template>

<script>
import SvgLayout from './svg-layout.vue'
import Graph from '@/graph.js';
import Layout from '@/layout.js';

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

export default {
  name: 'Graph',
  components: {
    'svg-layout': SvgLayout
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
  data() {
      return { shapes: null, links: null, selected: null };
  },
  watch: {
    reference(value) {
        if (value) {
            const shapes = Layout.shapes(Graph.idForPath(''), this.reference).children;
            this.shapes = shapes;
            this.links = findLinks(value).map(l => Layout.closestPorts(shapes, l.from, l.to));
        } else {
            this.shapes = null;
            this.links = null;
        }
    }
  },
  methods: {
    requestSelect(id) {
        if (!id) {
            return;
        }

        this.$emit('reference-requested', id);
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
