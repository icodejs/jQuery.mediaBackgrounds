/**
 *
 *  Media Backgrounds by Jay Esco 2012
 *  ----------------------------------
 *  PC:   file:///C:/Non%20Work/gitHub/jQuery.mediaBackgrounds/index.html
 *  Mac:  file:///Users/tyrone/Sites/mediaBackgrounds/index.html
 *  Dev:  http://localhost:4000/playpen/javascript/jquery/mediabackgrounds/
 *  Live: http://www.icodejs.com/playpen/javascript/jquery/mediaBackgrounds/
 *
 */

var MB = MB || {};

MB.app = (function($, global, document, undefined) {
  "use strict";

  // public API
  return {
    init          : init,
    getWallpaper  : getWallpaper,
    preloadImage  : preloadImage
  };

  /**
   * Preload images so that large images are fully loaded ready to
   * be faded in.
   *
   * @param {string} src_url - Image URL.
   * @param {integer} delay - Option to call the callback with a delay
   * @param {function} callback - Callback method for results.
   */
  function preloadImage(src_url, delay, callback) {
    MB.common.vars.is_loading = true;
    // remove this for now but in future we might hide it
    MB.ui.$pe.body.find('img.preloaded').remove();

    // Load image, hide it, add to the pages.
    $(new Image())
      .hide()
      .load(function () {
        var
        img   = this,
        img_w = img.width,
        img_h = img.height,
        w     = MB.common.vars.win_width,
        h     = MB.common.vars.win_height;

        MB.events.trigger('updateStatus', [{
          functionName: 'preloadImage',
          description: 'Validating image with dimensions: ' + img_w + ' x ' + img_h,
          $status_el: MB.ui.$pe.status
        }]);

        if (MB.ui.$pe.img_size.val().indexOf('x') >= 0) {
          w = MB.ui.$pe.img_size.val().split('x')[0];
          h = MB.ui.$pe.img_size.val().split('x')[1];
        } else {
          // CSS3 background-size:cover does a good job of
          // stretching images so allow images as much as
          // 50% smaller than current window size.
          img_w *= 1.5;
          img_h *= 1.5;
        }

        // Filter out images that are too small for the current
        // window size or that are smaller than the minimum
        // size specified by the user.
        if (img_w < w || img_h < h) {
          return callback({
            func_name : 'preloadImage',
            desc      : 'image returned is too small'
          });
        }

        setTimeout(function () {
          var obj = {width: img.width, height: img.height, url: src_url};

          if (!MB.common.vars.ss_mode) {
            MB.ui.$pe.body.find('.loader').fadeOut(1000, function () {
              $(this).remove();
              MB.common.vars.is_loading = false;
              callback(null, obj);
            });
          } else {
            MB.common.vars.is_loading = false;
            callback(null, obj);
          }
          MB.common.reset();
        }, delay);

      })
      .addClass('preloaded')
      .attr('src', src_url)
      .prependTo('body')
      .error(function (e) {
        return callback({
          func_name   : 'preloadImage',
          description : '404 (Not Found)',
          error       : e
        });
      }); // end JQ new Image
  }

  /**
   * Initialisation function that does most of the heavy lifting.
   */
  function init() {
    MB.ui.init({
      bg_container        : $('<section />'),
      body                : $('body'),
      buttons             : $('.button'),
      controls_container  : $('#controls'),
      favorites_container : $('#favorites_container'),
      favorite_show_hide  : $('#favorite_controls a'),
      img_size            : $('#img_size'),
      keypress_detector   : $('<input />'),
      ss_checkbox         : $('#slideshow'),
      status              : $('.status'),
      terms               : $('#terms'),
      window              : $(global),
      ws_dropdown         : $('#wallpapers_sites').hide(),
      eventElement        : $(global)
    }, function ($pe) {
      MB.events.trigger('getWallpaper', [$pe.bg_container]);
    }); // end ui init
  }

  /**
   * Base function from which new background images are retrieved
   * ready to be appended to the background container section.
   * @param {jQuery} elem.
   */
  function getWallpaper(elem) {
    // Monitor the error being brought back for a url or keyword.
    if (MB.errors.len > 10) {
      if (!MB.common.vars.ss_mode) {
        MB.ui.$pe.body.find('.loader').fadeOut(1000, function () {
          $(this).remove();
          MB.errors.clear();
        });
      }

      return MB.events.trigger('updateStatus', [{
        functionName: 'getWallpaper',
        description: 'Insuffient images for the current URL. Please enter another URL or keyword(s)',
        errors: MB.errors.toString(),
        $status_el: MB.ui.$pe.status
      }]);
    }

    var
    idx    = 0,
    bg     = {},
    input  = MB.ui.$pe.terms.val().toLowerCase(),
    is_url = (input.indexOf('http://') >= 0 || input.indexOf('www') >= 0);

    if ($('.loader').length === 0 && !MB.common.vars.ss_mode) {
      $('<section />')
        .hide()
        .addClass('loader')
        .append($('<img />').attr('src', MB.options.loading_image))
        .appendTo(MB.ui.$pe.body)
        .fadeIn();
    }

    // MB.common.loading.begin(MB.ui.$pe.bg_container);
    MB.events.trigger('image_loading', [MB.ui.$pe.bg_container]);

    // Check cache. If callback returns cached item index? Do stuff!
    checkCache(input, function (i) {
      var items = MB.common.vars.cache.items, images;

      if (is_url && i >= 0 && items[i] && items[i].images.length) {
        images = items[i].images;
        idx    = MB.common.getRandomInt(0, images.length -1);
        bg     = {url: images[idx].url};

        MB.ui.set_bg(bg, elem);
      } else {
        // Clear error if accessing an uncached URL.
        MB.errors.clear();

        getJson(is_url, input, function (err, images) {
          if (err) {
            MB.errors.add(err);

            return MB.events.trigger('updateStatus', [{
              functionName: 'getWallpaper',
              description: 'getWallpaper: See error object',
              error: err,
              errors: MB.errors.toString(),
              $status_el: MB.ui.$pe.status
            }]);

          }
          if (images && images.length) {
            idx = MB.common.getRandomInt(0, images.length -1);
            bg  = {url: images[idx].url};
            MB.ui.set_bg(bg, elem);
          }
        });
      }
    });
  }

  /**
   * Responsible for performing ajax calls and returning the relevant
   * information to the callback.
   *
   * @param {boolean} is_url - Has the user entered a URL or a keyword.
   * @param {string} input - User input.
   * @param {function} callback - Callback method for results.
   */
  function getJson(is_url, input, callback) {
    var url = '';

    if (MB.options.domain.length && MB.options.scrape_path.length && is_url) {
      url  = MB.options.domain + MB.options.scrape_path + '?url=' + input;
    } else {
      url  = 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=';
      url += (input.length ? MB.common.parseSearchTerm(input) : getRandomSearchTerm());
      url += '&imgsz=xlarge|xxlarge|huge';                     // |huge (make this optional)
      url += '&imgtype=photo';
      url += '&rsz=8';                                         // max results per page
      url += '&start=' + MB.common.getRandomInt(1, 50);
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
            if (!MB.common.vars.cache.items.contains(input, 'id')) {
              MB.common.vars.cache.items.push({id: input, images: data});
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

  function checkCache(id, callback) {
    var
    i,
    items = MB.common.vars.cache.items,
    len   = items.length;

    if (len) {
      for (i = 0; i < len; i += 1) {
        if (id.toLowerCase() === items[i].id.toLowerCase()) {
          return callback(i);
        }
      }
    }
    return callback(-1);
  }

  function getRandomSearchTerm() {
    var
    idx  = 0,
    st   = MB.options.search_terms,
    term = '';

    if (st.length === 1) {
      return MB.common.parseSearchTerm(st[idx]);
    } else {
      idx = MB.common.getRandomInt(0, st.length -1);
      term = MB.common.parseSearchTerm(st[idx]);

      MB.events.trigger('updateStatus', [{
        functionName: 'getRandomSearchTerm',
        description: 'search term: ' + term,
        $status_el: MB.ui.$pe.status
      }]);

      return term;
    }
  }

} (jQuery, this, document));

