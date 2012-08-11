var MB = MB || {};

MB.events = (function () {
  return {
    bindEvents: function () {
      MB.app.$pe.window.on('updateStatus', function(event, data) {
        MB.ui.updateStatus(data);
      });
    }
  };
}());
MB.events.bindEvents();