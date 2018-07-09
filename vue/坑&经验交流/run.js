;(function () {

  // create Step DOM
  const createStep = (section, codeText, iframeUrl) => {
    const fragment = document.createDocumentFragment()

    const pre = document.createElement('pre')
    const code = document.createElement('code')
    code.textContent = codeText
    code.classList.add('lang-html')
    pre.appendChild(code)
    pre.classList.add('code-wrapper')

    const iframe = document.createElement('iframe')
    iframe.src = iframeUrl
    iframe.classList.add('code-rel')

    fragment.appendChild(pre)
    fragment.appendChild(iframe)

    section.appendChild(fragment)
  }

  // add `pNum` class, for ... hmmmm
  // idk why I do this hhhhh
  ;[ ...document.querySelectorAll('.reveal section') ]
    .forEach((section, index) => section.classList.add(`p${index}`))

  const fetchProcesses = [ ]

  ;[ ...document.querySelectorAll('.with-code') ]
    .forEach((section) => {
      const step = section.dataset['step']

      const url = `steps/step${step}`

      const fetchProcess = fetch(url).then((x) => x.text())
                           .then((code) => createStep(section, code, url))

      fetchProcesses.push(fetchProcess)
    })

  Promise.all(fetchProcesses).then(() => highlight())

  const highlight = (() => {
    let readyCount = 0
    return () => {
      ++ readyCount
      if (readyCount === 2) {
        hljs.initHighlightingOnLoad()
      }
    }
  })()
  
  Reveal.initialize({
    dependencies: [
      {
        src: './node_modules/reveal.js/plugin/highlight/highlight.js',
        async: false,
        callback () { highlight() }
      },
    ]
  })
})()
