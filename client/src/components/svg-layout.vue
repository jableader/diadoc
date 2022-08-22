<template>
  <svg ref="canvas"
    width="100%"
    height="100%">
    <defs>
      <marker id="head" orient="auto"
        markerWidth="5" markerHeight="6"
        refX="5" refY="2">
        <path d="M0,0 V4 L5,2 Z" fill="black"/>
      </marker>
    </defs>

    <g id="svg-pan-zoom-viewport" :class="{ animate: recentering }">
      <svg-box v-for="s in shapes" :shape="s" :key="s.id" @shape-selected="shapeSelected" />
      
        <!-- Debug helper - show bounding boxes
        <rect v-for="b in bboxes" :key="b" :x="b.x" :y="b.y" :width="b.w" :height="b.h" fill-opacity="0" stroke="#FF0000" strokeWidth="0.5" />
        -->
      <g>
        <line v-for="link in links" :key="link"
          :x1="link.p1.x" :x2="link.p2.x" :y1="link.p1.y" :y2="link.p2.y"
          stroke="black" strokeWidth="1" strokeOpacity="0.5"
          marker-end='url(#head)'/>
      </g>
    </g>
  </svg>
</template>

<style scoped>
  .animate {
    transition: transform 0.5s ease;
  }
</style>

<script>
import svgPanZoom from 'svg-pan-zoom'
import svgBox from './svg-box.vue'
import Shape from '@/shape.js'

function createPanZoom(targetElement) {
    const panZoom = svgPanZoom(targetElement, { 
      viewportSelector: '#svg-pan-zoom-viewport',
      dblClickZoomEnabled: false,
      maxZoom: 100,
      minZoom: 0.1,
    });

    return panZoom;
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

function calcCenter(p, l, z, vl) { // point[x|y], length[w|h], zoom, viewbox[w|h]
  const offset = p + l / 2;
  return vl / 2 - offset * z;
}

function centerElement(box, panZoom){
    const { width, height, realZoom, viewBox } = panZoom.getSizes();
    panZoom.pan({
      x: calcCenter(box.x, box.w, realZoom, width), 
      y: calcCenter(box.y, box.h, realZoom, height)
    });

    const dz = Math.min((viewBox.width / box.w), (viewBox.height / box.h)) * 0.8;
    panZoom.zoomAtPoint(dz, {x: width / 2, y: height / 2}, true);
}

export default {
  components: { svgBox },
  props: {
      shapes: {
          type: [Object, null], // Graph of items
          required: true
      },
      links: {
        type: [Array, null],
      },
      selection: {
          type: Object, // ID
          required: false
      },
  },
  computed:  {
    bboxes() {
      return allIds(this.shapes).map(id => Shape.trueBoundingBox(this.shapes, id))
    }
  },
  data() {
    return { recentering: false };
  },
  watch: {
    selection(){
      this.recenter();
    },
    shapes() {
      this.resetPanZoom();
      this.recenter();
    }
  },
  mounted() {
    this.recenter();
  },
  unmounted() {
    this.resetPanZoom()
  },
  methods: {
    resetPanZoom() {
      if (this._pz) {
        this._pz.destroy();
        this._pz = null;
      }
    },
    panZoom() {
      if (this.shapes?.length) {
        return this._pz ?? (this._pz = createPanZoom(this.$refs['canvas']));
      }
    },
    recenter: function() {
      if (this.shapes && this.shapes.length) {
        this.$nextTick(function() {
          const pz = this.panZoom();
          if (pz) {
            pz.resize();

            this.recentering = true;
            if (this.selection){
              var box = Shape.trueBoundingBox(this.shapes, this.selection);
              centerElement(box, pz);
            }

            setTimeout(() => this.recentering = false, 500);
          }
        });
      }
    },
    shapeSelected(id) {
      this.$emit('shape-selected', id);
    }
  }
}
</script>