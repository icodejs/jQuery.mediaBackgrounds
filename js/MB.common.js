
var MB = MB || {};

MB.common = {};

MB.common.getTag = function (input, t, attrs) {
  return '<' + t + (attrs ? ' ' + attrs : '') + '>' + input + '</' + t + '>';
};


MB.common.get_rnd_term = function () {
  var
  idx  = 0,
  st   = MB.options.search_terms,
  term = '';

  if (st.length === 1) {
    return MB.common.parse_search_term(st[idx]);
  } else {
    idx = MB.common.get_rnd_int(0, st.length -1);
    term = MB.common.parse_search_term(st[idx]);
    MB.ui.set_status('get_rnd_term', 'search term: ' + term);
    return term;
  }
};


MB.common.loading = (function () {
  return {
    start_time: 0,
    elaps: 0,
    interval_id: -1,
    begin: function () {
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

        if (elaps > 20) return MB.common.reset(true);
      }, 2000);
    }
  };
}());


MB.common.reset = function (ui) {
  if (ui) {
    if ($.xhrPool.length) {
      $.xhrPool.abortAll();
    }
    MB.ui.update_ui(MB.app.$pe.bg_container);
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

