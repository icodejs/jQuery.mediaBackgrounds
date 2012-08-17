
var MB = MB || {};

MB.utils = (function ($) {
  'use strict';

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
            return MB.utils.reset(true, bg_container);
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
    MB.utils.loading.start_time = 0;

    return clearInterval(MB.utils.loading.interval_id);
  }

  function parseSearchTerm(term) {
    return term.split(' ').join('+');
  }

  function getRandomInt(min, max)  {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function active() {
    return MB.utils.loading.start_time > 0;
  }

  function getRandomSearchTerm(searchTerms) {
    var
    index = 0,
    term  = '';

    if (searchTerms.length === 1) {
      return MB.utils.parseSearchTerm(searchTerms[index]);
    } else {
      index = MB.utils.getRandomInt(0, searchTerms.length -1);
      term  = MB.utils.parseSearchTerm(searchTerms[index]);

      MB.events.trigger('updateStatus', [{
        functionName : 'getRandomSearchTerm',
        description  : 'search term: ' + term,
        elem         : MB.ui.$pe.status
      }]);

      return term;
    }
  }

  // public API
  return {
    loading             : loading,
    reset               : reset,
    parseSearchTerm     : parseSearchTerm,
    getRandomInt        : getRandomInt,
    active              : active,
    getRandomSearchTerm : getRandomSearchTerm
  };

}(jQuery));