/*
 *  Project: General Setup
 *  Description: General setup for the MongKok template
 *  Author: Simon Li
 *  License: http://www.simon-li.com
 */

;(function ( $, window, undefined ) {
	var document = window.document,
		defaults = {
			nav: 'nav',
			navToggle: '.nav-toggle',
			sectionContainer: '.section-container',
			sectionContainerWrapper: '.section-container-wrapper',

			navPosition: 'top',
			offCanvasAnimation: 'rotate-reveal',
			offCanvasAnimationPerspective: '400px',
			offCanvasAnimationScaleUpInitScale: 0.85,
			offCanvasAnimationRotateRevealAngle: 3,
			offCanvasAnimationFallbackDuration: 500,
			verticalNavWidth: '220px',
			verticalNavShowIcons: true,
			navScrollingAnimationDuration: 300,

			fixFirstSection: true,
			fixedSectionClass: 'fixed',
			fixedSectionDummyClass: 'dummy'
		};

	function Setup( element, options ) {
		this.elem = element;
		this.$elem = $(element);
		this.options = $.extend( {}, defaults, options) ;
		this._defaults = defaults;

		this.$win = $(window);
		this.$body = $('body');
		this.$nav = $(this.options.nav);
		this.$navToggle = $(this.options.navToggle);
		this.$sectionContainer = $(this.options.sectionContainer);
		this.$sectionContainerWrapper = $(this.options.sectionContainerWrapper);
		this.$firstSection = this.$sectionContainer.children().eq(0);
		this.sectionPosTop = [];
		this.scrollbarWidth = $.getScrollbarWidth();
		this.isIE11Win81 = (navigator.userAgent.indexOf('Windows NT 6.3')> -1 &&
							navigator.userAgent.indexOf('Trident/7.0')> -1 &&
							navigator.userAgent.indexOf('rv:11.0')> -1);
		this.isIE2x = (window.screen.deviceXDPI !== undefined &&
						window.screen.logicalXDPI !== undefined &&
						window.screen.deviceXDPI / window.screen.logicalXDPI !== 1);
		this.isIE11Win81Retina = this.isIE11Win81 && this.isIE2x;
		this.isCSS3 = Modernizr.csstransforms3d && Modernizr.csstransitions && !this.isIE11Win81Retina;

		this.init();
	}

	Setup.prototype.init = function () {
		this.offCanvasInit();
		this.setupNavToggle();
		this.setupNavScrolling();
		this.fixFirstSection();
	};

	Setup.prototype.fixFirstSection = function () {
		if (this.options.fixFirstSection === false) return;

		var self = this;
		// position -> fixed, width -> 100%, max-width, max-height
		this.$firstSection.addClass(this.options.fixedSectionClass).css({
			// 'height': this.$firstSection.innerHeight() + 'px',
			'max-width': this.$sectionContainer.innerWidth() - this.scrollbarWidth + 'px',
			'max-height': this.$sectionContainer.innerHeight() + 'px',
		});
		this.$navToggle.css({
			'max-width': this.$sectionContainer.innerWidth() - this.scrollbarWidth + 'px',
		});

		// add a dummy section of the same width and height after the first section
		this.$firstSection.after($('<section />').addClass(this.options.fixedSectionDummyClass).css({
			'width': '100%',
			'height': this.$firstSection.height() + 'px',
			'z-index': -9999,
		}));

		// update css on window resizing
		this.$win.on('resize', function (e) {
			self.$firstSection.css({
				'max-width': self.$sectionContainer.innerWidth() - self.scrollbarWidth + 'px',
				'max-height': self.$sectionContainer.innerHeight() + 'px',
			}).next('.' + self.options.fixedSectionDummyClass).css({
				'height': self.$firstSection.height() + 'px',
			});
			self.$navToggle.css({
				'max-width': self.$sectionContainer.innerWidth() - self.scrollbarWidth + 'px',
			});
		});

		var wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";
		this.$sectionContainer.get(0).addEventListener(wheelEvent, function (e) {
			e.preventDefault();
			var d = wheelEvent === 'wheel' ? e.deltaY * (e.deltaMode === 0 ? 1:18) :
							e.wheelDeltaY === undefined ? (-e.wheelDelta) : (-e.wheelDeltaY);
			self.$sectionContainer.scrollTop(self.$sectionContainer.scrollTop() + d);
		}, false);
	};

	Setup.prototype.setupNavToggle = function () {
		var self = this;

		this.$navToggle.on('click', function (e) {
			e.preventDefault();
			if (!self.$sectionContainerWrapper.hasClass('opened')){
				// if first section fixed and scrollTop is less than first section's height, scroll to top first
				if (self.options.fixFirstSection && self.$sectionContainer.scrollTop() > 0 && self.$sectionContainer.scrollTop() < self.$firstSection.innerHeight()){
					self.$sectionContainer.animate(
						{scrollTop: 0},
						self.options.navScrollingAnimationDuration, function () {
							self.unfixFirstSection();
							self.toggleNav();
						}
					);
				} else{
					self.unfixFirstSection();
					self.toggleNav();
				}
			} else{
				self.toggleNav();
			}
		});
		$(document).on('click', function (e) {
			self.documentClickOrTapHandler(e);
		});
		window.Hammer(document).on('tap', function (e) {
			self.documentClickOrTapHandler(e);
		});
	};

	Setup.prototype.documentClickOrTapHandler = function (e) {
		if (!this.$nav.hasClass('opened') ||
			!this.$sectionContainerWrapper.hasClass('opened'))
			return;
		if (this.$navToggle.filter(e.target).length > 0 ||
			this.$navToggle.find(e.target).length > 0 ||
			this.$nav.filter(e.target).length > 0 ||
			this.$nav.find(e.target).length > 0)
			return;
		this.toggleNav(true);
	};

	Setup.prototype.unfixFirstSection = function () {
		// temporarily unfix first section for off-canvas animation

		if (this.options.fixFirstSection === false) return;
		this.$firstSection.css({
			position: 'relative'
		}).next('.' + this.options.fixedSectionDummyClass).hide();
	};

	Setup.prototype.refixFirstSection = function () {
		if (this.options.fixFirstSection === false) return;
		this.$firstSection.css({
			position: 'fixed'
		}).next('.' + this.options.fixedSectionDummyClass).show();
	};

	Setup.prototype.offCanvasInit = function () {
		this.prefixCSS(this.$body, 'perspective', this.options.offCanvasAnimationPerspective);

		var navPos = this.options.navPosition,
		offCanvasAnimation = this.options.offCanvasAnimation;

		this.$nav.removeClass('nav-pos-bottom nav-pos-left nav-pos-right').css('width', '');
		this.$navToggle.removeClass('nav-pos-bottom nav-pos-left nav-pos-right');
		/*   */if (navPos === 'top'){
			this.prefixCSS(this.$body, 'perspective-origin', '50% 0');
			switch (offCanvasAnimation){
				case 'push':
					this.prefixCSS(this.$nav, 'transform', 'translateY(-' + this.$nav.innerHeight() + 'px)');
					break;
				case 'reveal':
					this.prefixCSS(this.$nav, 'transform', 'none');
					break;
				case 'rotate-in':
					this.prefixCSS(this.$nav, 'transform', 'translateY(-' + this.$nav.innerHeight() + 'px) ' + 'rotateX(90deg)');
					this.prefixCSS(this.$nav, 'transform-origin', '50% 100%');
					break;
				case 'rotate-out':
					this.prefixCSS(this.$nav, 'transform', 'translateY(-' + this.$nav.innerHeight() + 'px) ' + 'rotateX(-90deg)');
					this.prefixCSS(this.$nav, 'transform-origin', '50% 100%');
					break;
				case 'scale-up':
					this.prefixCSS(this.$nav, 'transform', 'scale(' + this.options.offCanvasAnimationScaleUpInitScale + ')');
					this.prefixCSS(this.$nav, 'transform-origin', '50% 0');
					break;
				case 'rotate-reveal':
					this.prefixCSS(this.$nav, 'transform', 'none');
					this.prefixCSS(this.$sectionContainerWrapper, 'transform-origin', '50% 0');
					break;
			}


		} else if (navPos === 'bottom'){
			this.$nav.addClass('nav-pos-bottom');
			this.$navToggle.addClass('nav-pos-bottom');

			this.prefixCSS(this.$body, 'perspective-origin', '50% 100%');
			switch (offCanvasAnimation){
				case 'push':
					this.prefixCSS(this.$nav, 'transform', 'translateY(' + this.$nav.innerHeight() + 'px)');
					break;
				case 'reveal':
					this.prefixCSS(this.$nav, 'transform', 'none');
					break;
				case 'rotate-in':
					this.prefixCSS(this.$nav, 'transform', 'translateY(' + this.$nav.innerHeight() + 'px) ' + 'rotateX(-90deg)');
					this.prefixCSS(this.$nav, 'transform-origin', '50% 0');
					break;
				case 'rotate-out':
					this.prefixCSS(this.$nav, 'transform', 'translateY(' + this.$nav.innerHeight() + 'px) ' + 'rotateX(90deg)');
					this.prefixCSS(this.$nav, 'transform-origin', '50% 0');
					break;
				case 'scale-up':
					this.prefixCSS(this.$nav, 'transform', 'scale(' + this.options.offCanvasAnimationScaleUpInitScale + ')');
					this.prefixCSS(this.$nav, 'transform-origin', '50% 100%');
					break;
				case 'rotate-reveal':
					this.prefixCSS(this.$nav, 'transform', 'none');
					this.prefixCSS(this.$sectionContainerWrapper, 'transform-origin', '50% 100%');
					break;
			}


		} else if (navPos === 'left'){
			this.$nav.addClass('nav-pos-left');
			this.$navToggle.addClass('nav-pos-left');

			this.$nav.css({
				width: this.options.verticalNavWidth,
			});
			if (this.options.verticalNavShowIcons === false){
				this. $nav.find('.menu i.fa').hide();
			}

			this.prefixCSS(this.$body, 'perspective-origin', '0 50%');
			switch (offCanvasAnimation){
				case 'push':
					this.prefixCSS(this.$nav, 'transform', 'translateX(-' + this.options.verticalNavWidth + ')');
					break;
				case 'reveal':
					this.prefixCSS(this.$nav, 'transform', 'none');
					break;
				case 'rotate-in':
					this.prefixCSS(this.$nav, 'transform', 'translateX(-' + this.options.verticalNavWidth + ') ' + 'rotateY(-90deg)');
					this.prefixCSS(this.$nav, 'transform-origin', '100% 50%');
					break;
				case 'rotate-out':
					this.prefixCSS(this.$nav, 'transform', 'translateX(-' + this.options.verticalNavWidth + ') ' + 'rotateY(90deg)');
					this.prefixCSS(this.$nav, 'transform-origin', '100% 50%');
					break;
				case 'scale-up':
					this.prefixCSS(this.$nav, 'transform', 'scale(' + this.options.offCanvasAnimationScaleUpInitScale + ')');
					this.prefixCSS(this.$nav, 'transform-origin', '0 50%');
					break;
				case 'rotate-reveal':
					this.prefixCSS(this.$nav, 'transform', 'none');
					this.prefixCSS(this.$sectionContainerWrapper, 'transform-origin', '0 50%');
					break;
			}


		} else if (navPos === 'right'){
			this.$nav.addClass('nav-pos-right');
			this.$navToggle.addClass('nav-pos-right');

			this.$nav.css({
				width: this.options.verticalNavWidth,
			});
			if (this.options.verticalNavShowIcons === false){
				this. $nav.find('.menu i.fa').hide();
			}

			this.prefixCSS(this.$body, 'perspective-origin', '100% 50%');
			switch (offCanvasAnimation){
				case 'push':
					this.prefixCSS(this.$nav, 'transform', 'translateX(' + this.options.verticalNavWidth + ')');
					break;
				case 'reveal':
					this.prefixCSS(this.$nav, 'transform', 'none');
					break;
				case 'rotate-in':
					this.prefixCSS(this.$nav, 'transform', 'translateX(' + this.options.verticalNavWidth + ') ' + 'rotateY(90deg)');
					this.prefixCSS(this.$nav, 'transform-origin', '0 50%');
					break;
				case 'rotate-out':
					this.prefixCSS(this.$nav, 'transform', 'translateX(' + this.options.verticalNavWidth + ') ' + 'rotateY(-90deg)');
					this.prefixCSS(this.$nav, 'transform-origin', '0 50%');
					break;
				case 'scale-up':
					this.prefixCSS(this.$nav, 'transform', 'scale(' + this.options.offCanvasAnimationScaleUpInitScale + ')');
					this.prefixCSS(this.$nav, 'transform-origin', '100% 50%');
					break;
				case 'rotate-reveal':
					this.prefixCSS(this.$nav, 'transform', 'none');
					this.prefixCSS(this.$sectionContainerWrapper, 'transform-origin', '100% 50%');
					break;
			}
		}

		var self = this;

		// use the transitionend event when css3 is available
		if (this.isCSS3){
			this.$sectionContainerWrapper.on(
				'webkitTransitionEnd otransitionend oTransitionEnd transitionend',
				function (e) {
					var $this = $(this);
					if (self.options.fixFirstSection && !$this.hasClass('opened')){
						self.refixFirstSection();
					}
				}
			);
		}

		// disable transition in section overlay in case IE11-Win8.1-Retina is true
		if (!this.isCSS3){
			this.$sectionContainerWrapper.addClass('no-transition');
		}
	};

	Setup.prototype.toggleNav = function (closeOnly) {
		var self = this,
			navPos = this.options.navPosition,
			offCanvasAnimation = this.options.offCanvasAnimation;

		if (this.$nav.hasClass('opened') && this.$sectionContainerWrapper.hasClass('opened')){
			// to close nav

			/*   */if (navPos === 'top'){
				if (this.isCSS3){
					switch (offCanvasAnimation){
						case 'push':
							this.prefixCSS(this.$nav, 'transform', 'translateY(-' + this.$nav.innerHeight() + 'px)');
							break;
						case 'reveal':
						case 'rotate-reveal':
							break;
						case 'rotate-in':
							this.prefixCSS(this.$nav, 'transform', 'translateY(-' + this.$nav.innerHeight() + 'px) ' + 'rotateX(90deg)');
							break;
						case 'rotate-out':
							this.prefixCSS(this.$nav, 'transform', 'translateY(-' + this.$nav.innerHeight() + 'px) ' + 'rotateX(-90deg)');
							break;
						case 'scale-up':
							this.prefixCSS(this.$nav, 'transform', 'scale(' + this.options.offCanvasAnimationScaleUpInitScale + ')');
							break;
					}
					this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'none');
				} else {
					this.$navToggle.animate(
						{
							top: '-=' + this.$nav.innerHeight() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
					this.$sectionContainerWrapper.animate(
						{
							top: '-=' + this.$nav.innerHeight() + 'px',
							bottom: '+=' + this.$nav.innerHeight() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration,
						function () {
							if (self.options.fixFirstSection){
								self.$navToggle.css('top','');
								self.refixFirstSection();
							}
						}
					);
				}
			} else if (navPos === 'bottom'){
				if (this.isCSS3){
					switch (offCanvasAnimation){
						case 'push':
							this.prefixCSS(this.$nav, 'transform', 'translateY(' + this.$nav.innerHeight() + 'px)');
							break;
						case 'reveal':
						case 'rotate-reveal':
							break;
						case 'rotate-in':
							this.prefixCSS(this.$nav, 'transform', 'translateY(' + this.$nav.innerHeight() + 'px) ' + 'rotateX(-90deg)');
							break;
						case 'rotate-out':
							this.prefixCSS(this.$nav, 'transform', 'translateY(' + this.$nav.innerHeight() + 'px) ' + 'rotateX(90deg)');
							break;
						case 'scale-up':
							this.prefixCSS(this.$nav, 'transform', 'scale(' + this.options.offCanvasAnimationScaleUpInitScale + ')');
							break;
					}
					this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'none');
				} else{
					this.$navToggle.animate(
						{
							bottom: '-=' + this.$nav.innerHeight() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
					this.$sectionContainerWrapper.animate(
						{
							top: '+=' + this.$nav.innerHeight() + 'px',
							bottom: '-=' + this.$nav.innerHeight() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration,
						function () {
							if (self.options.fixFirstSection){
								self.$navToggle.css('bottom','');
								self.refixFirstSection();
							}
						}
					);
				}
			} else if (navPos === 'left'){
				if (this.isCSS3){
					switch (offCanvasAnimation){
						case 'push':
							this.prefixCSS(this.$nav, 'transform', 'translateX(-' + this.options.verticalNavWidth + ')');
							break;
						case 'reveal':
						case 'rotate-reveal':
							break;
						case 'rotate-in':
							this.prefixCSS(this.$nav, 'transform', 'translateX(-' + this.options.verticalNavWidth + ') ' + 'rotateY(-90deg)');
							break;
						case 'rotate-out':
							this.prefixCSS(this.$nav, 'transform', 'translateX(-' + this.options.verticalNavWidth + ') ' + 'rotateY(90deg)');
							break;
						case 'scale-up':
							this.prefixCSS(this.$nav, 'transform', 'scale(' + this.options.offCanvasAnimationScaleUpInitScale + ')');
							break;
					}
					this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'none');
				} else {
					this.$navToggle.animate(
						{
							left: '-=' + this.$nav.innerWidth() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
					this.$sectionContainerWrapper.animate(
						{
							left: '-=' + this.$nav.innerWidth() + 'px',
							right: '+=' + this.$nav.innerWidth() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration,
						function () {
							if (self.options.fixFirstSection){
								self.$navToggle.css('left','');
								self.refixFirstSection();
							}
						}
					);
				}
			} else if (navPos === 'right'){
				if (this.isCSS3){
					switch (offCanvasAnimation){
						case 'push':
							this.prefixCSS(this.$nav, 'transform', 'translateX(' + this.options.verticalNavWidth + ')');
							break;
						case 'reveal':
						case 'rotate-reveal':
							break;
						case 'rotate-in':
							this.prefixCSS(this.$nav, 'transform', 'translateX(' + this.options.verticalNavWidth + ') ' + 'rotateY(90deg)');
							break;
						case 'rotate-out':
							this.prefixCSS(this.$nav, 'transform', 'translateX(' + this.options.verticalNavWidth + ') ' + 'rotateY(-90deg)');
							break;
						case 'scale-up':
							this.prefixCSS(this.$nav, 'transform', 'scale(' + this.options.offCanvasAnimationScaleUpInitScale + ')');
							break;
					}
				}
				else{
					this.$navToggle.animate(
						{
							right: '-=' + this.$nav.innerWidth() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
					this.$sectionContainerWrapper.animate(
						{
							left: '+=' + this.$nav.innerWidth() + 'px',
							right: '-=' + this.$nav.innerWidth() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration,
						function () {
							if (self.options.fixFirstSection){
								self.$navToggle.css('right','');
								self.refixFirstSection();
							}
						}
					);
				}
			}
			this.prefixCSS(this.$navToggle, 'transform', 'none');
			this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'none');

			this.$nav.removeClass('opened');
			this.$sectionContainerWrapper.removeClass('opened');
		} else if (closeOnly !== true){
			// to open nav
			this.computeSectionPosTop();

			this.$nav.addClass('opened');
			this.$sectionContainerWrapper.addClass('opened');

			/*   */if (navPos === 'top'){
				if (this.isCSS3){
					switch (offCanvasAnimation){
						case 'push':
						case 'reveal':
						case 'rotate-in':
						case 'rotate-out':
						case 'scale-up':
						case 'rotate-reveal':
							this.prefixCSS(this.$navToggle, 'transform', 'translateY(' + this.$nav.innerHeight() + 'px)');
							if (offCanvasAnimation !== 'rotate-reveal')
								this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'translateY(' + this.$nav.innerHeight() + 'px) rotateX(0deg)');
							else
								this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'translateY(' + this.$nav.innerHeight() + 'px) rotateX(-' + this.options.offCanvasAnimationRotateRevealAngle + 'deg)');
							break;
					}
				} else {
					this.$sectionContainerWrapper.animate(
						{
							top: '+=' + this.$nav.innerHeight() + 'px',
							bottom: '-=' + this.$nav.innerHeight() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
					this.$navToggle.animate(
						{
							top: '+=' + this.$nav.innerHeight() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
				}
			} else if (navPos === 'bottom'){
				if (this.isCSS3){
					switch (offCanvasAnimation){
						case 'push':
						case 'reveal':
						case 'rotate-in':
						case 'rotate-out':
						case 'scale-up':
						case 'rotate-reveal':
							this.prefixCSS(this.$navToggle, 'transform', 'translateY(-' + this.$nav.innerHeight() + 'px)');
							if (offCanvasAnimation !== 'rotate-reveal')
								this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'translateY(-' + this.$nav.innerHeight() + 'px) rotateX(0deg)');
							else
								this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'translateY(-' + this.$nav.innerHeight() + 'px) rotateX(' + this.options.offCanvasAnimationRotateRevealAngle + 'deg)');
							break;
					}
				} else {
					this.$sectionContainerWrapper.animate(
						{
							top: '-=' + this.$nav.innerHeight() + 'px',
							bottom: '+=' + this.$nav.innerHeight() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
					this.$navToggle.animate(
						{
							bottom: '+=' + this.$nav.innerHeight() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
				}
			} else if (navPos === 'left'){
				if (this.isCSS3){
					switch (offCanvasAnimation){
						case 'push':
						case 'reveal':
						case 'rotate-in':
						case 'rotate-out':
						case 'scale-up':
						case 'rotate-reveal':
							this.prefixCSS(this.$navToggle, 'transform', 'translateX(' + this.options.verticalNavWidth + ')');
							if (offCanvasAnimation !== 'rotate-reveal')
								this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'translateX(' + this.options.verticalNavWidth + ') rotateY(0deg)');
							else
								this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'translateX(' + this.options.verticalNavWidth + ') rotateY(' + this.options.offCanvasAnimationRotateRevealAngle + 'deg)');
							break;
					}
				} else {
					this.$sectionContainerWrapper.animate(
						{
							left: '+=' + this.$nav.innerWidth() + 'px',
							right: '-=' + this.$nav.innerWidth() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
					this.$navToggle.animate(
						{
							left: '+=' + this.$nav.innerWidth() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
				}
			} else if (navPos === 'right'){
				if (this.isCSS3){
					switch (offCanvasAnimation){
						case 'push':
						case 'reveal':
						case 'rotate-in':
						case 'rotate-out':
						case 'scale-up':
						case 'rotate-reveal':
							this.prefixCSS(this.$navToggle, 'transform', 'translateX(-' + this.options.verticalNavWidth + ')');
							if (offCanvasAnimation !== 'rotate-reveal')
								this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'translateX(-' + this.options.verticalNavWidth + ') rotateY(0deg)');
							else
								this.prefixCSS(this.$sectionContainerWrapper, 'transform', 'translateX(-' + this.options.verticalNavWidth + ') rotateY(-' + this.options.offCanvasAnimationRotateRevealAngle + 'deg)');
							break;
					}
				} else {
					this.$sectionContainerWrapper.animate(
						{
							left: '-=' + this.$nav.innerWidth() + 'px',
							right: '+=' + this.$nav.innerWidth() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
					this.$navToggle.animate(
						{
							right: '+=' + this.$nav.innerWidth() + 'px'
						},
						this.options.offCanvasAnimationFallbackDuration
					);
				}
			}
			this.prefixCSS(this.$nav, 'transform', 'none');
		}
	};

	Setup.prototype.prefixCSS = function ($obj, prop, val) {
		var style = {};
		style['-webkit-' + prop] = val;
		style['-moz-' + prop] = val;
		style['-ms-' + prop] = val;
		style['-o-' + prop] = val;
		style[prop] = val;

		$obj.css(style);
	};

	Setup.prototype.setupNavScrolling = function () {
		var self = this;

		this.$nav.find('.menu a').on('click', function (e) {
			if (this.hash === '' || $(this.hash).index() === -1) return;

			e.preventDefault();
			var $this = $(this),
				scrollTo = self.sectionPosTop[self.$sectionContainer.children().not('.' + self.options.fixedSectionDummyClass).not('.hidden').index($(this.hash))];

			self.$sectionContainer.animate(
				{ scrollTop: scrollTo },
				self.options.navScrollingAnimationDuration
			);

			$this.parent().addClass('active').siblings().removeClass('active');
		});
	};

	Setup.prototype.computeSectionPosTop = function () {
		// get each section's top position
		// used for computing scrollTop in nav
		
		var baseTop = this.$sectionContainer.children().not('.' + this.options.fixedSectionDummyClass).eq(0).position().top,
			posTopArr = $.map(this.$sectionContainer.find('section').not('.' + this.options.fixedSectionDummyClass).not('.hidden'), function(item, index) {
				var $item = $(item);
				return {
					top: $item.position().top,
					hash: $item.attr('id')
				};
			}),
			posTopAbsArr = $.map(posTopArr, function(item, index) {
				return Math.abs(item.top);
			});

		this.sectionPosTop = $.map(posTopArr, function(item, index) {
			return item.top - baseTop;
		});

		var minPosTopAbs = Math.min.apply(Math, posTopAbsArr),
			i = posTopAbsArr.indexOf(minPosTopAbs);

		if (posTopArr[i].top > 0 && minPosTopAbs /  this.$win.height() > 0.5) i--;
		this.$nav.find('.menu li').not('.hidden').removeClass('active').each(function(index, el) {
			var $el = $(el),
				hash = $el.find('a').get(0).hash;
			if (hash === '#' + posTopArr[i].hash){
				$el.addClass('active');
			}
		});
	};

	$.fn['setup'] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, 'plugin_setup')) {
				$.data(this, 'plugin_setup', new Setup( this, options ));
			}
		});
	};

}(jQuery, window));