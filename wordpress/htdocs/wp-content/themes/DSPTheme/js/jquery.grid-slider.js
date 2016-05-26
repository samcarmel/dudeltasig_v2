/**
 * jQuery Grid Slider
 * Copyright (c) 2014 Allan Ma (http://codecanyon.net/user/webtako)
 * Version: 2.6 (9/4/2014)
 */
(function($) {
    var IS_TOUCH = 'ontouchstart' in window;
	var AJAX_ACTION = 'kpm_gs_get_post';
	
	var PLUGIN = 'gridSlider',
		ANIMATE_SPEED = 400,
		SWIPE_MIN = 40,
		ERROR_MSG = 'Error Loading Content';
	
	var LOAD_CONTENT = 'gsLoadContent',
		PROCESS_IMG = 'gsProcessImg',
		CHANGE_SLIDES = 'gsChangeSlides',
		INIT_SIZE = 'gsInitSize',
		INIT_CAPTION = 'gsInitCaption',
		SHOW_CAPTION = 'gsShowCaption',
		HIDE_CAPTION = 'gsHideCaption';
	
	var SLIDER_INIT = 'gridSliderInit',
		SLIDER_PLAY = 'gridSliderPlay',
		SLIDER_PAUSE = 'gridSliderPause',
		SLIDER_PREV = 'gridSliderPrevious',
		SLIDER_NEXT = 'gridSliderNext',
		SLIDER_BEGIN = 'gridSliderBegin',
		SLIDER_END = 'gridSliderEnd';
	
	var ANDROID2 = androidCheck(2.9),
		MSIE = msieCheck(),
		MSIE7 = msieCheck(7);
	
	var SUPPORT = {};
	styleSupport('transition');
	styleSupport('transform');
	styleSupport('boxSizing');
	styleSupport('boxShadow');
	styleSupport('backgroundSize');
	
	var CUBIC_BEZIER = {
		'linear':			'linear',
		'':					'ease',
		'swing':			'ease',
		'ease':           	'ease',
       	'ease-in':        	'ease-in',
       	'ease-out':       	'ease-out',
       	'ease-in-out':    	'ease-in-out',
		'easeInQuad':		'cubic-bezier(.55,.085,.68,.53)',
		'easeOutQuad':		'cubic-bezier(.25,.46,.45,.94)',
		'easeInOutQuad':	'cubic-bezier(.455,.03,.515,.955)',
		'easeInCubic':		'cubic-bezier(.55,.055,.675,.19)',
		'easeOutCubic':		'cubic-bezier(.215,.61,.355,1)',
		'easeInOutCubic':	'cubic-bezier(.645,.045,.355,1)',
		'easeInQuart':		'cubic-bezier(.895,.03,.685,.22)',
		'easeOutQuart':		'cubic-bezier(.165,.84,.44,1)',
		'easeInOutQuart':	'cubic-bezier(.77,0,.175,1)',
		'easeInQuint':		'cubic-bezier(.755,.05,.855,.06)',
		'easeOutQuint':		'cubic-bezier(.23,1,.32,1)',
		'easeInOutQuint':	'cubic-bezier(.86,0,.07,1)',
		'easeInSine':		'cubic-bezier(.47,0,.745,.715)',
		'easeOutSine':		'cubic-bezier(.39,.575,.565,1)',
		'easeInOutSine':	'cubic-bezier(.445,.05,.55,.95)',
		'easeInExpo':		'cubic-bezier(.95,.05,.795,.035)',
		'easeOutExpo':		'cubic-bezier(.19,1,.22,1)',
		'easeInOutExpo':	'cubic-bezier(1,0,0,1)',
		'easeInCirc':		'cubic-bezier(.6,.04,.98,.335)',
		'easeOutCirc':		'cubic-bezier(.075,.82,.165,1)',
		'easeInOutCirc':	'cubic-bezier(.785,.135,.15,.86)',
		'easeInBack':		'cubic-bezier(.60,-.28,.735,.045)',
		'easeOutBack':		'cubic-bezier(.175,.885,.32,1.275)',
		'easeInOutBack':	'cubic-bezier(.68,-.55,.265,1.55)'
	};
	 
	var CSS_TRANSITION,
		CSS_TRANSITION_END;
	
	switch(SUPPORT.transition) {
		case 'WebkitTransition':
			CSS_TRANSITION = '-webkit-transition';
			CSS_TRANSITION_END = 'webkitTransitionEnd';
			break;
		case 'MozTransition':
			CSS_TRANSITION = '-moz-transition';
			CSS_TRANSITION_END = 'transitionend';
			break;
		case 'OTransition':
			CSS_TRANSITION = '-o-transition';
			CSS_TRANSITION_END = 'oTransitionEnd';
			break;
		default:
			CSS_TRANSITION = 'transition';
			CSS_TRANSITION_END = 'transitionend';
			break;
	}
	
	//Packer Class
	function Packer(width, height) {
		if (this instanceof Packer) {
			this._bins = [];
			this._bins[0] = new Rect(0, 0, width, height);
		}
		else {
			return new Packer(width, height);
		}
	}

	Packer.prototype = {
		constructor: Packer,

		fitRect: function(width, height) {
			var rect = this.findTopLeftPosition(width, height),
				len = this._bins.length;
				
			for (var i = 0; i < len; i++) {
				if (this.splitBin(rect, this._bins[i])) {
					this._bins.splice(i, 1);
					i--;
					len--;
				}
			}

			this.pruneList();
		
			return rect;
		},

		findTopLeftPosition: function(width, height) {
			var rect = new Rect(0, 0, 0, 0),
				smallY = Number.MAX_VALUE,
				smallX = Number.MAX_VALUE,				
				len = this._bins.length;
			
			for (var i = 0; i < len; i++) {
				var bin = this._bins[i];
				if (bin.fit(width, height)) {
					var y = bin.y,
						x = bin.x;
					
					if (y < smallY || (y === smallY && x < smallX)) {
						rect.x = x;
						rect.y = y;
						rect.width = width;
						rect.height = height;

						smallY = y;
						smallX = x;
					}
				}
			}

			return rect;
		},

		splitBin: function(rect, bin) {
			if (rect.x >= bin.x2() || rect.x2() <= bin.x ||
				rect.y >= bin.y2() || rect.y2() <= bin.y) {
				return false;
			}

			if (rect.x < bin.x2() && rect.x2() > bin.x) {
				if (rect.y > bin.y && rect.y < bin.y2()) {
					this._bins.push(new Rect(bin.x, bin.y, bin.width, rect.y - bin.y));
				}

				if (rect.y2() < bin.y2()) {
					var y = rect.y2(),
						height = bin.y2() - y;
					this._bins.push(new Rect(bin.x, y, bin.width, height));
				}
			}

			if (rect.y < bin.y2() && rect.y2() > bin.y) {
				if (rect.x > bin.x && rect.x < bin.x2()) {
					this._bins.push(new Rect(bin.x, bin.y, rect.x - bin.x, bin.height));
				}

				if (rect.x2() < bin.x2()) {
					var x = rect.x2(),
						width = bin.x2() - x;
					this._bins.push(new Rect(x, bin.y, width, bin.height));
				}
			}

			return true;
		},

		pruneList: function() {
			for (var i = 0; i < this._bins.length; i++) {
				var rect1 = this._bins[i];
				for (var j = i + 1; j < this._bins.length; j++) {
					var rect2 = this._bins[j];

					if (rect2.contains(rect1)) {
						this._bins.splice(i, 1);
						i--;
						break;
					}

					if (rect1.contains(rect2)) {
						this._bins.splice(j, 1);
						j--;
					}
				}
			}
		},

		toString: function() {
			return this._bins.join();
		}
	};
	
	//Rect Class
	function Rect(x, y, width, height) {
		if (this instanceof Rect) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}
		else {
			return new Rect(x, y, width, height);
		}
	}
	
	Rect.prototype = {
		constructor: Rect,

		fit: function(width, height) {
			return (width <= this.width && height <= this.height);
		},
		
		contains: function(rect) {
			return (this.x <= rect.x && rect.x2() <= this.x2() && this.y <= rect.y && rect.y2() <= this.y2());
		},

		isValid: function() {
			return (0 < this.width && 0 < this.height);
		},

		x2: function() {
			return this.x + this.width;
		},

		y2: function() {
			return this.y + this.height;
		},

		toString: function() {
			return '[x = ' + this.x + ', y = ' + this.y + ', width = ' + this.width + ', height = ' + this.height + ']';  
		}
	};
	
	//HoverBox Class
	function HoverBox(opts, namespace) {
		if (this instanceof HoverBox) {
			this._defaultWidth = getPosInteger(opts.width, 'auto');
			this._defaultHeight = getPosInteger(opts.height, 'auto');
			this._effect = getValue(opts.effect, 'fade');
			this._toggle = opts.toggle;

			this._$hoverBox = $('<div class="gs-hover-box">\
									<div class="gs-hover-content"></div>\
									<div class="gs-hover-bg"></div>\
									<div class="gs-left-shadow-arrow"></div>\
									<div class="gs-right-shadow-arrow"></div>\
									<div class="gs-hover-close"><div></div></div>\
								 </div>');

			this._$contentBox = this._$hoverBox.find('>.gs-hover-content');
			this._$background = this._$hoverBox.find('>.gs-hover-bg');
			this._$closeButton = this._$hoverBox.find('>.gs-hover-close');
			this._$leftArrow  = this._$hoverBox.find('>.gs-left-shadow-arrow');
			this._$rightArrow = this._$hoverBox.find('>.gs-right-shadow-arrow');
			if (!SUPPORT.boxShadow) {
				this._$leftArrow.addClass('gs-left-arrow').removeClass('gs-left-shadow-arrow');
				this._$rightArrow.addClass('gs-right-arrow').removeClass('gs-right-shadow-arrow');
			}

			$('body').prepend(this._$hoverBox);
			
			this._$hoverBox.one(INIT_SIZE, $.proxy(function() {
				this._padding = this._$contentBox.outerWidth() - this._$contentBox.width();				
				this._margin = this._$hoverBox.outerWidth() - this._$hoverBox.width();
				this._arrowWidth = this._$leftArrow.width() - 1;
				this._arrowHeight = this._$leftArrow.outerHeight(true);
				this._minWidth = parseInt(this._$contentBox.css('minWidth'), 10) + this._padding + this._margin;
			}, this));
			
			if (this._toggle) {
				this._delay = 0;
				this._$closeButton.gsAddTransitionClass('gs-all-transition')
									.click({delay:0}, $.proxy(this.fadeOut, this))
									.mousedown(preventDefault);
				
				this._$hoverBox.click(function(e) {
					e.stopPropagation();
				});

				$(document).bind('click'+namespace, {delay:0}, $.proxy(this.fadeOut, this));
			}
			else {
				this._delay = getNonNegInteger(opts.delay, 1000);
				this._$closeButton.remove();
				this._$hoverBox.hover(function() {
									$(this).addClass('gs-hover-on');
								},
							   	$.proxy(function() {
							   		this._$hoverBox.removeClass('gs-hover-on');
							   		this.fadeOut(100);
							   	}, this));
			}
		}
		else {
			return new HoverBox(opts, namespace);
		}
	}
	
	HoverBox.prototype = {
		constructor: HoverBox,
		
		toggle: function($el) {
			if ($el.is(this._$slide)) {
				this.fadeOut(0);
			}
			else {
				this._$slide = $el;
				this.fadeIn($el);
			}
		},
		
		//set align right
		setAlignRight: function() {
			this._$hoverBox.removeClass('gs-hover-left');
			this._$currArrow = this._$leftArrow;
		},
		
		//set align left
		setAlignLeft: function() {
			this._$hoverBox.addClass('gs-hover-left');
			this._$currArrow = this._$rightArrow;
		},
		
		//get available left space
		getFreeLeft: function() {
			return Math.max(this._$slide.offset().left - $(window).scrollLeft(), 0);
		},

		//get available right space
		getFreeRight: function() {
			return $(window).width() - Math.max(this._$slide.offset().left - $(window).scrollLeft() + this._$slide.width(), 0);
		},

		//is left available
		isLeftAvail: function() {
			return this.getFreeLeft() > this.getFreeRight();
		},
		
		//is right available
		isRightAvail: function() {
			return this.getFreeRight() > this.getFreeLeft();
		},

		setAutoSize: function(maxWidth) {
			var $item = this._$slide.find('.gs-hover'),				
				type = $item.data('content-type'),
				contentWidth = maxWidth - this._padding - this._margin;

			if ('image' === type) {
				var $content = this._$contentBox.children().first(),
					width = $content.width();
				
				if (width) {
					this._$contentBox.width(width);
					if (this._$hoverBox.outerWidth() > maxWidth) {
						this._$contentBox.width(contentWidth);
					}
				}
			}
			else {
				this._$contentBox.width(contentWidth);
			}
		},

		//set hoverbox position
		setPosition: function() {
			var	slideTop = this._$slide.offset().top,
				slideLeft = this._$slide.offset().left,
				slideWidth = this._$slide.width(),
				slideHeight = this._$slide.height(),
				winLeft = $(window).scrollLeft(),
				winTop = $(window).scrollTop(),
				winWidth = $(window).width(),
				winHeight = $(window).height(),
				hoverTop, hoverLeft, hoverWidth, hoverHeight,
				autoWidth = isNaN(this._width);

			//set x position
			if (0 === this._$slide.position().left) {
				this.setAlignRight();
				hoverLeft = slideLeft + slideWidth;

				//set auto width
				if (autoWidth) {
					this.setAutoSize(Math.max(winLeft + winWidth - hoverLeft, this._minWidth));
				}

				hoverWidth = this._$hoverBox.outerWidth();
				
				//check available left
				if (!autoWidth && (hoverLeft + hoverWidth > winLeft + winWidth) && this.isLeftAvail()) {
					this.setAlignLeft();
					hoverLeft = slideLeft - hoverWidth;
				}
			}
			else {
				this.setAlignLeft();

				//set auto width
				if (autoWidth) {
					this.setAutoSize(Math.max(slideLeft - winLeft, this._minWidth));
				}

				hoverWidth = this._$hoverBox.outerWidth();
				hoverLeft = slideLeft - hoverWidth;

				if (!autoWidth && hoverLeft < winLeft && this.isRightAvail()) {
					this.setAlignRight();
					hoverLeft = slideLeft + slideWidth;
				}
			}
			
			//set y position
			hoverHeight = this._$hoverBox.outerHeight();
			hoverTop = slideTop - ((hoverHeight - slideHeight)/2);
			
			if (hoverTop + hoverHeight > winTop + winHeight) {
				hoverTop = Math.max(winTop + winHeight - hoverHeight, slideTop + this._arrowHeight - hoverHeight);
			}
			
			if (hoverTop < winTop) {
				hoverTop = Math.min(winTop, slideTop + slideHeight - this._arrowHeight);
			}

			//set position
			this._$hoverBox.css({top:hoverTop, left:hoverLeft});

			//set arrow position
			var top = Math.max(hoverTop, slideTop),
				bottom = Math.min(hoverTop + hoverHeight, slideTop + slideHeight),
				offset = ((bottom - top) - this._arrowHeight)/2;

			offset += Math.max(slideTop - hoverTop, 0);
			this._$currArrow.css({top:offset});
		},
		
		showContent: function() {
			this._$contentBox.removeClass('gs-hidden-el');
			this._$background.hide();
			this._$closeButton.show();
		},
		
		expandContent: function(top) {
			top = Math.max(this._$currArrow.position().top - top, 0);
			this._$background.css({top:top}).animate({top:0, width:this._$contentBox.width(), height:this._$contentBox.height()}, 
													 {duration:ANIMATE_SPEED, complete:$.proxy(this.showContent, this), queue:false});
		},

		fadeIn: function($slide) {
			clearTimeout(this._showId);
			this._$slide = $slide;
			
			this._showId = setTimeout($.proxy(function() {
				clearTimeout(this._hideId);
				var $item = this._$slide.find('.gs-hover');
				this._width = getValue($item.data('width'), this._defaultWidth);
				this._height = getValue($item.data('height'), this._defaultHeight); 

				this._$hoverBox.addClass('gs-hidden-el').show().trigger(INIT_SIZE);
				this._$closeButton.hide();
				this._$contentBox.addClass('gs-hidden-el').css({width:this._width, height:this._height});
				this._$background.stop(true).css({top:0, width:this._width, height:this._height}).show();
				
				this.loadContent().done($.proxy(function() {
					var arrowTop = this._$currArrow.position().top;
					this.setPosition();
					this.expandContent(arrowTop);
				}, this));

				this._$hoverBox.removeClass('gs-hidden-el');
				if ('fade' === this._effect) {
					this._$hoverBox.stop(true, true).css({opacity:0}).animate({opacity:1}, ANIMATE_SPEED);
				}
			}, this), this._delay);
		},
		
		fadeOut: function() {
			var delay = 0;

			if (arguments.length) {
				var arg = arguments[0];
				if (typeof arg === 'number') {
					delay = arg;
				}
				else if (arg.data && typeof arg.data.delay === 'number') {
					delay = arg.data.delay;
				}
			}

			clearTimeout(this._showId);
			clearTimeout(this._hideId);
			this._$slide = null;
				
			this._hideId = setTimeout($.proxy(function() {
				if (this._$hoverBox.hasClass('gs-hover-on')) {
					return;
				}

				if ('fade' === this._effect) {
					this._$hoverBox.stop(true, true).animate({opacity:0}, ANIMATE_SPEED, function() { $(this).hide(); });
				}
				else {
					this._$hoverBox.hide();
				}
			}, this), delay);
		},
		
		hide: function() {
			clearTimeout(this._showId);
			clearTimeout(this._hideId);
			this._$slide = null;
			this._$hoverBox.hide();
		},
		
		loadContent: function($slide) {
			var deferred = $.Deferred(),
				$item = this._$slide.find('.gs-hover'),
				type = $item.data('content-type'),
				$content;
			
			this._$contentBox.css({overflow:'auto'}).empty();
			if (typeof type === 'undefined' && !isEmpty($item.html())) {
				type = 'static';
				$item.data('content-type', type);
			}

			if ('static' === type) {
				this._$contentBox.append($('<div></div>').html($item.html()));
				this.setPosition();
				this.showContent();
				deferred.reject();
			}
			else {
				var url = $item.data('src');
				if (typeof type === 'undefined') {
					type = getContentType(url);
					$item.data('content-type', type);
				}

				if ('image' === type) {
					$content = $('<img/>').css({maxWidth:'none'});
					this._$contentBox.append($content);
					this.setPosition();

					$content.one('load', $.proxy(function(e) { 
						if ($.contains(this._$hoverBox[0], e.currentTarget)) {
							deferred.resolve();
						}
						else {
							deferred.reject();
						}
					}, this)).error(function() {
						deferred.reject();
					}).attr('src', url);
					
					if ($content[0].complete || 'complete' === $content[0].readyState) {
						$content.trigger('load');
					}
				}
				else if ('inline' === type) {
					this._$contentBox.append($('<div></div>').html($(url).html()));
					this.setPosition();
					this.showContent();
					deferred.reject();
				}
				else if ('flash' === type) {
					this._$contentBox.html(getFlashContent(url));
					this.setPosition();
					this.showContent();
					deferred.reject();
				}
				else if ('post' === type || 'ajax' === type) {
					var method, varData; 
					
					if ('post' === type) {
						url = ajaxurl;
						varData = $.param({action:AJAX_ACTION, post_id:$item.data('post-id')});
						method = 'POST';
					}
					else {
						var index = url.indexOf('?');
						method = getValue($item.data('method'), 'GET');
						
						if (-1 < index) {
							varData = url.substring(index + 1);
							url = url.substring(0, index);
						}
						else {
							varData = '';
						}
					}
									
					$content = $('<div></div>');
					this._$contentBox.append($content);
					this.setPosition();

					$.ajax({url:url, type:method, data:varData,
							success:$.proxy(function(data) {
								if ($.contains(this._$hoverBox[0], $content[0])) {
									$content.html(data);
									deferred.resolve();
								}
								else {
									deferred.reject();
								}
							}, this),
							error:$.proxy(function() {
								deferred.reject();
							})
						});
				}
				else {
					$content = $('<iframe frameborder="0" hspace="0" scrolling="auto" width="100%" height="100%"></iframe>').hide();
					this._$contentBox.css({overflow:'hidden'}).append($content);
					this.setPosition();

					$content.load($.proxy(function(e) {
						if ($.contains(this._$hoverBox[0], e.currentTarget)) {
							$(e.currentTarget).show();
							deferred.resolve();
						}
						else {
							deferred.reject();
						}
					}, this)).attr('src', url);
				}
			}
			return deferred.promise();
		}
	};
	
	//Class Grid Slider
	function GridSlider(obj, opts) {
		if (this instanceof GridSlider) {
			this._$slider = $(obj);
			this._options = opts;
			
			this._responsive = opts.responsive;
			var outerSize = !(!SUPPORT.boxSizing && this._responsive);
			if (IS_TOUCH) {
				opts.hoverBox.toggle = true;
				$('body').addClass('gs-touch');		
			}
			
			this._numCols = getPosInteger(opts.numCols, 4);
			this._numRows =	getPosInteger(opts.numRows, 2);
			this._minSlideWidth = getPosInteger(opts.minSlideWidth, 200);
			this._slideWidth = getPosInteger(opts.slideWidth, 300);
			this._slideHeight = getPosInteger(opts.slideHeight, 200);
			this._slideMargin = (outerSize ? getNonNegInteger(opts.slideMargin, 0) : 0);
			this._borderWidth =	(outerSize ? getNonNegInteger(opts.slideBorder, 0) : 0);
			this._captionWidth = getNonNegInteger(opts.captionWidth, 'auto');
			this._captionHeight = getNonNegInteger(opts.captionHeight, 'auto');
			this._padding = getNonNegInteger(this._options.padding, 0);
			this._rotate = opts.autoPlay;
			this._delay = getPosInteger(opts.delay, 5000);
			this._speed = getPosInteger(opts.speed, 500);
			this._tabIndex = getNonNegInteger(opts.tabIndex, 0);
			this._cssTransition = SUPPORT.transition && !ANDROID2 ? opts.cssTransition : false;
			this._cssTransform = this._cssTransition && SUPPORT.transform;
			
			this._namespace = '.' + ((typeof this._$slider.attr('id') !== 'undefined') ? ('grid-slider-' + this._$slider.attr('id')) : 'grid-slider');
			this._timerId = null;
			this._currIndex = 0;
			this._borderSize = (2 * this._borderWidth);
			this.setOptColor(this._$slider, this._options.backgroundColor, 'backgroundColor');
			this.setOptColor(this._$slider, this._options.color, 'color');
			this._bgColor = this._$slider.css('backgroundColor');
			this._orgCols = this._numCols;
			this._orgRows = this._numRows;
			this._dimension = this._numRows * this._numCols;
			this._outerSize = this._borderSize + this._slideMargin;
			this._backgroundSize = SUPPORT.backgroundSize;			
			this._hoverBox = new HoverBox(opts.hoverBox, this._namespace);
			
			this.start = $.noop;
			this.changeIndexes = $.noop;
			this.refreshIndexes = $.noop;
			this.refreshButtons = $.noop;
			this.updatePageInfo = $.noop;
			this.resizeMenu = $.noop;
			this.resizeCPanel = $.noop;
			this.pauseOnAction = $.noop;

			this.init();
		}
		else {
			return new GridSlider(obj, opts);
		}
	}
	
	GridSlider.prototype = {
		constructor: GridSlider,

		init: function() {
			if (!this._cssTransition) {
				$.fn.gsTransition = $.fn.animate;
				$.fn.gsStopTransition = $.fn.stop;
			}
			
			this._$lists = this._$slider.find('>ul').addClass('gs-list').data({index:0, init:false, packed:false});
			this._$slides = this._$lists.find('>li').addClass('gs-slide');
			
			if (ANDROID2) {
				this._$slides.css('backface-visibility', 'visible');
			}
				
			this._$lists.wrapAll($('<div class="gs-container"><div class="gs-main-panel"><div class="gs-slide-panel"></div></div></div>'));
			this._$container = this._$slider.find('>.gs-container');
			this._$mainPanel = this._$container.find('>.gs-main-panel');
			this._$slidePanel = this._$mainPanel.find('>.gs-slide-panel');
			this._tabIndex = Math.min(this._tabIndex, this._$lists.length - 1);
			
			//init components
			this.initLists();
			this.initControl();
			this.initMenu();
			this.initContentPanel();
			this.initContainer();
			
			//select current tab
			this.start = this.startTimer;
			this.selectTab(this._tabIndex);
		
			//bind events
			if (this._responsive) {
				this.resize(true);
				$(window).bind('resize' + this._namespace, $.proxy(function() { this.resize(false); }, this));
			}		
			$(window).bind('resize' + this._namespace, $.proxy(this.hideHoverBox, this));
			
			if (!IS_TOUCH && this._options.pauseOnHover) {
				this._$slider.hover($.proxy(this.pause, this), $.proxy(this.play, this));
			}

			if (this._options.pauseOnInteraction) {
				this.pauseOnAction = this.pause;
			}
		},

		preloadNext: function(items, callback) {
			if (items.length) {
				this.loadImage($(items.splice(0, 1)))
				.always($.proxy(function() {
					this.preloadNext(items, callback);
				}, this));
			}
			else if ($.isFunction(callback)) {
				callback.call(this);
			}
		},

		loadImage: function($slide) {
			var deferred = this.getDeferred($slide);

			if ($slide.find('img.gs-slide-content').length || 'image' === $slide.data('content-type')) {
				$slide.trigger(LOAD_CONTENT);
			}
			else {
				deferred.reject();
			}

			return deferred.promise();
		},

		resize: function(enforce) {
			if (enforce || $(window).width() !== this._winWidth) {
				this._winWidth = $(window).width();

				this.pauseTimer();
				this.start = $.noop;
				
				var deferred = $.Deferred();
				deferred.promise().always($.proxy(function() {
					this.start = this.startTimer;
					this.start();
				}, this));

				var $bins = this._$currList.children(),
					binWidth = $bins.width(),
					columns = Math.min(Math.max(Math.round(binWidth/this._minSlideWidth), this._minCols), this._orgCols);
				
				while (this._dimension%columns !== 0) {
					columns--;
				}
				
				if (columns < this._minCols) {
					columns = this._minCols;
				}

				rows = Math.ceil(this._dimension/columns);

				if (!enforce) {
					enforce = (columns !== this._numCols);
				}
				
				this._numCols = columns;
				this._numRows = rows;
							
				var slideOuterWidth = Math.round(binWidth/this._numCols),
					slideWidth = slideOuterWidth - this._outerSize;
				
				if (this._$slider.data('horizontal-captions')) {
					slideWidth -= this._captionWidth;
				}
				
				var	slideHeight = Math.round((slideWidth/this._slideWidth) * this._slideHeight),
					slideOuterHeight = slideHeight + this._outerSize;
					
				if (this._$slider.data('vertical-captions')) {
					slideOuterHeight += this._captionHeight;
				}
				
				var binHeight = this._numRows * slideOuterHeight;
				this._$slidePanel.height(binHeight + this._slideMargin);
				this._$container.height(this._$mainPanel.outerHeight());

				if (enforce) {
					var $currBin = $bins.first(),
						packer = new Packer(this._numCols, this._numRows),
						$items = this._$currList.data('items');
					
					//repack
					$items.each($.proxy(function(n, el) {
						var $slide = $(el),
							colspan = $slide.data('colspan'),
							rowspan = $slide.data('rowspan');

						var rect = packer.fitRect(colspan, rowspan);
						if (!rect.isValid()) {
							$currBin = $currBin.next();
							if (1 > $currBin.length) {
								$currBin = this.addBin(this._$currList);
							}

							packer = new Packer(this._numCols, this._numRows);
							rect = packer.fitRect(colspan, rowspan);
						}

						if (!$.contains($currBin.find('>ul')[0], $slide[0])) {
							$currBin.find('>ul').append($slide);
						}

						var	top = ((rect.y * slideOuterHeight)/binHeight * 100) + '%',
							left = ((rect.x * slideOuterWidth)/binWidth * 100) + '%',
							width = (colspan/this._numCols * 100) + '%',
							height = (rowspan/this._numRows * 100) + '%';
						
						$slide.css({top:top, left:left});
						if (SUPPORT.boxSizing) {
							$slide.outerWidth(width).outerHeight(height);
						}
						else {
							$slide.css({width:width, height:height});
						}
					}, this));
					
					//remove empty bins
					this._$currList.children().filter(function(index) {
    					return (0 === $(this).find('>ul').children().length);
					}).remove();

					//change setup
					var numIndex = this._$currList.children().length;
					if ($bins.length !== numIndex) {
						this._$currList.data({numIndex:numIndex});
						this._currIndex = Math.min(this._currIndex, numIndex - 1);
						this.setListInfo(this._$currList);
						this.setListSize(this._$currList);
						this.changeControls();
						this.updateSlideList(false);
					}
				}
				
				this.resizeMenu();
				this.resizeCPanel();
				this.msieResize();

				deferred.resolve();
			}
		},
		
		//init container
		initContainer: function() {
			if (this._slideMargin) {
				var sides = ['top', 'bottom', 'left', 'right'];
				for (var i = 0; i < sides.length; i++) {
					var side = sides[i];
					var $blinder = $('<div></div>').addClass('gs-' + side + '-blinder').css({backgroundColor:this._bgColor});
					if ('top' === side || 'bottom' === side) {
						$blinder.css({height:this._slideMargin});
					}
					else {
						$blinder.css({width:this._slideMargin});
					}
					this._$slidePanel.append($blinder);
				}
			}
			
			var $prevButton = this._$mainPanel.find('>.gs-prev'),
				$nextButton = this._$mainPanel.find('>.gs-next'),
				css = {borderTopWidth:this._padding, borderBottomWidth:this._padding, borderColor:this._bgColor};
			
			if (0 === $prevButton.length) {
				css.borderLeftWidth = this._padding;
			}
			
			if (0 === $nextButton.length) {
				css.borderRightWidth = this._padding;
			}
			
			this._$mainPanel.css(css);
			
			if (!this._responsive) {
				this._$slidePanel.width(this._binWidth + this._slideMargin).height(this._binHeight + this._slideMargin);
				this._$mainPanel.width(this._$slidePanel.width());
				this._$container.height(this._$mainPanel.outerHeight());
				this._$slider.width(this._$mainPanel.outerWidth(true));
			}			
							
			if (MSIE7) {
				var $contentPanel = this._$slider.find('.gs-panel'),
					$contentContainer = $contentPanel.find('>.gs-panel-container'),
					$panelBar = $contentPanel.find('>.gs-panel-bar');
				
				GridSlider.prototype.msieResize = function() {
					var panelHeight = this._$mainPanel.height();  
					$prevButton.height(panelHeight);
					$nextButton.height(panelHeight);
					
					var contentPanelHeight = this._$container.outerHeight();
					$contentPanel.height(contentPanelHeight);
					
					if (!this._options.panelBarOnHover) {
						contentPanelHeight -= $panelBar.height();
					}
					
					$contentContainer.height(contentPanelHeight);
				};

				this.msieResize();
			}
		},
		
		//get auto caption width
		getCaptionWidth: function() {
			var $captions = this._$slides.filter(function() { return $(this).data('horizontal-caption'); }).find('>.gs-caption');
			$captions.outerHeight(this._slideHeight + this._borderSize);
			var width = Math.min(Math.max.apply(null, $captions.map(function() { return $(this).outerWidth(); }).get()), this._slideWidth);
			$captions.outerWidth(width);
			
			width = $captions.outerWidth();
			$captions.outerWidth('auto').outerHeight('100%');
			return width;
		},
		
		//get auto caption height
		getCaptionHeight: function() {
			var $captions = this._$slides.filter(function() { return $(this).data('vertical-caption'); }).find('>.gs-caption');
			$captions.outerWidth(this._slideWidth + this._borderSize).outerHeight(Math.max.apply(null, $captions.map(function() { return $(this).outerHeight(); }).get()));
			
			var height = $captions.outerHeight();
			$captions.outerWidth('100%').outerHeight('auto');
			return height;
		},
		
		//init all captions
		initCaptions: function() {
			this._$slides.find('>:not(a,img,[class]):first').addClass('gs-caption').toggleClass('gs-no-outer', !SUPPORT.boxSizing);
			
			if ('outside' === this._options.captionPosition) {
				var horizontal = false;
				var vertical = false;
				
				this._$slides.each($.proxy(function(n, el) {
					var $slide = $(el);
					var align = getValue($slide.data('caption-align'), this._options.captionAlign);
					$slide.data({'caption-align':align});
					if ('top' === align || 'bottom' === align) {
						$slide.data('vertical-caption', true);
						vertical = true;
					}
					else {
						$slide.data('vertical-caption', false);
					}
					
					if ('left' === align || 'right' === align) {
						$slide.data('horizontal-caption', true);
						horizontal = true;
					}
					else {
						$slide.data('horizontal-caption', false);
					}
				}, this));
				
				if (vertical) {
					if (isNaN(this._captionHeight)) {
						this._captionHeight = this.getCaptionHeight();
					}
					this._rowHeight += this._captionHeight;
				}
				
				if (horizontal) {
					if (isNaN(this._captionWidth)) {
						this._captionWidth = this.getCaptionWidth();
					}
					this._colWidth += this._captionWidth;
				}
				
				this._$slider.data({'horizontal-captions':horizontal, 'vertical-captions':vertical});
				this._$slides.addClass('gs-outside').one(INIT_CAPTION, $.proxy(this.initExtCaption, this));
			}
			else {
				this._$slides.addClass('gs-inside').one(INIT_CAPTION, $.proxy(this.initCaption, this)).find('>.gs-caption').gsAddTransitionClass('gs-img-transition');
				if (ANDROID2) {
					this._$slides.find('>.gs-caption').css('backface-visibility', 'visible');
				}
			}			
		},
		
		//init all lists
		initLists: function() {
			this._colWidth = this._slideWidth + this._outerSize;
			this._rowHeight = this._slideHeight + this._outerSize;
			
			this.initCaptions();
			
			this._binWidth = this._numCols * this._colWidth;
			this._binHeight = this._numRows * this._rowHeight;
			
			this._minCols = 1;
			this._$lists.each($.proxy(function(n, list) {
				var $items = $(list).find('>li');

				$(list).data({items:$items, deferred:$.Deferred()});
				$items.each($.proxy(function(m, li) {
					var $slide = $(li);
					$slide.data({
						colspan:Math.min(getPosInteger($slide.data('colspan'), 1), this._numCols),
						rowspan:Math.min(getPosInteger($slide.data('rowspan'), 1), this._numRows)
					});

					if ($slide.data('colspan') > this._minCols) {
						this._minCols = $slide.data('colspan');
					}
				}, this));
			}, this));
			
			if (this._options.initAll) {
				this._$lists.each($.proxy(function(n, el) {
					this.initList(n);
				}, this));
			}
			else {
				this.initList(this._tabIndex);
			}
		},
		
		//init list
		initList: function(listIndex) {
			var $list = this._$lists.eq(listIndex),
				deferred = $list.data('deferred');

			if (!$list.data('packed')) {
				$list.data('packed', true);
				var shuffle = getValue($list.data('shuffle'), this._options.shuffle);
				if (shuffle) {
					this.shuffleItems($list);
				}
				
				var $slides = $list.find('>li');
				var packer = new Packer(this._orgCols, this._orgRows);
				var $bin = this.addBin($list);
				
				//init slides
				$slides.css({paddingRight:this._slideMargin, paddingBottom:this._slideMargin}).each($.proxy(function(n, el) {
					var $slide = $(el);
					this.initSlide($slide);
					
					var	colspan = $slide.data('colspan'),
						rowspan = $slide.data('rowspan');
					
					var rect = packer.fitRect(colspan, rowspan);
					if (!rect.isValid()) {
						$bin = this.addBin($list);
						packer = new Packer(this._orgCols, this._orgRows);
						rect = packer.fitRect(colspan, rowspan);
					}
					$slide.css({top:rect.y * this._rowHeight, left:rect.x * this._colWidth});
					$bin.find('>ul').append($slide);
					
					this.setSlideSize($slide);
					this.processSlide($slide);
				}, this));
				
				var $wrappers = $slides.find('>.gs-wrapper');
				this.setOptColor($wrappers, this._options.slideBackgroundColor, 'backgroundColor');
				this.setOptColor($wrappers, this._options.slideBorderColor, 'borderColor');
				
				//init bins
				this.setListInfo($list);

				//init list
				$list.data({numIndex:$list.children().length, numItems:$slides.length, 
						   	effect:getValue($list.data('effect'), this._options.effect),
							speed:getPosInteger($list.data('speed'), this._speed),
							easing:getValue($list.data('easing'), this._options.easing),
							delay:getPosInteger($list.data('delay'), this._delay)});
				
				this.setListSize($list);
				
				var fn;
				switch($list.data('effect')) {
					case 'horizontalSlide':
						fn = this.scrollHorizontal;
						break;
					case 'verticalSlide':
						fn = this.scrollVertical;
						break;
					case 'fade':
						fn = this.fadeSlides;
						break;
					default:
						fn = this.showSlides;
						break;
				}
				$list.bind(CHANGE_SLIDES, $.proxy(fn, this));
				
				deferred.resolve();
			}
			else {
				deferred.reject();
			}
		},
		
		setListInfo: function($list) {
			var $bins = $list.children(),
				begin = 0;
			
			$bins.each(function() {
				var len = $(this).find('>ul').children().length;
				$(this).data({index:begin, length:len});
				begin += len;
			});
		},

		setListSize: function($list) {
			var $bins = $list.children(),
				length = $bins.length,
				effect = $list.data('effect');
			
			if (this._responsive) {
				var listSize = (length * 100) + '%',
					binSize = (1/length * 100) + '%';
				
				if ('verticalSlide' === effect) {
					$list.css({width:'100%', height:listSize});
					$bins.outerHeight(binSize);
				}
				else {
					$list.css({width:listSize, height:'100%'});
					$bins.outerWidth(binSize);
				}
			}
			else {
				$bins.width(this._binWidth).height(this._binHeight);
				if ('verticalSlide' === effect) {
					$list.css({width:$bins.outerWidth(), height:(length * $bins.outerHeight())});
				}
				else {
					$list.css({width:(length * $bins.outerWidth()), height:$bins.outerHeight()});
				}
			}
		},
		
		initSlide: function($slide) {
			$slide.wrapInner($('<div></div>').addClass('gs-wrapper'));
			var $wrapper = $slide.find('>.gs-wrapper').css({borderWidth:this._borderWidth});
			$slide.data({
				'image-position':getValue($slide.data('image-position'), this._options.imagePosition),
				'hover-effect':getValue($slide.data('hover-effect'), this._options.hoverEffect),
				'caption-align': getValue($slide.data('caption-align'),  this._options.captionAlign), 
				'caption-effect':getValue($slide.data('caption-effect'), this._options.captionEffect),
				'caption-button':getValue($slide.data('caption-button'), this._options.captionButton)
			});

			var $buttonTray = $wrapper.find('>.gs-button-tray');
			if ($buttonTray.length) {
				if ($buttonTray.children().length) {
					$buttonTray.children().gsAddTransitionClass('gs-all-transition');
					$buttonTray.show();
				}
			}
			else {
				$buttonTray = $('<div></div>').addClass('gs-button-tray');
				$wrapper.append($buttonTray);
			}
			
			$buttonTray.on('mousedown', '.gs-overlay-button', preventDefault)
					   .on('click', '.gs-overlay-button:not(.gs-hoverbox-button)', $.proxy(this.hideHoverBox, this))
					   .gsAddTransitionClass('gs-opacity-transition');
			
			var $link = $wrapper.find('>a:first');
			if ($link.length) {
				$link.data({title:$link.attr('title')}).removeAttr('title');
				if ($link.hasClass('lb-link')) {
					var $button = $link.clone(true).html('<div></div>').addClass('gs-overlay-button gs-zoom-button').gsAddTransitionClass('gs-all-transition');
					$buttonTray.append($button).show();
				}
				$link.click($.proxy(this.hideHoverBox, this));
			}
			
			if (this._options.pauseOnInteraction) {
				$wrapper.click($.proxy(this.pause, this));
			}
			
			//init caption
			$slide.trigger(INIT_CAPTION);
			
			//bind hover box
			if ($wrapper.find('>.gs-hover').length) {
				if (this._options.hoverBox.toggle) {
					var $hoverButton = $('<a><div></div></a>').addClass('gs-overlay-button gs-hoverbox-button').gsAddTransitionClass('gs-all-transition')
															  	.click($.proxy(function(e) { 
																	e.stopPropagation();
																	this._hoverBox.toggle($slide); 
															   	}, this));
					$buttonTray.append($hoverButton).show();
				}
				else {
					$wrapper.hover($.proxy(function(e) { this._hoverBox.fadeIn($slide); }, this), $.proxy(function(e) { this._hoverBox.fadeOut(100); }, this));
				}
			}
			
			//init panel content
			var $content = $wrapper.find('>.gs-content');
			if ($content.length) {
				var $panelButton = $('<a><div></div></a>').addClass('gs-overlay-button gs-panel-button').gsAddTransitionClass('gs-all-transition').click($.proxy(this.openPanel, this));
				
				if (isEmpty($content.data('content-type'))) {
					var contentType = 'static';
					if (!isEmpty($content.data('src'))) {
						contentType = getContentType($content.data('src'));
					}
					else if (0 < $content.data('post-id')) {
						contentType = 'post';
					}
					
					$content.data({contentType:contentType});
				}
				
				$buttonTray.append($panelButton).show();
			}
		},
		
		setSlideSize: function($slide) {
			var $wrapper = $slide.find('>.gs-wrapper'),
				$outerCaption = $slide.find('>.gs-caption-wrapper'),
				colspan = $slide.data('colspan'),
				rowspan = $slide.data('rowspan'),
				slideWidth = (colspan * this._colWidth) - this._outerSize,
				slideHeight = (rowspan * this._rowHeight) - this._outerSize,
				horizontalCaption = $slide.data('horizontal-caption');
			
			if ($outerCaption.length) {
				if (horizontalCaption) {
					slideWidth -= this._captionWidth;
				}
				else {
					slideHeight -= this._captionHeight;
				}
			}
			$slide.data({slideWidth:slideWidth, slideHeight:slideHeight});
			if (this._responsive) {
				$slide.addClass('gs-border-box').css({top:(parseInt($slide.css('top'), 10)/this._binHeight * 100) + '%', left:(parseInt($slide.css('left'), 10)/this._binWidth * 100) + '%'})
					  .outerWidth((colspan/this._orgCols * 100) + '%').outerHeight((rowspan/this._orgRows * 100) + '%');
			}
			else {
				$wrapper.width(slideWidth).height(slideHeight);
				$slide.width($wrapper.outerWidth()).height($wrapper.outerHeight());
			}
		},
		
		processImage: function(e) {
			var $slide = $(e.currentTarget),
				$img = $slide.find('img.gs-slide-content');
			
			$img.one('load', $.proxy(this.processImg, this))
				.error($.proxy(function() {
					var deferred = this.getDeferred($slide);
					deferred.reject();
				}, this))
				.attr('src', $img.attr('src'));
			
			if ($img[0].complete || 'complete' === $img[0].readyState) {
				$img.trigger('load');
			}
		},
		
		processSlide: function($slide) {
			var $wrapper = $slide.find('>.gs-wrapper');
			
			if (!isEmpty($slide.data('src')) || $slide.data('post-id')) {
				var contentType = $slide.data('content-type');
				if (isEmpty(contentType)) {
					$slide.data('content-type', getContentType($slide.data('src')));
				}
				
				$slide.one(LOAD_CONTENT, $.proxy(this.processContent, this));
			}
			else {
				var $link = $wrapper.find('>a:first'),
					$content;
				
				if ($link.length) {
					$content = $link.find('>:first');
				}
				else {
					$content = $wrapper.find('>:first');
				}
				
				if ($content.length) {
					$content.addClass('gs-slide-content');
					if ($content.is('img')) {
						if (this._backgroundSize) {
							$content.before($('<div></div>').addClass('gs-bg-img gs-slide-content').gsAddTransitionClass('gs-opacity-transition'));
						}
						$slide.one(LOAD_CONTENT, $.proxy(this.processImage, this));
					}
					$content.gsAddTransitionClass('gs-opacity-transition');
				}
			}
			
		},
		
		addLinkButton: function($link) {
			$link = $link.not('[class]');
			if ($link.length) {
				var $button = $link.clone(true).html('<div></div>').addClass('gs-overlay-button gs-link-button').gsAddTransitionClass('gs-all-transition');
				$link.closest('.gs-wrapper').find('>.gs-button-tray').prepend($button).show();
				$link.replaceWith(function() {
					return $(this).children();
				});
			}
		},
		
		setHoverEffect: function($slide) {
			if (!IS_TOUCH && SUPPORT.transition && SUPPORT.transform && !ANDROID2) {
				var effect = $slide.data('hover-effect');
				var $img = $slide.find('.gs-slide-content');
				
				if ('zoomIn' === effect) {
					$img.addClass('gs-zoom-in');
				}
				else if ('zoomOut' === effect) {
					$img.addClass('gs-zoom-out');
				}
				else {
					return;
				}				
				$slide.one('mouseenter', function() { $img.gsAddTransitionClass('gs-img-transition'); });
			}
		},
		
		addBin: function($list) {
			var $bin = $('<li><ul class="gs-bin-list"></ul></li>');
			$bin.addClass('gs-bin-item').css({borderTopWidth:this._slideMargin, borderLeftWidth:this._slideMargin, borderColor:this._bgColor});
			$list.append($bin);
			return $bin;
		},
		
		initExtCaption: function(e) {
			var $slide = $(e.currentTarget),
				$wrapper = $slide.find('>.gs-wrapper'),
				$caption = $wrapper.find('>.gs-caption');
			
			if ($caption.length) {
				var $captionWrapper = $('<div></div>').addClass('gs-caption-wrapper').append($caption);
				$slide.append($captionWrapper);
				
				if ($slide.data('horizontal-caption')) {
					$captionWrapper.css({top:0, width:this._captionWidth, height:'100%', paddingBottom:this._slideMargin});
				}
				else {
					$captionWrapper.css({left:0, width:'100%', height:this._captionHeight, paddingRight:this._slideMargin});
				}
				$caption.css({width:'100%', height:'100%'});
				
				switch($slide.data('caption-align')) {
					case 'left':
						$slide.css({paddingLeft:'+=' + this._captionWidth});
						$captionWrapper.css({left:0});
						break;
					case 'right':
						$slide.css({paddingRight:'+=' + this._captionWidth});
						$captionWrapper.css({right:this._slideMargin});
						break;
					case 'top':
						$slide.css({paddingTop:'+=' + this._captionHeight});
						$captionWrapper.css({top:0});
						break;
					default:
						$slide.css({paddingBottom:'+=' + this._captionHeight});
						$captionWrapper.css({bottom:this._slideMargin});
						break;
				}
			}
		},
		
		initCaption: function(e) {
			var $slide = $(e.currentTarget),
				$wrapper = $slide.find('>.gs-wrapper'),
				$caption = $wrapper.find('>.gs-caption');
				
			if ($caption.length) {
				var align = $slide.data('caption-align'),			
					$buttonTray = $wrapper.find('>.gs-button-tray');
				$caption.data({width:getValue($caption.data('width'), this._captionWidth), height:getValue($caption.data('height'), this._captionHeight)});
				
				if ('left' === align || 'right' === align) {
					$caption.css({top:0}).outerHeight('100%');
					if ('left' === align) {
						$caption.css({left:0});
					}
					else {
						$caption.css({right:0});
						$buttonTray.css({left:0, right:'auto'});
					}
					
					var captionWidth = $caption.data('width');
					if (!isNaN(captionWidth)) {
						if (this._responsive) {
							$caption.outerWidth((captionWidth/this._slideWidth * 100) + '%');
						}
						else {
							$caption.outerWidth(captionWidth);
						}
					}
				}
				else {
					$caption.css({left:0}).outerWidth('100%');
					if ('top' === align) {
						$caption.css({top:0});
						$buttonTray.css({bottom:0, top:'auto'});
					}
					else {
						$caption.css({bottom:0});
					}
					
					var captionHeight = $caption.data('height');
					if (!isNaN(captionHeight)) {
						if (this._responsive) {
							$caption.outerHeight((captionHeight/this._slideHeight * 100) + '%');
						}
						else {
							$caption.outerHeight(captionHeight);
						}
					}
				}
				
				if ($slide.data('caption-button')) {
					var $button = $('<a><div></div></a>').addClass('gs-overlay-button gs-caption-button').gsAddTransitionClass('gs-all-transition').click($.proxy(this.toggleCaption, this));
					$buttonTray.append($button).show();
					this.bindCaptionEvents($slide, SHOW_CAPTION, HIDE_CAPTION);
				}
				else {
					this.bindCaptionEvents($slide, 'mouseenter', 'mouseleave');
				}	
			}
		},
		
		bindCaptionEvents: function($slide, showEvent, hideEvent) {
			var $wrapper = $slide.find('>.gs-wrapper'),
				$caption = $wrapper.find('>.gs-caption');
			
			switch($slide.data('caption-effect')) {
				case 'slide':
					if (this._cssTransform) {
						var className;
						switch($slide.data('caption-align')) {
							case 'left':
								className = 'gs-slide-right';
								$caption.css({left:'auto', right:'100%'});
								break;
							case 'right':
								className = 'gs-slide-left';
								$caption.css({left:'100%', right:'auto'});
								break;
							case 'top':
								className = 'gs-slide-down';
								$caption.css({top:'auto', bottom:'100%'});
								break;
							default:
								className = 'gs-slide-up';
								$caption.css({top:'100%', bottom:'auto'});
								break;
						}
						$wrapper.bind(showEvent, function() { $caption.addClass(className); }).bind(hideEvent, function() { $caption.removeClass(className); });
					}
					else {
						var pos = $slide.data('caption-align');
						$caption.css(pos, '-100%');
						$wrapper.bind(showEvent, {position:pos}, this.slideInCaption).bind(hideEvent, {position:pos}, this.slideOutCaption);
					}
					break;
				case 'fade':
					if (SUPPORT.transition) {
						$caption.addClass('gs-opacity-off');
						$wrapper.bind(showEvent, function() { $caption.removeClass('gs-opacity-off'); }).bind(hideEvent, function() { $caption.addClass('gs-opacity-off'); });
					}
					else {
						$caption.css({opacity:0});
						$wrapper.bind(showEvent, this.fadeInCaption).bind(hideEvent, this.fadeOutCaption);
					}
					break;
				case 'normal':
					$caption.hide();
					$wrapper.bind(showEvent, function() { $caption.show(); }).bind(hideEvent, function() { $caption.hide(); });
					break;
				default:
					var $button = $wrapper.find('.gs-caption-button');
					if ($button.length) {
						$button.addClass('gs-caption-off');
						$wrapper.bind(showEvent, function() { $caption.show(); }).bind(hideEvent, function() { $caption.hide(); });
					}
					break;
			}
		},
		
		//init menu
		initMenu: function() {
			if (1 < this._$lists.length) {
				var html = '<div class="gs-menu">\
								<ul class="gs-menu-list">';
				this._$lists.each(function(n, el) {
					html += 		'<li class="gs-menu-item">' + getValue($(el).data('title'), n + 1) + '</li>';
				});
				html += 	   '</ul>\
							</div>';
				this._$mainPanel.prepend(html);
				
				this._$menu = this._$mainPanel.find('>.gs-menu');
				this._$menuList = this._$menu.find('>ul');
				var $menuItems = this._$menuList.children(),
					menuWidth = 0;
				
				this.setPanelSize(this._$menu);
				
				$menuItems.gsAddTransitionClass('gs-color-transition')
					.click($.proxy(function(e) {
						var $item = $(e.currentTarget);
						if (!$item.hasClass('gs-menu-active')) {
							this.selectTab($item.index());
						}
					}, this)).each(function() {
						$(this).css({width:($(this).width() + 2)});
						menuWidth += $(this).outerWidth();
					});
				
				this._$menuList.width(menuWidth);
				
				if (IS_TOUCH) {
					this._$menu.bind('touchstart', $.proxy(this.menuTouchStart, this));
				}
				else {
					var easing = ('easeOutCirc' in $.easing) ? 'easeOutCirc' : 'linear';
					this._$menu.mousemove($.proxy(function(e) {
						var range = this._$menu.width() - this._$menuList.width();
						if (0 > range) {
							var ratio = (e.pageX - this._$menu.offset().left)/this._$menu.width();
							this._$menuList.animate({left:Math.round(range * ratio)}, {duration:ANIMATE_SPEED, easing:easing, queue:false});
						}
					}, this));
				}

				if (this._responsive) {
					this.resizeMenu = function() {
						var range = Math.min(0, this._$menu.width() - this._$menuList.width());
						this._$menuList.css({left:Math.max(range, this._$menuList.position().left)});
					};
				}
			}
			else {
				this.initHeader();
			}
		},
		
		//init header
		initHeader: function() {
			var title = this._$lists.eq(0).data('title');
			if (!isEmpty(title)) {
				var $panel = $('<div></div>').addClass('gs-header');
				this.setPanelSize($panel);
				this._$mainPanel.prepend($panel);
				$panel.text(title);
			}
		},
		
		//init controls
		initControl: function() {
			this._$cpanel = $('<div></div>').addClass('gs-control');
			this.setPanelSize(this._$cpanel);
			this._$mainPanel.append(this._$cpanel);
			
			var $subPanel,
				displayPageInfo = (false !== this._options.pageInfo && 'none' !== this._options.pageInfo);
			if (this._options.playButton || displayPageInfo || 'small' === this._options.navButtons) { 
				$subPanel = $('<div></div>').addClass('gs-sub-control');
				this._$cpanel.append($subPanel);
			
				if (this._options.playButton) {
					var $playButton = $('<div><div></div></div>').addClass('gs-small-button gs-play-button').toggleClass('gs-pause', !this._rotate)
																 .click($.proxy(this.togglePlay, this)).attr({title:this._rotate ? this._options.pause : this._options.play});
					$playButton.find('>div').gsAddTransitionClass('gs-opacity-transition');
					$subPanel.append($playButton);
				}
			
				if (displayPageInfo) {
					var $pageInfo = $('<div></div>').addClass('gs-page-info');
					$subPanel.append($pageInfo);
				
					if (true === this._options.pageInfo || 'slide' === this._options.pageInfo) {
						this.updatePageInfo = function() {
							var $item = this._$currList.children().eq(this._currIndex),
								index = $item.data('index'),
								start = index + 1,
								end = index + $item.data('length');

							var current = (start != end ? (start + '-' + end) : start);	
							$pageInfo.html(this._options.current.replace('{current}', current).replace('{total}', this._$currList.data('numItems')));
						};
					}
					else {
						this.updatePageInfo = function() {
							$pageInfo.html(this._options.current.replace('{current}', this._currIndex + 1).replace('{total}', this._$currList.data('numIndex')));
						};
					}
				}
			}
			
			this.initNav();
			this.initNavButtons();
			this.initTimer();
			
			var height = Math.max(this._$cpanel.find('>.gs-sub-control').height(), this._$cpanel.find('>ul').height());
			if (this._options.timer) {
				height += this._$cpanel.find('>.gs-timer-box').height();
			}			
			this._$cpanel.height(height);

			if (this._responsive && typeof $subPanel !== 'undefined' && typeof this._$navList !== 'undefined') {
				this.resizeCPanel = function() {
					var listWidth = this._$navList.width(),
						panelWidth = $subPanel.width(),
						cpanelWidth = this._$cpanel.width();
					
					if (listWidth + (2 * panelWidth) > cpanelWidth) {
						this._$navList.css('float', 'left').show();
					}
					else if (listWidth + panelWidth > cpanelWidth) {
						this._$navList.hide();
					}					
					else {
						this._$navList.css('float', 'none').show();
					}
				};
			}
		},
		
		//init nav control
		initNav: function() {
			if (false !== this._options.control && 'none' !== this._options.control) {
				this._$navList = $('<ul></ul>');
				if ('number' === this._options.control) {
					this._$navList.addClass('gs-nav-number');
				}
				else {
					this._$navList.addClass('gs-nav');
				}
				
				this._$cpanel.append(this._$navList);
				
				this._$navList.on((!IS_TOUCH && this._options.selectOnHover ? 'mouseenter' : 'click'), '>li', $.proxy(this.selectNav, this)).on('mousedown', '>li', preventDefault);
				
				this.changeIndexes = this.initNavItems;
				this.refreshIndexes = function() {
					this._$navList.find('>li').removeClass('gs-active').eq(this._currIndex).addClass('gs-active');
				};
			}
		},
		
		//select control nav
		selectNav: function(e) {
			this.pauseOnAction();
			
			var $item = $(e.currentTarget);
			if (!$item.hasClass('gs-active')) {
				this._currIndex = $(e.currentTarget).index();
				this.updateSlideList(true);
			}
		},
		
		initNavItems: function() {
			var size = this._$currList.data('numIndex');
			this._$navList.empty();
			if (1 < size) {
				this._$navList.show();
				
				var displayNum = ('number' === this._options.control);
				for (var i = 0; i < size; i++) {
					var $item = $('<li></li>');
					if (displayNum) {
						$item.text(i+1).gsAddTransitionClass('gs-color-transition');
					}
					else {
						$item.gsAddTransitionClass('gs-bgcolor-transition');
					}
					this._$navList.append($item);
				}
				
				var $navItems = this._$navList.children();
				this._$navList.css({width:(size * $navItems.outerWidth(true))});
			}
			else {
				this._$navList.hide();
			}
		},
		
		//init timer
		initTimer: function() {
			this._$timer = $('<div></div>').addClass('gs-timer').data('pct', 1);
			var $timerBox = $('<div></div>').addClass('gs-timer-box').append(this._$timer);
			
			this._$cpanel.prepend($timerBox);
			if (!this._options.timer) {
				$timerBox.hide();
			}
		},
		
		//init nav buttons
		initNavButtons: function() {
			if (false !== this._options.navButtons && 'none' !== this._options.navButtons) {
				var $prevButton = $('<div><div></div></div>');
				var $nextButton = $('<div><div></div></div>');
				this._$navButtons = $nextButton.add($prevButton);
				this._$navButtons.find('>div').gsAddTransitionClass('gs-opacity-transition');
					
				if ('hover' === this._options.navButtons || 'mouseover' === this._options.navButtons) {
					$prevButton.addClass('gs-hover-prev');
					$nextButton.addClass('gs-hover-next');
					this._$slidePanel.append(this._$navButtons);
					
					var margin = ('+=' + (this._slideMargin + this._borderWidth));
					$prevButton.css({marginLeft:margin});
					$nextButton.css({marginRight:margin});
					
					this._$navButtons.gsAddTransitionClass('gs-all-transition');
				}
				else if ('small' === this._options.navButtons) {
					var $playButton = this._$cpanel.find('.gs-play-button');
					
					this._$navButtons.addClass('gs-small-button');
					$prevButton.addClass('gs-small-prev');
					$nextButton.addClass('gs-small-next');
										
					if ($playButton.length) {
						$playButton.before($nextButton).after($prevButton);
					}
					else {
						this._$cpanel.find('>.gs-sub-control').prepend(this._$navButtons);
					}
				}
				else {
					$prevButton.addClass('gs-prev');
					$nextButton.addClass('gs-next');
					this._$mainPanel.append(this._$navButtons).css({overflow:'visible', borderLeftWidth:$prevButton.outerWidth(), borderRightWidth:$nextButton.outerWidth()});
					
					$prevButton.css({left:-$prevButton.outerWidth()});
					$nextButton.css({right:-$nextButton.outerWidth()});
				}
				
				$prevButton.click($.proxy(this.prevSlides, this)).mousedown(preventDefault).attr({title:this._options.previous});
				$nextButton.click($.proxy(this.nextSlides, this)).mousedown(preventDefault).attr({title:this._options.next});
				
				if (!this._options.continuous) {
					this.refreshButtons = function() {
						$prevButton.toggleClass('gs-disabled', 0 === this._currIndex);
						$nextButton.toggleClass('gs-disabled', (this._$currList.data('numIndex') - 1) == this._currIndex);  
					};
				}
			}
		},
		
		hideHoverBox: function() {
			this._hoverBox.hide();
		},
		
		togglePlay: function() {
			if (this._rotate) { 
				this.pause();
			}
			else {
				this.play();
			}
		},
		
		play: function() {
			if (!this._rotate) {
				this._$cpanel.find('.gs-play-button').removeClass('gs-pause').attr('title', this._options.pause);
				this._rotate = true;
				this.start();
				this._$slider.trigger(SLIDER_PLAY);
				this._options.onPlay.call(this);
			}
		},
		
		pause: function() {
			if (this._rotate) {
				this._$cpanel.find('.gs-play-button').addClass('gs-pause').attr('title', this._options.play);
				this._rotate = false;
				this.pauseTimer();
				
				this._$slider.trigger(SLIDER_PAUSE);
				this._options.onPause.call(this);
			}
		},
		
		//change controls
		changeControls: function() {
			this._$slidePanel.unbind('touchstart mousewheel DOMMouseScroll');
			$(document).unbind('keyup' + this._namespace);
			
			this.changeIndexes();
			if (1 < this._$currList.data('numIndex')) {
				this._$cpanel.find('.gs-play-button').show();
				this._$cpanel.find('>.gs-timer-box').css({visibility:'visible'});
				if (typeof this._$navButtons !== 'undefined') {
					this._$navButtons.show();
				}
				
				if (IS_TOUCH && this._options.swipe) {
					this._$slidePanel.bind('touchstart', $.proxy(this.touchStart, this));
				}
				
				if (this._options.mousewheel) {
					this._$slidePanel.bind('mousewheel DOMMouseScroll', $.proxy(this.mouseScroll, this));
				}
				
				if (this._options.keyboard) {
					$(document).bind('keyup' + this._namespace, $.proxy(this.keyControl, this));
				}			
			}
			else {
				this._$cpanel.find('.gs-play-button').hide();
				this._$cpanel.find('>.gs-timer-box').css({visibility:'hidden'});
				if (typeof this._$navButtons !== 'undefined') {
					this._$navButtons.hide();
				}
				
				if (this._options.keyboard) {
					$(document).bind('keyup' + this._namespace, $.proxy(function(e) {
						if (27 === e.keyCode) {
							this.hidePanel();
						}
					}, this));
				}
			}
		},
		
		//init content panel
		initContentPanel: function() {
			var className, showProp, hideProp;
			var $contentPanel = $('<div class="gs-panel">\
										<div class="gs-panel-container">\
											<div class="gs-inner-content"></div>\
										</div>\
										<div class="gs-panel-bar">\
											<div class="gs-panel-title"></div>\
											<div class="gs-close-button"><div></div></div>\
										</div>\
								   </div>');
			
			this.setOptColor($contentPanel, this._options.panelBackgroundColor, 'backgroundColor');
			this.setOptColor($contentPanel, this._options.panelColor, 'color');
			
			var effect = this._options.panelEffect;
			if (!SUPPORT.boxSizing && this._responsive) {
				if ('slideLeft' === effect) {
					effect = 'coverLeft';
				}
				else if ('slideRight' === effect) {
					effect = 'coverRight';
				}
			}
			
			if (beginWith(effect, 'slide')) {
				this._$mainPanel.wrap('<div class="gs-panel-wrapper"></div>');
				var $panelWrapper = this._$mainPanel.parent();
				
				if (ANDROID2) {
					$panelWrapper.css('backface-visibility', 'visible');
				}
				
				switch(effect) {
					case 'slideRight':
						$panelWrapper.addClass('gs-horizontal-wrapper').css({left:'-100%'}).prepend($contentPanel);
						className = 'gs-panel-right';
						showProp = {left:0};
						hideProp = {left:'-100%'};
						break; 
					case 'slideLeft':
						$panelWrapper.addClass('gs-horizontal-wrapper').append($contentPanel);
						className = 'gs-panel-left';
						showProp = {left:'-100%'};
						hideProp = {left:0};
						break;
					case 'slideDown':
						$panelWrapper.addClass('gs-vertical-wrapper').css({top:'-100%'}).prepend($contentPanel);
						className = 'gs-panel-down';
						showProp = {top:0};
						hideProp = {top:'-100%'};
						break;
					default:
						$panelWrapper.addClass('gs-vertical-wrapper').append($contentPanel);
						className = 'gs-panel-up';
						showProp = {top:'-100%'};
						hideProp = {top:0};
						break;
				}
				
				if (this._cssTransform) {
					$panelWrapper.gsAddTransitionClass('gs-transform-transition');
					this.showPanel = function() { $panelWrapper.addClass(className); };
					this.hidePanel = function() { $panelWrapper.removeClass(className); };
				}
				else {
					this.showPanel = function() { $panelWrapper.animate(showProp, {duration:ANIMATE_SPEED, easing:this._options.easing, queue:false}); };
					this.hidePanel = function() { $panelWrapper.animate(hideProp, {duration:ANIMATE_SPEED, easing:this._options.easing, queue:false}); };
				}
			}
			else {
				this._$container.append($contentPanel.addClass('gs-overlay-panel'));
				if (ANDROID2) {
					$contentPanel.css('backface-visibility', 'visible');
				}
				
				if (beginWith(effect, 'cover')) {
					switch(effect) {
						case 'coverRight':
							$contentPanel.css({left:'-100%'});
							className = 'gs-slide-right';
							showProp = {left:0};
							hideProp = {left:'-100%'};
							break;
						case 'coverLeft':
							$contentPanel.css({left:'100%'});
							className = 'gs-slide-left';
							showProp = {left:0};
							hideProp = {left:'100%'};
							break;
						case 'coverDown':
							$contentPanel.css({top:'-100%'});
							className = 'gs-slide-down';
							showProp = {top:0};
							hideProp = {top:'-100%'};
							break;
						default:
							$contentPanel.css({top:'100%'});
							className = 'gs-slide-up';
							showProp = {top:0};
							hideProp = {top:'100%'};
							break;
					}
					
					if (this._cssTransform) {
						$contentPanel.gsAddTransitionClass('gs-transform-transition');
						this.showPanel = function() { $contentPanel.addClass(className); };
						this.hidePanel = function() { $contentPanel.removeClass(className); };
					}
					else {
						this.showPanel = function() { $contentPanel.animate(showProp, {duration:ANIMATE_SPEED, easing:this._options.easing, queue:false}); };
						this.hidePanel = function() { $contentPanel.animate(hideProp, {duration:ANIMATE_SPEED, easing:this._options.easing, queue:false}); };
					}
				}
				else {
					$contentPanel.hide();
					if ('fade' === effect) {
						this.showPanel = function() { $contentPanel.stop(true,true).fadeIn(ANIMATE_SPEED, this._options.easing); };
						this.hidePanel = function() { $contentPanel.stop(true).fadeOut(ANIMATE_SPEED, this._options.easing); };
					}
					else {
						this.showPanel = function() { $contentPanel.show(); };
						this.hidePanel = function() { $contentPanel.hide(); };
					}
				}
			}
			
			var $panelBar = $contentPanel.find('>.gs-panel-bar').dblclick($.proxy(this.closePanel, this)).mousedown(preventDefault),
				$container = $contentPanel.find('>.gs-panel-container');
			
			this._$panelTitle = $panelBar.find('>.gs-panel-title');
			this._$panelContent = $container.find('>.gs-inner-content');
			
			$panelBar.find('>.gs-close-button').gsAddTransitionClass('gs-bgcolor-transition').click($.proxy(this.closePanel, this)).mousedown(preventDefault).attr('title', this._options.close);
			$container.toggleClass('gs-no-outer', !SUPPORT.boxSizing);
			
			if (!IS_TOUCH && this._options.panelBarOnHover) {
				$contentPanel.addClass('gs-full-panel').hover(function() { $panelBar.animate({opacity:1}, {duration:ANIMATE_SPEED, queue:false}); }, 
															  function() { $panelBar.animate({opacity:0}, {duration:ANIMATE_SPEED, queue:false}); });
			}
		},
		
		//open content panel
		openPanel: function(e) {
			e.preventDefault();
			
			this.pauseTimer();
			
			var $item = $(e.currentTarget).closest('li.gs-slide'),
				$content = $item.find('>.gs-wrapper>.gs-content'),
				title = $content.data('title');
			
			if (!isEmpty(title)) {
				this._$panelTitle.text(title).show();
			}
			else {
				this._$panelTitle.hide();
			}
			
			if ($content.length) {
				loadContent($content, this._$panelContent);
			}
			
			this.showPanel();
		},
		
		//close content panel
		closePanel: function(e) {
			e.preventDefault();
			this.hidePanel();
			this.start();
		},
		
		//display panel error
		displayPanelError: function() {
			this._$panelContent.removeClass('gs-loading');
			var $error = $('<div></div>').addClass('gs-panel-error').html('<p>' + ERROR_MSG + '</p>');
			this._$panelContent.empty().append($error);
		},
		
		//select tab
		selectTab: function(tabIndex) {
			if (isNaN(tabIndex) || 0 > tabIndex || (this._$lists.length - 1) < tabIndex) {
				return;
			}
			
			this.pauseOnAction();
			
			this.resetTimer();
			this._$lists.gsStopTransition(true).eq(this._tabIndex).data({index:this._currIndex}).find('li.gs-slide .gs-slide-content').css({opacity:0});
			
			this._tabIndex = tabIndex;
			this._$mainPanel.find('>.gs-menu .gs-menu-item').removeClass('gs-menu-active').eq(this._tabIndex).addClass('gs-menu-active');
			
			this._$lists.not(':eq(' + this._tabIndex + ')').hide();
			this._$currList = this._$lists.eq(this._tabIndex).show();
			this._$currList.find('li.gs-slide.gs-loaded .gs-slide-content').gsReflow().css({opacity:1});

			this._$container.append('<div class="gs-cover"><div></div></div>');

			var deferred = this._$currList.data('deferred');
			deferred.promise().always($.proxy(function() {
				this._$container.find('>.gs-cover').remove();
			}, this));

			if (!this._$currList.data('packed')) {
				this.initList(this._tabIndex);
			}

			var $slides = this._$currList.find('li.gs-slide');
			if (!this._$currList.data('init')) {
				this.preloadNext($slides.toArray());
				this._$currList.css({visibility:'visible'}).data({init:true});
			}
			
			this._currIndex = (this._options.resetIndex ? 0 : this._$currList.data('index'));
			$slides.each($.proxy(function(n, el) {
				$(el).find('img.gs-slide-content').trigger(PROCESS_IMG);
			}, this));
			
			this.changeControls();
			this.updateSlideList(false);
			
			if (this._responsive) {
				this.resize(true);
			}
		},
		
		//move slides back
		prevSlides: function() {
			this.pauseOnAction();
			
			if (this._currIndex > 0) {
				this._currIndex--;
			}
			else if (this._options.continuous) {
				this._currIndex = this._$currList.data('numIndex') - 1;
			}
			else {
				return;
			}
			
			this._$slider.trigger(SLIDER_PREV);
			this._options.onPrevious.call(this);
			
			this.updateSlideList(true);
		},
		
		//move slides forward
		nextSlides: function() {
			this.pauseOnAction();

			if (this._currIndex < this._$currList.data('numIndex') - 1) {
				this._currIndex++;
			}
			else if (this._options.continuous) {
				this._currIndex = 0;
			}
			else {
				return;
			}
			
			this._$slider.trigger(SLIDER_NEXT);
			this._options.onNext.call(this);
			
			this.updateSlideList(true);
		},
		
		//rotate slides
		rotateSlides: function() {
			if (this._currIndex < (this._$currList.data('numIndex') - 1)) {
				this._currIndex++;
			}
			else {
				this._currIndex = 0;
			}
			this.updateSlideList(true);
		},
		
		//update slide list
		updateSlideList: function(animate) {
			this.resetTimer();
			this.hideHoverBox();
			
			if (animate) {
				this._$currList.trigger(CHANGE_SLIDES);
			}
			else {
				this.showSlides();
			}
			this.updatePageInfo();
			this.refreshButtons();
			this.refreshIndexes();
						
			if (0 === this._currIndex) {
				this._$slider.trigger(SLIDER_BEGIN);
				this._options.onBegin.call(this);
			}
			
			if (this._currIndex == (this._$currList.data('numIndex') - 1)) {
				this._$slider.trigger(SLIDER_END);
				this._options.onEnd.call(this);
				if (this._options.playOnce) {
					this.pause();
				}				
			}
		},
		
		loadContents: function($slides) {
			$slides.each(function(n, el) {
				$(el).trigger(LOAD_CONTENT);
			});
		},
		
		getSlidesAt: function($list, index) {
			return $list.children().eq(index).find('li.gs-slide');
		},
		
		getListPosition: function() {
			var isVertical = ('verticalSlide' === this._$currList.data('effect')),
				prop = {};
			
			if (this._cssTransform) {
				var val = (-this._currIndex * (100/this._$currList.data('numIndex'))) + '%';
				prop[SUPPORT.transform] = (isVertical ? 'translateY(' + val + ')' : 'translateX(' + val + ')');
			}
			else {
				if (isVertical) {
					prop.top = (this._responsive ? ((-this._currIndex * 100) + '%') : (-this._currIndex * (this._binHeight + this._slideMargin)));
				}
				else {
					prop.left = (this._responsive ? ((-this._currIndex * 100) + '%') : (-this._currIndex * (this._binWidth + this._slideMargin)));
				}
			}
			
			return prop;
		},
		
		//show slides
		showSlides: function() {
			var prop = this.getListPosition();
			this._$currList.css(prop);
			this.loadContents(this.getSlidesAt(this._$currList, this._currIndex));
			this.start();
		},
		
		//fade slides
		fadeSlides: function() {
			var $list = this._$currList,
				$slides = this.getSlidesAt(this._$currList, this._currIndex),				
				speed = Math.round($list.data('speed')/2),
				easing = $list.data('easing'),
				prop = this.getListPosition();
			
			$list.gsStopTransition(true).gsTransition({opacity:0}, speed, easing, $.proxy(function() { 
				$list.css(prop).gsTransition({opacity:1}, {duration:speed, easing:easing, complete:$.proxy(this.start, this), 
									  		    				always:$.proxy(function() { this.loadContents($slides); }, this)});
			}, this));
		},
		
		//scroll slides horizontally
		scrollHorizontal: function() {
			var $slides = this.getSlidesAt(this._$currList, this._currIndex);
			
			var prop = this.getListPosition();
			this._$currList.gsStopTransition(true).gsTransition(prop, {duration:this._$currList.data('speed'), easing:this._$currList.data('easing'), 
														     	   complete:$.proxy(this.start, this), 
																   always:$.proxy(function() { this.loadContents($slides); }, this)});
		},
		
		//scroll slides vertically
		scrollVertical: function() {
			var $slides = this.getSlidesAt(this._$currList, this._currIndex);
			
			var prop = this.getListPosition();
			this._$currList.gsStopTransition(true).gsTransition(prop, {duration:this._$currList.data('speed'), easing:this._$currList.data('easing'), 
														     	   complete:$.proxy(this.start, this), 
																   always:$.proxy(function() { this.loadContents($slides); }, this)});
		},
		
		//process & load content
		processContent: function(e) {
			var $slide = $(e.currentTarget),
				$wrapper = $slide.find('>.gs-wrapper'),
				$link = $wrapper.find('>a:first:not([class])'),
				url = $slide.data('src'),
				contentType = $slide.data('content-type');
			
			if (isEmpty(contentType)) {
				contentType = getContentType(url);
			}
			
			var $container = $wrapper;
			if ('image' === contentType) {
				if ($link.length) {
					$container = $link;
				}
			}
			else if ($link.length) {
				this.addLinkButton($link);
			}
							
			$container.find('>img:first, >.gs-slide-content').remove();
			if ('image' === contentType) {
				var $img = $('<img/>').addClass('gs-slide-content').gsAddTransitionClass('gs-opacity-transition');
				$container.prepend($img);
				
				if (this._backgroundSize) {
					$img.before($('<div></div>').addClass('gs-bg-img gs-slide-content').gsAddTransitionClass('gs-opacity-transition'));
				}
				
				$img.one('load', $.proxy(this.processImg, this)).attr('src', url);
				if ($img[0].complete || 'complete' === $img[0].readyState) {
					$img.trigger('load');
				}
				return;
			}
			
			var $div = $('<div></div>').addClass('gs-slide-content').css({overflow:'auto'}).gsAddTransitionClass('gs-opacity-transition');
			if ('post' === contentType) {
				var postId = $slide.data('post-id');
				if (postId) {
					$container.prepend($div);
					$.post(ajaxurl, $.param({action:AJAX_ACTION, post_id:postId}), $.proxy(function(r) { 
						$div.html(r);
						this.showContent($slide);
					}, this));
				}
			}
			else if ('inline' === contentType) {
				var $el = $(url);
				if ($el.length) {
					$container.prepend($div.html($el.html()));
					this.showContent($slide);
				}
			} 
			else if ('flash' === contentType) {
				$container.prepend($div.html(getFlashContent(url)));
				this.showContent($slide);
			}
			else if ('ajax' === contentType) {
				$container.prepend($div);
				
				var index = url.indexOf('?'), 
					varData = '';
			
				if (-1 < index) {
					varData = url.substring(index + 1);
					url = url.substring(0, index);
				}	
			
				var methodType = $slide.data('method');
				if (isEmpty(methodType)) {
					methodType = 'GET';
				}
				
				$.ajax({url:url, type:methodType, data:varData,
  					success:$.proxy(function(data) {
						$div.html(data);
						this.showContent($slide);
					}, this)
				});
			}
			else {
				var $iframe = $('<iframe frameborder="0" hspace="0" scrolling="auto" width="100%" height="100%"></iframe>').addClass('gs-slide-content').gsAddTransitionClass('gs-opacity-transition');
				$container.prepend($iframe);
				
				$iframe.load($.proxy(function() {
					this.showContent($slide);
				}, this)).attr('src', url);
			}
		},
		
		resizeImage: function($slide, $img) {
			if ($img.length && ($img[0].complete || 'complete' === $img[0].readyState)) {
				$img.css({width:'auto', height:'auto'});
			
				var slideWidth = $slide.data('slideWidth'), 
					slideHeight = $slide.data('slideHeight'),
					position = $slide.data('image-position');
				
				switch(position) {
					case 'fill':
					case 'cover':
						this.fillContent($img, slideWidth, slideHeight);
						break;
					case 'fit':
					case 'contain':
						this.fitContent($img, slideWidth, slideHeight);
						break;
					case 'center':
						this.centerContent($img, slideWidth, slideHeight);
						break;
					case 'stretch':
						this.stretchContent($img, slideWidth, slideHeight);
						break;
				}
				
				if (this._responsive && 'stretch' !== position) {
					var top = parseInt($img.css('top'), 10);
					top = isNaN(top) ? 0 : ((top/slideHeight * 100) + '%');
					
					var left = parseInt($img.css('left'), 10);
					left = isNaN(left) ? 0 : ((left/slideWidth * 100) + '%');
					
					$img.css({top:top, left:left, bottom:'auto', right:'auto', width:($img.width()/slideWidth * 100) + '%'});
					if ('fit' === position || 'fill' === position || 'cover' === position || 'contain' === position) {
						$img.css('height', ($img.height()/slideHeight * 100) + '%');
					}
					else {
						$img.css('height', 'auto');
					}					
				}			
			}
		},
		
		//process image size & position
		processImg: function(e) {
			var $img = $(e.currentTarget),
				$slide = $img.closest('.gs-slide'),
				$content;
			
			if ($img.width() === 0 && $img.height() === 0) {
				$img.one(PROCESS_IMG, $.proxy(this.processImg, this));
				return;
			}
			
			if (this._backgroundSize) {
				$content = $slide.find('div.gs-bg-img').css({backgroundImage:'url(' + $img.attr('src') + ')'});
				switch($slide.data('image-position')) {
					case 'fill':
					case 'cover':
						$content.css({backgroundSize:'cover', 'background-position':'center'});
						break;
					case 'fit':
					case 'contain':
						$content.css({backgroundSize:'contain', 'background-position':'center'});
						break;
					case 'center':
						$content.css({'background-position':'center'});
						break;
					case 'stretch':
						$content.css({backgroundSize:'100% 100%'});
						break;
				}
				$img.remove();
			}
			else {
				this.resizeImage($slide, $img);
				$content = $img;
			}
			
			if ($.support.opacity && !IS_TOUCH && this._options.hoverDim) {
				var $overlay = $('<div></div>').addClass('gs-overlay').gsAddTransitionClass('gs-opacity-transition');
				$content.after($overlay);
			}

			this.setHoverEffect($slide);
			
			this.showContent($slide);

			var deferred = this.getDeferred($slide);
			deferred.resolve();
		},
		
		//center content
		centerContent: function($img, boxWidth, boxHeight) {
			$img.css({top:(boxHeight - $img.height())/2, left:(boxWidth - $img.width())/2});
		},
		
		//fill content
		fillContent: function($img, boxWidth, boxHeight) {
			var width = $img.width(), height = $img.height(),
				scale = Math.max(boxHeight/height, boxWidth/width);
			
			$img.css({width:(width * scale), height:(height * scale)});
			this.centerContent($img, boxWidth, boxHeight);
		},
		
		//fit content
		fitContent: function($img, boxWidth, boxHeight) {
			var width = $img.width(), 
				height = $img.height(),
				boxRatio = boxWidth/boxHeight, 
				ratio = width/height;
			
			if (boxRatio > ratio) {
				width *= boxHeight/height;
				height = boxHeight;
			}
			else {
				height *= boxWidth/width;
				width = boxWidth;
			}
			
			$img.css({width:width, height:height});
			this.centerContent($img, boxWidth, boxHeight);
		},
		
		//stretch content
		stretchContent: function($img, boxWidth, boxHeight) {
			$img.css({top:0, left:0, width:'100%', height:'100%'});
		},
		
		showContent: function($slide) {
			$slide.addClass('gs-loaded').find('.gs-slide-content').css({opacity:1});
		},
		
		setPanelSize: function($el) {
			$el.css({borderLeftWidth:this._slideMargin, borderRightWidth:this._slideMargin, borderColor:this._bgColor});
			if (!SUPPORT.boxSizing && !this._responsive) {
				$el.width(this._binWidth - this._slideMargin);
			}
		},
		
		//start timer
		startTimer: function() {
			if (null === this._timerId && this._rotate && 1 < this._$currList.data('numIndex')) {
				var delay = Math.round(this._$timer.data('pct') * this._$currList.data('delay'));
				this._$timer.animate({width:'0%'}, {duration:delay, easing:'linear', queue:false});
				this._timerId = setTimeout($.proxy(this.rotateSlides, this), delay);
			}
		},
		
		//pause timer
		pauseTimer: function() {
			clearTimeout(this._timerId);
			this._timerId = null;
			var pct = this._$timer.width()/this._$timer.parent().width();
			this._$timer.stop(true).data('pct', pct);
		},
		
		//reset timer
		resetTimer: function() {
			clearTimeout(this._timerId);
			this._timerId = null;
			this._$timer.stop(true).css({width:'100%'}).data('pct', 1);
		},
			
		//toggle caption
		toggleCaption: function(e) {
			var $button = $(e.currentTarget),
				$wrapper = $button.closest('.gs-wrapper');
				
			if ($button.hasClass('gs-caption-off')) {
				$wrapper.trigger(HIDE_CAPTION);
				$button.removeClass('gs-caption-off');
			}
			else {
				$wrapper.trigger(SHOW_CAPTION);
				$button.addClass('gs-caption-off');
			}
		},
		
		//slide in caption
		slideInCaption: function(e) {
			var $caption = $(e.currentTarget).find('>.gs-caption'),
				props = {};
			props[e.data.position] = 0;
			$caption.animate(props, {duration:ANIMATE_SPEED, queue:false});
		},
		
		//slide out caption
		slideOutCaption: function(e) {
			var $caption = $(e.currentTarget).find('>.gs-caption'), 
				props = {};
			props[e.data.position] = '-100%';
			$caption.animate(props, {duration:ANIMATE_SPEED, queue:false});
		},
		
		//fade in caption
		fadeInCaption: function(e) {
			$(e.currentTarget).find('>.gs-caption').animate({opacity:1}, {duration:ANIMATE_SPEED, queue:false});
		},
		
		//fade out caption
		fadeOutCaption: function(e) {
			$(e.currentTarget).find('>.gs-caption').animate({opacity:0}, {duration:ANIMATE_SPEED, queue:false});
		},
		
		//shuffle slides
		shuffleItems: function($list) {
			var slides = $list.children().toArray();
			shuffleArray(slides);
			$list.append(slides);
		},
		
		//mousewheel scroll list
		mouseScroll: function(e) {
			e.preventDefault();
			if (!this._$currList.is(':animated') && 0 === parseFloat(this._$currList.css('transition-duration'))) {
				var delta = (typeof e.originalEvent.wheelDelta === 'undefined') ?  -e.originalEvent.detail : e.originalEvent.wheelDelta;
				if (0 < delta) {
					this.prevSlides();
				}
				else {
					this.nextSlides();
				}
			}
		},
		
		//keyup event handler
		keyControl: function(e) {
			switch(e.keyCode) {
				case 37:
					this.prevSlides();
					break;
				case 39:
					this.nextSlides();
					break;
				case 80:
					this.togglePlay();
					break;
				case 27:
					this.hidePanel();
					break;
			}
		},

		menuTouchStart: function(e) {
			this._menuPosition = this._$menuList.position().left;
			if (1 === e.originalEvent.touches.length) {
				this._menuStartX = e.originalEvent.touches[0].pageX;
				this._menuStartY = e.originalEvent.touches[0].pageY;
				
				this._$menu.bind('touchmove', $.proxy(this.menuTouchMove, this)).one('touchend', $.proxy(function() { this._$menu.unbind('touchmove'); }, this));
			}
		},

		menuTouchMove: function(e) {
			var xDist = this._menuStartX - e.originalEvent.touches[0].pageX,
				yDist = this._menuStartY - e.originalEvent.touches[0].pageY,
				swipeMove = this._menuPosition - xDist;
			
			if (0 >= swipeMove && Math.min(0, this._$menu.width() - this._$menuList.width()) <= swipeMove) {
				this._$menuList.css({left:swipeMove});
			}

			if (Math.abs(xDist) > Math.abs(yDist)) {
				e.preventDefault();
			}
		},

		touchStart: function(e) {
			this._swipeMove = 0;
			if (1 === e.originalEvent.touches.length) {
				this.pauseOnAction();
				this._swipeStart = new Date();
				this._startX = e.originalEvent.touches[0].pageX;
				this._startY = e.originalEvent.touches[0].pageY;
				
				if ('verticalSlide' === this._$currList.data('effect')) {
					this._$slidePanel.bind('touchmove', $.proxy(this.verticalTouchMove, this));
				}
				else if ('horizontalSlide' === this._$currList.data('effect')) {
					this._$slidePanel.bind('touchmove', $.proxy(this.horizontalTouchMove, this));
				}
				else {
					this._$slidePanel.bind('touchmove', $.proxy(this.touchMove, this));
				}
				
				this._$slidePanel.one('touchend', $.proxy(this.touchEnd, this));
			}
		},
		
		horizontalTouchMove: function(e) {
			var xDist = this._startX - e.originalEvent.touches[0].pageX;
			var	yDist = this._startY - e.originalEvent.touches[0].pageY;
			var unitSize = this._$slidePanel.width() - this._slideMargin;
			
			var cssProp;
			this._swipeMove = (this._currIndex * unitSize) + xDist;
			if (this._cssTransform) {
				cssProp = {transform:'translateX(' + (-this._swipeMove) + 'px)'};
			}
			else {
				cssProp = {left:-this._swipeMove};
			}
			this._$currList.css(cssProp);
			
			if (Math.abs(xDist) > Math.abs(yDist)) {
				e.preventDefault();
			}
		},
		
		verticalTouchMove: function(e) {
			var xDist = this._startX - e.originalEvent.touches[0].pageX;
			var	yDist = this._startY - e.originalEvent.touches[0].pageY;
			var unitSize = this._$slidePanel.height() - this._slideMargin;
			
			var cssProp;
			this._swipeMove = (this._currIndex * unitSize) + yDist;
			if (this._cssTransform) {
				cssProp = {transform:'translateY(' + (-this._swipeMove) + 'px)'};
			}
			else {
				cssProp = {top:-this._swipeMove};
			}
			this._$currList.css(cssProp);
			
			if (Math.abs(yDist) > Math.abs(xDist)) {
				e.preventDefault();
			}
		},
		
		touchMove: function(e) {
			var xDist = this._startX - e.originalEvent.touches[0].pageX;
			var	yDist = this._startY - e.originalEvent.touches[0].pageY;
			var unitSize = this._$slidePanel.width() - this._slideMargin;
			this._swipeMove = (this._currIndex * unitSize) + xDist;
			
			if (Math.abs(xDist) > Math.abs(yDist)) {
				e.preventDefault();
			}
		},
		
		touchEnd: function(e) {
			this._$slidePanel.unbind('touchmove');
			
			if (Math.abs(this._swipeMove) > SWIPE_MIN) {
				var unitSize = ('verticalSlide' === this._$currList.data('effect') ? this._$slidePanel.height() : this._$slidePanel.width()) - this._slideMargin;
				var currPos = (this._currIndex * unitSize);
				if (this._swipeMove > currPos) {
					if (this._currIndex < this._$currList.data('numIndex') - 1) {
						this._currIndex++;
						this._$slider.trigger(SLIDER_NEXT);
						this._options.onNext.call(this);
					}
				}
				else if (this._swipeMove < currPos) {
					if (this._currIndex > 0) {
						this._currIndex--;
						this._$slider.trigger(SLIDER_PREV);
						this._options.onPrevious.call(this);
					}
				}
			}
			
			this.updateSlideList(true);
		},
		
		setOptColor: function($el, color, prop) {
			if (typeof color !== 'undefined') {
				if ('backgroundColor' === prop || 'background-color' === prop) {
					if ('' === $.trim(color)) {
						color = 'transparent';
					}
				}
				$el.css(prop, color);
			}
		},

		getDeferred: function($el) {
			var deferred = $el.data('deferred');
			if (typeof deferred === 'undefined') {
				deferred = $.Deferred();
				$el.data('deferred', deferred);
			}

			return deferred;
		},

		msieResize: $.noop
	};
	
	function beginWith(str, val) {
		return (val === str.substring(0, val.length));
	}
	
	function loadContent($content, $contentBox, callback) {
		var loadClass = 'gs-loading';
		var $container;
		$contentBox.removeClass(loadClass);
		
		var type = $content.data('contentType'),			
			url = $content.data('src'),
			postId = $content.data('postId');
		
		if (!$.isFunction(callback)) {
			callback = $.noop;
		}
		
		$contentBox.css({overflow:'auto'}).empty();
		
		if ('static' === type || (isEmpty(url) && !postId)) {
			$contentBox.html($content.html());
			return;
		}
		
		if ('image' === type) {
			var $img = $('<img/>').gsAddTransitionClass('gs-opacity-transition').css({opacity:0});
			$contentBox.addClass(loadClass).append($img);
			
			$img.one('load', function(e) {
				if ($.contains($contentBox.get(0), e.currentTarget)) {
					$contentBox.removeClass(loadClass);
					$(e.currentTarget).css({opacity:1});
					callback();
				}
			}).attr('src', url);
				
			if ($img[0].complete || 'complete' === $img[0].readyState) {
				$img.trigger('load');
			}
		}
		else if ('post' === type) {
			if (postId) {
				$container = $('<div></div>').gsAddTransitionClass('gs-opacity-transition').css({opacity:0});
				$contentBox.append($container);
				$.post(ajaxurl, $.param({action:AJAX_ACTION, post_id:postId}), 
					function(data) {
						if ($.contains($contentBox.get(0), $container[0])) {
							$contentBox.removeClass(loadClass);
							$container.html(data).css({opacity:1});
							callback();
						}
					});
			}
		}
		else if ('inline' === type) {
			var $inline = $(url);
			if ($inline.length) {
				$contentBox.html($inline.html());
			}
		}
		else if ('flash' === type) {
			$contentBox.html(getFlashContent(url));
		}
		else if ('ajax' === type) {
			$contentBox.addClass(loadClass);
			
			var index = url.indexOf('?'),
				varData = '',
				methodType = getValue($content.data('method'), 'GET');
				
			if (-1 < index) {
				varData = url.substring(index + 1);
				url = url.substring(0, index);
			}
			
			$container = $('<div></div>').gsAddTransitionClass('gs-opacity-transition').css({opacity:0});
			$contentBox.append($container);
			$.ajax({url:url, type:methodType, data:varData,
					success:function(data) {
						if ($.contains($contentBox.get(0), $container[0])) {
							$contentBox.removeClass(loadClass);
							$container.html(data).css({opacity:1});
							callback();
						}
					}});
		}
		else {
			$contentBox.addClass(loadClass);
			var $iframe = $('<iframe frameborder="0" hspace="0" scrolling="auto" width="100%" height="100%"></iframe>').gsAddTransitionClass('gs-opacity-transition').css({opacity:0});
			$contentBox.css({overflow:'hidden'}).append($iframe);
			
			$iframe.load(function(e) {
				if ($.contains($contentBox.get(0), e.currentTarget)) {
					$contentBox.removeClass(loadClass);
					$(e.currentTarget).css({opacity:1});
					callback();
				}
			}).attr('src', url);
		}
	}
	
	function getFlashContent(url, width, height) {
		width = getValue(width, '100%');
		height = getValue(height, '100%');
		return '<object type="application/x-shockwave-flash" data="' + url + '" width="' + width + '" height="' + height + '" style="display:block">\
					<param name="movie" value="' + url + '"/>\
					<param name="allowFullScreen" value="true"/>\
					<param name="quality" value="high"/>\
					<param name="wmode" value="transparent"/>\
					<a href="http://www.adobe.com/go/getflash"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player"/></a>\
				</object>';
	}
	
	//shuffle array
	function shuffleArray(arr) {
		var i = arr.length;
		while(--i > 0) {
			var ri = Math.floor(Math.random() * (i+1)),
				temp = arr[i];
			arr[i] = arr[ri];
			arr[ri] = temp;
		}
	}
	
	//prevent default behavior
	function preventDefault(e) {
		e.preventDefault();
	}
	
	//android check
	function androidCheck(ver) {
		var ua = navigator.userAgent;
		var index = ua.indexOf('Android');
		if (index > -1) {
			if (typeof ver === 'undefined' || parseFloat(ua.slice(index + 8)) <= ver) {
				return true;
			}
		}
		return false;
	}
	
	//msie ver. check
	function msieCheck(ver) {
		if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
	 		if (typeof ver === 'undefined') {
				return true;
			}
			
			var ieVer = parseFloat(RegExp.$1);
			if (ieVer <= ver) {
				return true;
			}
		}
		return false;
	}
	
	//check is empty
	function isEmpty(val) {
		return (typeof val === 'undefined' || '' === $.trim(val));
	}
	
	//get positive int
	function getPosInteger(val, defaultVal) {
		val = parseInt(val, 10);
		return (isNaN(val) || val <= 0) ? defaultVal : val;
	}
	
	//get nonnegative int
	function getNonNegInteger(val, defaultVal) {
		val = parseInt(val, 10);
		return (isNaN(val) || val < 0) ? defaultVal : val;
	}
	
	//get string value
	function getValue(val, defaultVal) {
		return (typeof val !== 'undefined') ? val : defaultVal;
	}
	
	//get style property support
	function styleSupport(prop) {
		var elem = document.createElement('div'),
			style = elem.style,
			supportedProp = false;
	
		if (prop in style) {
			supportedProp = prop;
		}
		else {
			var capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
				prefixes = ["Moz", "Webkit", "O", "ms"];
			
			for (var i = 0; i < prefixes.length; i++) {
				var prefixProp = prefixes[i] + capProp;
				if (prefixProp in style) {
					supportedProp = prefixProp;
					break;
				}
			}
		}
		
		elem = null;
		
		SUPPORT[prop] = supportedProp;
		return supportedProp;
	}
	
	//get type of content
	function getContentType(url) {
		//determine from url		
		if (url.match(/[^\s]+\.(jpg|gif|png|bmp)/i)) {
			return 'image';
		}
		
		if (url.match(/[^\s]+\.(swf)/i)) {
			return 'flash';
		}
		
		if (0 === url.indexOf('#')) {
			return 'inline';
		}
		
		return 'iframe';
	}
	
	//transition
	$.fn.gsTransition = function() {
		var props = arguments[0],
			duration, easing, complete, always;
		
		if (typeof arguments[1] === 'object') {
			var opts = arguments[1];
			duration = opts.duration;
			easing = opts.easing;
			complete = opts.complete;
			always = opts.always;
		}
		else {
			duration = arguments[1];
			easing = arguments[2];
			complete = arguments[3];
		}
		duration = getValue(duration, 400);
		easing = getValue(easing, 'swing');
		
		return this.each(
			function() {
				$(this).queue(function(){
					if ($.isFunction(complete)) {
						$(this).one(CSS_TRANSITION_END, complete);
						$(this).gsForceTransitionEnd(duration + 50);
					}
					
					if ($.isFunction(always)) {
						$(this).one(CSS_TRANSITION_END + '.always', always);
					}
					
					$(this).one(CSS_TRANSITION_END, function() { 
						$(this).css(CSS_TRANSITION + '-duration', '0s').dequeue();
					});
					
					props[CSS_TRANSITION] = 'all ' + duration + 'ms ' + CUBIC_BEZIER[easing];
					$(this).gsReflow().css(props);
				});
			}
		);
	};
	
	//stop transition
	$.fn.gsStopTransition = function(clearQueue, jumpToEnd) {
		return this.each(
			function() {
				if (clearQueue) {
					$(this).clearQueue();
				}
				
				clearTimeout($(this).data('endId'));
				if (jumpToEnd) {
					$(this).trigger(CSS_TRANSITION_END);
				}
				else {
					$(this).trigger(CSS_TRANSITION_END + '.always');
					$(this).unbind(CSS_TRANSITION_END);
				}
				
				$(this).css(CSS_TRANSITION, 'none').css(CSS_TRANSITION + '-duration', '0s').dequeue();
			}
		);
	};
	
	//force reflow
	$.fn.gsReflow = function() {
		return this.each(
			function() {
				var reflow = this.offsetWidth;
			}
		);
	};
	
	//force transition end
	$.fn.gsForceTransitionEnd = function(duration) {
		return this.each(function() {
			var called = false;
			
			$(this).one(CSS_TRANSITION_END, function() { called = true; });
			$(this).data('endId', setTimeout($.proxy(function() {
				if (!called) {
					$(this).trigger(CSS_TRANSITION_END);
				}
			}, this), duration));
		});
	};
	
	$.fn.gsAddTransitionClass = function(className) {
		return this.each(function(n, el) {
			if (SUPPORT.transition && !ANDROID2) {
				$(el).addClass(className);
			}
		});
	};
	
	var methods = {
  		previous: function() {
			$(this).data(PLUGIN).prevSlides();
		},

		next: function() {
			$(this).data(PLUGIN).nextSlides();
		},
		
		play: function() {
			$(this).data(PLUGIN).play();
		},
		
		pause: function() {
			$(this).data(PLUGIN).pause();
		},
		
		selectTab: function(index) {
			if (typeof index !== 'undefined') {
				$(this).data(PLUGIN).selectTab(parseInt(index, 10));
			}
		},
		
		destroy: function() {
			var obj = $(this).data(PLUGIN);
			obj.pause();
			if (!isEmpty(obj._namespace)) {
				$(window).add($(document)).unbind(obj._namespace);
			}
			obj._$slider.add($('*', obj._$slider)).unbind().removeData();
			$(this).removeData(PLUGIN);
		}
 	};
	
	$.fn.gridSlider = function() {
		var args = arguments;
		var params = args[0];
			
		return this.each(
			function(n, el) {
				if (methods[params]) {
					if (typeof $(el).data(PLUGIN) !== 'undefined') {
						methods[params].apply(el, Array.prototype.slice.call(args, 1));
					}
				}
				else if (typeof params === 'object' || !params) {
					var opts = $.extend(true, {}, $.fn.gridSlider.defaults, params);
					var o = $.metadata ? $.extend({}, opts, $.metadata.get(this)) : opts;

					var plugin = new GridSlider(el, o);
					$(el).data(PLUGIN, plugin);
					
					plugin._$slider.trigger(SLIDER_INIT);
					plugin._options.onInit.call(plugin);
				}
			}
		);
	};

	$.fn.gridSlider.defaults = { 
		responsive:false,
		numCols:4,
		numRows:2,
		minSlideWidth:200,
		slideWidth:300,
		slideHeight:200,
		slideBorder:0,
		slideMargin:0,
		padding:10,
		effect:"horizontalSlide",			
		speed:500,			
		easing:"",
		autoPlay:false,
		delay:5000,
		playButton:true,
		timer:true,		
		pauseOnHover:false,
		pauseOnInteraction:false,
		control:'index',
		selectOnHover:false,
		navButtons:'normal',
		continuous:true,
		pageInfo:true,
		keyboard:false,
		mousewheel:false,
		swipe:true,
		captionAlign:'bottom',
		captionPosition:'inside',
		captionEffect:'fade',
		captionButton:false,
		tabIndex:0,
		panelBarOnHover:false,
		panelEffect:'coverDown',
		hoverEffect:'none',
		imagePosition:'fill',
		shuffle:false,
		resetIndex:true,
		hoverDim:true,		
		cssTransition:true,
		initAll:false,
		onInit:function() {},			
		onPlay:function() {},
		onPause:function() {},
		onPrevious:function() {},
		onNext:function() {},
		onBegin:function() {},
		onEnd:function() {},
		previous:'previous',
		next:'next',
		play:'play',
		pause:'pause',
		close:'close',
		current:'{current} of {total}',
		hoverBox: {
			width:250,
			height:'auto',
			delay:1000,
			effect:'fade',
			toggle:false
		}
	};
})(jQuery);