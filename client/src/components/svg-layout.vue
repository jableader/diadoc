<template>
  <svg ref="canvas"
    width="100%"
    height="100%"
    @mousedown="startPan"
    @mouseup="stopPan"
    v-html="content" />
</template>

<script>
import svgPanZoom from 'svg-pan-zoom'

function createPanAndZoom(targetElement) {
    const panAndZoom = svgPanZoom(targetElement, 
    {
        panEnabled: false,
        dblClickZoomEnabled: false,
    });

    panAndZoom.setMinZoom(0.1);
    return panAndZoom;
}

function renderShape(shape) {
  let inner = ''
  if (shape.children) {
    for (let c of shape.children) {
      inner += renderShape(c);
    }
  }

  return `
    <svg x="${shape.x}" y="${shape.y}">
      <rect width="${shape.width}" height="${shape.height}" fill="${shape.fill}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" />
      <text x="5" y="20" fill="black">${shape.label}</text>
      <g>
        ${inner}
      </g>
    </svg>
    `
}

function renderSvg(shapes) {
  let svg = '';
  for (let c of shapes) {
    svg += renderShape(c);
  }

  return `<g>${svg}</g>`;
}

export default {
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

  data: function() {
    return {
      content: renderSvg(this.shapes)
    }
  },

  mounted: function() {
    this.panAndZoom = createPanAndZoom(this.$refs['canvas']);
  },

  methods: {
    startPan: function() {
      this.panAndZoom.enablePan();
    },

    stopPan: function() {
      this.panAndZoom.disablePan();
    }
  }
}
</script>