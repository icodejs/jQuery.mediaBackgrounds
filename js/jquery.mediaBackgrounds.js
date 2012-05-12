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

;(function($, window, document, undefined) {

    /**
     * jQuery mediaBackgrounds plugin that ajax load images from external web
     * pages via a custom node.js REST API.
     *
     * This is currently in development and nowhere near finished.
     */
    $.fn.mediaBackgrounds = function (custom_options) {

       // Global variables.
        var vars = {
            timer: {
                prev_req: 0,
                diff_ms: 0,
                elaps: 0
            },
            errors: [],
            cache: {
                items: []
            },
            favorites: [],
            win_width: 1024,
            win_height: 1024,
            interval_id: undefined,
            loading: false,
            ss_mode: false, // slideshow mode
            max_container_height: 450
        };

        // Global jQuery page elements.
        var $pe = {
            bg_container: null,
            body: null,
            buttons: null,
            controls_container: null,
            favorites_container: null,
            favorite_show_hide: null,
            img_size: null,
            keypress_detector: null,
            ss_checkbox: null,
            status: null,
            terms: null,
            window: null,
            ws_dropdown: null
        };

        /**
         * Monkey patch Array object with a custom contains method
         * (may need check if string and use toLowerCase()).
         */
        (function () {
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
                }
            }
        }());

        /**
         * jQuery global function that keep a record of all ajax requests and
         * provide a handly way of aborting them all at any given time.
         */
        (function () {
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

            $.fn.css_attr_val = function(property) {
                return parseInt(this.css(property).slice(0,-2));
            };
        }());

        // Global helper methods.
        var helpers = {

            /**
             * Add current image to favorites with the intention of saving them
             * to the database or sending the URLs as an email to the user.
             * Not finished.
             *
             * * @param {jQuery} elem.
             */
            favorite: function (elem) {
                if (elem && elem.data('img_dims')) {
                    var img = elem.data('img_dims'),
                        thumb_width = 255,
                        thumb_height = 132;

                    if (!vars.favorites.contains(img.url, 'url')) {
                        $('<img />')
                            .attr({src: img.url, width: thumb_width, height: thumb_height})
                            .load(function () {
                                var $this   = $(this),
                                    $favs   = $pe.favorites_container.find('#favorites'),
                                    $ul     = $favs.find('ul')[0] ? $favs.find('ul') : $('<ul />').appendTo($favs),
                                    $rm_btn = $('<a class="remove" href="/"><i class="icon icon_x"></a>').on('click', interaction.remove_favorite_image),
                                    $li     = $('<li />').append($rm_btn).hide(),
                                    $a      = $('<a />').attr({href: img.url, target: '_blank'}).html($this),
                                    height  = helpers.set_favorites_container_height($ul, thumb_height, $ul.find('li').length === 0),
                                    state = $pe.favorite_show_hide.data('state'),
                                    btn_config = {
                                        element: $pe.favorite_show_hide,
                                        state: 'open',
                                        do_toggle: state === 'closed'
                                    },
                                    container_config = {
                                        element: $favs,
                                        state: state,
                                        overflow: 'auto',
                                        height: height > vars.max_container_height ? vars.max_container_height : height,
                                        speed: 750
                                    };

                                $li.prepend($a).prependTo($ul).slideDown(1000);

                                interaction.view_favorites_show(container_config, function () {
                                    interaction.view_favorites_button(btn_config);
                                    $pe.keypress_detector.focus();
                                    vars.favorites.push(img);
                                    methods.set_status('save', vars.favorites.length +
                                            ' image(s) saved in your favorites!', vars.favorites.length);
                                });

                                var style = $pe.favorites_container.attr('style').replace(' ', '');

                                style.indexOf('display:none;') >= 0 &&
                                    $pe.favorites_container.fadeIn();
                            });
                    }
                }
            },
            set_favorites_container_height: function (container, single_thumb_height, is_new) {
                var $lis = container.find('li')
                    len = $lis.length + 1;

                if ($lis.length) {
                    var margin = $lis.css_attr_val('margin-bottom');
                    return ($lis.first().outerHeight(true) * len) + (len * margin);
                } else if (is_new) {
                    return container.outerHeight(true) + single_thumb_height + 12; // hack
                } else {
                    return 0;
                }
            },
            email: function () {
                methods.set_status('email', 'Check your inbox! (To do)');
            },
            tweet: function () {
                methods.set_status('tweet', 'tweet tweet (To do)');
            },
            save: function () {
                // $.ajax({
                //   type: 'POST',
                //   url: url,
                //   data: data,
                //   success: success,
                //   dataType: dataType
                // });
                methods.set_status('save',
                    'Your favorites list has been saved. (To do)');
            },
            help: function () {
                methods.set_status('help',
                    'Use the spacebar to load new images. (To do)');
            },
            get_rnd_term: function () {
                var idx  = 0,
                    st   = options.search_terms,
                    term = '';

                if (st.length === 1) {
                    return helpers.parse_search_term(st[idx]);
                } else {
                    idx = helpers.get_rnd_int(0, st.length -1);
                    term = helpers.parse_search_term(st[idx]);
                    methods.set_status('get_rnd_term', 'search term: ' + term);
                    return term;
                }
            },
            parse_search_term: function (term) {
                return term.split(' ').join('+');
            },
            get_rnd_int: function (min, max)  {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
        };

        // Global interaction methods that work with jQuery elements.
        var interaction = {
            view_favorites: function (event, elem, target_elem) {
                var state      = elem.data('state'),
                    $icon      = elem.find('i'),
                    height     = target_elem.find('ul').outerHeight(true) + 10
                    btn_config = {
                        element: elem,
                        state: state === 'open' ? 'closed' : 'open',
                        do_toggle: true
                    },
                    container_config = {
                        element: target_elem,
                        state: btn_config.state,
                        overflow: state === 'open' ? 'hidden' : 'auto',
                        height: state === 'open' ? 10 : height > vars.max_container_height ? vars.max_container_height : height,
                        speed: 750
                    };

                interaction.view_favorites_show(container_config, function () {
                    interaction.view_favorites_button(btn_config);
                });
            },
            view_favorites_button: function (obj) {
                obj.element.data({state: obj.state});
                obj.do_toggle && obj.element.find('i').toggleClass('icon_state_close', 'icon_state_open');
            },
            view_favorites_show: function (obj, callback) {
                var easing = obj.state === 'open' ?  'easeOutQuad' : 'easeInQuad';

                obj.element.stop(true, true);
                obj.element.animate({
                    height: obj.height
                }, obj.speed, easing, function() {
                    $(this).css({overflow: obj.overflow});
                    callback();
                });
            },
            remove_favorite_image: function (e) {
                e.preventDefault();
                var $parent_li = $(this).closest('li');

                $parent_li.slideUp(1000, function () {
                    var i,
                        len,
                        img,
                        $this = $(this)
                        src = $parent_li.find('img').attr('src'),
                        $siblings = $this.siblings(),
                        $favorites = $pe.favorites_container.find('#favorites');

                    $this.remove();

                    for (i = 0, len = vars.favorites.length; i < len; i += 1) {
                        if (vars.favorites[i].url.toLowerCase() === src.toLowerCase()) {
                            img = vars.favorites.splice(i, 1);
                            break;
                        }
                    }

                    if ($siblings.length) {
                        interaction.view_favorites(e, $pe.favorite_show_hide.data({state: 'closed'}), $favorites);
                    } else {
                        $pe.favorites_container
                            .hide()
                            .find('#favorites')
                                .slideUp(1000)
                                .removeAttr('style')
                                .find('ul')
                                    .remove();
                    }
                });
            }
        };

        // Base plugin methods.
        var base = this,
            methods = {

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
                    $pe.ws_dropdown         = $('#wallpapers_sites');
                    $pe.ss_checkbox         = $('#slideshow');
                    $pe.favorite_show_hide  = $('#favorite_controls a');
                    $pe.window              = $(window);
                    vars.win_width          = $pe.window.width();
                    vars.win_height         = $pe.window.height();

                    $pe.window
                        .on('resize', methods.resize_window)
                        .bind('beforeunload', function (e) {
                            if ($pe.favorites_container.find('#favorites li').length > 0) {
                                return 'You will loose your favorite images.';
                            }
                        });

                    return base.each(function () {

                        // disable right click
                        $('*').bind('contextmenu', function () { return false });

                        // Bind and listen to bodyonclick events. Set focus to
                        // $pe.keypress_detector. This will allow me to listen
                        // to keyboard events.
                        $pe.body = $(this)
                            .height(vars.win_height)
                            .on('click', function (e) {
                                if (e.target.id !== 'controls' && e.target.parentElement.id !== 'controls') {
                                    $pe.keypress_detector.focus();
                                }
                            });

                        // Add background image container div.
                        $pe.bg_container = $('<div />')
                            .addClass('bg_container')
                            .height(vars.win_height)
                            .hide()
                            .prependTo($pe.body);

                        // Bind and listen to all button click events and handle
                        // them accordingly.
                        $pe.buttons
                            .on('click', function (e) {
                                e.preventDefault();
                                $pe.keypress_detector.focus();

                                switch ($(this).attr('id').toLowerCase()) {
                                    case 'fav':   helpers.favorite($pe.bg_container); break;
                                    case 'save':  helpers.save($pe.bg_container); break;
                                    case 'email': helpers.email($pe.bg_container); break;
                                    case 'tweet': helpers.tweet($pe.bg_container); break;
                                    case 'help':  helpers.help($pe.bg_container); break;
                                }
                            });

                        // Bind and listen to the change event of the #wallpapers_sites
                        // drp and update the search textbox.
                        $pe.ws_dropdown
                            .on('change', function () {
                                var url = $(this).val();
                                url.toLowerCase() !== 'none' && $pe.terms.val(url)
                                $pe.keypress_detector.focus();
                            });

                        // Bind and listen to the change event of the slideshow checkbox
                        // and initialise the image slide show based on the current cache
                        // or search terms.
                        $pe.ss_checkbox
                            .on('change', function () {
                                var $inputs = $pe.controls_container.find('input, select, button').not('#slideshow, #fav');

                                vars.ss_mode = $(this).attr('checked') ? true : false;

                                if (vars.ss_mode) {
                                    vars.interval_id = setInterval(function () {
                                        ($.xhrPool.length === 0 && !vars.loading) && methods.update_ui($pe.bg_container)
                                    }, options.interval);

                                    $inputs.attr({disabled: 'disabled'}).addClass('disabled');
                                    methods.set_status('init', 'Slideshow mode. A new image will load in approximately ' + (options.interval / 1000) + ' seconds.');
                                } else {
                                    clearInterval(vars.interval_id);

                                    $inputs.removeAttr('disabled').removeClass('disabled');
                                    methods.set_status('init', 'Slideshow cancelled. Press the spacebar to load new images.');
                                }
                            });

                        // Bind and listen to click event of favorite_controls.
                        $pe.favorite_show_hide
                            .on('click', function (e) {
                                e.preventDefault();
                                interaction.view_favorites(e, $(this), $('#favorites'))
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
                                if (e.which === 32 && !vars.ss_mode) {
                                    var now = new Date().getTime();

                                    // stop user from sending too many http requests
                                    if (vars.timer.prev_req === 0) {
                                        vars.timer.prev_req = now;
                                    } else {
                                        vars.timer.diff_ms = now - vars.timer.prev_req;
                                        vars.timer.elaps   = vars.timer.diff_ms / 1000;

                                        if (vars.timer.elaps >= 2) {
                                            vars.timer.prev_req = now;
                                        } else {
                                            //debug('init keypress time check', ['please wait', vars.timer.elaps]);
                                            return;
                                        }
                                    }
                                    methods.update_ui($pe.bg_container);
                                }
                            })
                            .appendTo($pe.body);

                        methods.get_bg($pe.bg_container);
                    });
                },

                /**
                 * Base function from which new background images are retrieved
                 * ready to be appended to the background container div.
                 * @param {jQuery} elem.
                 */
                get_bg: function (elem) {
                    // Monitor the error being brought back for a url or keyword.
                    if (vars.errors.length > 10) {
                        !vars.ss_mode && $pe.body.find('.loader').fadeOut(1000, function () {
                            $(this).remove();
                            vars.errors = [];
                        });
                        return methods.set_status('get_bg',
                                'Insuffient images for the current URL. Please enter another URL or keyword(s)',
                                vars.errors);
                    }

                    var idx    = 0,
                        bg     = {},
                        input  = $pe.terms.val().toLowerCase(),
                        is_url = (input.indexOf('http://') >= 0 || input.indexOf('www') >= 0);

                    if ($('.loader').length === 0 && !vars.ss_mode) {
                        $('<div />')
                            .hide()
                            .addClass('loader')
                            .append($('<img />').attr('src', options.loading_image))
                            .appendTo($pe.body)
                            .fadeIn();
                    }

                    // Check cache. If callback returns cached item index? Do stuff!
                    methods.check_cache(input, function (i) {
                        var items = vars.cache.items;

                        if (is_url && i >= 0 && items[i] && items[i].images.length > 0) {
                            var images = items[i].images;

                            idx = helpers.get_rnd_int(0, images.length -1);
                            bg  = {url: images[idx].url};

                            methods.set_bg(bg, elem);
                        } else {
                            // Clear error if accessing an uncached URL.
                            vars.errors = [];

                            methods.get_json(is_url, input, function (err, images) {
                                if (err) {
                                    return methods.set_status('get_bg', err);
                                }
                                if (images && images.length > 0) {
                                    idx = helpers.get_rnd_int(0, images.length -1);
                                    bg  = {url: images[idx].url};
                                    methods.set_bg(bg, elem);
                                }
                            });
                        }
                    });
                },

                /**
                 * Responsible for calling the preload function and updating the
                 * UI with the results.
                 *
                 * @param {object} data - Object literal containing image data.
                 * @param {jQuery} elem.
                 */
                set_bg: function (data, elem) {
                    if (data && data.url) {
                        methods.preload_img(data.url, 0, function (err, img_dims) {
                            // create a new bg_container div which will replace the old on
                            var old_bg_containers = $('.bg_container');

                            if (err) {
                                return methods.get_bg(elem);
                            }

                            $pe.bg_container = $('<div />')
                                .addClass('bg_container')
                                .height(vars.win_height)
                                .css({
                                    'background-image': 'url("' + data.url + '")',
                                    'background-position': 'top',
                                    'background-repeat': 'repeat',
                                    'height': vars.win_height
                                })
                                .data('img_dims', img_dims)
                                .prependTo($pe.body);

                            old_bg_containers.fadeOut(1000, function () {
                                $(this).remove();
                            });
                        });

                        $pe.keypress_detector.focus();
                    }
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
                    if (options.api_url.length > 0 && is_url) {
                        url  = options.api_url + input;
                    } else {
                        url  = 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q='
                        url += (input.length > 0 ? helpers.parse_search_term(input) : helpers.get_rnd_term())
                        url += '&imgsz=xlarge|xxlarge|huge'                     // |huge (make this optional)
                        url += '&imgtype=photo'
                        url += '&rsz=8'                                         // max results per page
                        url += '&start=' + helpers.get_rnd_int(1, 50);
                    }

                    // Abort all ajax requests if any.
                    $.xhrPool.length > 0 && $.xhrPool.abortAll();

                    $.ajax({
                        url: url,
                        dataType: 'jsonp',
                        error: function (jqXHR, textStatus, errorThrown) {
                             return vars.errors.push({
                                func_name: 'get_json',
                                desc: textStatus,
                                data: errorThrown
                            });
                        }
                    }).done(function (data, status) {
                        if (status === 'success') {
                            try {
                                if (data.error) {
                                    vars.errors.push({
                                        func_name: 'get_json',
                                        desc: data.error,
                                        data: data
                                    });
                                    return callback(data.error);
                                }

                                // replace this logic with a custom function that can be passed in for each api
                                if (options.api_url.length > 0 && is_url) {
                                    !vars.cache.items.contains(input, 'id') && vars.cache.items.push({id: input, images: data});
                                    return callback(null, data);
                                } else {
                                    var results = data.responseData.results;

                                    if (results.length) {
                                        return callback(null, results);
                                    } else {
                                        return callback('no results');
                                    }
                                }
                            } catch (e) {
                                var error = {
                                    func_name: 'get_json',
                                    desc: e.toString(),
                                    data: e
                                };
                                vars.errors.push(error);
                                return callback(error);
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
                    var err;
                    vars.loading = true;
                    $pe.body.find('img.preloaded').remove();                    // remove this for now but in future we might hide it

                    // Load image, hide it, add to the pages.
                    $(new Image())
                        .hide()
                        .load(function () {
                            var img = this,
                                img_w = img.width,
                                img_h = img.height;

                            methods.set_status('preload_img',
                                'Loaded image with dimensions: ' +
                                img_w + ' x ' + img_h);

                            var w = vars.win_width, h = vars.win_height;

                            if ($pe.img_size.val().indexOf('x') >= 0) {
                                w = $pe.img_size.val().split('x')[0];
                                h = $pe.img_size.val().split('x')[1];
                            } else {
                                // CSS3 background-size:cover does a good job of
                                // stretching images so allow images as much as
                                // 30% smaller than current window size.
                                img_w *= 1.3;
                                img_h *= 1.3;
                            }

                            // Filter out images that are too small for the current
                            // window size or that are smaller than the minimum
                            // size specified by the user.
                            if (img_w < w || img_h < h) {
                                error = {
                                    func_name: 'preload_img',
                                    desc: 'image returned is too small'
                                };
                                vars.errors.push(error);
                                return callback(error);
                            }

                            setTimeout(function () {
                                var obj = {width: img.width, height: img.height, url: src_url};

                                if (!vars.ss_mode) {
                                    $pe.body.find('.loader').fadeOut(1000, function () {
                                        $(this).remove();
                                        vars.loading = false;
                                        callback(null, obj);
                                    });
                                } else {
                                    vars.loading = false;
                                    callback(null, obj);
                                }
                            }, delay);
                        })
                        .addClass('preloaded')
                        .attr('src', src_url)
                        .prependTo('body')
                        .error(function (e) {
                            error = {
                                func_name: 'preload_img',
                                desc: '404 (Not Found)',
                                data: e
                            };
                            vars.errors.push(error);

                            methods.set_status('preload_img', error.desc);
                            return callback(error);
                        }); // end JQ new Image
                },

                /**
                 * This function is bound to the window resize event. Each time
                 * it is called it updates the body and image container elements.
                 */
                resize_window: function () {
                    var $this  = $(this);
                    vars.win_width  = $this.width();
                    vars.win_height = $this.height();

                    $pe.bg_container.css({'height': vars.win_height});
                    $pe.body.css({'height': vars.win_height});

                    // debug('resize_window', [
                    //     'window dimensions: ' +
                    //     vars.win_width + ' x ' +
                    //     vars.win_height
                    // ]);
                },
                update_ui: function (elem) {
                    elem && methods.get_bg(elem);
                },

                /**
                 * Check to see with if we have previously loaded this URL before.
                 * If we have then return its position in the global cache.
                 *
                 * @param {string} id - URL id of the cached item.
                 * @param {function} callback - Callback method for results.
                 */
                check_cache: function (id, callback) {
                    var i,
                        items = vars.cache.items,
                        len = items.length;

                    if (items.length > 0) {
                        for (i = 0; i < len; i += 1) {
                            if (id.toLowerCase() === items[i].id.toLowerCase()) {
                                return callback(i);
                            }
                        }
                    }
                    return callback(-1);
                },

                /**
                 * Updates the status bar with the results of called functions.
                 *
                 * @param {string} type - Name of function.
                 * @param {string} status - Text to be added to the status.
                 * @param {object} data - Extra data that may be of use at a later date.
                 */
                set_status: function (type, status, data) {
                    $pe.status
                        .find('div')
                            .fadeOut()
                            .end()
                        .html('')
                        .append($('<div>'
                                    + status
                                    + (type === 'save' ? ' <a href="#" id="view" class="button">view</a>' : '')
                                    + ' ...'
                                + '</div>')
                        .fadeIn(1000))
                        .fadeIn();
                },
                destroy: function () {
                    return base.each(function () {
                        // ...
                    })
                }
            },
            options = $.extend({
                api: 'google_image_search',
                api_url: '',
                loading_image: 'img/loader.gif',
                search_terms: ['graffiti'],
                media_type: 'img',
                interval: 15000,
                user_id: -1,
                rest_url: ''
            }, custom_options);

        // initialise plugin
        methods.init();

        function debug(context, lines, data) {
            console.log('');
            console.log('+++++++ ' + context + ' +++++++');

            for (var i = 0; i < lines.length; i += 1) {
                console.log(lines[i]);
                data && console.log(data);
                console.log('------------------------------');
                console.log('');
            }
        }

    }

} (jQuery, window, document));