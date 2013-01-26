Cross Browser Zoom and Pixel Ratio Detector
======
------

**As of January 2013 https://github.com/yonran stopped maintaining his source, and trasfered the repository to me**
**If you are looking to update previous versions note that there were some breaking chnages**


* **Major Changes form the last yonran version:**
    * `DetectZoom` object name changed to `detectZoom`
    * `DetectZoom.ratio()` is no longer publicly accesible
    * Supported browsres: IE8+, FF4+, modern Webkit, mobile Webkit, Opera 11.1+
    * *IE6, IE7, FF 3.6 and Opera 10.x are no longer supported*
    * Added support to be loaded as an AMD and CommonJS module

What is this for?
------

Detecting the browser zoom level can be used to show higher-resolution `canvas` or `img` when necessary.
Personally I'm maitaining it to use Detect-zoom in [Wix.com](http://wix.com)'s editor to warn users that their browser is in zoom mode before saving imporant changes to their wabsite.


Live Example
------

http://tombigel.github.com/detect-zoom/

Usage
------

**Detect-zoom has only two public functions:**
* `zoom()`   Returns the zoom level of the user's browser using Javascript.
* `device()`   Returns the device pixel ratio multiplied by the zoom level (Read [more about devicePixelRatio](http://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html) at QuirksMode)

```html
    <script src="detect-zoom.js"></script>
    <script>
      var zoom = detectZoom.zoom();
      var device = detectZoom.device();

      console.log(zoom, device);
    </script>
```

AMD Usage
------
```javascript
    require(['detect-zoom'], function(detectZoom){
        var zoom = detectZoom.zoom();
    });
```

Help Needed
------

***Detect-zoom is not complete,
I need help testing different browsers, patches welcome.***


License
------

Detect-zoom is dual-licensed under the [WTFPL](http://www.wtfpl.net/about/) and [MIT](http://opensource.org/licenses/MIT) license, at the recipient's choice.
