
var MB = MB || {};

MB.errors = (function () {
  "use strict";
  var errors = [];

  // public API
  return {
    clear    : clear,
    add      : add,
    log      : log,
    len      : len,
    toString : toString
  };

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
    var i, len = this.len, output = '';

    for (i = 0; i < len; i += 1) {
      output += errors[i].description + '\n';
    }
    return output;
  }

}());

