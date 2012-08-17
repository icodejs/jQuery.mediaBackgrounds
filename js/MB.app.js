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
  'use strict';

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



    // CLEAN THIS CODE UP ASAP.
    // clean up this method by moving some decision making to other modules.
    // Remove circular reference between getWallpaper and set_bg



    // Monitor the error being brought back for a url or keyword.
    if (MB.errors.len > 10) {
      if (!MB.common.vars.ss_mode) {
        MB.ui.$pe.body.find('.loader').fadeOut(1000, function () {
          $(this).remove();
          MB.errors.clear();
        });
      }

      return MB.events.trigger('updateStatus', [{
        functionName : 'getWallpaper',
        description  : 'Insufficient images for the current URL. Please enter another URL or keyword(s)',
        errors       : MB.errors.toString(),
        elem         : MB.ui.$pe.status
      }]);
    }

    var
    index     = 0,
    wallpaper = {},
    input     = MB.ui.$pe.terms.val().toLowerCase(),
    is_url    = (input.indexOf('http://') >= 0 || input.indexOf('www') >= 0);

    if ($('.loader').length === 0 && !MB.common.vars.ss_mode) {
      $('<section />')
        .hide()
        .addClass('loader')
        .append($('<img />').attr('src', MB.options.loading_image))
        .appendTo(MB.ui.$pe.body)
        .fadeIn();
    }

    MB.events.trigger('image_loading', [MB.ui.$pe.bg_container]);

    // Check cache. If callback returns cached item index? Do stuff!
    MB.data.cache.get(input, function (obj) {
      var images, cached = is_url && obj && obj.images.length;

      if (cached) {
        images    = obj.images,
        index     = MB.utils.getRandomInt(0, images.length -1);
        wallpaper = { url: images[index].url };
        MB.ui.set_bg(wallpaper, elem);
      } else {
        // Clear error if accessing an uncached URL.
        MB.errors.clear();

        MB.data.getJSON(is_url, input, function (err, imgs) {
          if (err) {
            MB.errors.add(err);
            //console.log(err);
            return MB.events.trigger('updateStatus', [{
              functionName : 'getWallpaper',
              description  : 'getWallpaper: See error object - ' + MB.errors.toString(),
              error        : err,
              errors       : MB.errors.toString(),
              elem         : MB.ui.$pe.status
            }]);

          }
          if (imgs && imgs.length) {
            index     = MB.utils.getRandomInt(0, imgs.length -1);
            wallpaper = { url: imgs[index].url };
            MB.ui.set_bg(wallpaper, elem);
          }
        });
      }
    });
  }

  // public API
  return {
    init          : init,
    getWallpaper  : getWallpaper
  };

} (jQuery, this, document));

