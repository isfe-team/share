/*!
 * a sample module
 * bqliu | 08/22/2017
 */

;define(
  [ 'jquery', 'jquery.validate', 'js/dep-free-module' ],
  function ($, _, depFree) {
    return {
      test: function test() {
        depFree.log('jquery loaded |', $)
        depFree.log('jquery plugin jq-validate loaded |', typeof $('.dummy').validate)
      }
    }
  }
)
