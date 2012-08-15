
var MB = MB || {};

MB.ui = (function ($){
  "use strict";

  var $pe = {};

  var loadWallpaperSites = (function () {
    return function (callback) {
      $.ajax({
        url:  MB.options.domain + '/load/webPages/',
        dataType: 'jsonp',
        error: function (jqXHR, textStatus, errorThrown) {
          return callback({
            func_name : 'loadWallpaperSites',
            desc      : textStatus,
            data      : jqXHR
          });
        }
      }).done(function (data, status) {
        var opts = '';
        if (status === 'success') {
          opts += getTag('[ websites ]', 'option', getAttr('value', ''));
          $.each(data, function(i, obj) {
            opts += getTag(obj.category, 'option', getAttr('value', obj.url));
          });
          callback(null, opts);
        }
      });
    };
  }());

  var resize_window = (function () {
    return function () {
      var
      $this = $(this);
      MB.common.vars.win_width  = $this.width();
      MB.common.vars.win_height = $this.height();

      $pe.bg_container.css({'height': MB.common.vars.win_height});
      $pe.body.css({'height': MB.common.vars.win_height});
    };
  }());

  var set_favorites_container_height = (function () {
    return function (container, single_thumb_height, is_new) {
      var
      $lis = container.find('li'),
      len = $lis.length + 1,
      margin;

      if ($lis.length) {
        margin = $lis.css_attr_val('margin-bottom');
        return ($lis.first().outerHeight(true) * len) + (len * margin);
      } else if (is_new) {
        return container.outerHeight(true) + single_thumb_height + 12; // hack
      } else {
        return 0;
      }
    };
  }());

  var set_bg = (function () {
    return function (data, elem) {
      if (data && data.url) {
          MB.app.preload_img(data.url, 0, function (err, img_dims) {
            // create a new bg_container section which will replace the old on
            var old_bg_containers = $('.bg_container');

            if (err) {
              MB.errors.add(err);
              return MB.app.getWallpaper(elem);
            }

            $pe.bg_container = $('<section />')
              .addClass('bg_container')
              .height(MB.common.vars.win_height)
              .css({
                'background-color'    : 'transparent',
                'background-image'    : 'url("' + data.url + '")',
                'background-position' : 'top',
                'background-repeat'   : 'repeat',
                'height'              : MB.common.vars.win_height
              })
              .data('img_dims', img_dims)
              .prependTo($pe.body);

            // for when working on the plugin when you should be doing work :)
            if (MB.options.covert) $pe.bg_container.addClass('covert');

            old_bg_containers.fadeOut(1000, function () {
              $(this).remove();
            });
        });

        $pe.keypress_detector.focus();
      }
    };
  }());


  var update_ui = (function () {
    return function (elem) {
      if (elem) {
        MB.app.getWallpaper(elem);
      }
    };
  }());

  var updateStatus = (function () {
    return function (data) {
      if (data.description && data.description.length)
        data.$status_el
            .find('section')
            .fadeOut()
          .end()
            .html('')
            .append($('<section>' + data.description + '</section>').fadeIn(1000))
            .fadeIn();
    };
  }());

  function getTag(input, t, attrs) {
    return '<' + t + (attrs ? ' ' + attrs : '') + '>' + input + '</' + t + '>';
  }

  function getAttr(name, value) {
    return name + '="' + value + '"';
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

  function view_favorites_button(obj) {
    obj.element.data({state: obj.state});
    if (obj.do_toggle) {
      obj.element.find('i').toggleClass('icon_state_close', 'icon_state_open');
    }
  }

  function init(pageElements, callback) {
    var that = this;

    that.$pe = pageElements;
    $pe = that.$pe;

    MB.common.vars.win_width  = $pe.window.width();
    MB.common.vars.win_height = $pe.window.height();


    // load wallpaper sites from server
    setTimeout(function () {
      MB.ui.loadWallpaperSites(function (err, html) {
        if (err) {
          MB.errors.add(err);
          return MB.events.trigger('updateStatus', [{
            functionName : 'preload_img',
            error        : err,
            errors       : MB.errors.toString(),
            description  : 'init error',
            $status_el   : $pe.status
          }]);
        } else {
          $pe.ws_dropdown.html(html).show(500);
        }
      });
    }, 2000);

    $pe.window
      .on({
        resize       : MB.ui.resize_window,
        beforeunload : function (e) {
          if ($pe.favorites_container.find('#favorites li').length) {
            return 'You will loose your favorite images.';
          }
        }
      });

    // Bind and listen to bodyonclick events. Set focus to
    // $pe.keypress_detector. This will allow me to listen
    // to keyboard events.
    $pe.body
      .height(MB.common.vars.win_height)
      .on('click', function (e) {
        if (e.target.id !== 'controls' && e.target.parentElement.id !== 'controls') {
          $pe.keypress_detector.focus();
        }
      });

    // Bind and listen to all button click events and handle them accordingly.
    $pe.controls_container
      .on('click', '.button', function (e) {
        e.preventDefault();
        $pe.keypress_detector.focus();

        switch ($(this).attr('id').toLowerCase()) {
        case 'fav':
          MB.interaction.add_favorite($pe.bg_container);
          break;
        case 'save':
          MB.interaction.save($pe.bg_container);
          break;
        case 'email':
          MB.interaction.email($pe.bg_container);
          break;
        case 'tweet':
          MB.interaction.tweet($pe.bg_container);
          break;
        case 'help':
          MB.interaction.help($pe.bg_container);
          break;
        }
      });

    // Add background image container section.
    $pe.bg_container
      .addClass('bg_container')
      .height(MB.common.vars.win_height)
      .hide()
      .prependTo($pe.body);

    // Hack (fix asap). Create and input element and bind a keypress event
    // handler. Perform certain actions base on which key is pressed.
    $pe.keypress_detector
      .attr({
        id   : 'txtInput',
        type : 'text'
      })
      .focus()
      .addClass('keypress_detector')
      .on('keypress', function (e) {
         MB.events.keypress(e)($pe.bg_container);
      })
      .appendTo($pe.body);

    // Bind and listen to the change event of the #wallpapers_sites
    // drp and update the search textbox.
    $pe.controls_container
      .on('change', '#wallpapers_sites', function () {
        var url = $(this).val();
        if (url.toLowerCase() !== 'none') {
          $pe.terms.val(url);
        }
        $pe.keypress_detector.focus();
      });

    // Bind and listen to the change event of the slideshow checkbox
    // and initialise the image slide show based on the current cache
    // or search terms.
    $pe.controls_container
      .on('change', '#slideshow', function () {
        var $inputs = $pe.controls_container.find('input, select, button').not('#slideshow, #fav');

        MB.common.vars.ss_mode = $(this).attr('checked') ? true : false;

        if (MB.common.vars.ss_mode) {
          MB.common.vars.timers.request.interval_id = setInterval(function () {
            if ($.xhrPool.length === 0 && !MB.common.vars.loading) {
              MB.ui.update_ui($pe.bg_container);
            }
          }, MB.options.interval);

          $inputs.attr({
            disabled: 'disabled'
          }).addClass('disabled');

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
        MB.ui.view_favorites(e, $(this), $('#favorites'));
      }).data({state: 'closed'});

    // setup events
    MB.events.init([
      {
        elem: $pe.eventElement,
        name: 'updateStatus',
        func: MB.ui.updateStatus
      },
      {
        elem: $pe.eventElement,
        name: 'getWallpaper',
        func: MB.app.getWallpaper
      },
      {
        elem: $pe.eventElement,
        name: 'image_loading',
        func: MB.common.loading.begin
      }
    ]);

    callback($pe);
    //$('*').on('contextmenu', function () { return false; }); // disable right click
  }

  // public API
  return {
    init                           : init,
    loadWallpaperSites             : loadWallpaperSites,
    resize_window                  : resize_window,
    set_favorites_container_height : set_favorites_container_height,
    set_bg                         : set_bg,
    update_ui                      : update_ui,
    updateStatus                   : updateStatus,
    getTag                         : getTag,
    getAttr                        : getAttr,
    view_favorites_show            : view_favorites_show,
    view_favorites_button          : view_favorites_button,
    $pe                            : $pe
  };

}(jQuery));

