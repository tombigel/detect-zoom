// BSD.
// https://github.com/yonran/detect-zoom/

var DetectZoom = {
  mediaQueryBinarySearch: function(
      property, unit, a, b, maxIter, epsilon) {
    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    var div = document.createElement('div');
    div.className = 'mediaQueryBinarySearch';
    head.appendChild(style);
    div.style.display = 'none';
    document.body.appendChild(div);
    var r = binarySearch(a, b, maxIter);
    head.removeChild(style);
    document.body.removeChild(div);
    return r;

    function binarySearch(a, b, maxIter) {
      var mid = (a + b)/2;
      if (maxIter == 0 || b - a < epsilon) return mid;
      if (mediaQueryMatches(mid + unit)) {
        return binarySearch(mid, b, maxIter-1);
      } else {
        return binarySearch(a, mid, maxIter-1);
      }
    }
    function mediaQueryMatches(r) {
      style.sheet.insertRule('@media (' + property + ':' + r +
                             ') {.mediaQueryBinarySearch ' +
                             '{text-decoration: underline} }', 0);
      var matched = getComputedStyle(div, null).textDecoration
          == 'underline';
      style.sheet.deleteRule(0);
      return matched;
    }
  },
  _zoomIe7: function() {
    // the trick: body's offsetWidth was in CSS pixels, while
    // getBoundingClientRect() was in system pixels in IE7.
    // Thanks to http://help.dottoro.com/ljgshbne.php
    var rect = document.body.getBoundingClientRect();
    var z = (rect.right-rect.left)/document.body.offsetWidth;
    z = Math.round(z * 100) / 100;
    return {zoom: z, devicePxPerCssPx: z};
  },
  _zoomIe8: function() {
    // IE 8+: no trick needed!
    // TODO: MSDN says that logicalXDPI and deviceXDPI existed since IE6
    // (which didn't even have whole-page zoom). Check to see whether
    // this method would also work in IE7.
    return {
      zoom: screen.systemXDPI / screen.logicalXDPI,
      devicePxPerCssPx: screen.deviceXDPI / screen.logicalXDPI
    };
  },
  _zoomWebkitMobile: function() {
    // the trick: window.innerWIdth is in CSS pixels, while
    // documentElement.clientWidth is in system pixels.
    // And there are no scrollbars to mess up the measurement.
    var z = document.documentElement.clientWidth / window.innerWidth;
    var devicePixelRatio = window.devicePixelRatio != null ? window.devicePixelRatio : 1;
    // return immediately; don't round at the end.
    return {zoom: z, devicePxPerCssPx: z*devicePixelRatio};
  },
  _zoomWebkit: function() {
    // the trick: an element's clientHeight is in CSS pixels, while you can
    // set its line-height in system pixels using font-size and
    // -webkit-text-size-adjust:none.
    // device-pixel-ratio: http://www.webkit.org/blog/55/high-dpi-web-sites/

    // Previous trick (used before http://trac.webkit.org/changeset/100847):
    // documentElement.scrollWidth is in CSS pixels, while
    // document.width was in system pixels. Note that this is the
    // layout width of the document, which is slightly different from viewport
    // because document width does not include scrollbars and might be wider
    // due to big elements.

    var devicePixelRatio = window.devicePixelRatio != null ? window.devicePixelRatio : 1;

    // The container exists so that the div will be laid out in its own flow
    // while not impacting the layout, viewport size, or display of the
    // webpage as a whole.
    var container = document.createElement('div')
      , div = document.createElement('div');
    
    // Add !important and relevant CSS rule resets
    // so that other rules cannot affect the results.
    var important = function(str){ return str.replace(/;/g, " !important;"); };
    
    container.setAttribute('style', important('width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;'));
    div.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0";
    div.setAttribute('style', important('font: 100px/1em sans-serif; -webkit-text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;'));
    
    container.appendChild(div);
    document.body.appendChild(container);
    var z = 1000 / div.clientHeight;
    z = Math.round(z * 100) / 100;
    var r = {
      zoom: z,
      devicePxPerCssPx: devicePixelRatio * z
    };
    document.body.removeChild(container);
    return r;
  },
  _zoomFF35: function() {
    // the trick for FF3.5 ONLY: device-width gives CSS pixels, while
    // screen.width gave system pixels. Thanks to QuirksMode's widths table,
    // which called it a bug. http://www.quirksmode.org/m/widths.html
    var z = screen.width /
      this.mediaQueryBinarySearch('min-device-width', 'px', 0, 6000, 20, .0001);
    z = Math.round(z * 100) / 100;
    return {zoom: z, devicePxPerCssPx: z};
  },
  _zoomFF36: function() {
    // the hack for FF3.6: you can measure scrollbar's width in CSS pixels,
    // while in system pixels it's 15px (verified in Ubuntu).

    // TODO: verify for every platform that a scrollbar is exactly 15px wide.
    var container = document.createElement('div')
      , outerDiv = document.createElement('div');
    // The container exists so that the div will be laid out in its own flow
    // while not impacting the layout, viewport size, or display of the
    // webpage as a whole.
    container.setAttribute('style', 'width:0; height:0; overflow:hidden;' +
        'visibility:hidden; position: absolute');
    outerDiv.style.width = outerDiv.style.height = '500px';  // enough for all the scrollbars
    var div = outerDiv;
    for (var i = 0; i < 10; ++i) {
      var child = document.createElement('div');
      child.style.overflowY = 'scroll';
      div.appendChild(child);
      div = child;
    }
    container.appendChild(outerDiv);
    document.body.appendChild(container);
    var outerDivWidth = outerDiv.clientWidth;
    var innerDivWidth = div.clientWidth;
    var scrollbarWidthCss = (outerDivWidth - innerDivWidth)/10;
    document.body.removeChild(container);
    var scrollbarWitdth = 15;
    if (-1 != navigator.platform.indexOf('Win')){
      scrollbarWitdth = 17;
    }
    var z = scrollbarWitdth / scrollbarWidthCss;  // scrollbars are 15px always?
    z = Math.round(z * 100) / 100;
    return {zoom: z, devicePxPerCssPx: z};
  },
  _zoomFF4: function() {
    // no real trick; device-pixel-ratio is the ratio of device dpi / css dpi.
    // (Note that this is a different interpretation than Webkit's device
    // pixel ratio, which is the ratio device dpi / system dpi).
    // TODO: is mozmm vs. mm promising?
    var z = this.mediaQueryBinarySearch(
            'min--moz-device-pixel-ratio',
            '', 0, 10, 20, .0001);
    z = Math.round(z * 100) / 100;
    return {zoom: z, devicePxPerCssPx: z};
  },
  _zoomOpera: function() {
    // the trick: a div with position:fixed;width:100%'s offsetWidth is the
    // viewport width in CSS pixels, while window.innerWidth was in system
    // pixels. Thanks to:
    // http://virtuelvis.com/2005/05/how-to-detect-zoom-level-in-opera/
    //
    // Unfortunately, this failed sometime in 2011; newer Opera always returns 1.
    // TODO: find a trick for new Opera versions.
    var fixedDiv = document.createElement('div');
    fixedDiv.style.position = 'fixed';
    fixedDiv.style.border = '5px solid blue';
    fixedDiv.style.width = '100%';
    fixedDiv.style.height = '100%';
    fixedDiv.style.top = fixedDiv.style.left = '0';
    fixedDiv.style.visibility = 'hidden';
    document.body.appendChild(fixedDiv);
    var z = window.innerWidth / fixedDiv.offsetWidth;
    z = Math.round(z * 100) / 100;
    document.body.removeChild(fixedDiv);
    return {zoom: z, devicePxPerCssPx: z};
  },
  ratios: function() {
    var r;
    if (! isNaN(screen.logicalXDPI) && ! isNaN(screen.systemXDPI) ) {
      return this._zoomIe8();
    } else if ('ontouchstart' in window && document.body.style.webkitTextSizeAdjust != null) {
      return this._zoomWebkitMobile();
    } else if (document.body.style.webkitTextSizeAdjust != null) {  // webkit
      return this._zoomWebkit();
    } else if (-1 != navigator.userAgent.indexOf('Firefox/3.5')) {
      return this._zoomFF35();
    } else if (-1 != navigator.userAgent.indexOf('Firefox/3.6')) {
      return this._zoomFF36();
    } else if (-1 != navigator.appVersion.indexOf("MSIE 7.")) {
      return this._zoomIe7();
    } else if (-1 != navigator.userAgent.indexOf('Opera')) {
      return this._zoomOpera();
    } else if (0.001 < (r = this._zoomFF4()).zoom) {
      return r;
    } else {
      return {zoom: 1, devicePxPerCssPx: 1}
    }
  },
  zoom: function() {
    return this.ratios().zoom;
  },
  device: function() {
    return this.ratios().devicePxPerCssPx;
  },
  isZoomed: function() {
      var r = this.ratios();
      if (r.zoom !== 1) {
          return true;
      }
      if (r.zoom !== r.devicePxPerCssPx) {
          return true;
      }
      return false;
  }
};
