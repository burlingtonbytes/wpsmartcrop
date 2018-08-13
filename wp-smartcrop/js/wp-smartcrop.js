function wpsmartcrop( element, options ) {
    if( !element ) {
        return;
    }
    if( !options ) options = {};

    var defaults = {
        // array of percentages [x, y] denoting the position
        // of the focal point in the image (example: [16, 78])
        'focal_point'   : null,
        // set to 'new' to force "objectFit" mode or
        // set to 'old' to force "overflow: hidden" mode
        'compatibility' : null,
    };
    options = smartcrop_merge( options, defaults );



    // localized version of a request animation frame polyfill by paul irish
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    var requestFrame = window.requestAnimationFrame;
    var cancelFrame = window.cancelAnimationFrame;
    for(var x = 0; x < vendors.length && !requestFrame; ++x) {
        requestFrame = window[vendors[x]+'RequestAnimationFrame'];
        cancelFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
    if (!requestFrame) {
        requestFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!cancelFrame) {
        cancelFrame = function(id) {
            clearTimeout(id);
        };
    }
    // END requestAnimationFrame polyfill


    // check if the browser supports objectfit
    var browser_supports_object_fit = (function() { // immediately invoked
        var div = document.createElement("div");
        if( "objectFit" in div.style && "objectPosition" in div.style ) {
            return true;
        }
        if( "OobjectFit" in div.style && "OobjectPosition" in div.style ) {
            return true;
        }
        return false;
    })();
    // get the closest value in an array to a specific number
    function closest( num, arr ) {
        var curr = arr[0];
        var diff = Math.abs( num - curr );
        for( var val = 0; val < arr.length; val++ ) {
            var newdiff = Math.abs( num - arr[val] );
            if( newdiff < diff ) {
                diff = newdiff;
                curr = arr[val];
            }
        }
        return curr;
    }
    // calculating the dimensions of a proportional image that
    // will cover the target used for overflow:hidden mode
    function get_final_image_dims( natural_dims, target_dims ) {
        var natural_ratio = natural_dims[0]/natural_dims[1];
        var target_ratio  = target_dims[0]/target_dims[1];
        if( natural_ratio > target_ratio ) {
            return [
                Math.round(target_dims[1] * natural_ratio),
                target_dims[1]
            ];
        }
        return [
            target_dims[0],
            Math.round(target_dims[0] / natural_ratio)
        ];
    }


    // get dimensions to crop element to put the focus as close to a rule of
    // thirds line, or the center, as possible
    function get_crop_data( el ) {

        var get_smartcrop_offset = function(dim, orig_dim, focus_pos) {
            var power_lines = [.33333, .5, .66667];
            focus_pos = focus_pos / 100;
            var focus_target = closest(focus_pos, power_lines);
            var offset = Math.round(focus_pos * orig_dim - focus_target * dim);
            var max = orig_dim - dim;
            if(offset > max) {
                offset = max;
            }
            if(offset < 0) {
                offset = 0;
            }
            return -1 * offset;
        }

        var focal_point = JSON.parse(el.getAttribute('data-smartcrop-focus'));
        if(!focal_point) {
            console.log('Eror: data-smartcrop-focus attribute not read by JSON.parse()');
            focal_point = [50, 50];
        }

        var natural_dims = [
            ( el.naturalWidth  ) ? el.naturalWidth  : el.getAttribute('width'),
            ( el.naturalHeight ) ? el.naturalHeight : el.getAttribute('height')
        ];

        var target_dims  = [
            el.offsetWidth,
            el.offsetHeight
        ];

        if( !focal_point || focal_point.length < 2 ||
            !natural_dims[0] || !natural_dims[1] ||
            !target_dims[0] || !target_dims[1] ) {
            return false;
        }
        var final_dims = get_final_image_dims( natural_dims, target_dims );
        var offsets = [0,0]
        if( target_dims[0]/target_dims[1] < final_dims[0]/final_dims[1] ) {
            offsets[0] = get_smartcrop_offset(target_dims[0], final_dims[0], focal_point[0]);
        } else {
            offsets[1] = get_smartcrop_offset(target_dims[1], final_dims[1], focal_point[1]);
        }
        return {
            final_width  : final_dims[0],
            final_height : final_dims[1],
            offset_x     : offsets[0],
            offset_y     : offsets[1]
        };
    }

    function recrop_images( el, use_object_fit ) {

        var crop = get_crop_data(el);

        // for browsers that support object-position and object-fit
        if( use_object_fit ) {
            var position_val = '' + crop.offset_x + 'px ' + '' + crop.offset_y + 'px';

            el.style.objectPosition = position_val;
            el.style.oObjectPosition = position_val;
            el.classList.add('wpsmartcrop-rendered');

        } else {

            // Need to test this in a browse where that does not support object-fit

            var img_pos = {
                top: el.offsetTop,
                left: el.offsetLeft
            }

            var overlay = el.nextSibling();
            if(overlay && overlay.classList.contains('wpsmartcrop-overlay')) {
                var overlayStyles = {
                    'width' : el.offsetWidth + 'px',
                    'height': el.offsetHeight + 'px',
                    'top'   : img_pos.top + 'px',
                    'left'  : img_pos.left + 'px',
                };
                overlay = set_object_styles( overlay, overlayStyles );

                var overlay_img = overlay.querySelector('img');
                if(overlay_img) {
                    var overlay_imgStyles = {
                        'width' : crop.final_width  + 'px',
                        'height': crop.final_height + 'px',
                        'top'   : crop.offset_y     + 'px',
                        'left'  : crop.offset_x     + 'px',
                    };
                    overlay_img = set_object_styles( overlay_img, overlay_imgStyles );
                }
                overlay.classList.add('wpsmartcrop-overlay-rendered');
            }
        }
    }



    for(var i = 0; i < element.length; i++) {
        var this_img = element[i];
        // console.log(this_img);
        if(this_img.nodeName != 'IMG') {
            continue;
        }

        var natural_dims = [
            ( this_img.naturalWidth  ) ? this_img.naturalWidth  : this_img.getAttribute('width'),
            ( this_img.naturalHeight ) ? this_img.naturalHeight : this_img.getAttribute('height')
        ];

        if( natural_dims[0] == 0 || natural_dims[1] == 0 ) {
            continue;
        }

        this_img.setAttribute('data-wpsmartcrop-natural-dims', natural_dims);

        var next = this_img.nextSibling;
        if(next && next.classList && next.classList.contains('wpsmartcrop-overlay')) {
            next.parentNode.removeChild(next);
        }

        if( options['focal_point'] ) {
            this_img.setAttribute('data-smartcrop-focus', options['focal_point']);

        } else {

            if( !this_img.hasAttribute('data-smartcrop-focus') ) {
                this_img.setAttribute('data-smartcrop-focus', [50, 50]);
            }
        }

        // decide whether the browser supports objectFit, or just force one mode in options
        var use_object_fit = true;

        if( options['compatibility'] != 'new' ) {
            if( ( options['compatibility'] == 'old' ) || !browser_supports_object_fit ) {
                use_object_fit = false;

                var clone = this_img.cloneNode(true);
                clone.classList.remove('wpsmartcrop-image');
                clone.removeAttribute('data-smartcrop-focus');

                var image_overlay = document.createElement('div');
                image_overlay.classList.add('wpsmartcrop-overlay');
                image_overlay.appendChild(clone);
                this_img.parentNode.insertBefore(image_overlay, this_img.nextSibling);
            }
        }

        var el = this_img
        recrop_images( el, use_object_fit);
        var resizer_frame_request = false;

        window.addEventListener('resize', function() {
            cancelFrame( resizer_frame_request );
            resizer_frame_request = requestFrame(function() {
                recrop_images( el, use_object_fit);
            });
        });

        window.addEventListener('load', function() {
            recrop_images( el, use_object_fit );
        });

        this_img.addEventListener('wpsmartcrop-redraw', function () {
            recrop_images( el, use_object_fit);
        });
    }
}


/**
 * Merge function - shallow merge only
 */
function smartcrop_merge( obj1, obj2 ) {
    if( typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return;
    }
    var extended = {};
    for( var prop in obj1 ) {
        if( obj1.hasOwnProperty(prop) ) {
            extended[prop] = obj1[prop];
        }
    }
    for( var prop in obj2 ) {
        if( obj2.hasOwnProperty(prop) ) {
            extended[prop] = obj2[prop];
        }
    }
    return extended;
}
/**
 * Merge styles
 */
function set_object_styles( obj, style_obj ) {
    for(var prop in style_array) {
        obj.style[prop] = style_obj[prop];
    }
    return obj;
}


var smartcrop_options = {};
var wpsmartcrop_images = document.querySelectorAll('img.wpsmartcrop-image');
wpsmartcrop(wpsmartcrop_images, smartcrop_options);