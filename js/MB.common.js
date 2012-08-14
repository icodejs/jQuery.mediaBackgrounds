
var MB = MB || {};

MB.common = {};

MB.common.vars = (function () {
  return {
    timers: {
      request: {
        prev_req    : 0,
        diff_ms     : 0,
        elaps       : 0,
        interval_id : -1
      }
    },
    errors: [],
    cache: {
      items: []
    },
    favorites            : [],
    win_width            : 1024,
    win_height           : 1024,
    is_loading           : false,
    ss_mode              : false, // slideshow mode
    max_container_height : 450
  };
}());


MB.common.getTag = function (input, t, attrs) {
  return '<' + t + (attrs ? ' ' + attrs : '') + '>' + input + '</' + t + '>';
};


MB.common.loading = (function () {
  return {
    start_time: 0,
    elaps: 0,
    interval_id: -1,
    begin: function (bg_container) {
      var that = this;
      if (that.start_time > 0) {
        return true;
      } else if (that.start_time === 0) {
        that.start_time = new Date().getTime();
      }

      that.interval_id = setInterval(function () {
        var
        now   = new Date().getTime(),
        elaps = (now - that.start_time) / 1000;

        if (elaps > 20) return MB.common.reset(true, bg_container);
      }, 2000);
    }
  };
}());


MB.common.reset = function (ui, bg_container) {
  if (ui && bg_container) {
    if ($.xhrPool.length) {
      $.xhrPool.abortAll();
    }
    MB.ui.update_ui(bg_container);
  }
  MB.common.loading.start_time = 0;

  return clearInterval(MB.common.loading.interval_id);
};


MB.common.parse_search_term = function (term) {
  return term.split(' ').join('+');
};


MB.common.get_rnd_int = function (min, max)  {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


MB.common.active = function () {
  return MB.common.loading.start_time > 0;
};

