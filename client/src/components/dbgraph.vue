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
import Layout from '@/layouts/layout.js';
import Shape from '@/shape.js'

function findLinks(reference_data) {
    let links = [];
    Graph.walk(reference_data, function(id, node) {
        let nodeLinks = node?.['__meta']?.links?.map(link => ({ from: id, to: Graph.idForPath(link.to) }));
        if (nodeLinks)
            links = links.concat(nodeLinks)
        return true;
    });

    return links;
}

function buildShapes(reference) {
    const shapes = Layout.shapes(Graph.idForPath(''), reference).children;
    const links = findLinks(reference).map(l => Shape.closestPorts(shapes, l.from, l.to));
    return { shapes, links }
}

export default {
  name: 'Graph',
  components: {
    'svg-layout': SvgLayout
  },
  emits: ['reference-requested'],
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
    return { selected: null, ...buildShapes(this.reference ?? {})}
  },
  watch: {
      reference(v) {
          const {shapes, links} = buildShapes(v);
          this.shapes = shapes;
          this.links = links;
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
