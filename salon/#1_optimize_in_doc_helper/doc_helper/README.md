# Doc helper

> Api refs: https://www.processon.com/diagraming/5cb5708de4b0841b84316c16

> 注意由于懒得拼接，所以用了 `artTemplate` 作为模板引擎。

## Usage

See `example/index.html`.

## Background

1. vie 测听在长音频时卡顿，滚动时有明显的延迟。

> Firefox 比 Chrome 表现更好一点。

2. vie 测听在 Chrome 版本中搜索出错。

### Why

1. 卡顿，长音频时 dom 元素较多，而 vie 中直接是基于 dom 一个个的搜索而且有很多冗余运算，导致长音频时，卡顿严重。

2. 分词导致搜索不对（ie 版本正确，Chrome 版本很迷）

### How

#### Think #0

基于 `Virtual List`。

`Virtual List` 需要使用固定高度，不然无法计算，故放弃。

#### Think #1

基于 DOM Diff + CSS 继承。

1. 降低 DOM 搜索频率
2. 优化渲染逻辑（基于diff + css继承）
3. 增加 throttle 节流措施

前提：设计良好的数据结构。

##### 流程设计

对于 render

```
#0 ConfigDocHelper

#1 InitDocHelper

#2 RenderDoc
  #2.1 RenderRows
  #2.2 RenderColumns

#3 Diff

#4 ApplyPatch
```

对于 search

```
#0 RenderPrevSearchedWords

#1 RenderSearchedWords
  #1.1 RenderSearchedWord
```

整体 API

```
DocHelper
|
init
|
gotoCertainTime
|
getHighlightConfigByTime ----- renderListByConfig: renderHaveBeenReadRows -> renderHaveBeenReadColumns
|
diff: diffList
|
applyPatch: dropHaveBeenReadColumns -> renderHaveBeenReadColumns -> dropHaveBeenReadRows -> renderHaveBeenReadRows
|
scrollToLastHaveBeenReadBottom
```

```
searchByKeyword
|
getWordsByKeyword
|
renderWordsToCertainClass
|
highlightCertainWord
```

```
stepTo
|
getSteppedWord
|
highlightCertainWord
|
other callbacks
```

辅助 API

```
DocHelperError
```
