<template>
  <div class="container">
    WithOb Component

    <label>Name: <input v-model="name"></label>
  </div>
</template>

<script>
import assign from 'lodash/assign'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'WithOb',
  data () {
    return {
      name: '',
      clonedValue: cloneDeep(this.value)
    }
  },
  props: {
    value: {
      type: Object,
      default: { }
    }
  },
  methods: {
    emitInput () {
      // `observe` fn result in errors
      const newValue = assign(this.clonedValue, { checked: this.value.checked })
      // const newValue = assign({ }, this.clonedValue, { checked: this.value.checked })
      console.log(newValue, Object.hasOwnProperty.call(newValue, '__ob__'))
      this.$emit('input', newValue)
    }
  },
  watch: {
    name (name) {
      this.clonedValue = { name: this.name }
      this.emitInput()
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 50px;
  border: 1px solid pink;
}
</style>
