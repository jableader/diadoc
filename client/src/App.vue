<template>
  <div>
    <dbgraph />
    <vue-suggestion :items="items" 
                    v-model="item" 
                    :setLabel="setLabel"
                    :itemTemplate="itemTemplate"
                    @changed="inputChange" 
                    @selected="itemSelected">
    </vue-suggestion>
  </div>
</template>

<script>
import dbgraph from './components/dbgraph.vue'
import VueSuggestion from 'vue-suggestion'

export default {
  name: 'App',
  components: {
    dbgraph,
    VueSuggestion
  },
  data (){
    return {
      'item': {},
      'items': [

      ]
    }
  }
}
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
