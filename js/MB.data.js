
// This will handle all the interaction with store.js, node.js (saving, updating, fetching)

var MB = MB || {};

MB.data = (function () {

  var cache = {
    items: []
  };

  // public API
  return {
    cache: cache // this is made public for now but in the futere this will be accessed by methods
  };

}());