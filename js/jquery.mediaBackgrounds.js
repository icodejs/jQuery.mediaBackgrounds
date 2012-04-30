/**
 *
 * Demo URL: http://seo-stats-demo.datadial.net/test/tj/background/
 *
 *  This plugin will take a media type (colour, img, video).
 *  - Images: collection of URLs
 *  - Colour: hex values
 *  - Video: object with video type (youtube, vimeo) and url
 *
 *  The plugin will allow the user to pass in a REST url so that media can be
 *  pulled in via ajax.
 *
 *  e.g.: https://developers.google.com/image-search/v1/jsondevguide#json_reference
 *
 *  The media manipulation will allow you to load in tweak the returned html for
 *  for the videos like, remove chrome.
 *
 *  Must also detect the resizing of the browser.
 *
 *  The background may have to be an absolutely positioned div with a z-index
 *  that allows it to sit behind everything else on the page.
 *
 *  It will be possible to pass in a function that will take the returned
 *  JSON and return JSON that the plugin can use.
 *
 *  Also consider using an absolutly positioned div with 100% height and width
 *  The set the background of that and set z-index so that is sits at the back
 *
 *  Notes
 *  ----------------------------
 *  1. setInterval based on interval
 *  2. use animation to fade out images / adjust opacity (use inserted div)
 *  3. ajax / REST Api to get media from external source
 *  4. add ability to save favourite images to counchdb (use REST) (add mouseover hover button).
       saved images will appear in a list running down the side of the page.
 *  5. put the images from this page into couch: http://thepaperwall.com/wallpapers/cityscape/big/
 *  6. add more user feedback similar to what you see in the chrome network consle. users need to
       know what is going on while they are waiting
 */

(function($, window, document, undefined) {

    $.fn.mediaBackgrounds = function (custom_options) {

        var base    = this,
            win_width  = 1024,
            win_height = 1024,
            methods = {
                init: function (options) {
                    var $window = $(window);

                    win_width  = $window.width(),
                    win_height = $window.height();

                    $window.on('resize', methods.resize_window);

                    return base.each(function () {
                        methods.get_bg($(this));
                    });
                },
                destroy: function () {
                    return base.each(function () {
                        // ...
                    })
                },
                resize_window: function () {
                    var $this  = $(this);

                    win_width  = $this.width(),
                    win_height = $this.height();

                    console.log(win_width + ' x ' + win_height);

                    return base.each(function () {
                        $(this).css({'height': win_height});
                    });
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
                                    'height': $(window).height()
                                });
                            });
                        }
                    }
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
                        .appendTo(elem);

                    // load the background image, hide it, append to the body.
                    // that way the images is loaded and cached, ready for use.

                    $(new Image())
                        .hide()
                        .load(function () {
                            if (this.width >= win_width && this.height >= win_height) { // filter out small image
                                console.log(this.width + 'x' + this.height);
                                setTimeout(function () {
                                    elem.find('img').fadeOut(500, function () { // remove loader image
                                        callback();
                                    }).remove();
                                }, delay);
                             } else {
                                 methods.get_bg(elem);
                             }
                        })
                        .attr('src', src_url)
                        .appendTo('body')
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