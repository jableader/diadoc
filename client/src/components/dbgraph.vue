<template>
  <div class="container">
    <svg-layout
          ref="jointWrapper"
          :shapes="shapes"
          :links="links"
          :selection="selectedReference"
          :transition-speed="transitionSpeed"
          @shape-selected="id => $emit('reference-requested', id)"
          @nav="navReady"
          />
    <nav-toolbar 
      :transition-speed="transitionSpeed"
      @recenter="nav.recenter(true)"
      @update-transition-speed="v => transitionSpeed = v"
      />
  </div>
</template>

<script>
import NavToolbar from './nav-toolbar.vue';
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
  name: 'DbGraph',
  components: { SvgLayout, NavToolbar },
  emits: ['reference-requested', 'nav'],
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
    return { selected: null, nav: null, transitionSpeed: 1.5, ...buildShapes(this.reference ?? {})}
  },
  watch: {
      reference(v) {
          const {shapes, links} = buildShapes(v);
          this.shapes = shapes;
          this.links = links;
      }
  },
  methods: {
    navReady(nav) {
      this.nav = nav;
      this.$emit('nav', nav);
    }
  }
}

</script>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

</style>
