Media Backgrounds
==================

An experimental JavaScript web app that pull background images from a Google images API or crapes wallpaper sites via Node.js (currently broken) and presents the images in a sideshow format.

This is a work in progress and is currently undergoing a major overhaul, so 'Star' this Github repository if you'd like to receive notifications on future updates.

## Basic Setup

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="js/libs/jquery-1.7.1.min.js"><\/script>')</script>
<script src="js/libs/jquery.easing.1.3.js"></script>
<script src="js/libs/store.min.js"></script>
<script src="js/MB.common.js"></script>
<script src="js/MB.data.js"></script>
<script src="js/MB.utils.js"></script>
<script src="js/MB.setup.js"></script>
<script src="js/MB.interaction.js"></script>
<script src="js/MB.ui.js"></script>
<script src="js/MB.events.js"></script>
<script src="js/MB.error.js"></script>
<script src="js/MB.app.js"></script>
<script>
  $(function () {
    MB.app.init();
  });
</script>
```

## Demo Screenshot

<img src="https://raw.github.com/icodejs/jQuery.mediaBackgrounds/master/img/screenshot.png"/>