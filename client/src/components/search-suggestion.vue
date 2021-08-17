<template>
  <div>
    <h1 class="title">
      {{ item.query }}
    </h1>
    <h2>
      {{ item.caption }}
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
    font-weight: normal;
  }

  h2 {
    font-size: small;
    font-style: italic;
    font-weight: normal;
  }
</style>
