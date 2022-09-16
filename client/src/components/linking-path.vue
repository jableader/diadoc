<template>
  <span class="outer">
    <span class="node" v-for="root in roots" :key="root.id" @click="$emit('reference-requested', root.id)">/{{ root.name }}</span>
  </span>
</template>

<style scoped>
  .outer:hover .node:not(.node:hover ~ .node) {
    font-weight: bold;
  }
</style>

<script>
import graph from '../graph.js'

export default {
  emits: ['reference-requested'],
  props: {
    id: {
      type: Object,
      required: true
    }
  },
  computed: {
    roots() {
      return graph.roots(this.id).map(id => ({ id, name: graph.leafName(id)}));
    },
    fid() {
      return graph.friendlyId(this.id);
    }
  }
}
</script>