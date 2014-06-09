/*
 *  Project: Bar Chart
 *  Description: Bar Chart Plugin for the TsingYi template
 *  Author: Simon Li
 *  License: http://www.simon-li.com
 */

;(function ( $, d3, window, undefined ) {

	var document = window.document,
	defaults = {
		paddingLeft: 0,
		paddingRight: 0,
		barHeight: 26,
		barClassName: 'bar-chart-bar',
		labelClassName: 'bar-chart-label',
		labelFontSize: 12,
		labelFontWeight: 400,
		labelFontColor: '#666666',
		labelHeight: 12,
		labelPaddingLeft: 10,
		labelPaddingRight: 10,
		barVerticalSpacing: 3,
		barStrokeWidth: 0,
		barStrokeColor: '#ffffff',
		defaultBarFillColor: '#ffe0ba',
		initialPercent: 0,
		animationDuration: 1200,
		scrollTopOffset: 200,
		onScrollAnimation: true,
		sectionContainer: '.section-container'
	};

// The actual plugin constructor
function BarChart( element, options ) {
	this.elem = element;
	this.$elem = $(element);
	this.$parent = this.$elem.parent();
	this.options = $.extend( {}, defaults, options) ;
	this._defaults = defaults;
	this.$win = $(window);
	this.$body = $('body');
	this.$sectionContainer = $(this.options.sectionContainer);

	this.barVerticalOffsetUnit = this.options.barHeight + this.options.barVerticalSpacing;
	this.barFullWidth = this.$parent.width() - this.options.paddingLeft - this.options.paddingRight;
	this.labelVerticalOffset = (this.options.barHeight - this.options.labelHeight) / 2;
	this.scrollTopTrigger = this.$elem.parents('section').position().top - this.options.scrollTopOffset;

	this.labels = this.$elem.find('dt').map(function () { return $(this).text(); }).get();
	this.dataset = this.$elem.find('dd').map(function() { return $(this).text(); }).get();

	var self = this;
	this.colorRange = this.$elem.find('dt').map(function () {
		var $this = $(this),
			color = $this.data('color');

		if (color === undefined || color === ''){
			color = self.options.defaultBarFillColor;
		}
		return color;
	}).get();
	this.color = d3.scale.ordinal().range(this.colorRange);

	this.svg = null;
	this.bars = null;
	this.labelItemGroup = null;
	this.labelPercentGroup = null;
	this.hasDrawn = false;

	this.checkPropOverride();
	this.init();
}

BarChart.prototype.checkPropOverride = function () {
	// check if label font color specified
	if (this.$elem.data('label-font-color') !== undefined){
		this.options.labelFontColor = this.$elem.data('label-font-color');
	}
};

BarChart.prototype.init = function () {
	var self = this;
	this.$elem.hide();

	this.svg = d3.select(this.$parent.get(0)).insert('svg', '#'+this.$elem.prop('id'));
	this.bars = this.svg.selectAll('rect').data(this.dataset).enter().append('rect').attr({
		stroke: this.options.barStrokeColor,
		'stroke-width': this.options.barStrokeWidth,
		fill:  function (d) {
			return self.color(d);
		},
		'class': this.options.barClassName,
		width: this.barFullWidth * this.options.initialPercent / 100,
		height: this.options.barHeight,
		x: this.options.paddingLeft,
		y: function (d, i) { return self.barVerticalOffsetUnit * i; },
	});

	this.labelItemGroup = this.svg.append('g').attr('id','label-Items');
	this.labelPercentGroup = this.svg.append('g').attr('id','label-percent');

	this.labelItemGroup.selectAll('text').data(this.labels).enter().append('text').attr({
		x: this.options.paddingLeft + this.options.labelPaddingLeft,
		y: function (d, i) { return self.barVerticalOffsetUnit * (i+1) - self.options.barVerticalSpacing - self.labelVerticalOffset; },
		'font-size': this.options.labelFontSize,
		'font-weight': 'bold',
		'fill': self.options.labelFontColor,
		'opacity': 0,
		'class': this.options.labelClassName
	}).text(function (d) { return d; });
	this.labelPercentGroup.selectAll('text').data(this.dataset).enter().append('text').attr({
		x: function (d, i) { return self.barFullWidth * d/100 - self.options.labelPaddingRight + self.options.paddingLeft; },
		y: function (d, i) { return self.barVerticalOffsetUnit * (i+1) - self.options.barVerticalSpacing - self.labelVerticalOffset; },
		'font-size': this.options.labelFontSize,
		'font-weight': this.options.labelFontWeight,
		'text-anchor': 'end',
		'fill': self.options.labelFontColor,
		'opacity': 0,
		'class': this.options.labelClassName
	}).text(function (d) { return d + '%'; });

	this.resizeCanvas();

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

BarChart.prototype.resizeCanvas = function () {
	// refresh bar full width
	this.barFullWidth = this.$parent.width() - this.options.paddingLeft - this.options.paddingRight;

	// resize svg canvas
	this.svg.attr({
		width: this.$parent.width(),
		height: this.barVerticalOffsetUnit * this.dataset.length - this.options.barVerticalSpacing
	});
};

BarChart.prototype.draw = function (dur) {
	var self = this;

	this.resizeCanvas();

	// draw bars
	this.bars.transition().duration(dur).attr({
		width: function (d, i) { return self.barFullWidth * d/100; },
	});

	// draw item labels
	this.labelItemGroup.selectAll('text').transition().attr({
		'opacity': 1
	});

	// draw percent labels
	this.labelPercentGroup.selectAll('text').transition().attr({
		x: function (d, i) { return self.barFullWidth * d/100 - self.options.labelPaddingRight + self.options.paddingLeft; },
		'opacity': 1
	});
};

$.fn['barChart'] = function ( options ) {
	return this.each(function () {
		if (!$.data(this, 'plugin_bar_chart')) {
			$.data(this, 'plugin_bar_chart', new BarChart( this, options ));
		}
	});
};

}(jQuery, d3, window));