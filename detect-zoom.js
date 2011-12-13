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
    var rect = document.body.getBoundingClientRect();
    var z = (rect.right-rect.left)/document.body.offsetWidth;
    z = Math.round(z * 100) / 100;
    return {zoom: z, devicePxPerCssPx: z};
  },
  _zoomIe8: function() {
    // IE 8
    return {
      zoom: screen.systemXDPI / screen.logicalXDPI,
      devicePxPerCssPx: screen.deviceXDPI / screen.logicalXDPI
    };
  },
  _zoomWebkitMobile: function() {
    // Webkit, on mobile browser
    var z = document.documentElement.clientWidth / window.innerWidth;
    var devicePixelRatio = window.devicePixelRatio != null ? window.devicePixelRatio : 1;
    // return immediately; don't round at the end.
    return {zoom: z, devicePxPerCssPx: z*devicePixelRatio};
  },
  _zoomWebkit: function() {
    // WebKit

    // device-pixel-ratio: http://www.webkit.org/blog/55/high-dpi-web-sites/
    // Note: Webkit before http://trac.webkit.org/changeset/100847 had document.width but it's gone now!
    var devicePixelRatio = window.devicePixelRatio != null ? window.devicePixelRatio : 1;

    var div = document.createElement('div');
    div.innerHTML = "one<br>two<br>three<br>four<br>five<br>six<br>seven<br>eight<br>nine<br>ten";
    div.setAttribute('style',
      "font: 100px/1em sans-serif; -webkit-text-size-adjust:none;" +
      "visibility:hidden; position:absolute;"
    );
    document.body.appendChild(div);
    var z = 1000 / div.clientHeight;
    z = Math.round(z * 100) / 100;
    var r = {
      zoom: z,
      devicePxPerCssPx: devicePixelRatio * z
    };
    document.body.removeChild(div);
    return r;
  },
  _zoomFF35: function() {
    // FF3.5 ONLY: screen.width was in device pixels.
    var z = screen.width /
      this.mediaQueryBinarySearch('min-device-width', 'px', 0, 6000, 20, .0001);
    z = Math.round(z * 100) / 100;
    return {zoom: z, devicePxPerCssPx: z};
  },
  _zoomFF36: function() {
    // TODO: verify for every platform that a scrollbar is exactly 15px wide.
    var outerDiv = document.createElement('div');
    outerDiv.style.width = outerDiv.style.height = '500px';  // enough for all the scrollbars
    var div = outerDiv;
    for (var i = 0; i < 10; ++i) {
      var child = document.createElement('div');
      child.style.overflowY = 'scroll';
      div.appendChild(child);
      div = child;
    }
    document.body.appendChild(outerDiv);
    var outerDivWidth = outerDiv.clientWidth;
    var innerDivWidth = div.clientWidth;
    var scrollbarWidthCss = (outerDivWidth - innerDivWidth)/10;
    document.body.removeChild(outerDiv);
    var z = 15 / scrollbarWidthCss;  // scrollbars are 15px always?
    z = Math.round(z * 100) / 100;
    return {zoom: z, devicePxPerCssPx: z};
  },
  _zoomFF4: function() {
    // TODO: use mozmm vs. mm
    var z = this.mediaQueryBinarySearch(
            'min--moz-device-pixel-ratio',
            '', 0, 10, 20, .0001);
    z = Math.round(z * 100) / 100;
    return {zoom: z, devicePxPerCssPx: z};
  },
  _zoomOpera: function() {
    var fixedDiv = document.createElement('div');
    fixedDiv.style.position = 'fixed';
    fixedDiv.style.border = '5px solid blue';
    fixedDiv.style.width = '100%';
    fixedDiv.style.height = '100%';
    fixedDiv.style.top = fixedDiv.style.left = '0';
    document.body.appendChild(fixedDiv);
    var z = window.innerWidth / fixedDiv.offsetWidth;
    z = Math.round(z * 100) / 100;
    document.body.removeChild(fixedDiv);
    return {zoom: z, devicePxPerCssPx: z};
  },
  ratios: function() {
    var r;
    if (screen.logicalXDPI != null && ! isNaN(screen.logicalXDPI)) {
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
  }
};
