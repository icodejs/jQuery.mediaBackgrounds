function bindWebSiteDropdown($dd, callback) {
  if ($dd) {

    $.ajax({
      url:  'http://localhost:5000/load/webPages/',
      dataType: 'jsonp',
      error: function (jqXHR, textStatus, errorThrown) {
        callback({
          textStatus: textStatus,
          errorThrown: errorThrown
        });
      }
    }).done(function (data, status) {
      var options = '';
      if (status === 'success') {
        $.each(data, function(i, obj) {
          options += getTag(obj.category, 'option', 'value="' + obj.url + '"');
        });
        $dd.html(options);
      }
    });

  }
}

function getTag(input, tag, attrs) {
  t  = tag || 'p';
  return '<' + t + (attrs ? ' ' + attrs : '') + '>' + input + '</' + t + '>';
}