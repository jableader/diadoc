<template>
  <svg ref="canvas" 
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid meet">

    <rect 
      :x="shape.x"
      :y="shape.y"
      :width="shape.width" 
      :height="shape.height" 
      :fill="shape.fill"
      :stroke="shape.stroke"
      :stroke-width="shape.strokeWidth" 
      @dblclick="$emit('shape-selected', shape.id)"/>

    <text 
      :x="shape.x + 5"
      :y="shape.y + 15"
      fill="black">{{shape.label}}</text>

    <g v-if="shape.children" transform="scale(0.1 0.1)">
      <svg-box 
        v-for="s in shape.children" 
        :key="s.label" 
        :shape="s" 
        @shape-selected="shapeSelected" /> 
    </g>
  </svg>
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