/*!
 * test pdf
 * hentai | 05/27/2017
 */

!(function(root) {

  var previewer = PDFPreviewer.of({
    $container: document.querySelector('#app')
    // pdfPath
  });
  previewer.init().then(function() {
    previewer.toPage(2);
  });

  setTimeout(function() {
    previewer.changeSrc('nwjs-doc.pdf').then(function() {
      previewer.toPage(14);
    });
  }, 5000);

})(this);
