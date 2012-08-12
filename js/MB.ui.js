
var MB = MB || {};

MB.ui = (function () {
  return {
    // move all the functions below into here
  };
}());

MB.ui.load_wallpapers_sites = (function () {
  return function (callback) {
    $.ajax({
      url:  MB.options.domain + '/load/webPages/',
      dataType: 'jsonp',
      error: function (jqXHR, textStatus, errorThrown) {
        return callback({
          func_name : 'load_wallpapers_sites',
          desc      : textStatus,
          data      : jqXHR
        });
      }
    }).done(function (data, status) {
      var opts = '';
      if (status === 'success') {
        opts += MB.common.getTag('[ websites ]', 'option', 'value=""');
        $.each(data, function(i, obj) {
          opts += MB.common.getTag(obj.category, 'option', 'value="' + obj.url + '"');
        });
        callback(null, opts);
      }
    });
  };
}());

/**
 * This function is bound to the window resize event. Each time
 * it is called it updates the body and image container elements.
 */
MB.ui.resize_window = (function () {
  return function () {
    var
    $this           = $(this);
    MB.app.vars.win_width  = $this.width();
    MB.app.vars.win_height = $this.height();

    MB.app.$pe.bg_container.css({'height': MB.app.vars.win_height});
    MB.app.$pe.body.css({'height': MB.app.vars.win_height});
  };
}());

MB.ui.set_favorites_container_height = (function () {
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

/**
   * Responsible for calling the preload function and updating the
   * UI with the results.
   *
   * @param {object} data - Object literal containing image data.
   * @param {jQuery} elem.
   */
MB.ui.set_bg = (function () {
  return function (data, elem) {
    if (data && data.url) {
        MB.app.methods.preload_img(data.url, 0, function (err, img_dims) {
          // create a new bg_container section which will replace the old on
          var old_bg_containers = $('.bg_container');

          if (err) {
            MB.app.vars.errors.push(err);
            return MB.app.methods.get_bg(elem);
          }

          MB.app.$pe.bg_container = $('<section />')
            .addClass('bg_container')
            .height(MB.app.vars.win_height)
            .css({
              'background-color'    : 'transparent',
              'background-image'    : 'url("' + data.url + '")',
              'background-position' : 'top',
              'background-repeat'   : 'repeat',
              'height'              : MB.app.vars.win_height
            })
            .data('img_dims', img_dims)
            .prependTo(MB.app.$pe.body);

          // for when working on the plugin when you should be doing work :)
          if (MB.options.covert) MB.app.$pe.bg_container.addClass('covert');

          old_bg_containers.fadeOut(1000, function () {
            $(this).remove();
          });
      });

      MB.app.$pe.keypress_detector.focus();
    }
  };
}());

MB.ui.update_ui = (function () {
  return function (elem) {
    if (elem) {
      MB.app.methods.get_bg(elem);
    }
  };
}());

/**
 * Updates the status bar with the results of called functions.
 *
 * @param {string} type - Name of function.
 * @param {string} status - Text to be added to the status.
 * @param {object} data - Extra data that may be of use at a later date.
 */
MB.ui.set_status = (function () {
  return function (type, status, data) {
    var
    s = status;
    s += (type === 'save' ? ' <a href="#" id="view" class="button">view</a>' : '');
    s += ' ...';

    MB.app.$pe.status
      .find('section')
        .fadeOut()
        .end()
      .html('')
      .append($('<section>' + s + '</section>').fadeIn(1000))
      .fadeIn();
  };
}());

MB.ui.updateStatus = (function () {
  return function (data) {
    MB.app.$pe.status
        .find('section')
        .fadeOut()
      .end()
        .html('')
        .append($('<section>' + data.description + '</section>').fadeIn(1000))
        .fadeIn();
  };
}());



