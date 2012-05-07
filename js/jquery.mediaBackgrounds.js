/**
 *
 *  Media Backgrounds by Jay Esco 2012
 *  file:///C:/Non%20Work/gitHub/jQuery.mediaBackgrounds/index.html
 *
 */

(function($, window, document, undefined) {

    var helpers = (function () {
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
            win_height: 1024
        };

        var base = this,
            $body = null,
            $bg_container = null,
            $keypress_detector = null,
            $status = null,
            methods = {
                init: function (options) {
                    var $window = $(window);
                    vars.win_width  = $window.width(),
                    vars.win_height = $window.height();

                    $window.on('resize', methods.resize_window);
                    $status = $('.status');

                    return base.each(function () {

                        $body = $(this)
                            .height(vars.win_height)
                            .on('click', function (e) {
                                if (e.target.id !== 'controls' && e.target.parentElement.id !== 'controls') {
                                    $keypress_detector.focus();
                                    methods.save($(this).find('.bg_container')); // change this to a button
                                }
                            });

                        $keypress_detector = $('<input />')                     // hack (fix asap)
                            .attr({id: 'txtInput', type: 'text'})
                            .addClass('keypress_detector')
                            .focus()
                            .on('keypress', function (e) {
                                e.preventDefault();
                                if (e.which === 32) {                           // stop user from sending too many http requests
                                    var now = new Date().getTime();

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
                                    methods.update_ui($bg_container);
                                }
                            })
                            .appendTo($body);

                        $bg_container = $('<div />')
                            .addClass('bg_container')
                            .height(vars.win_height)
                            .hide()
                            .prependTo($body);

                        methods.get_bg($bg_container);
                    });
                },
                get_bg: function (elem) {
                    var idx    = 0,
                        bg     = {},
                        input  = $('#terms').val().toLowerCase(),
                        is_url = (input.indexOf('http://') >= 0 || input.indexOf('www') >= 0);

                    $('.loader').length === 0 && $('<div />')
                        .hide()
                        .addClass('loader')
                        .append($('<img />').attr('src', options.loading_image))
                        .appendTo($body)
                        .fadeIn();

                    methods.check_cache(input, function (i) {                   // check cache. if callback returns cached item index? Do stuff!
                        var items = vars.cache.items;

                        if (is_url && i >= 0 && items[i] && items[i].images.length > 0) {
                            var images = items[i].images;

                            idx = methods.get_rnd_int(0, images.length -1);
                            bg  = {url: images[idx].url};

                            methods.set_bg(bg, elem);
                            //console.log('using cache');
                        } else {
                            methods.get_json(is_url, input, function (err, images) {
                                if (err) {
                                    return methods.set_status('get_bg2', err);
                                }
                                if (images && images.length > 0) {
                                    idx = methods.get_rnd_int(0, images.length -1);
                                    bg  = {url: images[idx].url};
                                    methods.set_bg(bg, elem);
                                }
                                //console.log('using get json');
                            }); // end get_json
                        }
                    }); // end check_cache
                },
                set_bg: function (data, elem) {
                    if (data && data.url) {
                        methods.pre_load_img(data.url, 0, function (err, img_dims) {
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
                        }); // end pre_load_img

                        $keypress_detector.focus();
                    }
                },
                get_json: function (is_url, input, callback) {
                    if (options.api_url.length > 0 && is_url) {
                        url  = options.api_url + input;
                    } else {
                        url  = 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&callback=?&q='
                        url += (input.length > 0 ? methods.parse_search_term(input) : methods.get_rnd_term())
                        url += '&imgsz=xlarge|xxlarge|huge'                     // |huge (make this optional)
                        url += '&imgtype=photo'
                        url += '&rsz=8'                                         // max results per page
                        url += '&start=' + methods.get_rnd_int(1, 50);
                    }

                    $.xhrPool.length > 0 && $.xhrPool.abortAll();               // abort all ajax requests if any

                    $.getJSON(url, function (data, textStatus) {
                        if (textStatus === 'success') {
                            try {
                                if (data.error) {
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
                                return callback(e.toString());
                            }
                        }
                    });
                },
                pre_load_img: function (src_url, delay, callback) {
                    $body.find('img.preloaded').remove();                       // remove this for now but in future we might keep them

                    $(new Image())                                              // load image, hide it, append to the body.
                        .hide()
                        .load(function () {                                     // images are loaded and cached ready for use
                            var img = this;

                            methods.set_status('pre_load_img',
                                'loaded image dimensions: ' + img.width + ' x ' + img.height);

                            if (img.width  < vars.win_width ||
                                img.height < vars.win_height) {                 // filter out small image
                                return callback({err: 'image returned is too small'});
                            }

                            setTimeout(function () {
                                $body.find('.loader').fadeOut(1000, function () {
                                    $(this).remove();
                                    callback(null,
                                        {
                                            width: img.width,
                                            height: img.height,
                                            url: src_url
                                        });
                                });
                            }, delay);
                        })
                        .addClass('preloaded')
                        .attr('src', src_url)
                        .prependTo('body')
                        .error(function () {
                            methods.set_status('pre_load_img', 'error occured while trying to load this image');
                            return callback({err: 'error occured while trying to load this image'});
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
                save: function (elem) {
                    if (elem && elem.data('img_dims')) {
                        var url = elem.data('img_dims').url;

                        if (!vars.favorites.contains(url, 'url')) {
                            vars.favorites.push(elem.data('img_dims'));
                            methods.set_status('save', 'Current image save to favorites!', vars.favorites.length);             // everytime this changes the view needs to be updated
                        }
                    }
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
                set_status: function (func_name, status, data) {
                    $status
                        .find('li')
                            .fadeOut()
                            .end()
                        .html('')
                        .append($('<li>'
                                    + status
                                    + (func_name === 'save' ? ' <a class="button" href="#">view ' + data + ' image(s)</a>' : '')
                                + '</li>')
                        .fadeIn(1000))
                        .fadeIn();
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