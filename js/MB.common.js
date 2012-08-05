
var MB = MB || {};



// Global helper methods.
MB.common = {
  getTag: function (input, t, attrs) {
    return '<' + t + (attrs ? ' ' + attrs : '') + '>' + input + '</' + t + '>';
  },
  get_rnd_term: function () {
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
  },
  parse_search_term: function (term) {
    return term.split(' ').join('+');
  },
  get_rnd_int: function (min, max)  {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  loading: {
    start_time: 0,
    elaps: 0,
    interval_id: -1,
    begin: function () {
      if (MB.common.loading.start_time > 0) {
        return true;
      } else if (MB.common.loading.start_time === 0) {
        MB.common.loading.start_time = new Date().getTime();
      }

      MB.common.loading.interval_id = setInterval(function () {
        var
        now   = new Date().getTime(),
        elaps = (now - MB.common.loading.start_time) / 1000;

        if (elaps > 20)
          return MB.common.loading.reset(true);

      }, 2000);
    },
    reset: function (ui) {
      if (ui) {
        if ($.xhrPool.length) {
          $.xhrPool.abortAll();
        }
        MB.ui.update_ui(MB.app.$pe.bg_container);
      }

      MB.common.loading.start_time = 0;
      return clearInterval(MB.common.loading.interval_id);
    },
    active: function () {
      return MB.common.loading.start_time > 0;
    }
  }
};
