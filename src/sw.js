let cacheStorageKey = 'local'

let cacheList = [
  "/",
]
const info = fetch("/asset-manifest.json")
  .then(res => res.json())
  .then(data => {
    cacheList = ["/", ...Object.values(data)]
  })
  .then(() => fetch("/manifest.json"))
  .then(res => res.json())
  .then(data => {
    cacheStorageKey = data.version
  })
  .catch(e => null)
  .then(() => {
    console.log("cacheStorageKey", cacheStorageKey)
    console.log("cacheList", cacheList)
  })

// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', e => {
  e.waitUntil(
    info
      .then(() => caches.open(cacheStorageKey))
      .then(cache => cache.addAll(cacheList))
      .then(() => self.skipWaiting())
  )
});


// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(cacheNames => {
        console.log("所有缓存资料", cacheNames)
        // eslint-disable-next-line array-callback-return,consistent-return
        return Promise.all(cacheNames.map(name => {
          console.log("显示一次缓存资料", name)
          return name !== cacheStorageKey && caches.delete(name)
        }))
      })
      .then(() => {
        // eslint-disable-next-line no-restricted-globals
        return self.clients.claim()
      })
  )
});


//fetch event
// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', evt => {
  // console.log('fetch Event', evt);
})
