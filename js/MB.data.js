
// This will handle all the interaction with store.js, node.js (saving, updating, fetching)

var MB = MB || {};

MB.data = (function () {

  var cache = {
    items: [],
    checkCache: function (id, callback) {
      var
      i,
      items = MB.data.cache.items,
      len   = items.length;

      if (len) {
        for (i = 0; i < len; i += 1) {
          if (id.toLowerCase() === items[i].id.toLowerCase()) {
            return callback(items[i].images);
          }
        }
      }
      return callback(null);
    }
  };

  // public API
  return {
    cache: cache // this is made public for now but in the futere this will be accessed by methods. (getById, deleteById, toString() etc)
  };

}());