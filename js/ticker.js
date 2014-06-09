/*
 *  Project: Ticker Plugin for the MongKok Template
 *  Description: Ticker based on child elements
 *  Author: Simon Li
 *  License: http://www.simon-li.com
 */

;(function ( $, window, undefined ) {
	var document = window.document,
	defaults = {
		tickerDefaultDuration: 2000,
		AnimationDuration: 500
	};

	function Ticker( element, options ) {
		this.elem = element;
		this.$elem = $(element);
		this.options = $.extend( {}, defaults, options) ;
		this._defaults = defaults;
		
		this.$children = this.$elem.children();
		this.maxHeight = 0;
		this.timeoutHandles = [];
		this.isAnimating = false;

		this.init();
	}

	Ticker.prototype.init = function () {
		var self = this;

		// refresh maxHeight and reset children margins
		this.refreshMaxHeight();

		// set all children to relative positioning
		this.$children.each(function(index, el) {
			$(this).css({
				top: index === 0 ? 0 : -(index - 1) * self.maxHeight,
				position: 'relative'
			});
		});
		this.$children.eq(0).addClass('current');

		// activate vertical scrolling in time intervals
		this.timeoutHandles.push(this.setScrollTimeout());

		// handle hover event
		this.$elem.hover(function (e) {
			self.clearTimeouts();
		}, function (e) {
			self.clearTimeouts();
			self.timeoutHandles.push( self.setScrollTimeout() );
		});

		// handle window resize event
		$(window).on('resize', function () {
			self.refreshMaxHeight();
		});
	};

	Ticker.prototype.refreshMaxHeight = function () {
		var self = this;

		// get maximum child height
		var heightArr = $.map(this.$children, function(item, index) {
				return $(item).height();
			});

		this.maxHeight = Math.max.apply(null, heightArr);

		// adjust margin for each child
		this.$children.each(function(index, el) {
			var $this = $(this),
				vMargin = (self.maxHeight - $this.height()) / 2;

			$(this).css({
				'margin-top': vMargin,
				'margin-bottom': vMargin
			});
		});

		// set own height to max height
		// set overflow to hidden
		this.$elem.css({
			'height': this.maxHeight,
			'overflow': 'hidden'
		});

		// set all children to relative positioning
		setTimeout(function () {
			self.$children.each(function(index, el) {
				var $this = $(this);

				$this.css({
					top: $this.hasClass('current') ? -index * self.maxHeight : -(index - 1) * self.maxHeight
				});
			});
		}, this.isAnimating ? this.options.AnimationDuration : 0);
	};

	Ticker.prototype.setScrollTimeout = function () {
		var self = this;

		return setTimeout(function () {
			self.scroll();
		}, this.timeoutDuration(
			this.$children.filter('.current').data('ticker-duration'))
		);
	};

	Ticker.prototype.timeoutDuration = function (d) {
		if (d === undefined) return this.options.tickerDefaultDuration;
		else return d;
	};

	Ticker.prototype.clearTimeouts = function () {
		var i;
		for (i=0;i<this.timeoutHandles.length;i++){
			clearTimeout(this.timeoutHandles[i]);
		}
		this.timeoutHandles = [];
	};

	Ticker.prototype.scroll = function () {
		// check current top
		var self = this,
			$curr = this.$children.filter('.current'),
			$next = $curr.next().length === 0 ? $curr.siblings().eq(0) : $curr.next();

		// animate current and current's next to next top
		this.isAnimating = true;
		$curr.stop().animate({
			top: '-=' + this.maxHeight
		}, this.options.AnimationDuration, function () {
			// reset current's top to (current's index - 1) * maxHeight
			$curr.css('top', -($curr.index() - 1) * self.maxHeight);
			// remove current class
			$curr.removeClass('current');
		});
		$next.stop().animate({
			top: '-=' + this.maxHeight
		}, this.options.AnimationDuration, function () {
			$next.addClass('current');
			self.isAnimating = false;

			// get ready for next scrolling
			self.timeoutHandles.push(
				setTimeout(function () {
					self.scroll();
				}, self.timeoutDuration($next.data('ticker-duration')))
			);
		});
	};

	$.fn['ticker'] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, 'plugin_ticker')) {
				$.data(this, 'plugin_ticker', new Ticker( this, options ));
			}
		});
	};

}(jQuery, window));