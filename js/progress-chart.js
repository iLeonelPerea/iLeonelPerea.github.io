/*
 *  Project: Progress Chart
 *  Description: Progress bar plugin for the MongKok template
 *  Author: Simon Li
 *  License: http://www.simon-li.com
 */

;(function ( $, window, undefined ) {
	var document = window.document,
		defaults = {
			progressChartItemClass: 'progress-chart-item',
			progressChartItemLabelClass: 'progress-chart-label',
			labelFontSize: 12,
			labelFontWeight: 700,
			labelFontColor: '#666',
			labelPaddingLeft: 0,
			labelPaddingRight: 10,
			labelWidth: 60,
			symbolFontAwesomeClass: 'fa-stop',
			symbolFontSize: 14,
			symbolPaddingLeft: 2,
			symbolPaddingRight: 2,
			itemHeight: 20,
			defaultColor: "black",
			animationDuration: 1200,
			scrollTopOffset: 200,
			onScrollAnimation: true,
			sectionContainer: '.section-container'
		};

	function ProgressChart( element, options ) {
		this.elem = element;
		this.$elem = $(element);
		this.options = $.extend( {}, defaults, options) ;
		this._defaults = defaults;

		this.$win = $(window);
		this.$body = $('body');
		this.$sectionContainer = $(this.options.sectionContainer);
		this.$parent = this.$elem.parent();
		this.labels = this.$elem.find('dt').map(function () { return $(this).text(); }).get();
		this.dataset = this.$elem.find('dd').map(function() { return parseInt($(this).text(), 10); }).get();
		this.itemMinWidth = this.options.labelWidth +
						(this.options.symbolFontSize + this.options.symbolPaddingLeft + this.options.symbolPaddingRight ) *
						Math.max.apply(null, this.dataset);
	
		var self = this;
		this.colorRange = this.$elem.find('dt').map(function () {
			var $this = $(this),
				color = $this.data('color');

			if (color === undefined || color === ''){
				color = self.options.defaultColor;
			}
			return color;
		}).get();

		this.scrollTopTrigger = this.$elem.parents('section').position().top - this.options.scrollTopOffset;
		this.hasDrawn = false;

		this.checkPropOverride();
		this.init();
	}

	ProgressChart.prototype.init = function () {
		var self = this;

		// hide original dt
		this.$elem.hide();

		// set parent min-height
		this.$parent.css({
			'min-height': this.$parent.height() + this.options.itemHeight * this.dataset.length
		});

		this.$win.on('resize', function (e) {
			if (self.hasDrawn){
				self.draw(0);
			}
		});

		if (this.options.onScrollAnimation === true){
			this.$sectionContainer.on('scroll', function (e) {
				if (self.$sectionContainer.scrollTop() > self.scrollTopTrigger && self.hasDrawn === false) {
					self.draw(self.options.animationDuration);
					self.hasDrawn = true;
				}
			});
		}

		if (this.options.onScrollAnimation === true){
			this.$win.on('load', function (e) {
				if (self.$sectionContainer.scrollTop() > self.scrollTopTrigger && self.hasDrawn === false) {
					self.draw(self.options.animationDuration);
					self.hasDrawn = true;
				}
			});
		} else {
			this.draw(0);
		}
	};

	ProgressChart.prototype.checkPropOverride = function () {
		if (this.$elem.data('symbol-font-awesome-class') !== undefined){
			this.options.symbolFontAwesomeClass = this.$elem.data('symbol-font-awesome-class');
		}
	};

	ProgressChart.prototype.draw = function (dur) {
		var self = this;

		this.$parent.find('.' + this.options.progressChartItemClass).remove();

		// draw label and progress using symbol
		$.each(this.labels, function(index, val) {
			var i,
				$symbol = $('<i/>').addClass('fa').addClass(self.options.symbolFontAwesomeClass);
				$progressItemHtml = $('<div/>').addClass(self.options.progressChartItemClass);

			$('<span/>').addClass(self.options.progressChartItemLabelClass).html(val).appendTo($progressItemHtml);
			for (i=0;i<self.dataset[index];i++){
				$symbol.clone().appendTo($progressItemHtml);
			}

			// add styling
			$progressItemHtml.css({
				height: self.options.itemHeight + 'px',
				lineHeight: self.options.itemHeight + 'px',
				minWidth: self.itemMinWidth
			}).find('i.fa').css({
				color: self.colorRange[index],
				paddingLeft: self.options.symbolPaddingLeft,
				paddingRight: self.options.symbolPaddingRight,
				opacity: 0
			}).end().find('.' + self.options.progressChartItemLabelClass).css({
				display: 'inline-block',
				fontSize: self.options.labelFontSize,
				fontWeight: self.options.labelFontWeight,
				color: self.options.labelFontColor,
				paddingLeft: self.options.labelPaddingLeft,
				paddingRight: self.options.labelPaddingRight,
				width: self.options.labelWidth + 'px',
			});

			$progressItemHtml.appendTo(self.$parent);
		});

		// animate
		var $progressItems = $('.' + this.options.progressChartItemClass),
			currVal = 0,
			maxVal = Math.max.apply(null, this.dataset),
			interval = dur / maxVal,
			intervalHandler = setInterval(function () {
				if (currVal > maxVal) clearInterval(intervalHandler);
				else{
					$progressItems.find('i.fa:nth-child(' + (currVal+1) + ')').css({
						opacity: 1
					});
					currVal++;
				}
			}, interval);
	};

	$.fn['progressChart'] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, 'plugin_progress_chart')) {
				$.data(this, 'plugin_progress_chart', new ProgressChart( this, options ));
			}
		});
	};

}(jQuery, window));