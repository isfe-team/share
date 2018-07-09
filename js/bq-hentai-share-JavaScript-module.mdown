前端模块化 之 JavaScript 模块化
=================================

## 前面的话

- 所有内容仅仅只是说前端模块化中的 JavaScript 模块化，HTML CSS 的相关技术不提及。

- 可能会牵涉到前端工程化的知识，但是并不会过多探讨。

- 所有内容均很基础，不涉及过多的代码，也不过多涉及技术的具体实现，有兴趣的大家可以去具体看看。

- 另外并不是很全面，也不能完全保证正确性。

## 现状

随着前端的发展，我们开发的方式也越来越多，下面简单进行介绍。

### 编写并引用脚本的方式

现在，我们编写脚本***主要***有以下几种方法：

  - 直接在 HTML 中的 `script` 标签中书写，例如：

    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <title>栗子</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <script type="text/javascript">
        ;(function (doc, win) {
            var docEl = doc.documentElement,
            resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',

            recalc = function () {
                var clientWidth = docEl.clientWidth;
                if (!clientWidth) return;
                docEl.style.fontSize = 20 * (clientWidth / 320) + 'px';
            };
         
            if (!doc.addEventListener) return;
            win.addEventListener(resizeEvt, recalc, false);
            doc.addEventListener('DOMContentLoaded', recalc, false);
        })(document, window);
    </script>
    </head>
    <body>
      <h1>Hello World</h1>
    </body>
    </html>
    ```


  - 用 `script` 标签引入一个或多个 JavaScript 脚本文件，例如：
  	
	```html
    <!DOCTYPE html>
    <html>
    <head>
      <title>栗子</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <script type="text/javascript" src="respond.js"></script>
    </head>
    <body>
      <h1>Hello World</h1>
    </body>
    </html>
    ```

  - 在一个组件文件中书写 HTML、Styles、Scripts，例如：
  	
	```vuecomponent
	<template>
  	  <div class="tag-input-wrp">
        <label>{{ meta.name }}<input v-model="meta.value"></label>
      </div>
    </template>

    <script>
      export default {
        data() {
          return { val: '' };
      	},
      	props: {
      	  meta: {
	        type: Object,
            default() {
              return { name: '名称', value: 'v' };
            }
          }
        },
        mounted() {
          this.val = this.meta.value;
    	}
  	  }
	</script>

	<style scoped>
	  .tag-input-wrp { }
	</style>
	```

### 三种方法的优缺点

- 方法一：
  + 优点：
  	* HTML 与 脚本代码在一起，只有一个文件，减少请求数
  + 缺点：
    * 仅能适用于单一小功能：比如设置某个必须的全局变量，或者在使用 rem时，在页面中直接写上 resize 的监听代码
    * 除去上面一条之外，基本只能用于交互极少（甚至没有）的用于浏览性质的网页

- 方法二：
  + 优点:
    * HTML 与 JavaScript 分离，更易维护
  + 缺点：
	* 增加了脚本文件的 HTTP 请求
	* 较大的系统，脚本较多，对开发者的代码组织、管理能力有要求

- 方法三：
  + 优点：
    * 纯组件式开发，便于定位、便于组合、便于扩展、便于维护（在一定的前提下）
    * 单一组件的 HTML、Style、Script 在一起，不用跨文件查找
  + 缺点：
    * 组件式开发对开发者的组件的定义、粒度的控制等有要求
    * 增加了学习成本
    * 需要预处理比如 `vue-loader` 才能生效，不可直接运行

### 总结

三种方式各有利弊，我们通常都是对三者进行组合，且大多集中在第二种方式，也就是我们将脚本抽离到单独的文件中，然后引入。

但是正如上面分析的结果，我们可以用这种方式编写可/易维护的应用，但是我们也要面对其缺点。我们如何减少 HTTP 请求，并组织、管理好我们的脚本。

下面我们主要讨论第二种方式。

## 为什么要模块化

好的模块化能带来很多好处：

  - 逻辑层次清晰易懂
  - 代码易于维护
  - 方便模块的分解以及组合
  - 方便单个功能的调试和升级
  - 方便多人协作
  - 易于进行单元测试
  - 其它

但是即使是进行了很好的模块化，也会带来一些缺点：

  - 模块化管理器（如果使用了的话）自身所带来的性能损耗
  - 模块化可能导致分层过多，调用链变长，带来性能损耗
  - 其它

但是，好的模块化所带来的好处远大于不进行模块化，所以在大多情况下，尽量去用模块化（组件化）的思想去组织你的代码。

## 模块化的历程

### 远古时期

在远古时期，主要进行表单校验以及简单的动画效果，没有模块化的概念，也基本不需要。

那是一个无模块化的时代。仅仅只是代码的简单堆砌。

### 模块化萌芽时代

随着 Ajax 发展，前端拥有了主动向服务端发送请求并操作返回数据的能力，传统的网页向**富客户端**发展。前端业务逻辑越来越多，代码量越来越大，暴露出一些问题：
  - 全局变量的灾难
  - 函数命名冲突
  - 依赖不好管理
  - 其它

#### 解决方案一

既然遇到了问题，也要去解决，这时候的解决方案是采用 IIFE + Singleton 的方式来管理代码。比如：

```javascript
var sampleModule = (function() {
  // inner state
  var cid;
  return {
	getCid: function() { return cid; }
	setCid: function(n) { cid = n; }
  }
})();
```

要调用的时候我们只需要 `sampleModule.getCid()` 即可。

这种模式缓解了全局变量过多以及函数命名冲突的问题。但是这种模式仍旧存在着一些问题：
  - 仍旧暴露了 `sampleModule` 这一个变量，如果模块过多，全局变量仍旧很多
  - 并没能解决依赖管理的问题

#### 解决方案一的优化

鉴于萌芽时代解决方案一的问题，有稍微改进一点的做法，也就是增加 `namespace` 概念。

比如我们熟悉的 `jQuery` 以及 `YUI` 等等。

按照这种思想，当我们在开发一个应用的时候，我们可以规划好应用的命名空间，划分好层次。比如：

```javascript
app.util.common = { };
app.util.adaptor = { };
app.components.pagination = { };
app.page.index = { };
```

这样做带来的好处有：全局变量只有一个。

但是相对的，带来了一些其它副作用：
  - 调用链过长，编写代码麻烦，效率相对较差。
  - 很恶心。

但是很多库或者框架的设计，都是按照这种思想，进行模块化划分，虽然采用的模块化方式并不相同，但是这是一个很大的改进，比如 `jQuery` 中就有 dom、ajax、animation、selector 模块。

与此同时（或许是与此同时吧），IIFF 也发展成一下。以 `jQuery` 为例：

```javascript
;(function(global, factory, undefined) {
  window.jQuery = window.$ = factory();
})(this, function() {
  var jQuery = function() { }
  // TODOS
});
```

最后，无论怎么发展，在萌芽阶段，依赖管理的问题始终没有解决。

### CommonJS 规范

其实，依赖管理的问题其实是语言层面的设计问题，是语言设计的缺陷。在 ES2015 标准开始才得到改进。

2009年，`node.js` 横空出世，开创了一个新纪元，人们可以用 `JavaScript` 来编写服务端的代码了。如果说浏览器端即便没有模块化也可以忍的话，那服务端是万万不能的。

于是社区发力，制定了[Modules/1.0](http://wiki.commonjs.org/wiki/Modules/1.0)规范，首次定义了一个模块应该长啥样。具体来说，Modules/1.0规范包含以下内容：
  - 模块的标识应遵循的规则（书写规范）
  - 定义全局函数**require**，通过传入模块标识来引入其他模块，执行的结果即为别的模块暴漏出来的API
  - 如果被**require **函数引入的模块中也包含依赖，那么依次加载这些依赖
  - 如果引入模块失败，那么**require**函数应该报一个异常
  - 模块通过变量**exports**来向往暴露API，**exports**只能是一个对象，暴漏的API须作为此对象的属性。

代码是类似于这样的：

```javascript
/* algor.js */

var algorCore = require('algor-core');

exports.quicksort = function() {
  // TODOS
}
```

但是这个规范其实只是为了服务端的（以前称之为 serverJS），服务端依赖直接同步加载，但是对于前端来说，同步加载基本不现实。

于是乎有着 Modules/Transport 和 Modules/Async 以及 Modules/2.0 等派别。但是现在貌似用的基本都不怎么多。

### AMD/RequireJS 的崛起

AMD 也就是 Asynchronous Module Definition，被开发者接受，在前端场景胜出。

AMD规范包含以下内容：
  - 用全局函数**define**来定义模块，用法为：`define(id?, dependencies?, factory)`;
  - id 为模块标识，遵从 CommonJS Module Identifiers 规范
  - dependencies 为依赖的模块数组，在 factory 中需传入形参与之一一对应
  - 如果 dependencies 的值中有 require、exports 或 module，则与commonjs中的实现保持一致
  - 如果 dependencies 省略不写，则默认为[ 'require', 'exports', 'module' ]，factory中也会默认传入 require, exports, module
  - 如果factory为函数，模块对外暴露 API 的方法有三种：`return AnyTypeData`、`exports.xxx = xxx`、`module.exports = xxx`
  - 如果 factory 为对象，则该对象即为模块的返回值

RequireJS 最被人诟病的一点是**预加载**。

比如：

```javascript
/* sample.js */
define(function(require, exports, module){
  console.log('sample.js');
  return {
    helloA: function(){
      var a = require('a');
      a.hello();
    },
    run: function(){
      $('#b').click(function(){
        var b = require('b');
        b.hello();
      });
    }
  }
});
```

在这里，a.js 和 b.js 都会比 sample.js 先加载且执行，哪怕是在 sample.js 里面 require 的。

### sea.js 后起之秀

sea.js 采用的是和 CommonJS 几乎一致的写法，同时采用 lazy load 的方式，在上面的栗子中，a.js 和 b.js 比 sample.js 早加载，但是 在其 require 之后才会去执行。

sea.js 被人诟病的大概是 spm 的使用很麻烦以及 parse dependencies 的时候采用的是方式是：

** 直接 parse function code ...... **

### ES6 模块化

`import` `export`

## 前端如何进行模块化

## 后面的话

## Refs
