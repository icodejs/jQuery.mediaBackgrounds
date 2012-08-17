
var MB = MB || {};

MB.errors = (function () {
  'use strict';

  var errors = [];

  function clear() {
    errors = [];
  }

  function add(item) {
    errors.push(item);
  }

  function log() {
    console.log(errors); // in the future this may update the status
  }

  function len() {
    return errors.length;
  }

  function toString() {
    var i, len = MB.errors.len, output = '';

    for (i = 0; i < len; i += 1) {
      output += errors[i].description + '\n';
    }
    return output;
  }

  function manage() {
    // decide based on some kind of logic whether to many errors are occurring
    // this decision will determin wether to a reset or a hard reset (ui).

    if (MB.errors.len > 10) {
      MB.events.trigger('updateStatus', [{
        functionName : 'MB.error.manage',
        description  : 'Maximum error count has been exceeded.',
        errors       : MB.errors.toString(),
        elem         : MB.ui.$pe.status
      }]);

      return { pass: false };
    }
     return { pass: true };
  }

  // public API
  return {
    clear    : clear,
    add      : add,
    log      : log,
    len      : len,
    toString : toString,
    manage   : manage
  };

}());

