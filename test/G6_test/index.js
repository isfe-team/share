/*!
 * G6 test
 * index.js
 * bq-hentai
 */

;

// {

  // dom 容器 id
  const DOM_WRAPPER_ID = 'app_1'

  // 设置图数据
  const data = {
    nodes: [
      {
        id: 'node_1',
        x: 140,
        y: 210
      },
      {
        id: 'node_2',
        x: 270,
        y: 210
      }
    ],
    edges: [
      {
        id: 'edge_1',
        source: 'node_1',
        target: 'node_2'
      }
    ]
  }

  // 创建并配置 G6 画布
  const net = new G6.Net({
    // 容器 id
    id: DOM_WRAPPER_ID,
    // 容器 宽
    width: 500,
    // 容器 高
    height: 500
  })

  // 载入数据
  net.source(data.nodes, data.edges)
  // 渲染关系图
  net.render()
// }
