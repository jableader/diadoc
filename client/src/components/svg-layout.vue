<template>
  <svg ref="canvas"
    width="100%"
    height="100%">

    <svg-box v-for="s in shapes" :shape="s" :key="s.id" @shape-selected="shapeSelected" />
    <!--
      Debug helper - show bounding boxes
      <rect v-for="b in bboxes" :key="b" :x="b.x" :y="b.y" :width="b.w" :height="b.h" fill-opacity="0" stroke="#FF0000" strokeWidth="0.5" />
    -->
  </svg>
</template>

<script>
import svgPanZoom from 'svg-pan-zoom'
import svgBox from './svg-box.vue'
import layout from '@/layout.js'

function createPanAndZoom(targetElement) {
    const panAndZoom = svgPanZoom(targetElement, { 
      dblClickZoomEnabled: false,
      maxZoom: 100,
      minZoom: 0.1,
    });

    return panAndZoom;
}

function allIds(shapes) {
  if (!shapes) {
    return [];
  }

  let ids = [];
  for (const s of shapes) {
    ids.push(s.id);
    ids = ids.concat(allIds(s.children));
  }

  return ids;
}

function centerElement(box, panAndZoom){
    panAndZoom.zoom(1);
    
    // We want our element to take up 80% of the vertical space
    // but no more than 50% of the horizontal space
    let pzSizes = panAndZoom.getSizes();
    panAndZoom.center();
    panAndZoom.pan({x: 0, y: 0});
    var ox = box.x + box.w / 2;
    var oy = box.y + box.h / 2;
    
    var z = pzSizes.realZoom;
    var dx = -ox*z + pzSizes.width / 2; // + z*viewBox.x;
    var dy = -oy*z + pzSizes.height / 2; // + z*viewBox.y;
    
    panAndZoom.pan({x: dx, y: dy});
    panAndZoom.zoomAtPoint(2, {x: pzSizes.width / 2, y: pzSizes.height / 2});
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
  computed:  {
    bboxes() {
      return allIds(this.shapes).map(id => layout.trueBoundingBox(this.shapes, id))
    }
  },

  updated: function() {
    if (this.shapes && !this.panAndZoom)
      this.panAndZoom = createPanAndZoom(this.$refs['canvas']);

    if (this.selection && this.panAndZoom) {
      var box = layout.trueBoundingBox(this.shapes, this.selection);
      this.$nextTick(() => centerElement(box, this.panAndZoom));
    }
  },

  methods: {
    shapeSelected(id) {
      this.$emit('shape-selected', id);
    }
  }
}
</script>