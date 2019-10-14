/*!
 * index
 * (c) 2016 bqliu
 * @license MIT
 */

~(function(global) {

  'use strict';

  // `VueRouter` will call `Vue.use(VueRouter)` automatically.
  if (typeof window !== 'undefined' &&
      global.Vue && global.VueResource) {
    // Vue.use(VueResource);
  }

  // config Vue-Resource
  Vue.http.options.root = '/';
  Vue.http.headers.common['Authorization'] = 'Basic YXBpOnBhc3N3b3Jk';
  // Vue.http.options.emulateJSON = true;
  // Vue.http.options.emulateHTTP = true;

  // global interceptor, no optimization version.
  // Vue.http.interceptors.push(function(request, next) {
  //   // do something before send
  //   console.log('will send');
  //   vm.show = true;
  //   // flow to next middleware
  //   next(function(response) {
  //     // do something afte response
  //     console.log('responsed');
  //     vm.show = false;
  //     return response;
  //   })
  // });

  // global interceptor, with single optimization, but has trap.
  Vue.http.interceptors.push((function() {
    var timer = null;
    return function(request, next) {
      // do something before send
      console.log('will send');
      // set a timer
      // if after 500ms, the request has no response, the flag will be set
      timer = setTimeout(function() {
        vm.show = true;
        timer = null;
      }, 500);
      // flow to next middleware
      next(function(response) {
        // do something afte response
        console.log('responsed');
        // clear timer, if duration is lt 500ms, the flag will not be set
        if (timer) {
          clearTimeout(timer);
        }
        else {
          vm.show = false;
        }
        return response;
      });
    }
  })());

  var productActions = {
    getProduct: { method: 'GET', url: '/products{/id}' },
    deleteProduct: { method: 'DELETE', url: '/products{/id}' },
    pushProduct: { method: 'POST', url: '/products{/id}' }
  };

  // Create a `Vue` instance.
  var vm = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue',
      show: false
    },
    methods: {
      getProduct(id) {
        var resource = this.$resource('/products{/id}', { }, productActions);
        resource.getProduct({ id: id }).then(function(response) {
          return response.json();
        }).then(function(result) {
          console.log(result);
        }).catch(function(err) {
          console.log(err);
        });
      },
      pushProduct() {
        var product = {
          name: 'miku',
          description: 'ou pai',
          price: Infinity
        };
        var resource = this.$resource('/products{/id}', { }, productActions);
        resource.pushProduct({ id: -1 }, product).then(function(response) {
          return response.json();
        }).then(function(result) {
          console.log(result);
        }).then(function(err) {
          console.log(err);
        })
      },
      deleteProduct(id) {
        var resource = this.$resource('/products{/id}', { }, productActions);
        resource.deleteProduct({ id: id }).then(function(response) {
          return response.json();
        }).then(function(result) {
          console.log(result);
        }).then(function(err) {
          console.log(err);
        })
      }
    }
  });

})(this);
