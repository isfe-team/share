# Vue 交流

## 向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。

vue方法：`Vue.set(target, key, value)`。

例：

```javascript
data() {
  return {
    myObject: {
      property: '1'
    }
  }
}
```

`this.myObject.newProperty = 'hi'` 无法触发视图更新。

`this.$set(this.myObject, newProperty, 'hi')` 可以触发视图更新。

建议一开始就把newProperty写在myObject中

## 深度监听

```javascript
var vm = new Vue({
  data: {
    obj: {
      property: '11'
    }
  },
  watch: {
    // 深度 watcher
    // deep的意思就是深入观察，监听器会一层层的往下遍历，给对象的所有属性都加上这个监听器
    obj: {
      handler: function (val, oldVal) { /* ... */ },
      deep: true
    },
    // 另一种写法，只给property属性加上监听器
    'obj.property': {
        handler: function (val, oldVal) { /* ... */ },
        deep: true
    }
  }
})
```

## 遇到的一个问题

需求：在输入数据变化时，获取输入的值并做一些处理

```vue
<el-input type="textarea" v-model="note" v-on:input="checkLength(notes)"></el-input>
```

方法：

```javascript
checkLength(data) {
  // ......一些代码
  // 赋值，如果不使用$nextTick是不行的
  this.$nextTick(() => {
    // 这里需要使用dom更新后的数据this.note
    this.note = this.note.slice(0, -1);
  })
}
```

原因：Vue中DOM更新是异步的
官网解释：
Vue.js 默认异步更新 DOM。每当观察到数据变化时，Vue就开始一个队列，将同一事件循环内所有的数据变化缓存起来。等到下一次事件循环，Vue 将清空队列，只进行必要的 DOM 更新。

例如，设置了 `vm.someData = 'new value'`，DOM不会立即更新，而是在下一次事件循环清空队列时更新。为了在数据变化之后等待 Vue.js 完成更新 DOM，可以在数据变化之后立即使用 Vue.nextTick(callback) 。

## 父组件异步获取到数据前，子组件使用数据报错

原因：子组件渲染时，父组件数据还未返回
解决方法：
  1. 给子组件设置 `v-if="data"`，data未返回前不渲染子组件；
  2. 给子组件的 props 中值设置默认值

## vue 中 echarts 图表自适应

问题：调整浏览器大小如何使图表自适应
解决办法：

method:
```
handleResize() {
  this.echarts.resize() //初始化
}
```
在mounted中添加：
`window.addEventListener('resize', this.handleResize)`

beforeDestory中记得解绑：
`window.addEventListener('resize', this.handleResize)`
