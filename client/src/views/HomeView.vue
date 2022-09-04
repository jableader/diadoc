<template>
  <div class="top-level">
    <div class="search-container primary">
      <div class="search-prompt">
        Diadocs &nbsp;&nbsp;&nbsp;
      </div>

      <div style="width: 60%;max-width: 600px;display: inline-block">
        <search-box :suggestions="searchSuggestions" @update-suggestions="updateSearchSuggestions"
          @search-requested="search" @blur="searchSuggestions = []" />
      </div>
    </div>

    <div class="bottom-level">
      <splitpanes @resize="ev => panelResized(ev, '')">
        <pane min-size="25" :size="layout.container.size" ref="container">
          <splitpanes :horizontal="layout.container.size < 50" @resize="ev => panelResized(ev, 'container')">
            <pane v-if="searchResults" :size="layout.container.results.size" ref="container.results">
              <div class="search-results primary">
                <div style = "display: flex; justify-content:flex-end">
                  <button @click="showPage(selectedReferenceId, null)">X</button>
                </div>
                <span>Search Results</span>
                <results-panel :searchResults="searchResults" :selectedId="selectedReferenceId"
                  @item-selected="showReference" />
              </div>
            </pane>

            <pane :size="layout.container.graph.size" ref="container.graph">
              <dbgraph ref="graph" :reference="reference" :selected-reference="selectedReferenceId"
                @reference-requested="showReference" />
            </pane>
          </splitpanes>         
        </pane>
        <pane v-if="selectedReferenceId" :size="layout.ref.size" ref="ref">
          <div class="reference-panel">
            <reference-panel :source-id="selectedReferenceId" :referenceMetaData="reference" @close="showReference(null)"
              @reference-requested="showReference" />
          </div>
        </pane>
      </splitpanes>
    </div>
  </div>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import Graph from '../graph.js'
import ReferencePanel from '../components/reference-panel.vue'
import Dbgraph from '../components/dbgraph.vue';
import ResultsPanel from '../components/results-panel.vue';
import SearchBox from '../components/search-box.vue'
import data from '../data.js';

export default {
  name: 'App',
  components: {
    Dbgraph,
    SearchBox,
    ResultsPanel,
    ReferencePanel,
    Splitpanes, Pane,
  },
  props: {
    query: {
      type: String,
      required: false
    }
  },
  data (){
    const layout = {
      container: {
        size: 100, index: 0,
        results: { size: 25, index: 0 },
        graph:  { size: 100, index: 1 },
      },
      ref: { size: 30, index: 1 },
    };

    return {
      searchSuggestions: [],
      searchResults: null,
      reference: null,
      layout,
    }
  },
  computed: {
    selectedReferenceId(){
      var parts = this.$route.params.path;
      if (parts && parts.length > 0)
        return Graph.idForPath('/' + parts.join('/'));
      return null;
    },
  },
  watch: {
    query(prompt) {
      if (prompt) {
        return data.searchResults(prompt).then(g => {
          this.searchResults = g;
          this.searchSuggestions = [];
        });
      }
    }
  },
  created() {
    data.fetchReferenceMetadata()
      .then(g => this.reference = g);
  },
  methods: {
    search(item) {
      this.showPage(this.selectedReferenceId, item);
    },
    showReference(id) {
      this.showPage(id, this.query);
    },
    showPage(id, searchtext) {
      const query = searchtext ? { query: searchtext } : null
      if (id) {
        this.$router.push({
          path: '/v' + Graph.pathForId(id),
          query
        });
      }
      else {
        this.$router.push({ path: '/', query });
      }
    },
    panelResized(ev, parent) {
      let layout = this.layout, prefix = '';
      if (parent) {
        layout = parent.split('.').reduce((l, n) => l[n], layout);
        prefix = parent + '.';
      }

      const visible = Object.keys(layout)
        .sort((a, b) => layout[a].index - layout[b].index)
        .filter(k => this.$refs[prefix + k]);

      visible.forEach((key, i) => layout[key].size = ev[i].size);
    },
    updateSearchSuggestions(text) {
      data.searchSuggestions(text)
        .then(r => this.searchSuggestions = r);
    },
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
}

.top-level {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}

.search-container {
  position: absolute;
  width: 100%;
  height: 6ex;
  padding-left: 1em;
  padding-top: 1ex;
  padding-bottom: 1ex;
  margin: 0 0;
  z-index: 30;

  text-align: left;
}

.search-prompt {
  display: inline-block;
  vertical-align: top; 
  margin-top: 1em;

  font-weight: bold;
}

.search-results {
  overflow-y: scroll;
  height: 100%;
  padding: 1ex 5px 2px 5px;

  text-align: left;
}

.reference-panel {
  padding: 1ex 1em 5px 5px;
  overflow-y: scroll;
  height: 100%;
  display: flex;
  text-align: left;
  background-color: white;
}

.reference-panel > div {
  width: 100%;
}

.bottom-level {
  position: absolute;
  top: 8ex;
  bottom: 0;
  left: 0;
  right: 0;
}

.splitpanes__splitter {
  background-color: #625ad8;
  border: solid medium #8882df;
}

</style>
