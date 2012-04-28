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
 *  2. use animation to fade out images / adjust opacity
 *  3. ajax / REST Api to get media from external source
 *  4. add loading image to body while the background is loading
 *
 *
 */

(function($, window, document, undefined) {

    $.fn.mediaBackgrounds = function (custom_options) {

        var base    = this,
            methods = {
                init: function (options) {
                    $(window).on('resize', methods.resize_window);
                    return base.each(function () {
                        methods.get_bg($(this));
                    });
                },
                destroy: function () {
                    return this.each(function () {

                    })
                },
                resize_window: function () {
                    console.log($(this).width() + ' x ' + $(this).height());
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
                            + '&q=' + options.search_term
                            + '&callback=?'                     // for jsonp
                            + '&imgsz=xxlarge|huge'                  // |huge
                            + '&as_filetype=png|jpg'
                            + '&imgtype=photo'
                            + '&rsz=8'                          // max results per page
                            + '&start=' + methods.get_random_int(1, 50);

                        $.getJSON(url, function (data, textStatus) {
                            var img = '',
                                index;

                            if (textStatus === 'success') {
                                try {
                                    if (data.responseData.results.length > 0) {
                                        console.log('estimatedResultCount: ', data.responseData.cursor.estimatedResultCount);
                                        console.log('results count: ', data.responseData.results.length);
                                        index = methods.get_random_int(0, data.responseData.results.length -1);
                                        img   = data.responseData.results[index];
                                        methods.set_bg({bg_url: img.url}, elem);
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
                            methods.pre_load_img(data.bg_url, elem, function () {
                                elem.css({
                                    'background-image': 'url("' + data.bg_url + '")',
                                    'background-position': 'top',
                                    'background-repeat': 'repeat'
                                }, 0);
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
                pre_load_img: function (src_url, elem, callback, delay) {
                    var image = new Image();
                    $(image).hide().load(function () {
                        // filter out small images
                        if (this.width >= 1024 && this.height >= 1024) {
                            console.log(this.width + 'x' + this.height);
                            setTimeout(function () {
                                callback();
                            }, delay);
                         } else {
                             methods.get_bg(elem);
                         }
                    })
                    .attr('src', src_url).appendTo('body')
                    .error(function () {
                        console.log('error occured while trying to load this image');
                        methods.get_bg(elem);
                    });
                }
            },
            options = $.extend({
                search_term: methods.parse_search_term('smash magazine wallpaper'),
                media_type: 'img',                                                      // or colour, video
                media_collection: ['#000000', '#ffffff', '#f0f'],
                media_manipulation_func: function (bmc) { },                            // pass in media coll
                interval: 5000,                                                         // 5 secs
                rest_url: ''
            }, custom_options);

        methods.init();
    }

}(jQuery, window, document));