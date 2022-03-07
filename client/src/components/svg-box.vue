<template>
  <g :transform="`translate(${shape.box.x}, ${shape.box.y})`">
    <rect 
      :width="shape.box.w" 
      :height="shape.box.h" 
      :fill="shape.style.fill"
      :fill-opacity="shape.style.fillOpacity"
      :stroke="shape.style.stroke"
      :stroke-width="shape.style.strokeWidth" 
      @dblclick="$emit('shape-selected', shape.id)"/>

    <text 
      :x="5"
      :y="shape.label.baseline"
      :transform="`scale(${shape.label.scale}, ${shape.label.scale})`"
      fill="black"
      >{{shape.label.text}}</text>

    <line v-if="shape.children"
      x1="0" :x2="shape.width" :y1="shape.label.bottom + shape.style.strokeWidth" :y2="shape.label.bottom + shape.style.strokeWidth" 
      :stroke="shape.style.stroke"
      :stroke-width="shape.style.strokeWidth" />

    <g v-if="shape.children.length > 0" :transform="`translate(${shape.children.box.x}, ${shape.children.box.y})`">
      <g :transform="`scale(${shape.children.scale}, ${shape.children.scale})`">
        <svg-box 
          v-for="s in shape.children" 
          :key="s.id.path" 
          :shape="s" 
          @shape-selected="shapeSelected" /> 
      </g>
    </g>
  </g>
</template>

<script>
export default {
  props: {
    shape: [Object]
  },
  methods: {
    shapeSelected(id) {
      this.$emit('shape-selected', id);
    }
  }
}
</script>