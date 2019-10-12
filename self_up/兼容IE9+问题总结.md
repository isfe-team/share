
# IE9+兼容问题

当项目需要兼容IE，但是此时又开发了较多功能时，可以不改变原有代码，增加一个专门的 `css` 文件，做专门针对IE的样式修改，并在 `html` 的 `head` 中增加一行代码
<!--[if IE]><link rel="stylesheet" href="样式文件地址"><![endif]-->

兼容IE具体操作

1. `transform`: 只能用于2D的转换，且必须加前缀 `-ms-` (ie9)
2. 不能使用 `flex` 布局，可采用浮动或者 `display: inline-block`  (ie9)
3. white-space: nowrap不生效问题， 可加 `word-wrap: normal `解决 (ie9)
4. 无法实现动画   (ie9)
5. 音频播放时无法播放 `wav` 格式音频， 解决方案是可将音频格式改成Mp3等能兼容的
6. 渐变色不兼容 解决方法：-ms-写法，注意还需加 FILTER：... (ie9)
7. 图片大小在chrome中可以直接使用height:,会自动缩放，ie9中还需要设置width，否则图片容易变形。 
8. ie下的get请求，会存在浏览器的缓存问题，解决方法是可以在请求中增加时间戳
