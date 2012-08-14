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

  // Private jQuery page elements.
  var $pe = {
    bg_container        : null,
    body                : null,
    buttons             : null,
    controls_container  : null,
    favorites_container : null,
    favorite_show_hide  : null,
    img_size            : null,
    keypress_detector   : null,
    ss_checkbox         : null,
    status              : null,
    terms               : null,
    window              : null,
    ws_dropdown         : null,
    eventBoundElement   : null
  };

  function view_favorites(event, elem, target_elem) {
    var
    state      = elem.data('state'),
    $icon      = elem.find('i'),
    height     = target_elem.find('ul').outerHeight(true) + 10,
    btn_config = {
      element   : elem,
      state     : state === 'open' ? 'closed' : 'open',
      do_toggle : true
    },
    container_config = {
      element  : target_elem,
      state    : btn_config.state,
      overflow : state === 'open' ? 'hidden' : 'auto',
      height   : state === 'open' ? 10 : height > MB.common.vars.max_container_height ? MB.common.vars.max_container_height : height,
      speed    : 750
    };

    view_favorites_show(container_config, function () {
      view_favorites_button(btn_config);
    });
  }

  function view_favorites_button(obj) {
    obj.element.data({state: obj.state});
    if (obj.do_toggle) {
      obj.element.find('i').toggleClass('icon_state_close', 'icon_state_open');
    }
  }

  function view_favorites_show(obj, callback) {
    var easing = obj.state === 'open' ?  'easeOutQuad' : 'easeInQuad';

    obj.element.stop(true, true);
    obj.element.animate({
      height: obj.height
    }, obj.speed, easing, function() {
      $(this).css({overflow: obj.overflow});
      callback();
    });
  }

  function remove_favorite_image(e) {
    e.preventDefault();
    var $parent_li = $(this).closest('li');

    $parent_li.slideUp(1000, function () {
      var
      i,
      len,
      img,
      $this      = $(this),
      src        = $parent_li.find('img').attr('src'),
      $siblings  = $this.siblings(),
      $favorites = $pe.favorites_container.find('#favorites');

      $this.remove();

      for (i = 0, len = MB.common.vars.favorites.length; i < len; i += 1) {
        if (MB.common.vars.favorites[i].url.toLowerCase() === src.toLowerCase()) {
          img = MB.common.vars.favorites.splice(i, 1);
          break;
        }
      }

      if ($siblings.length) {
        view_favorites(e, $pe.favoritesorite_show_hide.data({state: 'closed'}), $favorites);
      } else {
        $pe.favorites_container
          .slideUp(1000, function () {
              var $this = $(this)
                .find('#favorites')
                  .slideUp(1000)
                  .removeAttr('style')
                  .find('ul')
                    .remove()
                  .end()
                .end()
                .hide();
            });
        }
    });
  }

  /**
   * Check to see with if we have previously loaded this URL before.
   * If we have then return its position in the global cache.
   *
   * @param {string} id - URL id of the cached item.
   * @param {function} callback - Callback method for results.
   */
  function check_cache(id, callback) {
    var
    i,
    items = MB.common.vars.cache.items,
    len = items.length;

    if (len) {
      for (i = 0; i < len; i += 1) {
        if (id.toLowerCase() === items[i].id.toLowerCase()) {
          return callback(i);
        }
      }
    }
    return callback(-1);
  }

  function get_rnd_term() {
    var
    idx  = 0,
    st   = MB.options.search_terms,
    term = '';

    if (st.length === 1) {
      return MB.common.parse_search_term(st[idx]);
    } else {
      idx = MB.common.get_rnd_int(0, st.length -1);
      term = MB.common.parse_search_term(st[idx]);

      MB.events.trigger('updateStatus', [{
        functionName: 'get_rnd_term',
        description: 'search term: ' + term,
        $status_el: $pe.status
      }]);

      return term;
    }
  }

  return {

    // Base plugin methods.
    methods: {
      /**
       * Initialisation function that does most of the heavy lifting.
       */
      init: function () {
        $pe.controls_container  = $('#controls');
        $pe.status              = $('.status');
        $pe.favorites_container = $('#favorites_container');
        $pe.terms               = $('#terms');
        $pe.img_size            = $('#img_size');
        $pe.buttons             = $('.button');
        $pe.ws_dropdown         = $('#wallpapers_sites').hide();
        $pe.ss_checkbox         = $('#slideshow');
        $pe.favorite_show_hide  = $('#favorite_controls a');
        $pe.window              = $(global);
        $pe.eventElement        = $pe.window;
        MB.common.vars.win_width          = $pe.window.width();
        MB.common.vars.win_height         = $pe.window.height();

        MB.ui.init($pe);

        setTimeout(function () {
          MB.ui.loadWallpaperSites(function (err, html) {
            if (err) {
              MB.common.vars.errors.push(err);
              return MB.events.trigger('updateStatus', [{
                functionName: 'preload_img',
                error: err,
                errors: MB.common.vars.errors,
                description: 'init error',
                $status_el: $pe.status
              }]);
            } else {
              $pe.ws_dropdown.html(html).show(500);
            }
          });
        }, 2000);

        $pe.window
          .on('resize', MB.ui.resize_window)
          .on('beforeunload', function (e) {
            if ($pe.favorites_container.find('#favorites li').length) {
              return 'You will loose your favorite images.';
            }
          });

          // disable right click
          //$('*').on('contextmenu', function () { return false; });

          // Bind and listen to bodyonclick events. Set focus to
          // $pe.keypress_detector. This will allow me to listen
          // to keyboard events.
          $pe.body = $('body')
            .height(MB.common.vars.win_height)
            .on('click', function (e) {
              if (e.target.id !== 'controls' && e.target.parentElement.id !== 'controls') {
                $pe.keypress_detector.focus();
              }
            });

          // Add background image container section.
          $pe.bg_container = $('<section />')
            .addClass('bg_container')
            .height(MB.common.vars.win_height)
            .hide()
            .prependTo($pe.body);

          // Bind and listen to all button click events and handle them accordingly.
          $pe.buttons
            .on('click', function (e) {
              e.preventDefault();
              $pe.keypress_detector.focus();

              switch ($(this).attr('id').toLowerCase()) {
              case 'fav':
                MB.app.methods.add_favorite($pe.bg_container);
                break;
              case 'save':
                MB.app.methods.save($pe.bg_container);
                break;
              case 'email':
                MB.app.methods.email($pe.bg_container);
                break;
              case 'tweet':
                MB.app.methods.tweet($pe.bg_container);
                break;
              case 'help':
                MB.app.methods.help($pe.bg_container);
                break;
              }
            });

          // Bind and listen to the change event of the #wallpapers_sites
          // drp and update the search textbox.
          $pe.ws_dropdown
            .on('change', function () {
              var url = $(this).val();
              if (url.toLowerCase() !== 'none') {
                $pe.terms.val(url);
              }
              $pe.keypress_detector.focus();
            });

          // Bind and listen to the change event of the slideshow checkbox
          // and initialise the image slide show based on the current cache
          // or search terms.
          $pe.ss_checkbox
            .on('change', function () {
              var $inputs = $pe.controls_container.find('input, select, button').not('#slideshow, #fav');

              MB.common.vars.ss_mode = $(this).attr('checked') ? true : false;

              if (MB.common.vars.ss_mode) {
                MB.common.vars.timers.request.interval_id = setInterval(function () {
                  if ($.xhrPool.length === 0 && !MB.common.vars.loading) {
                    MB.ui.update_ui($pe.bg_container);
                  }
                }, MB.options.interval);

                $inputs.attr({disabled: 'disabled'}).addClass('disabled');

                return MB.events.trigger('updateStatus', [{
                  functionName: 'init',
                  description: 'Slideshow mode. A new image will load in approximately ' + (MB.options.interval / 1000) + ' seconds.',
                  $status_el: $pe.status
                }]);
              } else {
                clearInterval(MB.common.vars.timers.request.interval_id);
                $inputs.removeAttr('disabled').removeClass('disabled');

                return MB.events.trigger('updateStatus', [{
                  functionName: 'init',
                  description: 'Slideshow cancelled. Press the spacebar to load new images.',
                  $status_el: $pe.status
                }]);
              }
            });

          // Bind and listen to click event of favorite_controls.
          $pe.favorite_show_hide
            .on('click', function (e) {
              e.preventDefault();
              view_favorites(e, $(this), $('#favorites'));
            })
            .data({state: 'closed'});

          // Hack (fix asap). Create and input element and bind
          // a keypress event handler. Perform certain actions
          // base on which key is pressed.
          $pe.keypress_detector = $('<input />')
            .attr({id: 'txtInput', type: 'text'})
            .addClass('keypress_detector')
            .focus()
            .on('keypress', function (e) {
              e.preventDefault();
              if (e.which === 32 && !MB.common.vars.ss_mode) {
                var now = new Date().getTime();

                // stop user from sending too many http requests
                if (MB.common.vars.timers.request.prev_req === 0) {
                  MB.common.vars.timers.request.prev_req = now;
                } else {
                  MB.common.vars.timers.request.diff_ms = now - MB.common.vars.timers.request.prev_req;
                  MB.common.vars.timers.request.elaps   = MB.common.vars.timers.request.diff_ms / 1000;

                  if (MB.common.vars.timers.request.elaps >= 2) {
                    MB.common.vars.timers.request.prev_req = now;
                  } else {
                    return;
                  }
                }
                MB.ui.update_ui($pe.bg_container);
              }
            })
            .appendTo($pe.body);

            MB.events.init([
              {
                elem: $pe.eventElement,
                name: 'updateStatus',
                func: MB.ui.updateStatus
              },
              {
                elem: $pe.eventElement,
                name: 'getWallpaper',
                func: MB.app.methods.get_bg
              },
              {
                elem: $pe.eventElement,
                name: 'image_loading',
                func: MB.common.loading.begin
              }
            ]);

          MB.events.trigger('getWallpaper', [$pe.bg_container]);
      },
      email: function () {
        MB.events.trigger('updateStatus', [{
          functionName: 'email',
          description: 'Check your inbox! (To do)',
          $status_el: $pe.status
        }]);
      },
      tweet: function () {
        MB.events.trigger('updateStatus', [{
          functionName: 'tweet',
          description: 'tweet tweet! (To do)',
          $status_el: $pe.status
        }]);
      },
      save: function () {
        // $.ajax({
        //   type: 'POST',
        //   url: url,
        //   data: data,
        //   success: success,
        //   dataType: dataType
        // });
        MB.events.trigger('updateStatus', [{
          functionName: 'save',
          description: 'Your favorites list has been saved! (To do)',
          $status_el: $pe.status
        }]);
      },
      help: function () {
        MB.events.trigger('updateStatus', [{
          functionName: 'help',
          description: 'Use the spacebar to load new images! (To do)',
          $status_el: $pe.status
        }]);
      },
      /**
       * Add current image to favorites with the intention of saving them
       * to the database or sending the URLs as an email to the user.
       * Not finished.
       *
       * * @param {jQuery} elem.
       */
      add_favorite: function (elem) {
        if (elem && elem.data('img_dims')) {
          var img = elem.data('img_dims'),
              thumb_width = 255,
              thumb_height = 132;

          if (!MB.common.vars.favorites.contains(img.url, 'url')) {
            $('<img />')
                .attr({src: img.url, width: thumb_width, height: thumb_height})
                .load(function () {
                  var
                  $this   = $(this),
                  style   = '',
                  $favs   = $pe.favorites_container.find('#favorites'),
                  $ul     = $favs.find('ul')[0] ? $favs.find('ul') : $('<ul />').appendTo($favs),
                  $rm_btn = $('<a class="remove" href="/"><i class="icon icon_x"></a>').on('click', remove_favorite_image),
                  $li     = $('<li />').append($rm_btn).hide(),
                  $a      = $('<a />').attr({href: img.url, target: '_blank'}).html($this),
                  height  = MB.ui.set_favorites_container_height($ul, thumb_height, $ul.find('li').length === 0),
                  state   = $pe.favorite_show_hide.data('state');

                  var
                  btn_config = {
                    element   : $pe.favorite_show_hide,
                    state     : 'open',
                    do_toggle : state === 'closed'
                  },
                  container_config = {
                    element  : $favs,
                    state    : state,
                    overflow : 'auto',
                    height   : height > MB.common.vars.max_container_height ? MB.common.vars.max_container_height : height,
                    speed    : 750
                  };

                  $li.prepend($a).prependTo($ul).slideDown(1000);

                  view_favorites_show(container_config, function () {
                    view_favorites_button(btn_config);
                    $pe.keypress_detector.focus();
                    MB.common.vars.favorites.push(img);

                    return MB.events.trigger('updateStatus', [{
                      functionName: 'save',
                      description: MB.common.vars.favorites.length + ' image(s) saved in your favorites!',
                      $status_el: $pe.status
                    }]);
                  });

                  style = $pe.favorites_container.attr('style').replace(' ', '');

                  if (style.indexOf('display:none;') >= 0) {
                    $pe.favorites_container.fadeIn();
                  }
                });
          }
        }
      },
      /**
       * Base function from which new background images are retrieved
       * ready to be appended to the background container section.
       * @param {jQuery} elem.
       */
      get_bg: function (elem) {
        // Monitor the error being brought back for a url or keyword.

        if (MB.common.vars.errors.length > 10) {
          if (!MB.common.vars.ss_mode) {
            $pe.body.find('.loader').fadeOut(1000, function () {
              $(this).remove();
              MB.common.vars.errors = [];
            });
          }

          return MB.events.trigger('updateStatus', [{
            functionName: 'get_bg',
            description: 'Insuffient images for the current URL. Please enter another URL or keyword(s)',
            errors: MB.common.vars.errors,
            $status_el: $pe.status
          }]);
        }

        var
        idx    = 0,
        bg     = {},
        input  = $pe.terms.val().toLowerCase(),
        is_url = (input.indexOf('http://') >= 0 || input.indexOf('www') >= 0);

        if ($('.loader').length === 0 && !MB.common.vars.ss_mode) {
          $('<section />')
            .hide()
            .addClass('loader')
            .append($('<img />').attr('src', MB.options.loading_image))
            .appendTo($pe.body)
            .fadeIn();
        }

        //MB.common.loading.begin($pe.bg_container);
        MB.events.trigger('image_loading', [$pe.bg_container]);

        // Check cache. If callback returns cached item index? Do stuff!
        check_cache(input, function (i) {
          var items = MB.common.vars.cache.items, images;

          if (is_url && i >= 0 && items[i] && items[i].images.length) {
            images = items[i].images;
            idx    = MB.common.get_rnd_int(0, images.length -1);
            bg     = {url: images[idx].url};

            MB.ui.set_bg(bg, elem);
          } else {
            // Clear error if accessing an uncached URL.
            MB.common.vars.errors = [];

            MB.app.methods.get_json(is_url, input, function (err, images) {
              if (err) {
                MB.common.vars.errors.push(err);
                return MB.events.trigger('updateStatus', [{
                  functionName: 'get_bg',
                  description: 'get_bg: See error object',
                  error: err,
                  errors: MB.common.vars.errors,
                  $status_el: $pe.status
                }]);

              }
              if (images && images.length) {
                idx = MB.common.get_rnd_int(0, images.length -1);
                bg  = {url: images[idx].url};
                MB.ui.set_bg(bg, elem);
              }
            });
          }
        });
      },
      /**
       * Responsible for performing ajax calls and returning the relevant
       * information to the callback.
       *
       * @param {boolean} is_url - Has the user entered a URL or a keyword.
       * @param {string} input - User input.
       * @param {function} callback - Callback method for results.
       */
      get_json: function (is_url, input, callback) {
        var url = '';

        if (MB.options.domain.length && MB.options.scrape_path.length && is_url) {
          url  = MB.options.domain + MB.options.scrape_path + '?url=' + input;
        } else {
          url  = 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=';
          url += (input.length ? MB.common.parse_search_term(input) : get_rnd_term());
          url += '&imgsz=xlarge|xxlarge|huge';                     // |huge (make this optional)
          url += '&imgtype=photo';
          url += '&rsz=8';                                         // max results per page
          url += '&start=' + MB.common.get_rnd_int(1, 50);
        }

        // Abort all ajax requests if any
        if ($.xhrPool.length) {
          $.xhrPool.abortAll();
        }

        $.ajax({
          url: url,
          dataType: 'jsonp',
          error: function (jqXHR, textStatus, errorThrown) {
            return callback({
              func_name : 'get_json',
              desc      : textStatus,
              data      : errorThrown
            });
          }
        }).done(function (data, status) {

          if (status === 'success') {
            try {
              if (data.error) {
                return callback({
                  func_name : 'get_json',
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
                func_name : 'get_json',
                desc      : e.toString(),
                data      : e
              });
            }
          }
        });
      },

      /**
       * Preload images so that large images are fully loaded ready to
       * be faded in.
       *
       * @param {string} src_url - Image URL.
       * @param {integer} delay - Option to call the callback with a delay
       * @param {function} callback - Callback method for results.
       */
      preload_img: function (src_url, delay, callback) {
        MB.common.vars.is_loading = true;
        $pe.body.find('img.preloaded').remove();                    // remove this for now but in future we might hide it

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
              functionName: 'preload_img',
              description: 'Validating image with dimensions: ' + img_w + ' x ' + img_h,
              $status_el: $pe.status
            }]);

            if ($pe.img_size.val().indexOf('x') >= 0) {
              w = $pe.img_size.val().split('x')[0];
              h = $pe.img_size.val().split('x')[1];
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
                func_name : 'preload_img',
                desc      : 'image returned is too small'
              });
            }

            setTimeout(function () {
              var obj = {width: img.width, height: img.height, url: src_url};

              if (!MB.common.vars.ss_mode) {
                $pe.body.find('.loader').fadeOut(1000, function () {
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
                func_name   : 'preload_img',
                description : '404 (Not Found)',
                error       : e
              });
          }); // end JQ new Image
      }
    } // end methods object

  }; // end return

} (jQuery, this, document));

MB.setup(jQuery);

MB.app.methods.init();
