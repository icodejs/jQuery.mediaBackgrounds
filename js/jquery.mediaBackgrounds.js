/**
 *
 *  Media Backgrounds by Jay Esco 2012
 *  file:///C:/Non%20Work/gitHub/jQuery.mediaBackgrounds/index.html
 *
 */

(function($, window, document, undefined) {

    var helpers = (function () {
        if (typeof Array.prototype.contains  !== 'function') {                                      // stops the same image from being saved twice
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
        $.xhrPool.abortAll = function () {                                                          // stop multilpe ajax requests from running
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
            prev_req: 0,
            diff_ms: 0,
            elaps: 0
        };

        var base = this,
            $body = null,
            $bg_container = null,
            $keypress_detector = null,
            $pic_info = null,
            win_width = 1024,
            win_height = 1024,
            bg_history = [],                                                                        // history of every successfull image
            methods = {
                init: function (options) {
                    var $window = $(window);

                    win_width  = $window.width(),
                    win_height = $window.height();
                    $window.on('resize', methods.resize_window);

                    $pic_info = $('.pic_info');

                    return base.each(function () {
                        $body = $(this)
                            .height(win_height)
                            .on('click', function (e) {
                                if (e.target.id !== 'controls' && e.target.parentElement.id !== 'controls') {
                                    $keypress_detector.focus()
                                    methods.save($(this).find('.bg_container')); // change this to a button
                                }
                            });

                        $keypress_detector = $('<input />')
                            .attr({id: 'txtInput', type: 'text'})
                            .addClass('keypress_detector')
                            .focus()
                            .on('keypress', function (e) {
                                e.preventDefault();
                                if (e.which === 32) {                           // stop user from sending too many http requests
                                    var now = new Date().getTime();

                                    if (vars.prev_req === 0) {
                                        vars.prev_req = now;
                                    } else {
                                        vars.diff_ms = now - vars.prev_req;
                                        vars.elaps   = vars.diff_ms / 1000;

                                        if (vars.elaps >= 2) {
                                            vars.prev_req = now;
                                        } else {
                                            debug('init keypress time check', ['please wait', vars.elaps]);
                                            return;
                                        }
                                        methods.update_ui($bg_container);
                                    }
                                }
                            }).appendTo($body);

                        $bg_container = $('<div />')
                            .addClass('bg_container')
                            .height(win_height)
                            .hide()
                            .prependTo($body);

                        methods.get_bg($bg_container);
                    });
                },
                resize_window: function () {
                    var $this  = $(this);

                    win_width  = $this.width();
                    win_height = $this.height();

                    $bg_container.css({'height': win_height});
                    $body.css({'height': win_height});

                    debug('resize_window', ['window dimensions: ' + win_width + ' x ' + win_height]);
                },
                get_bg: function (elem) {
                    var url = '',
                        more_results_url = '',
                        query = $('#terms').val(),
                        is_url = $('#url').attr('checked');

                    $('.loader').length === 0 && $('<div />')
                        .addClass('loader')
                        .append($('<img />').attr('src', options.loading_image))
                        .appendTo($body);

                    $.xhrPool.abortAll();

                    if (options.api === 'icodejs_image_scrape' && is_url) {
                        url  = 'http://icodejs.no.de/mb/'
                        url += '?callback=?'
                        url += '&url='
                        url += (query.length > 0 ? query : 'http://thepaperwall.com/wallpapers/cityscape/big/');
                    } else {
                        url  = 'http://ajax.googleapis.com'
                        url += '/ajax/services/search/images'
                        url += '?v=1.0'
                        url += '&q=' + (query.length > 0 ? methods.parse_search_term(query) : methods.get_rnd_term())
                        url += '&callback=?'                                                        // for jsonp
                        url += '&imgsz=xlarge|xxlarge|huge'                                         // |huge (make this optional)
                        url += '&imgtype=photo'
                        url += '&rsz=8'                                                             // max results per page
                        url += '&start=' + methods.get_rnd_int(1, 50);
                    }

                    //debug('get_bg', [url]);

                    $.getJSON(url, function (data, textStatus) {
                        var img   = '',
                            index = 0,
                            bg    = {};

                        if (textStatus === 'success') {
                            try {

                                if (data.error) {
                                    debug('get_bg', data.error);
                                    //throw new Error(data.error);
                                    return;
                                }

                                var res;

                                if (options.api === 'icodejs_image_scrape' && is_url) { // replace this logic with a custom function that can be passed in for each api
                                    res = data;
                                } else {
                                    res = data.responseData.results;
                                }

                                if (res && res.length > 0) {
                                    index = methods.get_rnd_int(0, res.length -1);
                                    img   = res[index];
                                    bg    = {url: img.url};
                                    methods.set_bg(bg, elem);
                                }
                            } catch (e) {
                                debug('get_bg', e.toString(), e);
                            }
                        }
                    });
                },
                pre_load_img: function (src_url, elem, delay, callback) {
                    $body.find('img.preloaded').remove();                                           // remove this for now but in future we might keep them

                    $(new Image())                                                                  // load image, hide it, append to the body.
                        .hide()
                        .load(function () {                                                         // images are loaded and cached ready for use
                            var img = this;

                            methods.set_pic_info('pre_load_img',
                                ['loaded image dims: ' + img.width + ' x ' + img.height]);

                            if (img.width < win_width || img.height < win_height) {                 // filter out small image
                                return callback({err: 'image returned is too small'});
                            }

                            setTimeout(function () {
                                $body.find('.loader').fadeOut(1000, function () {                   // remove loader image
                                    callback(null,
                                        {
                                            width: img.width,
                                            height: img.height,
                                            url: src_url
                                        });
                                }).remove();
                            }, delay);
                        })
                        .addClass('preloaded')
                        .attr('src', src_url)
                        .prependTo('body')
                        .error(function () {
                            methods.set_pic_info('pre_load_img', ['error occured while trying to load this image']);
                            return callback({err: 'error occured while trying to load this image'});
                        }); // end JQ new Image
                },
                set_bg: function (data, elem) {
                    if (data && data.url) {
                        methods.pre_load_img(data.url, elem, 0, function (err, img_dims) {

                            if (err) {
                                return methods.get_bg(elem);
                            }

                            var old_bg_containers = $('.bg_container');                             // create a new bg_container div and remove the old one

                            $bg_container = $('<div />')
                                .addClass('bg_container')
                                .height(win_height)
                                .css({
                                    'background-image': 'url("' + data.url + '")',
                                    'background-position': 'top',
                                    'background-repeat': 'repeat',
                                    'height': win_height
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
                update_ui: function (elem) {
                    elem && methods.get_bg(elem);
                },
                parse_search_term: function (term) {
                    return term.split(' ').join('+');
                },
                get_rnd_int: function (min, max)  {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                },
                get_rnd_term: function () {
                    var index = 0,
                        st    = options.search_terms,
                        term  = '';

                    if (st.length === 1) {
                        return methods.parse_search_term(st[index]);
                    } else {
                        index = methods.get_rnd_int(0, st.length -1);
                        term = methods.parse_search_term(st[index]);

                        methods.set_pic_info('get_rnd_term', ['term: ' + term]);

                        return term;
                    }
                },
                save: function (elem) {
                    if (elem) {
                        var url = elem.data('img_dims').url;

                        if (!bg_history.contains(url, 'url')) {
                            bg_history.push(elem.data('img_dims'));
                            debug('save', ['image history has been updated!'], bg_history);             // everytime this changes the view needs to be updated
                        }
                    }
                },
                destroy: function () {
                    return base.each(function () {
                        // ...
                    })
                },
                set_pic_info: function (context, lines, data) {
                    if ($pic_info.find('li').length === 0) {
                         $pic_info.fadeIn(500);
                    } else if ($pic_info.find('li').length >= 20) {
                        $pic_info.fadeOut(500, function () {
                            $(this).html('').fadeIn(500);
                        });
                    }

                    for (var i = 0; i < lines.length; i += 1) {
                        $pic_info.append('<li>' + lines[i] + '</li>')
                    }
                    $pic_info.append('<li><hr /></li>');
                },
            },
            options = $.extend({
                api: 'google_image_search',
                loading_image: 'img/loader.gif',
                search_terms: [
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
                    'graffiti'
                    ],
                media_type: 'img',                                                                  // or colour, video
                media_collection: [],
                url_builder_func: null,                                                             // build url
                json_res_func: null,                                                                // pass in media coll
                interval: 5000,                                                                     // 5 secs
                user_id: -1,
                rest_url: ''
            }, custom_options);

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