<template>
  <svg ref="canvas"
    width="100%"
    height="100%">

    <svg-box v-for="s in shapes" :shape="s" :key="s.id" @shape-selected="shapeSelected" />
  </svg>
</template>

<script>
import svgPanZoom from 'svg-pan-zoom'
import svgBox from './svg-box.vue'

function createPanAndZoom(targetElement) {
    const panAndZoom = svgPanZoom(targetElement, { 
      dblClickZoomEnabled: false,
      maxZoom: 100,
      minZoom: 0.1,
    });

    return panAndZoom;
}

export default {
  components: { svgBox },
  props: {
      shapes: {
          type: [Object, null], // Graph of items
          required: true
      },
      selection: {
          type: Object, // ID
          required: false
      },
  },

  updated: function() {
    if (this.shapes && !this.panAndZoom)
      this.panAndZoom = createPanAndZoom(this.$refs['canvas']);
  },

  methods: {
    shapeSelected(id) {
      this.$emit('shape-selected', id);
    }
  }
}
</script>