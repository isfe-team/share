# 简单验证栗子

> 也可以参考 [crossdomain](https://github.com/colorhook/crossdomain)

## Usage

为了更好的体验，可以先更改本地 host，加上 `127.0.0.1 www.b.com`。

内部代码直接依赖了上述配置。然后：

```sh
# install
npm i

# start server
npm run server

# present
# *new cli*
npm start
```

## Core

目前来说方案主要是两种（除去hash变化等）以及这两种方案的变体，下面介介绍。

> 注意：host 为 A域页面，inner 为 A域中嵌入的B域页面（通过 iframe嵌入），stream 为 B域用于通信的长连接。

### iframe + postMessage

host 页面通过 iframe 直接建立到 stream 的长连接，然后服务端一直输出：

```html
<script type="text/javascript">
  parent.postMessage('${Date.now()}', '*') 
</script>
```

然后 host 页面中直接监听 onmessage：

```javascript
// 注意防止覆盖了第三方的
onmessage = function (event) {
  // fool ie
  event = event || window.event
  if (event.origin == domainOfB) {
    // handle(event.data)
  }
}
```

这种方案是没问题的，但是有一个注意点，那就是 iframe初始添加到 host页面上时，必须要在 onload 之后（建议还加一个 setTimeout，偶现过一次），代码如下：

```javascript
window.onload = function () {
  // 双层保险
  setTimeout(function () {
    document.body.appendChild(iframe)
  })
}
```

但是最后发现在 ie较低版本中刷新之后浏览器的 title旁边会一直转圈。无法解决。同时还存在按住 ESC 会断开连接的问题。

### double iframes + postMessage

由于刷新问题，所以得考虑其它改进或者其它方案。优先考虑了改进方案，考虑到加载问题，那我想到可以使用双层 iframe来解决。

host 页面通过内嵌 inner页面（此处的inner可以和host同域或不同域），直接嵌入，保证资源能正常加载，去除 loading状态。然后在 inner页面再去创建 iframe去实现 comet。然后 inner页面直接中转消息。

经过测试，可以解决 ESC 问题，但是还是有刷新转圈问题，就不详细解释。

### new ActiveXObject('htmlfile')

由于改进无效，所以考虑新的方案。这个一个新的思路，直接使用 ActiveXObject 来实现 comet。

基本思路和实现可以参考[这篇文章](http://cometdaily.com/2007/11/18/ie-activexhtmlfile-transport-part-ii/)。

但是很快就遇到了没有权限的报错，因为主域不同。

### inner iframe + new ActiveXObject('htmlfile')

由于遇到没有权限的问题，所以继续只能考虑改进或其它方案。

结合前面的 double iframes方案，我想到可以结合一起用。方案主要介绍如下：

A域的 host 内嵌 B域的 inner，然后 B域的 inner 使用 `new ActiveXObject('htmlfile')` 方案来连接 B域的长连接 stream，实现 comet。

因为 inner 和 stream 同属于 B域，用来解决权限问题，然后使用 `postMessage` 来实现 inner 和 host 的跨域通信。

所以最后我们的需要的集成在 host 页面的 jssdk，以及在 B域中的 `inner.html` 以及 长连接stream 服务。

实现简单介绍如下。

jssdk：

```javascript
// 注意做兼容处理以及兼容原始的可能绑定的 onmessage 处理
onmessage = function (event) {
  event = event || window.event
  // do sth. with event.data
}
```

inner 的 html 以及 plugin 代码见 `inner.html` 和 `plugin.js`。主要是用于中转消息以及建立长连接。

server 的话，只是简单的提供静态文件以及长连接服务。

经过测试，正常执行，同时可以解决 loading 状态问题。

#### 注意点

这个方案有几个注意点：

1. `transferDoc` 需要保持引用，防止垃圾回收了。在这里简单的直接将其作为全局变量了。

2. Browser 端长连接的关闭以及内存泄漏问题

需要在 `unload` 时或其它需要释放时将 `transferDoc` 置为空，释放一切需要释放的东西。

> ie 还暴露了 `CollectGarbage` 接口，可以参考。

3. 考虑异常处理（比如长连接建立异常处理），这个可以考虑直接检测 `inner.html` 的加载状态，但是 通过 ActiveXObject 建立的连接如何从前端考虑 error 暂时没有好的想法（onreadystatechange等测试过不行）。

4. 服务端的长连接服务需要注意资源释放。
