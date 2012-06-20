Javascript Zoom Detector
======

Detect the zoom level of the user's browser using Javascript. This can be used to show higher-resolution `canvas` or `img` when necessary.

It may not be complete; I need help testing different browsers. Patches welcome.

Usage:

    <script src=detect-zoom.js></script>
    <script>
      var zoom = DetectZoom.zoom();
      
      console.log(zoom);
    </script>

[Demo](http://yonran.github.com/detect-zoom/test-page.html)

[Dimensions test](http://yonran.github.com/detect-zoom/tools/dimensions.html)

License
------
Detect-zoom is dual-licensed under the WTFPL and MIT license, at the recipient's choice.
