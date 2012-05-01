/**
 *
 *  Media Backgrounds by Jay Esco 2012
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

                    win_width  = $this.width(),
                    win_height = $this.height();

                    console.log(win_width + ' x ' + win_height);
                    console.log($bg_container);

                    $bg_container.css({'height': win_height});
                    $body.css({'height': win_height});
                },
                get_bg: function (elem) {
                    var url = '',
                        more_results_url = '';

                    if (options.media_type === 'colour') {

                    } else if (options.media_type === 'video') {

                    } else if (options.media_type === 'img') {
                        url = 'http://ajax.googleapis.com'
                            + '/ajax/services/search/images'
                            + '?v=1.0'
                            + '&q=' + methods.get_random_search_term()
                            + '&callback=?'                                 // for jsonp
                            + '&imgsz=xxlarge|huge'                         // |huge (make this optional)
                            + '&as_filetype=png|jpg'
                            + '&imgtype=photo'
                            + '&rsz=8'                                      // max results per page
                            + '&start=' + methods.get_random_int(1, 50);

                        $.getJSON(url, function (data, textStatus) {
                            var img = '',
                                index,
                                bg = {};

                            if (textStatus === 'success') {
                                try {
                                    if (data.responseData.results.length > 0) {
                                        index = methods.get_random_int(0, data.responseData.results.length -1);
                                        img   = data.responseData.results[index];

                                        bg = {bg_url: img.url};
                                        methods.set_bg(bg, elem);
                                    }
                                } catch (e) {
                                    console.log(e.toString(), e);
                                    methods.get_bg(elem);
                                }
                            }
                        });
                    }
                },
                set_bg: function (data, elem) {
                    if (options.media_type === 'colour') {

                    } else if (options.media_type === 'video') {

                    } else { // media_type === img
                        if (data && data.bg_url) {
                            methods.pre_load_img(data.bg_url, elem, 0, function () {
                                elem.css({
                                    'background-image': 'url("' + data.bg_url + '")',
                                    'background-position': 'top',
                                    'background-repeat': 'repeat',
                                    'height': win_height
                                }).fadeIn(500);
                            });
                            $keypress_detector.focus();
                        }
                    }
                },
                update_ui: function (elem) {


                    elem.fadeOut(500, function () {
                        methods.get_bg(elem);
                    });

                },
                parse_search_term: function (term) {
                    return term.split(' ').join('+');
                },
                get_random_int: function (min, max)  {
                  return Math.floor(Math.random() * (max - min + 1)) + min;
                },
                pre_load_img: function (src_url, elem, delay, callback) {
                    $('<img />')
                        .attr('src', options.loading_image)
                        .addClass('loader')
                        .appendTo($body);

                    // load the background image, hide it, append to the body.
                    // that way the images is loaded and cached, ready for use.

                    $(new Image())
                        .hide()
                        .load(function () {
                            if (this.width >= win_width && this.height >= win_height) { // filter out small image
                                console.log(this.width + 'x' + this.height);
                                setTimeout(function () {
                                    $body.find('img.loader').fadeOut(500, function () { // remove loader image
                                        callback();
                                    }).remove();
                                }, delay);
                             } else {
                                 methods.get_bg(elem);
                             }
                        })
                        .attr('src', src_url)
                        .prependTo('body')
                        .error(function () {
                            console.log('error occured while trying to load this image');
                            methods.get_bg(elem);
                        });
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
                search_terms: ['cityscape wallpaper', 'forest waterfall', 'sky airplane photo', 'space wallpaper', 'rivers lakes', 'thepaperwall cityscape wallpapers'],
                media_type: 'img',                                                      // or colour, video
                media_collection: ['#000000', '#ffffff', '#f0f'],
                media_manipulation_func: function (bmc) { },                            // pass in media coll
                interval: 5000,                                                         // 5 secs
                rest_url: ''
            }, custom_options);

        methods.init();
    }

}(jQuery, window, document));