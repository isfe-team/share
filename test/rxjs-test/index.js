/*!
 * bq-hentai | 01/02/2018
 */

const slice = [].slice
const log = function () {
  console.log.apply(console, arguments)
}

const error = function () {
  console.error.apply(console, arguments)
}

const id = function (x) {
  return x
}

const logHello = function (callback) {
  log('Hello')
  callback()
  log('callback invoked')
}

const logHelloWrapper = Rx.Observable.bindCallback(logHello)

const logHelloObservable = logHelloWrapper()

const logHelloObservableSubscription = logHelloObservable.subscribe(log, error)

const foo = Rx.Observable.create(function (observer) {
  log('Hello')
  observer.next(42)
  observer.next(100)

  setTimeout(function () {
    observer.next(1000)
  })
})

const bar = foo.map(function (x) {
  log('switchMap init', x)
  return [ x, 1, Promise.resolve(x) ]
})

bar.map(function (x) {
  return Number(x) + 1
})

bar.subscribe(function (x) {
  log('switchMap result', x)
})

foo.subscribe(function (x) {
  log(x)
})

console.log('2')

foo.subscribe(function (y) {
  log(y)
})

Rx.Observable.zip(bar, foo).subscribe(function (x) {
  log('zip', x)
})
