<template>
  <span class="outer">
    <span class="node" v-for="root in roots" :key="root.id">
      <router-link :to="root.url">/{{ root.name }}</router-link>
    </span>
  </span>
</template>

<style scoped>
  .outer .node:hover {
    cursor: pointer;
    font-weight: bold;
  }

  .outer .node {
    margin-right: 0.3em;
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
      return graph.roots(this.id).map(id => ({ 
        id,
        url: `/v${graph.pathForId(id)}`,
        name: graph.leafName(id)
      }));
    },
    fid() {
      return graph.friendlyId(this.id);
    }
  }
}
</script>