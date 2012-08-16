
var MB = MB || {};

MB.common = (function () {
  'use strict';

  var vars = (function () {
    return {
      timers: {
        request: {
          prev_req    : 0,
          diff_ms     : 0,
          elaps       : 0,
          interval_id : -1
        }
      },
      favorites            : [],
      win_width            : 1024,
      win_height           : 1024,
      is_loading           : false,
      ss_mode              : false, // slideshow mode
      max_container_height : 450
    };
  }());


  // public API
  return {
    vars : vars
  };

}());