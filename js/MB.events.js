
var MB = MB || {};

MB.events = (function () {
  'use strict';

  var events = [];

  // public API
  return {
    init     : init,
    add      : add,
    bind     : bind,
    trigger  : trigger,
    keypress : keypress
  };

  function add(e) {
    events.push(e);
  }

  function bind(o) {
    events.push(o);
    o.elem.on(o.name, function(event, data) {
      o.func(data);
    });
  }

  function trigger(name, args) {
    events.forEach(function (o) {
      if (name.toLowerCase() === o.name.toLowerCase()) {
        o.elem.trigger(o.name, args);
      }
    });

  }

  function init(arr) {
    var items = arr || events;

    if (!items.length) { /*some kind of error handling */ }

    items.forEach(function (o) {
      MB.events.bind(o);
    });
  }

  function keypress(e) {
    // notes: http://www.quirksmode.org/js/keys.html
    e.preventDefault();
    var keycode = e.keyCode || e.which;
    return function(elem) {
      if (!MB.common.vars.ss_mode) {
        switch (keycode) {
        case 32  : pressSpacebar(elem); break;
        case 102 : pressF(); break;
        case 115 : pressS(); break;
        case 104 : pressH(); break;
        case 101 : pressE(); break;
        case 116 : pressT(); break;
        default:
        //do nothing
        }
      }
    };
  }

  function pressSpacebar(elem) {
    var now = new Date().getTime();

    // stop user from sending too many http requests
    if (MB.common.vars.timers.request.prev_req === 0) {
      MB.common.vars.timers.request.prev_req = now;
    } else {
      MB.common.vars.timers.request.diff_ms = now - MB.common.vars.timers.request.prev_req;
      MB.common.vars.timers.request.elaps   = MB.common.vars.timers.request.diff_ms / 1000;

      if (MB.common.vars.timers.request.elaps >= 2) {
        MB.common.vars.timers.request.prev_req = now;
      } else {
        return;
      }
    }
    MB.ui.update_ui(elem);
  }

  function pressF() {
    MB.interaction.add_favorite(MB.ui.$pe.bg_container);
  }

  function pressS() {
    MB.interaction.save(MB.ui.$pe.bg_container);
  }

  function pressT() {
    MB.interaction.tweet(MB.ui.$pe.bg_container);
  }

  function pressE() {
    MB.interaction.email(MB.ui.$pe.bg_container);
  }

  function pressH() {
    MB.interaction.help(MB.ui.$pe.bg_container);
  }

}());

