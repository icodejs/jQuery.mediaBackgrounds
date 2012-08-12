var MB = MB || {};

MB.events = (function () {
  var events = [];

  return {
    add: function (event) {
      events.push(event);
    },
    init: function (arr) {
      var items = arr || events;

      if (!items.length) {
        // some kind of error handling
      }

      items.forEach(function (e) {
        e.elem.on(e.name, function(event, data) {
          e.func(data);
        });
      });
    }
  };
}());


MB.events.init([
  {
    elem: MB.app.$pe.window,
    name: 'updateStatus',
    func: MB.ui.updateStatus
  }
]);