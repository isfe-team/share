/*!
 * A lib for pdf previewing based on `PDF.js` created by Mozilla
 * `PDF.js` should be loaded and mounted to root
 * NOTICE: 100+ pages maybe ok - - no lazy load now
 * hentai | 05/31/2017
 */

!(function(root, factory) {
  // although can't be used in node env.
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(require('pdf'), require('pdf.worker'));
  }
  else if (typeof define === 'function' && define.amd) {
    define([ 'pdf', 'pdf.worker' ], factory);
  }
  else {
    root.PDFPreviewer = factory(root.PDFJS);
  }
})(this || (0, eval)('this'), function factory(pdfjs) {
  // helpers
  var slice = Array.prototype.slice;
  var noop = function() { }

  var shallowExtend = function shallowExtend(tar/*, obj1, obj2, ... */) {
    var objs = slice.call(arguments, 1);

    objs.forEach(function(obj) {
      if (typeof obj !== 'object' && obj !== null) {
        return ;
      }
      Object.keys(obj).forEach(function(prop) {
        tar[prop] = obj[prop];
      });
    });

    return tar;
  }

  var getStyleValue = function($node, styleName) {
    return getComputedStyle($node)[styleName];
  }

  var removePx = function(x) {
    return x.slice(0, -2);
  }

  // simple `finally` pollyfill
  if (!('finally' in Promise.prototype)) {
    Promise.prototype.finally = function(cb) {
      return this.then(cb, cb);
    }
  }

  var loadPdfDocument = function loadPdfDocument(src) {
    return pdfjs.getDocument(src);
  }

  var handlePdfDocument = function handlePdfDocument(doc) {
    return new Promise(function(resolve, reject) {
      var curPage = 1;
      var loadedPageCnt = 0;
      var pdf$ = { info: doc, pages: { } };
      var errors = null;

      while(curPage <= doc.numPages) {
        doc.getPage(curPage)
          .then(function(page) {
            pdf$.pages[page.pageNumber] = page;
          })
          .catch(function(err) {
            if (!Array.isArray(errors)) {
              errors = [ ]
            }
            errors.push(err);
          })
          .finally(function() {
            if (++ loadedPageCnt === doc.numPages) {
              resolve({ errors: errors, pdf$: pdf$ });
            }
          });

        ++ curPage;
      }
    }).then(function(res) {
      if (res.errors) {
        throw res.errors;
      }
      return res.pdf$;
    });
  }

  var getRenderedPdfCore = function getRenderedPdfCore(pdf, isError) {

    var $el = document.createElement('div');
    $el.classList.add('pdf-previewer-wrapper');

    if (isError) {
      return $el;
    }

    var innerHTML = '<ul class="page-list">';
    var curPage = 1;

    while(curPage <= pdf.info.numPages) {
      innerHTML += '<li class="page-list-item" data-page-number="' +
        pdf.pages[curPage].pageNumber +
        '"><canvas></canvas></li>';

      ++ curPage;
    }

    innerHTML += '</ul>';

    $el.innerHTML = innerHTML;

    return $el;
  }

  /**
   * set up Constructor & its prototype
   */
  var PDFPreviewer = function(opts) {

    var defaults = {
      $container: document.body,
      pdfPath: 'compressed.tracemonkey-pldi-09.pdf',
      boundResize: true,
      onLoadAll: noop,
      onError: noop
    };


    if (!(this instanceof PDFPreviewer)) {
      return PDFPreviewer.of(opts);
    }
    this.opts = shallowExtend({ }, defaults, opts);
    this.src = this.opts.pdfPath;

    this.pdf$ = { };
    if (this.opts.boundResize) {
      window.addEventListener('resize', this.refreshPages.bind(this));
    }

    return this;
  }

  PDFPreviewer.of = function(opts) {
    return new PDFPreviewer(opts);
  }

  var proto = PDFPreviewer.prototype = {
    constructor: PDFPreviewer
  }

  proto.init = function() {
    return loadPdfDocument(this.src)
      .then(handlePdfDocument)
      .then(this.onLoadAll.bind(this))
      .catch(this.opts.onError.bind(this));
  }

  proto.onLoadAll = function(pdf$) {
    this.pdf$ = pdf$;
    this.loaded = true;

    this
      .mount()
      .refreshPages()
      .opts.onLoadAll.call(this);
  }

  proto.resetPdf$ = function() {
    this.pdf$ = { };
    return this;
  }

  proto.checkValid = function() {
    return (
      this.loaded &&
      typeof this.pdf$.info === 'object' &&
      typeof this.pdf$.pages === 'object'
    );
  }

  proto.isValidNumPages = function(numPages) {
    numPages = Number(numPages);
    return !Number.isNaN(numPages) && numPages !== 0;
  }

  proto.isValidNumPage = function(numPage) {
    if (!this.checkValid()) {
      return false;
    }
    return this.isValidNumPages(numPage) &&
      numPage <= this.pdf$.info.numPages;
  }

  proto.getRenderedPdf = function() {
    if (
      !this.checkValid() ||
      !this.isValidNumPages(this.pdf$.info.numPages)
    ) {
      return getRenderedPdfCore(this.pdf$, true);
    }

    return getRenderedPdfCore(this.pdf$);
  }

  proto.mount = function(replace) {
    if (replace) {
      this.opts.$container.innerHTML = '';
    }
    var $el = this.$el = this.getRenderedPdf();
    this.opts.$container.appendChild($el);

    return this;
  }

  proto.toPage = function(num) {
    num = Number(num);
    if (!this.isValidNumPage(num)) {
      return this;
    }

    var $selectedEl = this.$el.querySelector(
      '.page-list-item[data-page-number="' + num + '"]'
    );

    if (!$selectedEl) {
      return this;
    }

    this.opts.$container.scrollTop = $selectedEl.offsetTop;

    return this;
  }

  proto.refreshPages = function() {
    if (!this.checkValid()) {
      return this;
    }

    slice.call(
      this.$el.querySelectorAll('.page-list .page-list-item')
    )
      .forEach(function handle$page($page) {

        var pageNumber = $page.dataset['pageNumber'];

        this.renderPage(
          this.pdf$.pages[pageNumber],
          $page.querySelector('canvas')
        );

      }.bind(this));

    return this;
  }

  proto.renderPage = function(page, $canvas) {
    var width = removePx(getStyleValue(this.opts.$container, 'width'));
    var initialScale = 1;
    var viewport = page.getViewport(initialScale);

    var viewportWidth = viewport.width;
    var viewportHeight = viewport.height;

    var realScale = this.realScale = (width / viewportWidth).toFixed(2);

    viewport = page.getViewport(realScale);

    var ctx = $canvas.getContext('2d');
    $canvas.width = viewport.width;
    $canvas.height = viewport.height;

    var renderCtx = {
      canvasContext: ctx,
      viewport: viewport
    }

    page.render(renderCtx);

    return this;
  }

  proto.changeSrc = function(src) {
    this.src = src;

    return loadPdfDocument(this.src)
      .then(handlePdfDocument)
      .then(function(pdf$) {
        if (this.$el) {
          this.opts.$container.removeChild(this.$el);
        }
        this.onLoadAll(pdf$);
      }.bind(this))
      .catch(this.opts.onError.bind(this));
  }

  return PDFPreviewer;
});
