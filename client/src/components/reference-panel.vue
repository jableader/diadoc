<template>
    <div>
      <div class="reference-header">
        <button @click="$emit('close')">X</button>
        &nbsp;&nbsp;
        <span> {{ friendlyId(sourceId) }} </span>
      </div>

      <reference-documentation :source-id="sourceId" />

      <div class="reference-additionalcontent">
          <h4>
              Related content
          </h4>
          <ul>
              <li v-for="item in relatedItems" :key="item.path">
                  <a href="#" @click="$emit('reference-requested', item)">
                    {{ friendlyId(item) }}
                  </a>
              </li>
          </ul>
      </div>
    </div>
</template>

<script>
import ReferenceDocumentation from './reference-documentation.vue'
import graph from '@/graph.js'

export default {
    components: {
        ReferenceDocumentation
    },
    emits: ['reference-requested', 'close'],
    props: {
        sourceId: {
            type: Object,
            required: true,
        },
        referenceMetaData: {
            type: Object,
            required: true
        }
    },
    computed: {
        relatedItems() {
            return graph.getRelated(this.referenceMetaData, this.sourceId);
        }
    },
    methods: {
        friendlyId(id) {
            return graph.friendlyId(id);
        },
    }
}

</script>


<style scoped>

.reference-header {
  border-bottom: solid thin #625ad8;
  padding-bottom: 1ex;
}

.reference-additionalcontent {
  border-top: solid thin #625ad8;
}

</style>