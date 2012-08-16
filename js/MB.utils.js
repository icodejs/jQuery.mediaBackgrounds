
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

  function getJson(is_url, input, callback) {
    var url = '';

    if (MB.options.domain.length && MB.options.scrape_path.length && is_url) {
      url  = MB.options.domain + MB.options.scrape_path + '?url=' + input;
    } else {
      url  = 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=';
      url += (input.length ? MB.utils.parseSearchTerm(input) : getRandomSearchTerm());
      url += '&imgsz=xlarge|xxlarge|huge';                     // |huge (make this optional)
      url += '&imgtype=photo';
      url += '&rsz=8';                                         // max results per page
      url += '&start=' + MB.utils.getRandomInt(1, 50);
    }

    // Abort all ajax requests if any
    if ($.xhrPool.length) $.xhrPool.abortAll();

    $.ajax({
      url: url,
      dataType: 'jsonp',
      error: function (jqXHR, textStatus, errorThrown) {
        return callback({
          func_name : 'ajax getJson',
          desc      : textStatus,
          data      : errorThrown
        });
      }
    }).done(function (data, status) {

      if (status === 'success') {
        try {
          if (data.error) {
            return callback({
              func_name : 'done getJson',
              desc      : data.error,
              data      : data
            });
          }
          // replace this logic with a custom function that can be passed in for each api

          if (MB.options.domain.length && is_url) {
            if (!MB.data.cache.items.contains(input, 'id')) {
              MB.data.cache.items.push({id: input, images: data});
            }
            return callback(null, data);
          } else {
            var results = data.responseData.results;
            if (results.length) {
              return callback(null, results);
            } else {
              return callback({desc: 'no results'});
            }
          }

        } catch (e) {
          return callback({
            func_name : 'getJson',
            desc      : e.toString(),
            data      : e
          });
        }
      }
    });
  }

  function getRandomSearchTerm() {
    var
    index       = 0,
    searchTerms = MB.options.search_terms,
    term        = '';

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
    loading         : loading,
    reset           : reset,
    parseSearchTerm : parseSearchTerm,
    getRandomInt    : getRandomInt,
    active          : active,
    getJson         : getJson
  };

}(jQuery));