<template>
  <div id="app">
    <section>
      <h3>WithOb Component Test</h3>
      <div>
        <WithOb v-model="withObVModel" />
        <label>withObVModel::name<input v-model="withObVModel.name"></label>
        <label>Toggle Text<input type="checkbox" v-model="withObVModel.checked"></label>
        <span v-if="withObVModel.checked">You can see me if checkbox is checked</span>
      </div>
    </section>
    <section>
      <h3>WithOb Component Array Test</h3>
      <div v-for="(x, index) in withObsVModel">
        <!-- can't use v-model="x" -->
        <WithOb v-model="withObsVModel[index]" />
        <label>withObVModel::name<input v-model="x.name"></label>
        <label>Toggle Text<input type="checkbox" v-model="x.checked"></label>
        <span v-if="x.checked">You can see me if checkbox is checked</span>
      </div>
    </section>
  </div>
</template>

<script>
import WithOb from './withOb'

export default {
  name: 'app',
  components: {
    WithOb
  },
  data () {
    return {
      withObVModel: {
        name: 'initialName',
        checked: false
      },
      withObsVModel: [
        { name: 'initialName', checked: false },
        { name: 'initialName',  checked: true }
      ]
    }
  }
}
</script>
