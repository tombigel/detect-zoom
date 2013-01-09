Javascript Zoom Detector
======
**Forked from https://github.com/yonran/detect-zoom

Detect the zoom level of the user's browser using Javascript. This can be used to show higher-resolution `canvas` or `img` when necessary.

It may not be complete; I need help testing different browsers. Patches welcome.

I removed support for old browsers and cleaned up the original code.

Usage
------
    <script src=detect-zoom.js></script>
    <script>
      var zoom = DetectZoom.zoom();
      var device = DetectZoom.device(); // Device pixel ratio

      console.log(zoom, device);
    </script>

Examples
------
[Demo](http://tombigel.github.com/detect-zoom/test-page.html)

[Dimensions test](http://tombigel.github.com/detect-zoom/tools/dimensions.html)

------
Detect-zoom is dual-licensed under the WTFPL and MIT license, at the recipient's choice.
