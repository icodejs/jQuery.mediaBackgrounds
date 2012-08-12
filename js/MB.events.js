var MB = MB || {};

MB.events = (function () {
  var events = [];

  return {
    add: function (e) {
      events.push(e);
    },
    bind: function (o) {
      events.push(o);
      o.elem.on(o.name, function(event, data) {
        o.func(data);
      });
    },
    trigger: function (name, args) {
      events.forEach(function (o) {
        if (name.toLowerCase() === o.name.toLowerCase()) {
          o.elem.trigger(o.name, args);
        }
      });

    },
    init: function (arr) {
      var items = arr || events;

      if (!items.length) { /*some kind of error handling */ }

      items.forEach(function (o) {
        MB.events.bind(o);
      });
    }
  };
}());

