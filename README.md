Javascript Zoom Detector
======
**Forked from https://github.com/yonran/detect-zoom**  
**As of January 2013 [yornran](https://github.com/yonran) stopped supporting his source, so this is the maintained repository now**

_Major chnages from the opriginal code:_
* I removed support for old browsers and cleaned up the original code.
* Supported browsres: IE8+, FF4+, modern Webkit, mobile Webkit, Opera 11.1+
* Added AMD and CommonJS support ("require" and "exports") 

Detect Zoom has two external functions, zoom() and device()

**zoom()**      Returns the zoom level of the user's browser using Javascript.  
**device()**    Returns the device pixel ratio (Read [more about devicePixelRatio](http://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html) at QuirksMode)

This can be used to show higher-resolution `canvas` or `img` when necessary.  
I'm maitaining it to use DetectZoom in [Wix.com](http://wix.com)'s editor to warn users that their browser is in zoom mode before saving imporant changes to their wabsite.

*It is not complete; I need help testing different browsers. Patches welcome.*


Usage
------
```javascript
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

Examples 
------
*(Soon, working on my github page now)*
<!--
 [Demo](http://tombigel.github.com/detect-zoom/test-page.html) 
 [Dimensions test](http://tombigel.github.com/detect-zoom/tools/dimensions.html)
-->

License
------
Detect-zoom is dual-licensed under the WTFPL and MIT license, at the recipient's choice.
