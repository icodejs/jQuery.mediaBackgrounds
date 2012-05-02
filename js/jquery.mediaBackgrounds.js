/**
 *
 *  Media Backgrounds by Jay Esco 2012
 *  file:///C:/Non%20Work/gitHub/jQuery.mediaBackgrounds/index.html
 *
 */

(function($, window, document, undefined) {

    $.fn.mediaBackgrounds = function (custom_options) {

        var base = this,
            $body = null,
            $bg_container = null,
            $keypress_detector = null,
            win_width = 1024,
            win_height = 1024,
            methods = {
                init: function (options) {
                    var $window = $(window);

                    win_width  = $window.width(),
                    win_height = $window.height();
                    $window.on('resize', methods.resize_window);

                    return base.each(function () {
                        $body = $(this)
                            .height(win_height)
                            .on('click', function (e) {
                                e.preventDefault();
                                $keypress_detector.focus()
                            });

                        $keypress_detector = $('<input />')
                            .attr({id: 'txtInput', type: 'text'})
                            .addClass('keypress_detector')
                            .focus()
                            .on('keypress', function (e) {
                                e.preventDefault();
                                console.log(e.which);
                                if (e.which === 32) {
                                    methods.update_ui($bg_container);
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

                    console.log(win_width + ' x ' + win_height);
                },
                get_bg: function (elem) {
                    var url = '',
                        more_results_url = '';

                    url = 'http://ajax.googleapis.com'
                        + '/ajax/services/search/images'
                        + '?v=1.0'
                        + '&q=' + methods.get_random_search_term()
                        + '&callback=?'                                                             // for jsonp
                        + '&imgsz=xxlarge|huge'                                                     // |huge (make this optional)
                        + '&as_filetype=png|jpg'
                        + '&imgtype=photo'
                        + '&rsz=8'                                                                  // max results per page
                        + '&start=' + methods.get_random_int(1, 50);

                    // loading start here
                    var $loader = $('<img />')
                        .attr('src', options.loading_image)
                        .addClass('loader')
                        .appendTo($body);

                    $.getJSON(url, function (data, textStatus) {
                        var img   = '',
                            index = 0,
                            bg    = {};

                        if (textStatus === 'success') {
                            try {
                                if (data.responseData.results && data.responseData.results.length > 0) {
                                    index = methods.get_random_int(0, data.responseData.results.length -1);
                                    img   = data.responseData.results[index];
                                    bg    = {bg_url: img.url};
                                    methods.set_bg(bg, elem);
                                }
                            } catch (e) {
                                console.log(e.toString(), e);
                                //$loader.fadeOut().remove();
                                //methods.get_bg(elem);
                            }
                        }
                    });
                },
                pre_load_img: function (src_url, elem, delay, callback) {
                    // load the background image, hide it, append to the body.
                    // that way the images is loaded and cached, ready for use.

                    $body.find('img.preloaded').remove();                                           // remove this for now but in future we might keep them

                    $(new Image())
                        .hide()
                        .load(function () {
                            console.log(this.width + 'x' + this.height);

                            if (this.width < win_width || this.height < win_height) {               // filter out small image
                                return callback({err: 'image returned is too small'});
                            }

                            setTimeout(function () {
                                $body.find('img.loader').fadeOut(500, function () {                 // remove loader image
                                    callback(null);
                                }).remove();
                            }, delay);

                        })
                        .addClass('preloaded')
                        .attr('src', src_url)
                        .prependTo('body')
                        .error(function () {
                            console.log('error occured while trying to load this image');
                            return callback({err: 'error occured while trying to load this image'});
                        }); // end JQ new Image
                },
                set_bg: function (data, elem) {
                    if (data && data.bg_url) {
                        methods.pre_load_img(data.bg_url, elem, 0, function (err) {
                            if (err) {
                                return methods.get_bg(elem);
                            }

                            var old_bg_containers = $('.bg_container');                         // create a new bg_container div and remove the old one

                            elem = $('<div />')
                                .addClass('bg_container')
                                .height(win_height)
                                .css({
                                    'background-image': 'url("' + data.bg_url + '")',
                                    'background-position': 'top',
                                    'background-repeat': 'repeat',
                                    'height': win_height
                                })
                                .prependTo($body);

                            old_bg_containers.fadeOut(1000, function () {
                                $(this).remove();
                            });
                        }); // end pre_load_img

                        $keypress_detector.focus();
                    }
                },
                update_ui: function (elem) {
                        methods.get_bg(elem);
                },
                parse_search_term: function (term) {
                    return term.split(' ').join('+');
                },
                get_random_int: function (min, max)  {
                  return Math.floor(Math.random() * (max - min + 1)) + min;
                },
                get_random_search_term: function () {
                    var index = 0,
                        st    = options.search_terms,
                        term  = '';

                    if (st.length === 1) {
                        return methods.parse_search_term(st[index]);
                    } else {
                        index = methods.get_random_int(0, st.length -1);
                        term = methods.parse_search_term(st[index]);
                        console.log('term: ', term);
                        return term;
                    }
                },
                destroy: function () {
                    return base.each(function () {
                        // ...
                    })
                }
            },
            options = $.extend({
                loading_image: 'img/loader.gif',
                search_terms: [
                    'cityscape wallpaper',
                    'forest waterfall',
                    'sky airplane photo',
                    'space wallpaper',
                    'rivers lakes',
                    'thepaperwall cityscape wallpapers'
                    ],
                media_type: 'img',                                                                  // or colour, video
                media_collection: ['#000000', '#ffffff', '#f0f'],
                media_manipulation_func: function (bmc) { },                                        // pass in media coll
                interval: 5000,                                                                     // 5 secs
                rest_url: ''
            }, custom_options);

        methods.init();
    }

}(jQuery, window, document));