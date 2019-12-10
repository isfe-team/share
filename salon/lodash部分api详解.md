# lodash

## lodash用处

是一套工具库，它内部封装了诸多对字符串、数组、对象等常见数据类型的处理函数，帮助开发者降低JS使用难度

@see https://www.lodashjs.com

### 模块组成

Array, Object, Function, String, Number, Math, Date, Lang, Collection, Utils, Seq

#### 为什么使用lodash

1. 使我们的代码更加易读

```js
var arr = [{ id: 1, name: '小明', age: 20 }, { id: 2, name: '小红', age: 21 }, { id: 3, name: '小黄', age: 16 }]
var arr1 = [ ]
for (var i = 0; i < arr.length; i++) {
  if (arr[i].age <= 20) {
    arr1.push(arr[i])
  }
}
for (var i = 0; i < arr1.length; i++) {
  arr1[i].type = 'child'
}

var arr = [{ id: 1, name: '小明', age: 20 }, { id: 2, name: '小红', age: 21 }, { id: 3, name: '小黄', age: 16 }]
var arr1 = _.filter(arr, (x) => {
  if (x.age <= 20) {
    return _.assign(x, { type: 'child' })
  }
})
```

2. 省去我们对一些异常的处理
eg: value.slice() 和 _.slice()
```js
function slice(array, start, end) {
  let length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  start = start == null ? 0 : start
  end = end === undefined ? length : end

  if (start < 0) {
    start = -start > length ? 0 : (length + start)
  }
  end = end > length ? length : end
  if (end < 0) {
    end += length
  }
  length = start > end ? 0 : ((end - start) >>> 0) // 重点关注
  start >>>= 0

  let index = -1
  const result = new Array(length)
  while (++index < length) {
    result[index] = array[index + start]
  }
  return result
}

export default slice
```

3. 能优化性能（使用惰性求值, 将近一半的方法支持一般不支持）
``` js
var xs = [
  { value: 1 },
  { value: 3 },
  { value: 6 },
  { value: 2 },
  { value: 4 },
  { value: 8 },
  { value: 2 },
  { value: 0 },
  { value: 3 },
  { value: 7 }
]
function vaild(x) {
  return function(item, index) {
    console.log(1)
    return item.value < x
  }
}

function getData () {
  const data = _(xs)
              .filter(vaild(3))
              .take(3)
              // .value()
  // const data = xs.filter(vaild(3)).slice(0, 3)
  return date
}
getData()
```

4. 避免了使用某些原生的js api带来的改变原数据的隐患,部分api除外（eg:_.remove, _.reverse)
``` js
var xs = [2, 1, 3]
xs.sort()
console.log(xs)

var arr = [2, 1, 3]
_.sortBy(arr)
console.log(arr)
```

5. 避免js已有方法的一些坑

- isNaN: 全局方法`isNaN`对于不能转化为数字的情况都会返回`true` `isNaN(undefined)`、`isNaN('a')`, `_.isNaN`则能准确判断

- toString: 转换`value`为字符串，但是不能转换`-0, undefined, null`, `_.toString`则没有这种顾虑

- 判断两个值是否相等，传统的`a ==== b` 无法包含所有, `_.eq`能判断所有类型的值包括`NaN`
``` js
_.eq(NaN, NaN)  //  true

return a === b || (a !== a && b !== b)
```

#### 如何使用lodash

`npm install lodash`
```js
import lodash from 'lodash'
import assign from 'lodash/assign'(更推荐按需引入)
```
- lodash常用方法

chunk, assign, pick, omit, uniq, find, findIndex, clone, cloneDeep, uniqueId, truncat, has, debounce

1. _.chunk 拆分数组
_.chunk([1, 2, 3, 4, 5], 2)

2. _.assign： 类似于`Object.assign`,但是`Object.assign`在ES5环境无法使用
参数： 目标对象， 源对象，源对象...， 源对象将自身的属性分配给目标对象，后续的源对象会覆盖之前的源对象
_.assign({ }, { value: 1, name: 2 }, { value: 3, age: 18 })
日常开发过程中经常使用的场景：列表查询接口参数
 
3. _.pick: 创建一个从object选中某些属性的对象
var a = { a: 1, b: 2, c: 3, d: 4, c: 5 }
_.pick(a, ['b', 'c'])
常用场景： 编辑请求回显时传多个参

4. _.omit 创建一个从object去除某些属性的对象
var a = { a: 1, b: 2, c: 3, d: 4, c: 5 }
_.omit(a, ['b', 'c'])
常用场景: 转换数据使用[{a: 1, b: 2}] => [{value: 1, age: 2}]
```js
var data = [{key: 1, title: 2}].map((x) => {
  const item = _.omit(x, ['key', 'title'])
  item.value = x.key
  item.age = x.title
  return item
})
```

5. _.uniq 数组去重
常用场景，可用于判断数据里面有没有重复的  arr.length === uniq(arr).length ?

6. find: 找到并返回满足条件的第一个元素
_.find([1, 2, 3, 4, 5], (x) => x > 2)

7. _.findIndex 找到元素对应的索引值
常用场景：可用于在已知元素标识下删除数组内该项
```js
var arr = [{ id: 1, name: 'haha' }, { id: 2, name: 'hehe' }, { id: 3, name: 'huhu' }]
var item = { id: 2, name: 'hehe' }
var index = _.findIndex(arr, item) // var index = _.findIndex(arr, (x) => x.id === item.id)
arr.splice(index, 1)
```

8. * _.clone 拷贝对象时，对于基本数据类型的变量会重新复制一份，而对于引用类型的变量只是对引用进行拷贝，没有对引用指向的对象进行拷贝。
```js
var xs = { name: '哈哈', person: { age: 10, name: 'xiaoming' } }
var cloneValue = clone(xs)
cloneValue.person.age = 1
cloneValue.name = '呵呵'
xs.person === cloneValue.person

function clone (value) {
  var newValue
  if (value && typeof value === 'object') {
    newValue = _.isArray(value) ? [ ] : { }
    for (var i in value) {
      newValue[i] = value[i]
    }
    return newValue
  }
  newValue = value
  return newValue
}
```

9. * _.cloneDeep 会递归深度克隆一个对象，拷贝对象时，同时会对引用指向的对象进行拷贝。
```js
var xs = { name: '哈哈', person: { age: 10, name: 'xiaoming' } }
var cloneDeepValue = cloneDeep(xs)
xs.person === cloneValue.person
cloneValue.person.age = 1
cloneValue.name = '呵呵'

function cloneDeep (value) {
  var result
  if (value && typeof value === 'object') {
    result = _.isArray(value) ? [ ] : { }
    for (let key in value) {
      if (value[key] && typeof value[key] === 'object') {
        result[key] = cloneDeep(value[key])
      } else {
        result[key] = value[key]
      }
    }
    return result
  }
  return value
}
```

区别在于是否对对象中的引用变量所指向的对象进行拷贝 

10. _.uniqueId 生成独一无二的id
常用场景：新增列表操作时，设置一点独一无二的id

11. _.truncate 截取指定长度后默认加...
_.truncate(string, { length: number, omission: '...', separator: ' ' })
常用场景：长数据进行展示时

12. _.has 检查某个属性是否是object对象的直接属性
常用场景：做一些异常情况处理时
_.has({a: 1, b: 2}, 'a')

13. _.debounce 防抖动函数
常用场景：频繁发生的事件，这些事件频繁发生，从而会频繁的操作`dom`,进行资源加载等，可能会导致浏览器崩溃等情况，比如下拉选框的搜索事件，屏幕的滚动事件，拖拽时的`mousemove`事件
_.debounce(function, time)
