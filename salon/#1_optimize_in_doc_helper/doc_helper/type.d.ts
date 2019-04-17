/*!
 * DocHelper Type Definitions | bqliu
 */

interface CssConfig {
  haveBeenRead: string,
  searchHighlight: string,
  emSearchHighlight: string,
}

interface ScrollConfig {
  maxScrollDelta: number,
  minHeightToStartAutoScroll: number
}

interface DataTransformer {
  (input: Array<any>): Array<Channel>
}

// DocHelper 的配置类型
interface Config {
  css: CssConfig,
  scroll: ScrollConfig,
  $container: any, // $
  rawData: Array<any>,
  dataTransformer: DataTransformer 
}

type Time = number
type TimeTuple = [Time, Time] // seconds

interface Channel {
  channel: string,
  words: Array<string>,
  times: Array<TimeTuple>,
  [key: string]: any
}

type RowIndex = number
type ColumnIndex = number
type WordPos = { rowIndex: RowIndex, columnIndex: ColumnIndex }

// 高亮数据配置
// 考虑到业务实际情况，不会存在中间 rows 被选择的情况，所可以用一个数字来代替
// 但是如果存在 中间的被选择，那就需要用 Array 来记录 haveBeenReadRows 和 haveBeenReadColumnsInLastRow
// 暂时我想保持 patch 中间是 Array 所以暂时使用数组
interface HighlightConfig {
  // 因为存在多个的可能
  voiceIndex: number,
  // 数据缓存
  channels: Array<Channel>,
  // 已读过的行数组，整行的
  haveBeenReadRows: Array<RowIndex>,
  // 已读过的列数组，最后读的那行
  haveBeenReadColumnsInLastRow: Array<ColumnIndex>,
  // 搜索高亮的词组数组
  searchHighlightWords?: Array<WordPos>,
  // 模型词组数组，暂时不考虑
  modelWords?: Array<WordPos>
}

// 高亮 Patch 配置
interface HighlightPatch {
  voiceIndex: number,
  channels: Array<Channel>,
  newMaxRowIndex: RowIndex,
  oldMaxRowIndex: RowIndex,
  haveBeenReadRowsPatch: {
    added: Array<RowIndex>,
    removed: Array<RowIndex>
  },
  haveBeenReadColumnsInLastRowPatch: {
    added: Array<ColumnIndex>,
    removed: Array<ColumnIndex>
  },
  // 暂未使用，先保留，和模型一样
  searchHighlightWordsPatch?: {
    added: Array<WordPos>,
    removed: Array<WordPos>
  }
}

interface SearchedWordConfig {
  voiceIndex: number,
  rowIndex: RowIndex,
  columnIndices: Array<ColumnIndex>,
  fullKeywordColumns: Array<Array<ColumnIndex>>
}

type SearchedWordConfigs = Array<SearchedWordConfig>

interface HightlightWord {
  voiceIndex: number,
  rowIndexInWord: RowIndex,
  columnIndexInWord: ColumnIndex
}

enum StepType {
  prev = -1,
  next = 1
}
