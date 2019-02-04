(function( $ ) {
	function size_modal() {
		var $modal = $('.wpsmartcrop_editor .wpsmartcrop_editor_inner'),
			$img  = $modal.find('.wpsmartcrop_preview_wrap img'),
			img_w = $img.attr('width'),
			img_h = $img.attr('height'),
			button_h = $modal.find('.wpsmartcrop_buttons').height(),
			max_w = (window.innerWidth - 30) * 0.8,
			max_h = (window.innerHeight - button_h - 30) * 0.8;
		if( img_h / img_w * max_w > max_h ) {
			max_w = img_w / img_h * max_h;
		}
		$modal.width( max_w + 30 );
	}
	var resizeDebounce = null;
	$(window).resize(function() {
		clearTimeout(resizeDebounce);
		setTimeout(function() {
			size_modal();
		}, 200);
	});

	function round_to_precision( number, precision ) {
		var multiplier = Math.pow(10, precision);
		return Math.round( number * multiplier ) / multiplier;
	}
	function position_gnomon($wrapper, left, top) {
		$wrapper.find('.wpsmartcrop_gnomon_h').css('top' , top  + '%');
		$wrapper.find('.wpsmartcrop_gnomon_v').css('left', left + '%');
		$wrapper.find('.wpsmartcrop_gnomon_c').css('top' , top  + '%').css('left', left + '%');
	}

	// Preview interface
	$('body').on('click', '.wpsmartcrop_editor .wpsmartcrop_preview_wrap', function(e) {
		var $this = $(this),
			$editor = $this.closest('.wpsmartcrop_editor'),
			offset = $this.offset(),
			pos_x = e.pageX - offset.left,
			pos_y = e.pageY - offset.top,
			left  = round_to_precision( pos_x / $this.width() * 100, 2 ),
			top   = round_to_precision( pos_y / $this.height() * 100, 2);
		position_gnomon( $this, left, top );
		//populate the form fields
		$editor.find('.wpsmartcrop_temp_focus_left').val( left );
		$editor.find('.wpsmartcrop_temp_focus_top' ).val( top  );
	});
	$('body').on('input', '.wpsmartcrop_editor .wpsmartcrop_temp_focus_left, .wpsmartcrop_editor .wpsmartcrop_temp_focus_top', function(e) {
		var $this = $(this),
			$editor = $this.closest('.wpsmartcrop_editor'),
			$preview = $editor.find('.wpsmartcrop_preview_wrap'),
			left  = $editor.find('.wpsmartcrop_temp_focus_left').val(),
			top   = $editor.find('.wpsmartcrop_temp_focus_top').val();
		position_gnomon( $preview, left, top );
	});

	// show/hide smartcrop interface
	$('body').on('change', '.wpsmartcrop_enabled', function(e) {
		var $sc_settings = $('.wpsmartcrop_interface');
		if( $(this).is(':checked') ) {
			$sc_settings.addClass('wpsmartcrop_interface_enabled');
		} else {
			$sc_settings.removeClass('wpsmartcrop_interface_enabled');
		}
	});

	// show editor
	$('body').on('click', '.wpsmartcrop_interface .wpsmartcrop_edit', function(e) {
		var $interface = $(this).closest('.wpsmartcrop_interface'),
			editor_html = $interface.find('.wpsmartcrop_editor_template').html(),
			$editor = $(editor_html),
			$preview = $editor.find('.wpsmartcrop_preview_wrap'),
			left  = round_to_precision($interface.find('.wpsmartcrop_image_focus_left').val(), 2),
			top   = round_to_precision($interface.find('.wpsmartcrop_image_focus_top' ).val(), 2);
		$editor.find('.wpsmartcrop_temp_focus_left').val( left );
		$editor.find('.wpsmartcrop_temp_focus_top' ).val( top  );
		$editor.appendTo('body');
		position_gnomon( $preview, left, top );
		size_modal();
	});

	// cancel editor
	$('body').on('click', '.wpsmartcrop_editor .wpsmartcrop_cancel', function(e) {
		var $this = $(this),
			$editor = $this.closest('.wpsmartcrop_editor');
		$editor.remove();
	});

	// save editor
	$('body').on('click', '.wpsmartcrop_editor .wpsmartcrop_apply', function(e) {
		var $this = $(this),
			$interface = $('.wpsmartcrop_interface'),
			$editor = $this.closest('.wpsmartcrop_editor'),
			$preview = $interface.children('.wpsmartcrop_preview_wrap'),
			left  = $editor.find('.wpsmartcrop_temp_focus_left').val(),
			top   = $editor.find('.wpsmartcrop_temp_focus_top' ).val();
		$interface.find('.wpsmartcrop_image_focus_left').val( left );
		$interface.find('.wpsmartcrop_image_focus_top' ).val( top  ).change();
		position_gnomon( $preview, left, top );
		$editor.remove();
	});
})( jQuery );
