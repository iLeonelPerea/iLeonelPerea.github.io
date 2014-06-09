/*
 *  Project: Donut Chart
 *  Description: Donut Chart Plugin for the TsingYi template
 *  Author: Simon Li
 *  License: http://www.simon-li.com
 */

;(function ( $, d3, window, undefined ) {
	var document = window.document,
	defaults = {
		paddingLeft: 150,
		paddingRight: 0,
		paddingTop: 5,
		paddingBottom: 5,
		labelClassName: 'donut-chart-label',
		labelFontSize: 12,
		labelFontWeight: 700,
		labelFontColor: '#666',
		labelHeight: 12,
		showLabel: true,
		showPercentage: false,
		heightToWidthRatio: 1/2,
		maxHeight: 200,
		arcInnerRadiusPercent: 50,
		arcOuterRadiusPercent: 100,
		arcStrokeWidth: 3,
		arcStrokeColor: '#ffffff',
		defaultArcFillColor: '#ffe0ba',
		animationDuration: 200,
		animationEasing: 'linear',
		scrollTopOffset: 200,
		onScrollAnimation: true,
		sectionContainer: '.section-container'
	};

function DonutChart( element, options ) {
	this.elem = element;
	this.$elem = $(element);
	this.$parent = this.$elem.parent();
	this.options = $.extend( {}, defaults, options) ;
	this._defaults = defaults;
	this.$win = $(window);
	this.$body = $('body');
	this.$sectionContainer = $(this.options.sectionContainer);
	this.total = 0;

	this.dataset = this.$elem.find('dt').map(function () {
			var $this = $(this);

			return {
				item: $this.text(),
				value: parseInt($this.next().text(), 10),
			};
		}).get();

	var i;
	for (i=0;i<this.dataset.length;i++){
		this.total += this.dataset[i].value;
	}

	var self = this;
	this.colorRange = this.$elem.find('dt').map(function () {
		var $this = $(this),
			color = $this.data('color');

		if (color === undefined || color === ''){
			color = self.options.defaultArcFillColor;
		}
		return color;
	}).get();
	this.color = d3.scale.ordinal().range(this.colorRange);

	this.svg = null;
	this.svgWidth = this.$parent.width();
	this.svgHeight = this.$parent.width() * this.options.heightToWidthRatio;
	if (!isNaN(this.options.maxHeight) && this.options.maxHeight > 0 && this.svgHeight > this.options.maxHeight)
		this.svgHeight = this.options.maxHeight;
	this.mainGroup = null;

	this.arc = null;
	this.arcs = null;
	this.arcPaths = null;
	this.arcLabels = null;
	this.pie = null;

	this.scrollTopTrigger = this.$elem.parents('section').position().top - this.options.scrollTopOffset;
	this.hasDrawn = false;

	this.refreshProps();

	this.checkPropOverride();
	this.init();
}

DonutChart.prototype.checkPropOverride = function () {
	if (this.$elem.data('label-font-color') !== undefined){
		this.options.labelFontColor = this.$elem.data('label-font-color');
	}
	if (this.$elem.data('show-labels') !== undefined){
		this.options.showLabel = this.$elem.data('show-labels');
	}
	if (this.$elem.data('show-percentage') !== undefined){
		this.options.showPercentage = this.$elem.data('show-percentage');
	}
	if (this.$elem.data('max-height') !== undefined){
		this.options.maxHeight = this.$elem.data('max-height');
	}
	if (this.$elem.data('arc-inner-radius-percent') !== undefined){
		this.options.arcInnerRadiusPercent = this.$elem.data('arc-inner-radius-percent');
	}
	if (this.$elem.data('arc-outer-radius-percent') !== undefined){
		this.options.arcOuterRadiusPercent = this.$elem.data('arc-outer-radius-percent');
	}
	if (this.$elem.data('arc-stroke-width') !== undefined){
		this.options.arcStrokeWidth = this.$elem.data('arc-stroke-width');
	}
	if (this.$elem.data('arc-stroke-color') !== undefined){
		this.options.arcStrokeColor = this.$elem.data('arc-stroke-color');
	}
};

DonutChart.prototype.init = function () {
	var self = this;
	this.$elem.hide();

	this.svg = d3.select(this.$parent.get(0)).insert('svg', '#'+this.$elem.prop('id'));
	this.mainGroup = this.svg.append('g')
						.attr('transform',
								'translate(' + this.cx + ', ' + this.cy + ')');
	this.legendGroup = this.svg.append('g').attr('transform', 'translate(0, 0)');

	this.pie = d3.layout.pie().sort(null).value(function (d) { return d.value; });

	this.arcs = this.mainGroup.selectAll('.arc').data(this.pie(this.dataset)).enter().append('g').attr('class', 'arc');
	this.arcPaths = this.arcs.append('path').attr({
		'stroke-width': this.options.arcStrokeWidth,
		stroke: this.options.arcStrokeColor,
		fill: function (d) {
			return self.color(d.data.item);
		},
	});
	this.labels = this.legendGroup.selectAll('text').data(this.pie(this.dataset)).enter().append('text').attr({
		// 'text-anchor': 'middle',
		'font-size': this.options.labelFontSize,
		'font-weight': this.options.labelFontWeight,
		fill: this.options.labelFontColor,
		opacity: 0,
		'class': this.options.labelClassName
	});
	this.rects = this.legendGroup.selectAll('rect').data(this.pie(this.dataset)).enter().append('rect').attr({
		// 'text-anchor': 'middle',
		// 'font-size': this.options.labelFontSize,
		// 'font-weight': this.options.labelFontWeight,
		fill: function (d) {
			return self.color(d.data.item);
		},
		opacity: 0,
		// 'class': this.options.labelClassName
	});

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

DonutChart.prototype.refreshProps = function () {
	this.svgWidth = this.$parent.width();
	this.svgHeight = this.$parent.width() * this.options.heightToWidthRatio;
	if (!isNaN(this.options.maxHeight) && this.options.maxHeight > 0 && this.svgHeight > this.options.maxHeight)
		this.svgHeight = this.options.maxHeight;
	if (this.svgHeight < 6+20*this.dataset.length) this.svgHeight = 6+20*this.dataset.length;
	this.rx = (this.svgWidth - this.options.paddingLeft - this.options.paddingRight) / 2;
	this.ry = (this.svgHeight - this.options.paddingTop - this.options.paddingBottom) / 2;
	this.radius = Math.min(this.rx, this.ry);
	this.cx = this.svgWidth - this.options.paddingRight - this.radius;
	this.cy = this.options.paddingTop + this.ry;
};

DonutChart.prototype.resizeCanvas = function () {
	// resize svg canvas
	this.svg.attr({
		width: this.svgWidth,
		height: this.svgHeight
	});
};

DonutChart.prototype.draw = function (dur) {
	var self = this;

	// refresh
	this.refreshProps();

	// resize canvas
	this.resizeCanvas();

	// refresh the main group
	this.mainGroup.attr('transform', 'translate(' + this.cx + ', ' + this.cy + ')');

	// refresh the arc function
	this.arc = d3.svg.arc()
		.outerRadius(this.radius * this.options.arcOuterRadiusPercent / 100)
		.innerRadius(this.radius * this.options.arcInnerRadiusPercent / 100);

	// redraw labels
	this.labels.attr({
		x: 20,
		y: function (d, i) {return (i+1)*20;}
	}).transition().delay(
		function(d, i) {
			return i * dur;
		}).duration(dur).attr({
		opacity: 1
	}).text( function (d) {
		if (self.options.showLabel)
			return d.data.item + (self.options.showPercentage ? ' (' + Math.round(d.data.value / self.total * 100) + '%)' : '');
		else
			return '';
	});

	// redraw rectangles
	this.rects.attr({
		x: 0,
		y: function (d, i) {return i*20+6;},
		width: 16,
		height: 16
	}).transition().delay(
		function(d, i) {
			return i * dur;
		}).duration(dur).attr({
		opacity: 1
	});

	// redraw arcs
	// d3 donut chart animation: http://stackoverflow.com/questions/19950908/d3-js-attrtween-returning-null-unexpected-behavior
	this.arcPaths.transition().delay(
		function(d, i) {
			return i * dur;
			// return 0;
		}).duration(dur).ease(this.options.animationEasing)
		.attrTween('d', function(d) {
			var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
			return function(t) {
				d.endAngle = i(t);
				return self.arc(d);
			};
		});
};

$.fn['donutChart'] = function ( options ) {
	return this.each(function () {
		if (!$.data(this, 'plugin_donut_chart')) {
			$.data(this, 'plugin_donut_chart', new DonutChart( this, options ));
		}
	});
};

}(jQuery, d3, window));