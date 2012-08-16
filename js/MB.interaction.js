
var MB = MB || {};

MB.interaction = (function ($) {
   'use strict';

  // public API
  return {
    email          : email,
    tweet          : tweet,
    save           : save,
    help           : help,
    add_favorite   : add_favorite
  };

  function email() {
    MB.events.trigger('updateStatus', [{
      functionName : 'email',
      description  : 'Check your inbox! (To do)',
      elem         : MB.ui.$pe.status
    }]);
  }

  function tweet() {
    MB.events.trigger('updateStatus', [{
      functionName : 'tweet',
      description  : 'tweet tweet! (To do)',
      elem         : MB.ui.$pe.status
    }]);
  }

  function save() {
    MB.events.trigger('updateStatus', [{
      functionName : 'save',
      description  : 'Your favorites list has been saved! (To do)',
      elem         : MB.ui.$pe.status
    }]);
  }

  function help() {
    MB.events.trigger('updateStatus', [{
      functionName : 'help',
      description  : 'Spacebar: Load, F: Favorites, S: Save, T: Tweet, E: Email, H: Help',
      elem         : MB.ui.$pe.status
    }]);
  }

  function removeFavImage(e) {
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
      $favorites = MB.ui.$pe.favorites_container.find('#favorites');

      $this.remove();

      for (i = 0, len = MB.common.vars.favorites.length; i < len; i += 1) {
        if (MB.common.vars.favorites[i].url.toLowerCase() === src.toLowerCase()) {
          img = MB.common.vars.favorites.splice(i, 1);
          break;
        }
      }

      if ($siblings.length) {
        MB.ui.viewFavorites(e, MB.ui.$pe.favorite_show_hide.data({state: 'closed'}), $favorites);
      } else {
        MB.ui.$pe.favorites_container
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

        // reset state
        MB.ui.$pe.favorite_show_hide.removeData('state');
      }
    });
  }

  function add_favorite(elem) {
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
            $favs   = MB.ui.$pe.favorites_container.find('#favorites'),
            $ul     = $favs.find('ul')[0] ? $favs.find('ul') : $('<ul />').appendTo($favs),
            $rm_btn = $('<a class="remove" href="/"><i class="icon icon_x"></a>').on('click', removeFavImage),
            $li     = $('<li />').append($rm_btn).hide(),
            $a      = $('<a />').attr({href: img.url, target: '_blank'}).html($this),
            height  = MB.ui.set_favorites_container_height($ul, thumb_height, $ul.find('li').length === 0),
            state   = MB.ui.$pe.favorite_show_hide.data('state');

            var
            btn_config = {
              element   : MB.ui.$pe.favorite_show_hide,
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

            MB.ui.view_favorites_show(container_config, function () {
              MB.ui.view_favorites_button(btn_config);
              MB.ui.$pe.keypress_detector.focus();
              MB.common.vars.favorites.push(img);

              return MB.events.trigger('updateStatus', [{
                functionName: 'save',
                description: MB.common.vars.favorites.length + ' image(s) saved in your favorites!',
                elem: MB.ui.$pe.status
              }]);
            });

            style = MB.ui.$pe.favorites_container.attr('style').replace(' ', '');

            if (style.indexOf('display:none;') >= 0) {
              MB.ui.$pe.favorites_container.fadeIn();
            }
          });
      }
    }
  }

}(jQuery));

