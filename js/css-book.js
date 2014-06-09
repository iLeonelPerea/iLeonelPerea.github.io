/*
 *  Project: Book Plugin for the TsingYi Template
 *  Description: Generate a 3D book from the cover image
 *  Author: Simon Li
 *  License: http://www.simon-li.com
 */

;(function ( $, window, undefined ) {
	var document = window.document,
		defaults = {
			disable3dStyle: false,
			bookTransformPreset: 1,
			pageOffset: 6,
			thickness: 30,
			topFaceBgColor: '#f6f6f6',
			bottomFaceBgColor: '#f6f6f6',
			rightFaceBgColor: '#fdfdfd',
			leftFaceBgColor: '#ccc',
			frontFaceBgColor: 'coral',
			backFaceBgColor: '#ddd',
			frontInnerFaceBgColor: '#fdfdfd',
			bookInitialTransform: 'translateZ(-100px) rotateY(-30deg)',
			bookHoverTransform: 'translateZ(0) rotateY(0deg) rotateX(0deg)',
			frontFaceInitialTransform: 'rotateY(0deg)',
			frontFaceHoverTransform: 'rotateY(-180deg)',
		};

	function cssBook( element, options ) {
		this.elem = element;
		this.$elem = $(element);
		this.$img = this.$elem.find('img');
		this.$caption = this.$elem.find('figcaption');

		this.options = $.extend( {}, defaults, options);
		this.$win = $(window);
		this.opened = false;

		this._defaults = defaults;

		this.checkPropOverride();
		this.checkBookTransformPreset();
		this.init();
	}

	cssBook.prototype.init = function () {
		var self = this,
			transformStyleDiv = $('<div />').css('transform-style','preserve-3d');

		if (this.options.disable3dStyle !== true && transformStyleDiv.css('transform-style') === 'preserve-3d'){
			// hide original image and caption
			this.$img.hide();
			this.$caption.hide();

			this.drawBook();

			this.$win.on('resize', function () {
				self.drawBook();
			});
		} else {
			this.$elem.addClass('flat');
		}
	};

	cssBook.prototype.drawBook = function () {
		var self = this;

		// remove existing book wrapper
		this.$elem.find('.bookWrapper').remove();

		// create html tags
		var bookHtml = [
				'<div class="bookWrapper">',
					'<div class="book">',
						'<div class="face front"><div class="backface"></div></div>',
						'<div class="face front-inner"></div>',
						'<div class="face right"></div>',
						'<div class="face back"></div>',
						'<div class="face left"></div>',
						'<div class="face top"></div>',
						'<div class="face bottom"></div>',
					'</div>',
				'</div>'
				],
				$bookWrapper = $(bookHtml.join('')),
				$book = $bookWrapper.find('.book');

		// add styling
		var bookWidth = this.$img.width(),
			bookHeight = this.$img.height(),
			pageOffset = this.options.pageOffset;
			bookThickness = this.options.thickness;

		$bookWrapper.css({
			width: bookWidth,
			height: bookHeight
		});
		$bookWrapper.find('.front, .back').css({
			width: bookWidth,
			height: bookHeight,
			'margin-top': (-bookHeight/2),
			'margin-left': (-bookWidth/2)
		});
		$bookWrapper.find('.front-inner').css({
			width: bookWidth - pageOffset,
			height: bookHeight - pageOffset*2,
			'margin-top': (-bookHeight/2 + pageOffset),
			'margin-left': (-bookWidth/2)
		});
		$bookWrapper.find('.top, .bottom').css({
			width: bookWidth - pageOffset,
			height: bookThickness,
			'margin-top': (-bookThickness/2),
			'margin-left': (-bookWidth/2)
		});
		$bookWrapper.find('.left, .right').css({
			width: bookThickness,
			height: bookHeight,
			'margin-top': (-bookHeight/2),
			'margin-left': (-bookThickness/2)
		});
		$bookWrapper.find('.right').css({
			height: bookHeight - pageOffset*2,
			'margin-top': (-bookHeight/2 + pageOffset)
		});
		this.$img.clone().show().appendTo($bookWrapper.find('.front'));
		this.$caption.clone().show().appendTo($bookWrapper.find('.front-inner'));

		$bookWrapper.find('.top').css('background-color', this.options.topFaceBgColor);
		$bookWrapper.find('.bottom').css('background-color', this.options.bottomFaceBgColor);
		$bookWrapper.find('.right').css('background-color', this.options.rightFaceBgColor);
		$bookWrapper.find('.left').css('background-color', this.options.leftFaceBgColor);
		$bookWrapper.find('.front').css('background-color', 'transparent');
		$bookWrapper.find('.front>.backface').css({
			'background-color': this.options.frontFaceBgColor,
			'border': this.options.pageOffset + 'px solid rgba(0,0,0,.05)',
			'border-right': 'none'
		});
		$bookWrapper.find('.front-inner').css('background-color', this.options.frontInnerFaceBgColor);
		$bookWrapper.find('.back').css('background-color', this.options.backFaceBgColor);

		this.transform( $bookWrapper.find('.front'),	'translateZ(' + (bookThickness / 2 ) + 'px)' + this.options.frontFaceInitialTransform );
		this.transform( $bookWrapper.find('.front-inner'),	'translateZ(' + (bookThickness / 2  - 1) + 'px)' );
		this.transform( $bookWrapper.find('.back'),	'rotateY(180deg) translateZ(' + (bookThickness / 2 ) + 'px)' );
		this.transform( $bookWrapper.find('.left'),	'rotateY(-90deg) translateZ(' + (bookWidth / 2 ) + 'px)' );
		this.transform( $bookWrapper.find('.right'), 'rotateY(90deg) translateZ(' + (bookWidth / 2  - pageOffset) + 'px)' );
		this.transform( $bookWrapper.find('.top'),		'rotateX(90deg) translateZ(' + (bookHeight / 2  - pageOffset) + 'px)' );
		this.transform( $bookWrapper.find('.bottom'),'rotateX(-90deg) translateZ(' + (bookHeight / 2  - pageOffset) + 'px)' );
		this.transform( $book, 'translateZ(' + (-bookThickness / 2 ) + 'px) ' + this.options.bookInitialTransform );

		// listen to hover event
		$bookWrapper.hover(function() {
			self.openBook($book);
		}, function() {
			self.closeBook($book);
		});

		// listen to tap event
		window.Hammer($bookWrapper.get(0)).on('tap', function(e) {
			if (e.target.tagName === 'A') return;
			if (self.opened === false){
				self.openBook($book);
			} else {
				self.closeBook($book);
			}
		});

		// attach new book
		this.$elem.append($bookWrapper);
	};

	cssBook.prototype.openBook = function ($book) {
		this.transform( $book, 'translateZ(' + (-bookThickness / 2) + 'px) ' + this.options.bookHoverTransform );
		this.transform( $book.find('.front'), 'translateZ(' + (bookThickness / 2) + 'px) ' + this.options.frontFaceHoverTransform );
		this.opened = true;
	};

	cssBook.prototype.closeBook = function ($book) {
		this.transform( $book, ' translateZ(' + (-bookThickness / 2) + 'px) ' + this.options.bookInitialTransform);
		this.transform( $book.find('.front'), 'translateZ(' + (bookThickness / 2) + 'px) '  + this.options.frontFaceInitialTransform );
		this.opened = false;
	};

	cssBook.prototype.checkPropOverride = function () {
		var pageOffset = this.$elem.data('page-offset'),
			thickness = this.$elem.data('thickness'),
			topFaceBgColor = this.$elem.data('top-face-bgColor'),
			bottomFaceBgColor = this.$elem.data('bottom-face-bgColor'),
			rightFaceBgColor = this.$elem.data('right-face-bg-color'),
			leftFaceBgColor = this.$elem.data('left-face-bg-color'),
			frontFaceBgColor = this.$elem.data('front-face-bg-color'),
			backFaceBgColor = this.$elem.data('back-face-bg-color'),
			frontInnerFaceBgColor = this.$elem.data('front-inner-face-bg-color'),
			bookInitialTransform = this.$elem.data('book-initial-transform'),
			bookHoverTransform = this.$elem.data('book-hover-transform'),
			frontFaceInitialTransform = this.$elem.data('front-face-initial-transform'),
			frontFaceHoverTransform = this.$elem.data('front-face-hover-transform');
			
		if (pageOffset !== undefined) this.options.pageOffset = pageOffset;
		if (thickness !== undefined) this.options.thickness = thickness;
		if (topFaceBgColor !== undefined) this.options.topFaceBgColor = topFaceBgColor;
		if (bottomFaceBgColor !== undefined) this.options.bottomFaceBgColor = bottomFaceBgColor;
		if (rightFaceBgColor !== undefined) this.options.rightFaceBgColor = rightFaceBgColor;
		if (leftFaceBgColor !== undefined) this.options.leftFaceBgColor = leftFaceBgColor;
		if (frontFaceBgColor !== undefined) this.options.frontFaceBgColor = frontFaceBgColor;
		if (backFaceBgColor !== undefined) this.options.backFaceBgColor = backFaceBgColor;
		if (frontInnerFaceBgColor !== undefined) this.options.frontInnerFaceBgColor = frontInnerFaceBgColor;
		if (bookInitialTransform !== undefined) this.options.bookInitialTransform = bookInitialTransform;
		if (bookHoverTransform !== undefined) this.options.bookHoverTransform = bookHoverTransform;
		if (frontFaceInitialTransform !== undefined) this.options.frontFaceInitialTransform = frontFaceInitialTransform;
		if (frontFaceHoverTransform !== undefined) this.options.frontFaceHoverTransform = frontFaceHoverTransform;
	};

	cssBook.prototype.checkBookTransformPreset = function () {
		switch (this.options.bookTransformPreset) {
			case 1:
				this.options.bookInitialTransform = 'translateZ(-100px) rotateY(-30deg)';
				this.options.bookHoverTransform = 'translateZ(0) rotateY(0deg) rotateX(0deg)';
				this.options.frontFaceInitialTransform = 'rotateY(0deg)';
				this.options.frontFaceHoverTransform = 'rotateY(-180deg)';
				break;
			case 2:
				this.options.bookInitialTransform = 'translateZ(-100px) rotateY(0deg)';
				this.options.bookHoverTransform = 'translateZ(0) rotateY(0deg) rotateX(40deg)';
				this.options.frontFaceInitialTransform = 'rotateY(0deg)';
				this.options.frontFaceHoverTransform = 'rotateY(-180deg)';
				break;
		}
	};

	cssBook.prototype.transform = function ($obj, t) {
		$obj.css({
			'-webkit-transform': t,
			'-moz-transform': t,
			'-ms-transform': t,
			'-o-transform': t,
			'transform': t
		});
	};

	$.fn['cssBook'] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, 'plugin_css_book')) {
				$.data(this, 'plugin_css_book', new cssBook( this, options ));
			}
		});
	};

}(jQuery, window));