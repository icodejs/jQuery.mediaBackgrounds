
// This will handle all the interaction with store.js, node.js (saving, updating, fetching)

var MB = MB || {};

MB.data = (function ($) {
  'use strict';

  function getJSON(is_url, input, cb) {
    var url = '';

    if (MB.options.domain.length && MB.options.scrape_path.length && is_url) {
      url  = MB.options.domain + MB.options.scrape_path + '?url=' + input;
    } else {
      url  = 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=';
      url += (input.length ? MB.utils.parseSearchTerm(input) : MB.utils.getRandomSearchTerm(MB.options.search_terms));
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
        return cb({
          func_name : 'ajax getJson',
          desc      : textStatus,
          data      : errorThrown
        });
      }
    }).done(function (data, status) {

      if (status === 'success') {
        try {
          if (data.error) {
            return cb({
              func_name : 'done getJson',
              desc      : data.error,
              data      : data
            });
          }
          // replace this logic with a custom function that can be passed in for each api

          if (MB.options.domain.length && is_url) {
            if (!MB.data.cache.items.contains(input, 'id')) {
              MB.data.cache.add({id: input, images: data});
            }
            return cb(null, data);
          } else {
            var results = data.responseData.results;
            if (results.length) {
              return cb(null, results);
            } else {
              return cb({desc: 'no results'});
            }
          }

        } catch (e) {
          return cb({
            func_name : 'getJson',
            desc      : e.toString(),
            data      : e
          });
        }
      }
    });
  }

  function getWallpaperSites(cb) {
    $.ajax({
      url:  MB.options.domain + '/load/webPages/',
      dataType: 'jsonp',
      error: function (jqXHR, textStatus, errorThrown) {
        return cb({
          func_name : 'getWallpaperSites',
          desc      : textStatus,
          data      : jqXHR
        });
      }
    }).done(function (data, status) {
      if (status === 'success') {
        cb(null, data);
      }
    });
  }

  // public API
  return {
    getJSON           : getJSON,
    getWallpaperSites : getWallpaperSites
  };

}(jQuery));

MB.data.cache = (function ($) {
  'use strict';

  var
  items        = [],
  localstorage = $('html').is('.localstorage');

  function get(id, cb) {
    var
    i,
    items = MB.data.cache.items,
    len   = items.length;

    if (len) {
      for (i = 0; i < len; i += 1) {
        if (id.toLowerCase() === items[i].id.toLowerCase())
          return cb(items[i]);
      }
    }
    return cb(null);
  }

  function clear() {
    items = [];
  }

  function add(item) {
    // come kind validation
    items.push(item);
  }

  function remove(id, cb) {
    // for loop / find / delete
  }

  // public API
  return {
    items   : items, // this is made public for now but in the futere this will be accessed by methods.
    get     : get,
    add     : add,
    clear   : clear,
    remove  : remove
  };

}(jQuery));