var express = require('express');
var router = express.Router();

var cid = 4;

var products = [
  { id: 1, name: 'apple', description: 'this is apple.', price: 6 },
  { id: 2, name: 'banana', description: 'this is very useful.', price: 10 },
  { id: 3, name: 'orange', description: 'yellow', price: 12 },
  { id: 4, name: 'hentai', description: 'Yup, hentai !', price: Infinity }
];

/**
 * Get the index of the specific product.
 * @param { Number } id the product id
 * @return the index of the specific product, if -1, represent that the product is not exist.
 */
var getProductIndexById = function(id) {
  if (!id) {
    return -1;
  }

  var ret = -1;
  products.some(function(value, index) {
    if (value.id === id) {
      ret = index;
      return true;
    }
  });

  return ret;
}

/* GET all products. */
router.get('/', function(req, res, next) {
  res.json(products);
});

/* GET product by id */
router.get('/:id', function(req, res, next) {
  res.json(products[req.params.id]);
});

/* POST products to save product */
router.post('/:id', function(req, res, next) {
  var body = req.body;
  // whether exist
  var id = +req.params.id;
  var index = -1;
  if (id) {
    index = getProductIndexById(id);
  }
  var product = null;
  if (index !== -1) {
    product = products[index];
    product.name = body.name;
    product.description = body.description;
    product.price = body.price;
    return ;
  };
  // not exist
  product = {
    id: ++cid,
    name: body.name,
    description: body.description,
    price: body.price
  };

  products.push(product);
  res.location('/products/' + (cid - 1) >= 0 ? '' : (cid - 1));
  res.json(products);
});

/* DELETE resource */
router.delete('/:id', function(req, res, next) {
  var id = +req.params.id;
  var index = getProductIndexById(id);
  if (index === -1) {
    return res.json({ code: 0, message: 'This product is not exist.' });
  }

  // Only delete single item, remember pass the second howmany param.
  products.splice(index, 1);
  res.json(products);
});

module.exports = router;
