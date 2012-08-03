function bindWebSiteDropdown($dd, callback) {
  if ($dd) {

    var url1 = 'http://localhost:5000/load/webPages/';
    var url2 = 'http://localhost:5000/scrape/webPage/?url=http://thepaperwall.com/wallpapers/quotes_worded/big/';

    $.ajax({
      url:  url1,
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
        console.log(data);
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