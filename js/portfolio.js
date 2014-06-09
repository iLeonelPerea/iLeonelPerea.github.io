/*
 *  Project: Portfolio Plugin
 *  Description: Portfolio for the TsingYi template
 *  Author: Simon Li
 *  License: http://www.simon-li.com
 */

;(function ( $, window, undefined ) {
	var document = window.document,
	defaults = {
		overlay: '#portfolio .loading-indicator',
		categories: 'ul.categories',
		itemList: 'ul.ajax-portfolio-item-list',
		itemDetails: 'article.ajax-portfolio-item-details',
		portfolioSliderID: 'portfolio-slider',
		sectionContainer: '.section-container',
		fixedSectionClass: 'fixed',

		itemDetailsImgsForSlider: 'ul.images-for-slider',
		itemDetailsVideoIframe: 'iframe.video-iframe',
		itemDetailsDescription: '.desc',
		itemDetailsDescriptionContentColumn: '.content-col',
		itemDetailsDescriptionDropCapClass: 'drop-cap',

		heightToWidthRatio: 3/4,
		minThumbnailWidth: 220,
		itemDetailsDropCap: true,
		animationDuration: 300,
		autoScroll: true,
	};

	function Portfolio( element, options ) {
		this.elem = element;
		this.$elem = $(element);
		this.options = $.extend( {}, defaults, options) ;
		this._defaults = defaults;

		this.$overlay = $(this.options.overlay);
		this.$cats = $(this.options.categories);
		this.$itemList = $(this.options.itemList);
		this.$itemDetails = $(this.options.itemDetails);
		this.$sectionContainer = $(this.options.sectionContainer);

		this.currentListHtml = '';
		this.currentDetailsHtml = '';

		this.$win = $(window);
		this.$body = $('body');

		this.init();
	}

	Portfolio.prototype.init = function () {
		var self = this;

		this.$cats.find('a').on('click', function (e) {
			e.preventDefault();
			self.getList($(this).data('cat'), this);
		});

		setTimeout(function () {
			self.$cats.find('a').eq(0).trigger('click');
		}, 500);

		this.$win.on('resize', function (e) {
			self.refreshHeight();
		});
	};

	Portfolio.prototype.resolvePaths = function ($data, basePath) {
		// Resolve relative path in a, img and iframe
		$data.find('a').add($data.filter('a')).each(function(index, el) {
			var $el = $(el);

			if ($el.data('href') === undefined) return;
			if ($el.data('href') === '') return;

			$el.attr('href', URL.resolve(basePath, $el.data('href')));
		});
		$data.find('img, iframe').add($data.filter('img, iframe')).each(function(index, el) {
			var $el = $(el);

			if ($el.data('src') === undefined) return;
			if ($el.data('src') === '') return;

			$el.attr('src', URL.resolve(basePath, $el.data('src')));
		});

		return $data;
	};

	Portfolio.prototype.getList = function (cat, link) {
		var self = this,
			$link = $(link);

		// show overlay
		this.$overlay.addClass('loading');

		this.currentListHtml = 'portfolio/' + cat + '/list.html';

		// load item list with ajax
		$.ajax({
			url: this.currentListHtml,
			type: 'GET',
			dataType: 'html'
		})
		.done(function(data) {
			var $data = self.resolvePaths(
							$(data).filter('ul').find('li'),
							self.currentListHtml
						);

			$data.find('img').each(function(index, el) {
				var $el = $(el);
				$el.parent().css({
					backgroundImage: 'url("' + $el.attr('src') + '")',
				});
				$el.hide();
			});
			$data.find('a').on('click', {self: self}, self.thumbnailsOnClick);
			self.$itemList.html($data);
			self.$overlay.removeClass('loading');
			self.$cats.find('a').removeClass('current');
			$link.addClass('current');
			self.fadeInItemList();
		})
		.fail(function() {
			console.log("unable to load portfolio items");
			self.$overlay.removeClass('loading');
		});
	};

	Portfolio.prototype.thumbnailsOnClick = function (e) {
		var self = e.data.self,
			$this = $(this),
			$target = $(e.target),
			detailsUrl = '';

		e.preventDefault();

		// get url of details
		if ($target.prop('tagName').toLowerCase() === 'A'){
			detailsUrl = $target.attr('href');
		} else{
			detailsUrl = $target.parents('a').attr('href');
		}

		// retrieve details using ajax
		self.retrieveDetails(detailsUrl, $this);
	};

	Portfolio.prototype.retrieveDetails = function (detailsUrl, $this) {
		var self = this;

		// get current category
		var cat = this.$cats.find('a.current').prop('hash').replace('#', '');

		// show overlay
		this.$overlay.addClass('loading');

		this.currentDetailsHtml = detailsUrl;

		$.ajax({
			url: this.currentDetailsHtml,
			type: 'get',
			dataType: 'html',
		})
		.done(function(data) {
			var $data = self.resolvePaths($(data), self.currentDetailsHtml),
				$nav = self.createNav($this.parents('li')),
				$h3 = $data.filter('h3'),
				$images = $data.filter(self.options.itemDetailsImgsForSlider).find('li'),
				$slider = self.createSlider($images),
				$iframes = $data.filter(self.options.itemDetailsVideoIframe);
				$desc = $data.filter(self.options.itemDetailsDescription);
				$backToTop = self.createBackToTop();

			self.$itemDetails.html('');
			$h3.appendTo(self.$itemDetails);
			$nav.appendTo(self.$itemDetails);
			if ($slider){
				$slider.carousel().appendTo(self.$itemDetails);
			}
			$iframes.appendTo(self.$itemDetails);

			// check drop cap
			if (self.options.itemDetailsDropCap === true){
				$desc.find(self.options.itemDetailsDescriptionContentColumn + ' p:first-child').addClass(self.options.itemDetailsDescriptionDropCapClass);
			}

			$desc.appendTo(self.$itemDetails);
			$backToTop.appendTo(self.$itemDetails);

			self.$overlay.removeClass('loading');
			self.fadeOutItemList();
		})
		.fail(function() {
			console.log("error");
			self.$overlay.removeClass('loading');
		});
	};

	Portfolio.prototype.fadeOutItemList = function (autoScroll) {
		var self = this;
		this.$itemList.animate(
			{ opacity: 0 },
			this.options.animationDuration,
			function () {
				self.$itemList.hide();
				self.$itemDetails.show().animate(
					{ opacity: 1 },
					self.options.animationDuration,
					function () {
						if (autoScroll === false || self.options.autoScroll !== true) return;
						self.$sectionContainer.animate(
							{ scrollTop: self.computeItemDetailsTop() },
							self.options.animationDuration
						);
					}
				);
			}
		);
	};

	Portfolio.prototype.fadeInItemList = function () {
		var self = this;
		
		this.refreshHeight();
		this.$itemDetails.animate(
			{ opacity: 0 },
			this.options.animationDuration,
			function () {
				self.$itemDetails.hide().html('');
				self.$itemList.show().animate(
					{ opacity: 1 },
					self.options.animationDuration
				);
			}
		);
	};

	Portfolio.prototype.createNav = function ($currLi) {
		var self = this,
			$prevLi = $currLi.prev(),
			$nextLi = $currLi.next(),
			$nav = $('<div />').addClass('portfolio-nav clearfix'),
			$backIcon = $('<i />').addClass('fa fa-th'),
			$back = $('<a />').html('Back').attr({
				'href': '#',
				'class': 'nav-back'
			}).prepend($backIcon).on('click', function (e) {
				e.preventDefault();
				self.fadeInItemList();
			}).appendTo($nav);

		if ($prevLi.length > 0) {
			var $prevIcon = $('<i />').addClass('fa fa-arrow-left'),
				$prev = $('<a />').html('Prev').attr({
					'href': '#',
					'class': 'nav-prev'
				}).prepend($prevIcon).on('click', function (e) {
					e.preventDefault();
					$prevA = $prevLi.find('a');
					self.retrieveDetails($prevA.attr('href'), $prevA);
				}).appendTo($nav);
		}

		if ($nextLi.length > 0) {
			var $nextIcon = $('<i />').addClass('fa fa-arrow-right'),
				$next = $('<a />').html('Next').attr({
					'href': '#',
					'class': 'nav-next'
				}).prepend($nextIcon).on('click', function (e) {
					e.preventDefault();
					$nextA = $nextLi.find('a');
					self.retrieveDetails($nextLi.find('a').attr('href'), $nextA);
				}).appendTo($nav);
		}

		return $nav;
	};

	Portfolio.prototype.createBackToTop = function () {
		var self = this,
			$backToTop = $('<div />').addClass('portfolio-back-to-top'),
			$topIcon = $('<i />').addClass('fa fa-arrow-up'),
			$top = $('<a />').html('Top').attr({
				'href': '#',
				'class': 'nav-top'
			}).prepend($topIcon).on('click', function (e) {
				e.preventDefault();
				self.$sectionContainer.animate({
					scrollTop: self.computeItemDetailsTop()
				}, self.options.animationDuration);
			}).appendTo($backToTop);

		return $backToTop;
	};

	Portfolio.prototype.computeItemDetailsTop = function () {
		return this.$elem.position().top - this.$sectionContainer.children().not('.' + this.options.fixedSectionClass).eq(0).position().top + this.$itemDetails.position().top - 20;
	};

	Portfolio.prototype.createSlider = function ($images) {
		if ($images && $images.length === 0) return false;

		// generate a bootstrap slider from an array of images
		var self = this,
			i;

		// create indicators
		$indicators = $('<ol />'). addClass('carousel-indicators');
		for (i=0;i<$images.length;i++){
			var $li = $('<li />').attr({
				'data-target': '#' + self.options.portfolioSliderID,
				'data-slide-to': i,
				'class': i===0? 'active': ''
			});
			$li.appendTo($indicators);
		}

		// create slides
		$slides = $('<div />').addClass('carousel-inner');
		$images.each(function(index, el) {
			var $item = $('<div />').addClass('item');
			if (index === 0) $item.addClass('active');

			$(el).children().appendTo($item);
			$item.appendTo($slides);
		});

		// create controls
		$controlLeft = $('<a />').addClass('left carousel-control')
							.prop('href', '#' + self.options.portfolioSliderID).attr('data-slide', 'prev');
		$spanLeft = $('<span />').addClass('glyphicon glyphicon-chevron-left').appendTo($controlLeft);

		$controlRight = $('<a />').addClass('right carousel-control')
							.prop('href', '#' + self.options.portfolioSliderID).attr('data-slide', 'next');
		$spanRight = $('<span />').addClass('glyphicon glyphicon-chevron-right').appendTo($controlRight);

		// create slider
		$slider = $('<div />').prop('id', self.options.portfolioSliderID).addClass('carousel slide').attr('data-ride', 'carousel');
		$slider.append($indicators, $slides, $controlLeft, $controlRight);

		return $slider;
	};

	Portfolio.prototype.refreshHeight = function () {
		if (this.$itemList ===  undefined) return;

		var self = this;

		// get height of item list
		// compute maximum number of thumbs per row according to minimum thumb width
		var itemListWidth = this.$cats.innerWidth(),
			numOfThumbsPerRow = Math.floor(itemListWidth / this.options.minThumbnailWidth),
			$li = this.$itemList.find('li');

		// assign percentage to li
		$li.css('width', (100/numOfThumbsPerRow) + '%');

		// assign height to li>a
		$li.find('a').each(function(index, el) {
			var $el = $(el);
			$el.css({
				height: Math.round(itemListWidth / numOfThumbsPerRow * self.options.heightToWidthRatio)
			});
		});
	};

	$.fn['portfolio'] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + 'portfolio')) {
				$.data(this, 'plugin_' + 'portfolio', new Portfolio( this, options ));
			}
		});
	};

}(jQuery, window));