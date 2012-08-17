
var MB = MB || {};

MB.options = (function () {
  'use strict';

  return {
    domain        : 'http://localhost:5000',
    scrape_path   : '/scrape/webPage/',
    api_url       : 'http://icodejs.no.de/mb/',
    covert        : true,
    loading_image : 'img/loader.gif',
    media_type    : 'img',
    interval      : 10000,
    user_id       : -1,
    search_terms : [
      'cityscape wallpaper',
      'marvel comics',
      'dc commics',
      'space wallpaper',
      'space stars wallpaper',
      'space planets wallpaper',
      'muscle cars',
      'tokyo japan city',
      'adult swim wallpaper',
      'thepaperwall cityscape wallpapers',
      'akira wallpaper',
      'high res background textures',
      'high res background wallpapers',
      'architectural photography wallpapers',
      'Street photography wallpapers',
      'macro photography wallpapers',
      'Aerial photography wallpapers',
      'Black and White photography wallpapers',
      'Night photography wallpapers',
      'dream-wallpaper.com',
      'flowers',
      'graffiti',
      'national geographic wallpaper'
    ]
  };
}());


MB.setup = (function ($) {
  'use strict';

  /**
   * Monkey patch Array object with a custom contains method
   * (may need check if string and use toLowerCase()).
   */
  if (typeof Array.prototype.contains  !== 'function') {
    Array.prototype.contains = function (needle, prop) {
      var i = this.length;
      while (i--) {
        if (prop) {
          if (this[i][prop] === needle) return true;
        } else {
          if (this[i] === needle) return true;
        }
      }
      return false;
    };
  }

  /**
   * jQuery global function that keep a record of all ajax requests and
   * provide a handly way of aborting them all at any given time.
   */
  $.xhrPool = [];
  $.xhrPool.abortAll = function () {
    $(this).each(function (idx, jqXHR) {
      jqXHR.abort();
    });
    $.xhrPool.length = 0;
  };

  $.ajaxSetup({
    beforeSend: function (jqXHR) {
      $.xhrPool.push(jqXHR);
    },
    complete: function (jqXHR) {
      var index = $.xhrPool.indexOf(jqXHR);
      if (index > -1) {
        $.xhrPool.splice(index, 1);
      }
    }
  });

  $.fn.css_attr_val = function (property) {
    return parseInt(this.css(property).slice(0,-2), 10);
  };

}(jQuery));