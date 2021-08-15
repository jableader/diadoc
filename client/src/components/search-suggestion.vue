<template>
  <div>
    <h1 class="title">
      {{ item.table }}
      <span v-if="item.column">
        - {{ item.column }}
      </span>
    </h1>
    <h2>
      {{ item.captions.join(", ") }}
    </h2>
  </div>
</template>

<script>
export default {
  props: {
    item: { required: true },
  },
};
</script>

<style scoped>
  h1, h2 {
    text-align: left;
    margin: 2px;
  }

  h1 {
    font-size: large;
    font-weight: bold;
  }

  h2 {
    font-size: small;
    font-style: italic;
    font-weight: normal;
  }
</style>
