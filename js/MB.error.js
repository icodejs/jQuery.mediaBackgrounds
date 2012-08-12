
var MB = MB || {};

MB.errors = (function () {
  var errors = [];

  return {
    clear: function () {
      errors = [];
    },
    add: function (item) {
      errors.push(item);
    },
    log: function () {
      console.log(errors); // in the future this may update the status
    }
  };

});


