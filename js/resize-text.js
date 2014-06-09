/*
*  Project: MongKok Text Resizing
*  Description: Resizing Text in the MongKok template
*  Author: Simon Li
*  WebSite: http://www.simon-li.com 
*/

;(function ( $, window, undefined ) {
	var document = window.document,
	defaults = {
	};

// The actual plugin constructor
function ResizeText( element, options ) {
	this.elem = element;
	this.$elem = $(element);
	this.options = $.extend( {}, defaults, options) ;
	this._defaults = defaults;
	this.$win = $(window);

	this.init();
}

ResizeText.prototype.init = function () {
	var self = this;

	this.resize();
	this.$win.on('resize', function(event) {
		self.$elem.css('font-size','');
		self.resize();
	});
};

ResizeText.prototype.resize = function () {
	// get parent width
	// count # of characters
	// compute font size
	// apply new font size

	this.$elem.css({
		'font-size': '',
		'height': '',
		'line-height': '',
		'letter-spacing': ''
	});

	var parentWidth = this.$elem.parent().width(),
		currSize = parseInt(this.$elem.css('font-size'),10),
		currLetterSpacing = parseInt(this.$elem.css('letter-spacing'), 10),
		newSize = Math.round(currSize * parentWidth / this.$elem.width()),
		newLetterSpacing = currLetterSpacing * parentWidth / this.$elem.width(),
		newHeight = Math.round(newSize * 0.85);

	this.$elem.css({
		'font-size': newSize + 'px',
		'height': newHeight + 'px',
		'line-height': newHeight + 'px',
		'letter-spacing': newLetterSpacing + 'px'
	});

	var finalLetterSpacing = newLetterSpacing + (this.$elem.parent().width() - this.$elem.width()) / this.$elem.text().length;
	this.$elem.css({
		'letter-spacing': finalLetterSpacing + 'px'
	});
};

$.fn['resizeText'] = function ( options ) {
	return this.each(function () {
		if (!$.data(this, 'plugin_resize_text')) {
			$.data(this, 'plugin_resize_text', new ResizeText( this, options ));
		}
	});
};

}(jQuery, window));