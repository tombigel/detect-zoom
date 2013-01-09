// detect-zoom is dual-licensed under the WTFPL and MIT license,
// at the recipient's choice.
// https://github.com/yonran/detect-zoom/
var DetectZoom = (function(){
    var mediaQueryBinarySearch = function(property, unit, a, b, maxIter, epsilon){
        var matchMedia;
        var head, style, div;
        if (window.matchMedia){
            matchMedia = window.matchMedia;
        } else {
            head = document.getElementsByTagName('head')[0];
            style = document.createElement('style');
            head.appendChild(style);

            div = document.createElement('div');
            div.className = 'mediaQueryBinarySearch';
            div.style.display = 'none';
            document.body.appendChild(div);

            matchMedia = function(query){
                style.sheet.insertRule('@media ' + query + '{.mediaQueryBinarySearch ' + '{text-decoration: underline} }', 0);
                var matched = getComputedStyle(div, null).textDecoration == 'underline';
                style.sheet.deleteRule(0);
                return {matches: matched};
            };
        }
        var r = binarySearch(a, b, maxIter);
        if (div){
            head.removeChild(style);
            document.body.removeChild(div);
        }
        return r;

        function binarySearch(a, b, maxIter){
            var mid = (a + b) / 2;
            if (maxIter <= 0 || b - a < epsilon){
                return mid;
            }
            var query = "(" + property + ":" + mid + unit + ")";
            if (matchMedia(query).matches){
                return binarySearch(mid, b, maxIter - 1);
            } else {
                return binarySearch(a, mid, maxIter - 1);
            }
        }
    };

    /**
     * IE 8+: no trick needed!
     * (which didn't even have whole-page zoom).
     * @return {Object}
     * @private
     **/
    var ie8 = function(){
        var zoom = screen.deviceXDPI / screen.logicalXDPI;
        return {
            zoom            : zoom,
            devicePxPerCssPx: zoom
        };
    };

    /**
     * Mobile WebKit
     * the trick: window.innerWIdth is in CSS pixels, while
     * screen.width and screen.height are in system pixels.
     * And there are no scrollbars to mess up the measurement.
     * @return {Object}
     * @private
     */
    var webkitMobile = function(){
        var devicePixelRatio = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
        var deviceWidth = (Math.abs(window.orientation) == 90) ? screen.height : screen.width;
        var z = deviceWidth / window.innerWidth;
        // return immediately; don't round at the end.
        return {
            zoom            : z,
            devicePxPerCssPx: z * devicePixelRatio
        };
    };

    /**
     * the trick: an element's clientHeight is in CSS pixels, while you can
     * set its line-height in system pixels using font-size and
     * -webkit-text-size-adjust:none.
     * device-pixel-ratio: http://www.webkit.org/blog/55/high-dpi-web-sites/
     *
     * Previous trick (used before http://trac.webkit.org/changeset/100847):
     * documentElement.scrollWidth is in CSS pixels, while
     * document.width was in system pixels. Note that this is the
     * layout width of the document, which is slightly different from viewport
     * because document width does not include scrollbars and might be wider
     * due to big elements.
     * @return {Object}
     * @private
     */
    var webkit = function(){
        var devicePixelRatio = (window.devicePixelRatio) ? window.devicePixelRatio : 1;

        var important = function(str){
            return str.replace(/;/g, " !important;");
        };

        var div = document.createElement('div');
            div.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0";
            div.setAttribute('style', important('font: 100px/1em sans-serif; -webkit-text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;'));

        // The container exists so that the div will be laid out in its own flow
        // while not impacting the layout, viewport size, or display of the
        // webpage as a whole.
        // Add !important and relevant CSS rule resets
        // so that other rules cannot affect the results.
        var container = document.createElement('div');
            container.setAttribute('style', important('width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;'));
            container.appendChild(div);

        document.body.appendChild(container);
        var z = 1000 / div.clientHeight;
            z = Math.round(z * 100) / 100;
        document.body.removeChild(container);

        return{
            zoom            : z,
            devicePxPerCssPx: devicePixelRatio * z
        };
    };

    /**
     * no real trick; device-pixel-ratio is the ratio of device dpi / css dpi.
     * (Note that this is a different interpretation than Webkit's device
     * pixel ratio, which is the ratio device dpi / system dpi).
     * TODO: is mozmm vs. mm promising?
     * @return {Object}
     * @private
     */
    var firefox4 = function(){
        var z = mediaQueryBinarySearch('min--moz-device-pixel-ratio', '', 0, 10, 20, 0.0001);
        z = Math.round(z * 100) / 100;
        return {
            zoom            : z,
            devicePxPerCssPx: z
        };
    };

    /**
     * works starting Opera 11.11
     * the trick: outerWidth is the viewport width including scrollbars in
     * system px, while innerWidth is the viewport width including scrollbars
     * in CSS px;
     * @return {Object}
     * @private
     */
    var opera11 = function(){
        var z = window.outerWidth / window.innerWidth;
        z = Math.round(z * 100) / 100;
        return {
            zoom            : z,
            devicePxPerCssPx: z
        };
    };

    var ratios = function(){
        var ratio = {
            zoom            : 1,
            devicePxPerCssPx: 1
        };

        //IE8+
        if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)){
            ratio = ie8();

        //Mobile Webkit
        } else if ('ontouchstart' in window && typeof document.body.style.webkitTextSizeAdjust === 'string'){
            ratio = webkitMobile();

        //WebKit
        } else if (typeof document.body.style.webkitTextSizeAdjust === 'string'){
            ratio = webkit();

        //Opera
        } else if (navigator.userAgent.indexOf('Opera') >= 0){
            ratio = opera11();

        //Last one is Firefox
        } else if (firefox4().zoom > 0.001){
            ratio = firefox4();

        }

        return ratio;
    };

    return ({

        /**
         * Ratios.zoom shorthand
         * @return {Number} Zoom level
         */
        zoom: function(){
            return ratios().zoom;
        },

        /**
         * Ratios.devicePxPerCssPx shorthand
         * @return {Number} devicePxPerCssPx level
         */
        device: function(){
            return ratios().devicePxPerCssPx;
        }
    });
}());