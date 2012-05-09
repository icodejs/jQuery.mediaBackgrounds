/*
                      _
 _                   ( )           _
(_)   ___    _      _| |   __     (_)  ___
| | /'___) /'_`\  /'_` | /'__`\   | |/',__)
| |( (___ ( (_) )( (_| |(  ___/   | |\__, \
(_)`\____)`\___/'`\__,_)`\____)_  | |(____/
                              ( )_| |
                              `\___/'
*/
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

    (function () {
        if (typeof Array.prototype.contains  !== 'function') {                  // monkey path contains Array method (may need check if string and use toLowerCase())
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

        $.xhrPool = [];
        $.xhrPool.abortAll = function () {                                      // stop multilpe ajax requests from running
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
    }());

    $.fn.mediaBackgrounds = function (custom_options) {

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
            favorites: [],                                                      // save favorite background images
            win_width: 1024,
            win_height: 1024,
            interval_id: undefined,
            loading: false
        };

        var helpers = {
            favorite: function (elem) {
                if (elem && elem.data('img_dims')) {
                    var url = elem.data('img_dims').url;

                    if (!vars.favorites.contains(url, 'url')) {
                        vars.favorites.push(elem.data('img_dims'));
                        methods.set_status('save', vars.favorites.length + ' image(s) saved in your favorites!', vars.favorites.length);             // everytime this changes the view needs to be updated
                    }
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
                    return methods.parse_search_term(st[idx]);
                } else {
                    idx = methods.get_rnd_int(0, st.length -1);
                    term = methods.parse_search_term(st[idx]);
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

        var base = this,
            $body = null,
            $bg_container = null,
            $keypress_detector = null,
            $status = null,
            $slideshow = false,
            methods = {
                init: function (options) {
                    var $window = $(window);
                    vars.win_width  = $window.width(),
                    vars.win_height = $window.height();

                    $window.on('resize', methods.resize_window);
                    $status = $('.status');

                    return base.each(function () {

                        $('*').bind('contextmenu', function () { return false });

                        $body = $(this)
                            .height(vars.win_height)
                            .on('click', function (e) {
                                if (e.target.id !== 'controls' && e.target.parentElement.id !== 'controls') {
                                    $keypress_detector.focus();
                                }
                            });

                        $bg_container = $('<div />')
                            .addClass('bg_container')
                            .height(vars.win_height)
                            .hide()
                            .prependTo($body);

                        $('.button')
                            .on('click', function (e) {
                                e.preventDefault();
                                $keypress_detector.focus();
                                switch ($(this).attr('id').toLowerCase()) {
                                    case 'fav':   helpers.favorite($body.find('.bg_container')); break;
                                    case 'save':  helpers.save($body.find('.bg_container')); break;
                                    case 'email': helpers.email($body.find('.bg_container')); break;
                                    case 'tweet': helpers.tweet($body.find('.bg_container')); break;
                                    case 'help':  helpers.help($body.find('.bg_container')); break;
                                }
                            });

                        $('#example')
                            .on('change', function () {
                                var url = $(this).val();
                                $('#terms').val(url)
                                $keypress_detector.focus();
                            });

                        $('#slideshow')
                            .on('change', function () {
                                $slideshow = $(this).attr('checked') ? true : false;

                                if ($slideshow) {
                                     vars.interval_id = setInterval(function () {

                                        // console.log('$slideshow: ', $slideshow);
                                        // console.log('$.xhrPool.length: ', $.xhrPool.length);
                                        // console.log('loading: ', vars.loading);

                                        ($.xhrPool.length === 0 && !vars.loading) && methods.update_ui($bg_container)
                                     }, 15000);
                                } else {
                                    clearInterval(vars.interval_id);
                                }
                            });

                        $keypress_detector = $('<input />')                     // hack (fix asap)
                            .attr({id: 'txtInput', type: 'text'})
                            .addClass('keypress_detector')
                            .focus()
                            .on('keypress', function (e) {
                                e.preventDefault();
                                if (e.which === 32 && !$slideshow) {
                                    var now = new Date().getTime();

                                    if (vars.timer.prev_req === 0) {            // stop user from sending too many http requests
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
                                    methods.update_ui($bg_container);
                                }
                            })
                            .appendTo($body);

                        methods.get_bg($bg_container);
                    });
                },
                get_bg: function (elem) {
                    if (vars.errors.length > 10) {                              // monitor the error being brought back for a url or keyword
                        !$slideshow && $body.find('.loader').fadeOut(1000, function () {
                            $(this).remove();
                            vars.errors = [];
                        });
                        return methods.set_status('get_bg',
                                'Insuffient images for the current URL. Please enter another URL or keyword(s)',
                                vars.errors);
                    }

                    var idx    = 0,
                        bg     = {},
                        input  = $('#terms').val().toLowerCase(),
                        is_url = (input.indexOf('http://') >= 0 || input.indexOf('www') >= 0);

                    if ($('.loader').length === 0 && !$slideshow) {
                        $('<div />')
                            .hide()
                            .addClass('loader')
                            .append($('<img />').attr('src', options.loading_image))
                            .appendTo($body)
                            .fadeIn();
                    }

                    methods.check_cache(input, function (i) {                   // check cache. if callback returns cached item index? Do stuff!
                        var items = vars.cache.items;

                        if (is_url && i >= 0 && items[i] && items[i].images.length > 0) {
                            var images = items[i].images;

                            idx = helpers.get_rnd_int(0, images.length -1);
                            bg  = {url: images[idx].url};

                            methods.set_bg(bg, elem);
                            //console.log('using cache');
                        } else {
                            vars.errors = [];                                   // clear error for this new url

                            methods.get_json(is_url, input, function (err, images) {
                                if (err) {
                                    return methods.set_status('get_bg', err);
                                }
                                if (images && images.length > 0) {
                                    idx = helpers.get_rnd_int(0, images.length -1);
                                    bg  = {url: images[idx].url};
                                    methods.set_bg(bg, elem);
                                }
                                //console.log('using get json');
                            });
                        }
                    }); // end check_cache
                },
                set_bg: function (data, elem) {
                    if (data && data.url) {
                        methods.preload_img(data.url, 0, function (err, img_dims) {
                            var old_bg_containers = $('.bg_container');         // create a new bg_container div and remove the old one

                            if (err) {
                                return methods.get_bg(elem);
                            }

                            $bg_container = $('<div />')
                                .addClass('bg_container')
                                .height(vars.win_height)
                                .css({
                                    'background-image': 'url("' + data.url + '")',
                                    'background-position': 'top',
                                    'background-repeat': 'repeat',
                                    'height': vars.win_height
                                })
                                .data('img_dims', img_dims)
                                .prependTo($body);

                            old_bg_containers.fadeOut(1000, function () {
                                $(this).remove();
                            });
                        });

                        $keypress_detector.focus();
                    }
                },
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

                    $.xhrPool.length > 0 && $.xhrPool.abortAll();               // abort all ajax requests if any

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
                                if (options.api_url.length > 0 && is_url) {     // replace this logic with a custom function that can be passed in for each api
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
                preload_img: function (src_url, delay, callback) {
                    var err;
                    vars.loading = true;

                    $body.find('img.preloaded').remove();                       // remove this for now but in future we might keep them

                    $(new Image())                                              // load image, hide it, append to the body.
                        .hide()
                        .load(function () {                                     // images are loaded and cached ready for use
                            var img = this;

                            methods.set_status('preload_img',
                                'Loaded image dimensions: ' +
                                img.width + ' x ' + img.height);

                            var img_size = $('#img_size').val(),
                                w = vars.win_width,
                                h = vars.win_height;

                            if (img_size.indexOf('x') > 0) {
                                w = img_size.split('x')[0];
                                h = img_size.split('x')[1];
                            }
                            if (img.width  < w || img.height < h) {             // filter out small image
                                error = {
                                    func_name: 'preload_img',
                                    desc: 'image returned is too small'
                                };
                                vars.errors.push(error);
                                return callback(error);
                            }

                            setTimeout(function () {
                                var obj = {width: img.width, height: img.height, url: src_url};

                                if (!$slideshow) {
                                    $body.find('.loader').fadeOut(1000, function () {
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
                resize_window: function () {
                    var $this  = $(this);
                    vars.win_width  = $this.width();
                    vars.win_height = $this.height();

                    $bg_container.css({'height': vars.win_height});
                    $body.css({'height': vars.win_height});

                    //debug('resize_window', ['window dimensions: ' + vars.win_width + ' x ' + vars.win_height]);
                },
                update_ui: function (elem) {
                    elem && methods.get_bg(elem);
                },
                check_cache: function (url, callback) {
                    var i,
                        items = vars.cache.items,
                        len = items.length;

                    if (items.length > 0) {
                        for (i = 0; i < len; i += 1) {
                            if (url.toLowerCase() === items[i].id.toLowerCase()) {
                                return callback(i);
                            }
                        }
                    }
                    return callback(-1);
                },
                set_status: function (type, status, data) {
                    $status
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
                media_type: 'img',                                              // or colour, video
                media_collection: [],
                url_builder_func: null,                                         // build url
                json_res_func: null,                                            // pass in media coll
                interval: 5000,                                                 // 5 secs
                user_id: -1,
                rest_url: ''
            }, custom_options);

        methods.init();                                                         // initialise plugin

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