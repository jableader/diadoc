<template>
  <g :transform="`translate(${this.shape.x}, ${this.shape.y})`">
    <rect 
      :width="shape.width" 
      :height="shape.height" 
      :fill="shape.fill"
      :stroke="shape.stroke"
      :stroke-width="shape.strokeWidth" 
      @dblclick="$emit('shape-selected', shape.id)"/>

    <text 
      :x="5"
      :y="sizing.label.h * 0.8"
      :transform="`scale(${sizing.label.scale}, ${sizing.label.scale})`"
      fill="black"
      >{{shape.label}}</text>

    <line v-if="shape.children"
      x1="0" :x2="shape.width" :y1="sizing.label.bottom + shape.strokeWidth" :y2="sizing.label.bottom + shape.strokeWidth" 
      :stroke="shape.stroke"
      :stroke-width="shape.strokeWidth" />

    <g v-if="shape.children" :transform="`translate(${sizing.child.x}, ${sizing.child.y})`">
      <g :transform="`scale(${sizing.child.scale}, ${sizing.child.scale})`">
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
import Layout from '@/layout'

export default {
  props: {
    shape: [Object]
  },
  data() {
    return { sizing: Layout.sizing(this.shape) };
  },
  methods: {
    shapeSelected(id) {
      this.$emit('shape-selected', id);
    }
  }
}
</script>