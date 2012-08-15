
var MB = MB || {};

MB.common = (function ($) {
  "use strict";

  var vars = (function () {
    return {
      timers: {
        request: {
          prev_req    : 0,
          diff_ms     : 0,
          elaps       : 0,
          interval_id : -1
        }
      },
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

  var loading = (function () {
    return {
      start_time  : 0,
      elaps       : 0,
      interval_id : -1,
      begin       : function (bg_container) {
        var that = this;

        if (that.start_time > 0) {
          return true;
        } else if (that.start_time === 0) {
          that.start_time = new Date().getTime();
        }

        that.interval_id = setInterval(function () {
          var now = new Date().getTime(), elaps = (now - that.start_time) / 1000;
          if (elaps > 20)
            return MB.common.reset(true, bg_container);
        }, 2000);
      }
    };
  }());

  function reset(ui, bg_container) {
    if (ui && bg_container) {
      if ($.xhrPool.length) {
        $.xhrPool.abortAll();
      }
      MB.ui.update_ui(bg_container);
    }
    MB.common.loading.start_time = 0;

    return clearInterval(MB.common.loading.interval_id);
  }

  function parse_search_term(term) {
    return term.split(' ').join('+');
  }

  function get_rnd_int(min, max)  {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function active() {
    return MB.common.loading.start_time > 0;
  }

  // public API
  return {
    vars              : vars,
    loading           : loading,
    reset             : reset,
    parse_search_term : parse_search_term,
    get_rnd_int       : get_rnd_int,
    active            : active
  };

}(jQuery));