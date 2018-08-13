(function() {
    var position_image_overlay = function( img, overlay ) {
        var img_margin_left = img.style.marginLeft;
        var img_margin_right = img.style.marginRight;
        var overlay_style = {
            'position'   : 'absolute',
            'opacity'    : '0.4',
            'top'        : img.offsetTop + 'px',
            'left'       : img.offsetLeft + 'px',
            'width'      : img.offsetWidth +'px',
            'height'     : img.offsetHeight +'px',
            'marginLeft' : img_margin_left,
            'marginRight': img_margin_right
        };
        overlay = set_object_styles( overlay, overlay_style )


        var gnomon_left = document.querySelector('.wpsmartcrop_image_focus_left');
        var gnomon_width = parseInt(gnomon_left.value) + '%';

        var gnomon_top =document.querySelector('.wpsmartcrop_image_focus_top');
        var gnomon_height = parseInt(gnomon_top.value) + '%';


        document.querySelector('.wpsmartcrop_image_gnomon_left').style.width = gnomon_width;
        document.querySelector('.wpsmartcrop_image_gnomon_top').style.height = gnomon_height;

        var enable_input = document.querySelector('.wpsmartcrop_enabled');
        if(enable_input.length) {
            if(!enable_input[0].checked) {
                overlay.style.display = 'none';
                img.parentNode.classList.remove('wpsmartcrop_strip_pseudos');
            } else {
                overlay.style.display = 'block';
                img.parentNode.classList.add('wpsmartcrop_strip_pseudos');
            }
        }
    };

    var load_overlay = function( image ) {
        if( !image ) {
            return;
        }

        var gnomon_left = document.createElement('div');
        gnomon_left.classList.add('wpsmartcrop_image_gnomon_left');
        var gnomon_left_styles = {
            'width'       : '10px',
            'height'      : '100%',
            'position'    : 'absolute',
            'top'         : 0,
            'left'        : 0,
            'margin'      : '0px',
            'padding'     : '0px',
            'boxSizing'   : 'border-box',
            'borderRight' : '1px solid #f00'
        };
        gnomon_left = set_object_styles( gnomon_left, gnomon_left_styles )

        var gnomon_top = document.createElement('div');
        gnomon_top.classList.add('wpsmartcrop_image_gnomon_top');
        var gnomon_top_styles = {
            'width'       : '100%',
            'height'      : 0,
            'position'    : 'absolute',
            'top'         : 0,
            'left'        : 0,
            'margin'      : '0px',
            'padding'     : '0px',
            'boxSizing'   : 'border-box',
            'borderBottom': '1px solid #f00'
        };
        gnomon_top = set_object_styles( gnomon_top, gnomon_top_styles )

        var image_overlay = document.querySelector('.wpsmartcrop_image_overlay');
        if(image_overlay) {
            image_overlay.parentNode.removeChild(image_overlay);
        }
        var overlay = document.createElement('div');
        overlay.classList.add('wpsmartcrop_image_overlay', 'custom-class');
        overlay.appendChild(gnomon_left);
        overlay.appendChild(gnomon_top);
        image.parentNode.insertBefore(overlay, image.nextSibling);
        overlay.style.cursor = 'pointer';


        window.addEventListener('resize', function() {
            clearTimeout( window.wpsmartcrop_image_overlay_resize_timeout );
            window.wpsmartcrop_image_overlay_resize_timeout = setTimeout( function() {
                position_image_overlay( image, overlay );
            }, 50 );
        });

        position_image_overlay( image, overlay );

        var overlayElement = document.querySelector('.wpsmartcrop_image_overlay');
        if(overlayElement) {
            overlayElement.addEventListener('click', function(e) {
                var element = document.querySelector('.wpsmartcrop_image_overlay');
                var offset = getOffset(element);
                var pos_x = e.pageX - offset.left;
                var pos_y = e.pageY - offset.top;
                var left  = pos_x / element.offsetWidth * 100;
                var top   = pos_y / element.offsetHeight * 100;

                var gnomonInputLeft = document.querySelector('.wpsmartcrop_image_focus_left');
                gnomonInputLeft.value = left;
                var gnomonInputTop = document.querySelector('.wpsmartcrop_image_focus_top');
                gnomonInputTop.value = top;
                position_image_overlay( image, overlay );
            });

        }
        var smartCropImg = document.querySelector('.wpsmartcrop_enabled');
        if(smartCropImg) {
            smartCropImg.addEventListener('change', function() {
                position_image_overlay( image, overlay );
            });
        }
    };


    var image = document.querySelector('.media-frame-content .attachment-details .thumbnail img');
    if(document.body.classList.contains('post-type-attachment')) {
        image = document.querySelector('.wp_attachment_holder .wp_attachment_image img.thumbnail');
    }

    if(image && image.getAttribute('complete')) {
        load_overlay(image);
    } else if(image){
        image.addEventListener('load', function() {
            load_overlay(image);
        });
        load_overlay(image);
    }


    function getOffset(el) {
        var rect = el.getBoundingClientRect(),
            scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
    }

    function set_object_styles( obj, style_obj ) {
        for(var prop in style_obj) {
            obj.style[prop] = style_obj[prop];
        }
        return obj;
    }
})();
