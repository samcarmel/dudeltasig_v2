/**
 * jQuery Fotobox
 * Copyright (c) 2014 Allan Ma (http://codecanyon.net/user/webtako)
 * Version: 2.6 (9/3/2014)
 */
(function($) {
	var IS_TOUCH = 'ontouchstart' in window,   	
		ANIMATE_SPEED = 400,
		DEFAULT_WIDTH = 800,
		DEFAULT_HEIGHT = 500,
		MIN_SIZE = 100,
		INITIAL_SIZE = 250,
		SWIPE_MIN = 50,
		NAMESPACE = '.lightbox',
		GET_POST_ACTION = 'kpm_gs_get_post',
		PRELOAD_IMAGES = 'lbPreloadImages',
		INIT_OUTER_SIZE = 'lbInitOuterSize';

	var LIGHTBOX_OPEN = 'lightboxOpen',
		LIGHTBOX_CLOSE = 'lightboxClose',
		LIGHTBOX_PLAY = 'lightboxPlay',
		LIGHTBOX_PAUSE = 'lightboxPause',
		LIGHTBOX_PREV = 'lightboxPrevious',
		LIGHTBOX_NEXT = 'lightboxNext',
		LIGHTBOX_LOAD = 'lightboxLoad',
		LIGHTBOX_COMPLETE = 'lightboxComplete';
	
	var ANDROID2 = androidCheck(2.9),
		MSIE6 = msieCheck(6);
	
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
	
	var SUPPORT = {};
	styleSupport('transition');
	styleSupport('transform');
	styleSupport('boxSizing');
	styleSupport('backgroundSize');

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
	
	var HIDE_CSS = {opacity:0, visibility:'hidden', overflow:'auto'};

	var CONTENT =  "<div class='lb-wrapper'>\
						<div class='lb-container'>\
							<div class='lb-outer'>\
								<div class='lb-preloader'></div>\
								<div class='lb-inner'></div>\
								<div class='lb-timer'></div>\
								<div class='lb-caption'></div>\
								<div class='lb-prev-half'>\
									<div class='lb-hover-prev'><div></div></div>\
								</div>\
								<div class='lb-next-half'>\
									<div class='lb-hover-next'><div></div></div>\
								</div>\
							</div>\
							<div class='lb-outer-caption'></div>\
							<div class='lb-cpanel'>\
								<div class='lb-prev'><div></div></div>\
								<div class='lb-play'><div></div></div>\
								<div class='lb-next'><div></div></div>\
								<div class='lb-text'><div></div></div>\
								<div class='lb-info'></div>\
							</div>\
							<div class='lb-close'></div>\
						</div>\
					</div>";
	
	var methods = {
		init: function() {
			var lightbox = new Lightbox();
		},

		prev: function() {
			Lightbox.getInstance().prev();
		},

		next: function() {
			Lightbox.getInstance().next();
		},

		close: function() {
			Lightbox.getInstance().close();
		},

  		destroy: function() {
			Lightbox.getInstance().destroy();
		}
 	};
	
	//Constructor
	function Lightbox() {
		if (this instanceof Lightbox) {
			if (typeof Lightbox.instance === 'object') {
				return Lightbox.instance;
			}

			if (!SUPPORT.transition) {
				$.fn.lbTransition = $.fn.animate;
				$.fn.lbStop = $.fn.stop;
			}
		
			this._timerId = null;
			this._$overlay = $('<div></div>').addClass('lb-overlay');
			this._$wrapper = $(CONTENT);

			this._$thumbPanel = $('<div></div>').addClass('lb-thumbnails');
			this._$thumbList = $('<ul></ul>').click(stopPropagation).on('click', '>li', $.proxy(this.selectIndex, this));
			this._$thumbPanel.append(this._$thumbList);

			this._$overlay.append(this._$wrapper).append(this._$thumbPanel);
			$('body').append(this._$overlay);

			this._$container = this._$wrapper.find('>.lb-container').click(stopPropagation);
			this._$closeButton = this._$container.find('>.lb-close').lbAddClass('lb-shadow-transition').mousedown(preventDefault);
			
			this._$outerBox = this._$container.find('>.lb-outer');
			this._$outerCaption = this._$container.find('>.lb-outer-caption');
			this._$cpanel = this._$container.find('>.lb-cpanel');
			
			this._$preloader = this._$outerBox.find('>.lb-preloader');
			this._$innerBox = this._$outerBox.find('>.lb-inner');
			this._$timer = this._$outerBox.find('>.lb-timer').data('pct', 1);
			this._$innerCaption = this._$outerBox.find('>.lb-caption');
			this._$prevHalf = this._$outerBox.find('>.lb-prev-half');
			this._$nextHalf = this._$outerBox.find('>.lb-next-half');
			this._$hoverPrevButton = this._$prevHalf.find('>.lb-hover-prev');
			this._$hoverNextButton = this._$nextHalf.find('>.lb-hover-next');
			
			this._$prevButton = this._$cpanel.find('>.lb-prev');
			this._$nextButton = this._$cpanel.find('>.lb-next');
			this._$playButton = this._$cpanel.find('>.lb-play');
			this._$captionButton = this._$cpanel.find('>.lb-text');
			this._$infoPanel = this._$cpanel.find('>.lb-info');
			this._$cpanel.children().not('.lb-info').mousedown(preventDefault).lbAddClass('lb-opacity-transition');

			this._$errorBox = $('<div></div>').addClass('lb-error-box');

			this._$prevButton.add(this._$hoverPrevButton).click($.proxy(this.prev, this));
			this._$nextButton.add(this._$hoverNextButton).click($.proxy(this.next, this));
			this._$playButton.click($.proxy(this.togglePlay, this));
			this._$captionButton.click($.proxy(this.toggleCaption, this));
			this._winWidth = this._winHeight = 0;

			if (IS_TOUCH) {
				this._$overlay.addClass('lb-touch');
			}
			else {
				this._$prevHalf.add(this._$nextHalf).hover(function() { $(this).find('>div').animate({opacity:1}, {duration:ANIMATE_SPEED, queue:false}); },
											   			   function() { $(this).find('>div').animate({opacity:0}, {duration:ANIMATE_SPEED, queue:false}); });
			}

			if (!SUPPORT.boxSizing) {
				this._$innerCaption.css({padding:0});
			}

			if (SUPPORT.transition && SUPPORT.transform) {
				this._$innerCaption.css({top:'100%'});
				Lightbox.prototype.showCaption = function() { 
					this._$innerCaption.show().lbStop(true).lbTransition({transform:'translateY(-100%)'}, ANIMATE_SPEED); 
				};
				Lightbox.prototype.hideCaption = function() {
					this._$innerCaption.lbStop(true).lbTransition({transform:'translateY(0)'}, ANIMATE_SPEED); 
				};
			}
			else {
				this._$innerCaption.css({bottom:0});
				Lightbox.prototype.showCaption = function() { this._$innerCaption.show(); };
				Lightbox.prototype.hideCaption = function() { this._$innerCaption.hide(); };
			}
			
			this._$wrapper.one(INIT_OUTER_SIZE, $.proxy(function() {
				this._margin = this._$wrapper.outerWidth() - this._$wrapper.width();
				this._padding = this._$container.outerWidth() - this._$container.width();
			}, this));

			this.initMisc();
			if (!rgbaSupport()) {
				this._$overlay.prepend($('<div></div>').addClass('lb-overlay-bg'));
			}

			$(window).bind('resize' + NAMESPACE + '_extra', $.proxy(function() {
				if (this._displayThumbs) {
					this._$thumbList.lbStop(true).lbTransition({left:this.getThumbOffset()}, ANIMATE_SPEED);
				}
			}, this));

			Lightbox.instance = this;
			Lightbox.fnCalled = 0;
		}
		else {
			return new Lightbox();
		}
	}

	Lightbox.getInstance = function() {
		if (typeof Lightbox.instance === 'undefined') {
			var lightbox = new Lightbox();
		}
		return Lightbox.instance;
	};

	Lightbox.prototype = {
		constructor: Lightbox,

		open: function(e) {
			e.preventDefault();
			
			$('body').addClass('lb-noscroll');

			var $obj = $(e.currentTarget);
			this._$currGroup = $obj.data('group');
			this._currIndex = $obj.data('index');
			var data = this._$currGroup.data(),
				callId = data.callId;
			
			this._numItems = this._$currGroup.length;
			this._continuous = data.continuous;
			this._displayCaption = data.caption;
			this._outsideCaption = ('outside' === data.captionPosition);
			this._displayCaptionButton = this._displayCaption && !this._outsideCaption && data.captionButton;
			
			var rotate = data.autoPlay,
				displayPlayButton = data.playButton,
				buttonType = data.navButtons,
				normalNavs = (true ===  buttonType || 'normal' === buttonType);

			if (rotate || displayPlayButton) {
				Lightbox.prototype.play = this.startTimer;
			}
			else {
				Lightbox.prototype.play = $.noop;
			}

			this._$timer.toggleClass('lb-hidden', !data.timer);
			this._$prevHalf.add(this._$nextHalf).toggle('hover' === buttonType || 'mouseover' === buttonType);
			this._$prevButton.add(this._$nextButton).toggleClass('lb-hide-el', !normalNavs);
			this._$playButton.toggleClass('lb-pause', rotate).toggleClass('lb-hide-el', !displayPlayButton);
			this._$captionButton.toggleClass('lb-hide-el', !this._displayCaptionButton).removeClass('lb-expand').attr('title', this._$currGroup.data('closeCaption'));
			this._$infoPanel.toggleClass('lb-hide-el', !data.numberInfo);
			this._$outerCaption.css({maxHeight:'none'}).removeClass('lb-concat');
			this._displayCPanel = displayPlayButton || normalNavs || data.numberInfo || this._displayCaptionButton;
			
			this._$playButton.attr('title', rotate ? data.pause : data.play);
			this._$closeButton.attr('title', data.close);
			this._$prevButton.add(this._$hoverPrevButton).attr('title', data.previous);
			this._$nextButton.add(this._$hoverNextButton).attr('title', data.next);

			if (this._displayCaption) {
				if (this._outsideCaption) {
					Lightbox.prototype.updateCaption = this.updateOuterCaption;
				}
				else {
					Lightbox.prototype.updateCaption = this.updateInnerCaption;
				}
			}
			else {
				Lightbox.prototype.updateCaption = $.noop;
				this._$innerCaption.add(this._$outerCaption).hide();
			}
			
			if (this._continuous) {
				Lightbox.prototype.updateNavs = $.noop;
				this._$prevButton.add(this._$nextButton).add(this._$hoverPrevButton).add(this._$hoverNextButton).removeClass('lb-disable');
			}
			else {
				Lightbox.prototype.updateNavs = function() {
					this._$prevButton.add(this._$hoverPrevButton).toggleClass('lb-disable', 0 === this._currIndex);
					this._$nextButton.add(this._$hoverNextButton).toggleClass('lb-disable', (this._numItems - 1) === this._currIndex);
				};
			}

		//	this._$overlay.css({backgroundColor:data.overlayColor, opacity:data.overlayOpacity});
			this._$overlay.add(this._$closeButton).unbind('click').click($.proxy(this.close, this));

			var initWidth = Math.max(data.initialWidth, 40),
				initHeight = Math.max(data.initialHeight, 40);

			this._$overlay.css({visibility:'hidden', opacity:1}).show();
			this.initThumbnails();
		
			//start display			
			this._$container.css({width:initWidth, height:initHeight});
			this._$wrapper.trigger(INIT_OUTER_SIZE).css({width:initWidth + this._padding, height:initHeight + this._padding})
				    	  .css({marginLeft:-this._$wrapper.outerWidth()/2, marginTop:-this._$wrapper.outerHeight()/2 - this._offset});
			this.showThumbnails();
			this._$overlay.css({visibility:'visible'});

			//load content	
			this.loadContent(false);
			this.ie6_open();
			$(document).trigger(LIGHTBOX_OPEN);
			
			//preload images
			var name = $obj.data('lightbox-group');
			if (typeof name !== 'undefined') {
				this._$wrapper.trigger(PRELOAD_IMAGES + '.' + (callId + '_' + name));
			}
		},

		close: function(e) {
			if (typeof e !== 'undefined') {
				e.stopPropagation();
			}

			$('body').removeClass('lb-noscroll');

			this.resetTimer();
			this._$overlay.add(this._$closeButton).unbind('click');
			this._$overlay.lbStop(true).lbTransition({opacity:0}, ANIMATE_SPEED, $.proxy(function() {
				this._$wrapper.add(this._$container).lbStop(true);
				this._$innerBox.add(this._$innerCaption).add(this._$outerCaption).empty();
				this._$innerCaption.add(this._$outerCaption).hide();
				this.hideThumbnails();
				this.disableControl();
				this._$overlay.add(this._$preloader).hide();
			}, this));

			this.ie6_close();
			$(document).trigger(LIGHTBOX_CLOSE);
		},

		initMisc: function() {
			if (MSIE6) {
				this._$overlay.css({position:'absolute'});
				Lightbox.prototype.ie6_open = function() { $('body').find('select').addClass('lb-hide-selects'); };
				Lightbox.prototype.ie6_close = function() { $('body').find('select').removeClass('lb-hide-selects'); };

				this.setOverlayToDocSize();
				$(window).bind('resize' + NAMESPACE + '_extra', $.proxy(this.setOverlayToDocSize, this));
			}
		},

		initThumbnails: function() {
			var opts = this._$currGroup.data('thumbnails');
			this._displayThumbs = (1 < this._$currGroup.length && opts.enable); 
			this._$thumbList.empty();
			
			if (this._displayThumbs) {
				this._$thumbPanel.show();
				this._$currGroup.each($.proxy(function(n, el) {
					var $el = $(el),
						$thumb = $('<li></li>').data('thumbUrl', $el.data('lightbox-thumb') || $el.attr('href')).css({width:opts.width, height:opts.height}).lbAddClass('lb-border-transition'), 
						$img = $('<img/>');

					if (opts.title) {
						$img.attr({title:$el.attr('title') || $el.data('title')});
					}

					$thumb.append($img);
					this._$thumbList.append($thumb);
				}, this));

				this.loadNextThumb(this._$thumbList.children().toArray());
				this._$thumbList.css({width:this._$currGroup.length * this._$thumbList.children().outerWidth(true)});
				
				var isTop = ('top' === opts.position);
				this._$thumbPanel.toggleClass('lb-top', isTop);

				this._offset = this._$thumbPanel.height()/2;
				if (isTop) {
					this._offset *= -1;
				}
			}
			else {
				this._offset = 0;
			}
		},

		fillThumb: function($img) {
			var $parent = $img.parent(),				
				width = $img.width(), 
				height = $img.height(),
				boxWidth = $parent.width(),
				boxHeight = $parent.height(),
				scale = Math.max(boxHeight/height, boxWidth/width);
			
			$img.css({width:(width * scale), height:(height * scale)})
				.css({top:(boxHeight - $img.height())/2, left:(boxWidth - $img.width())/2});
		},

		showThumbnails: function() {
			if (this._displayThumbs) {
				this._$thumbPanel.lbStop(true, true).css({opacity:0}).lbTransition({opacity:1}, ANIMATE_SPEED);
			}
		},

		hideThumbnails: function() {
			this._$thumbPanel.lbStop(true, true).hide();
			this._$thumbList.empty();
		},

		getThumbOffset: function() {
			var width = this._$thumbList.children().outerWidth(true);
			return $(window).width()/2 - ((this._currIndex * width) + (width/2));
		},

		loadContent: function(animate) {
			this._$item = this._$currGroup.eq(this._currIndex);
			
			this.disableControl();
			
			this._$outerBox.css({width:'100%', height:'100%'});
			this._$innerBox.css({width:'auto', height:'auto'});

			this.updateCaption();
			this.getContent();

			if (this._displayThumbs) {
				if (typeof animate === 'undefined' || true === animate) {
					this._$thumbList.lbStop(true).lbTransition({left:this.getThumbOffset()}, ANIMATE_SPEED);
				}
				else {
					this._$thumbList.lbStop(true).css({left:this.getThumbOffset()});
				}
				this._$thumbList.children().removeClass('lb-active-thumb').eq(this._currIndex).addClass('lb-active-thumb');
			}
		},

		getContent: function() {
			var $item = this._$item,
				contentType = $item.data('contentType'),
				url = $item.attr('href'),
				$content,
				size;

			$(document).trigger(LIGHTBOX_LOAD);
			this._$innerBox.css(HIDE_CSS).css({backgroundColor:this._$container.css('backgroundColor'), color:this._$container.css('color')}).empty();
			if ('image' === contentType) {
				this._$preloader.show();
				$content = $('<img/>');
				this._$innerBox.append($content);
				$content.one('load', $.proxy(function(e) {
						var $img = $(e.currentTarget);
						if ($.contains(this._$innerBox.get(0), $img[0])) {
							size = this.getContentSize($item, $img);
							$img.css({width:'100%', height:'100%'});
							this.displayContent(size.width, size.height);
							$(document).trigger(LIGHTBOX_COMPLETE);
						}
					}, this))
					.error($.proxy(function(e) {
						if ($.contains(this._$innerBox.get(0), e.currentTarget)) {
							this.displayError();
						}
					}, this)).attr('src', url);
					
				if ($content[0].complete || 'complete' === $content[0].readyState) {
					$content.trigger('load');
				}
			}
			else if ('inline' === contentType) {
				$content = $(url);
				if ($content.length) {
					size = this.getContentSize($item, $content);
					this._$innerBox.css({color:this._$currGroup.data('color'), backgroundColor:this._$currGroup.data('backgroundColor')}).html($content.html());
					this.displayContent(size.width, size.height);
					$(document).trigger(LIGHTBOX_COMPLETE);
				}
				else {
					this.displayError();
				}
			}
			else if ('flash' === contentType) {
				size = this.getContentSize($item);
				var content =  "<object type='application/x-shockwave-flash' data='" + url + "' width='100%' height='100%' style='display:block'>\
									<param name='movie' value='" + url + "'/>\
									<param name='allowFullScreen' value='true'/>\
									<param name='quality' value='high'/>\
									<param name='wmode' value='transparent'/>\
								</object>";
				this._$innerBox.html(content);
				this.displayContent(size.width, size.height);
				$(document).trigger(LIGHTBOX_COMPLETE);
			}
			else if ('ajax' === contentType || 'post' === contentType) {
				var method, varData = ''; 

				this._$preloader.show();
				$content = $('<div></div>').hide(); 
				this._$innerBox.append($content);
				
				if ('post' === contentType) {
					url = ajaxurl;
					method = 'POST';
					varData = $.param({action:GET_POST_ACTION, post_id:$item.data('post-id')});
				}
				else {
					var index = url.indexOf('?');
					method = $item.data('lightbox-method');
					
					if (isEmpty(method)) {
						method = 'GET';
						$item.data('lightbox-method', method);
					}

					if (-1 < index) {
						varData = url.substring(index + 1);
						url = url.substring(0, index);
					}
				}

				$.ajax({url:url, type:method, data:varData,
						success:$.proxy(function(data) {
							if ($.contains(this._$innerBox.get(0), $content[0])) {
								this._$innerBox.html(data);
								size = this.getContentSize($item);
								this.displayContent(size.width, size.height);
								$(document).trigger(LIGHTBOX_COMPLETE);
							}
						}, this),
						error:$.proxy(function() {
							if ($.contains(this._$innerBox.get(0), $content[0])) {
								this.displayError();
							}
						}, this)
				});
			}
			else {
				this._$preloader.show();
				$content = $("<iframe frameborder='0' hspace='0' scrolling='auto' width='100%' height='100%'></iframe>");
				this._$innerBox.css({overflow:'hidden'}).append($content);
				$content.load($.proxy(function(e) {
					if ($.contains(this._$innerBox.get(0), e.currentTarget)) {
						size = this.getContentSize($item);
						this.displayContent(size.width, size.height);
						$(document).trigger(LIGHTBOX_COMPLETE);
					}
				}, this)).attr('src', url);
			}
		},

		//get content dimension	
		getContentSize: function($item, $el) {
			var width = $item.data('orgWidth'),
				height = $item.data('orgHeight');
			
			if (typeof width === 'undefined' || typeof height === 'undefined') {
				var elWidth, elHeight;

				width = $item.data('lightboxWidth');
				height = $item.data('lightboxHeight');

				if (typeof $el !== 'undefined' && $el.length) {
					elWidth = $el.outerWidth();
					elHeight = $el.outerHeight();
				}
				else {
					elWidth = DEFAULT_WIDTH;
					elHeight = DEFAULT_HEIGHT;
				}
				
				width = getSize(width, elWidth);
				height = getSize(height, elHeight);
				$item.data({orgWidth:width, orgHeight:height});
			}

			if (this._$currGroup.data('responsive')) {
				return this.getResponsiveSize(width, height);
			}
			
			return {width:width, height:height};
		},

		displayContent: function(contentWidth, contentHeight) {
			if (this._$wrapper.is(':visible')) {
				this._$preloader.hide();
				
				var width  = contentWidth,
					height = contentHeight,
					duration = this._$currGroup.data('speed'),
					easing = this._$currGroup.data('easing'),
					deferred1 = $.Deferred(),
					deferred2 = $.Deferred();
				
				if (this._displayCPanel) {
					height += this._$cpanel.outerHeight();
				}
				
				if (this._displayCaption && this._outsideCaption && !isEmpty(this._$outerCaption.html())) {
					this._$outerCaption.width(width);
					height += this._$outerCaption.outerHeight();
				}

				this._$innerBox.lbStop(true).css({opacity:0});
				
				if (this._$container.width() === width && this._$container.height() === height) {
					duration = 0;
				}

				$.when(deferred1.promise(), deferred2.promise()).done($.proxy(function() {
					this._$outerBox.css({width:contentWidth, height:contentHeight});
					this._$innerBox.css({width:'100%', height:'100%'});
					this._$infoPanel.html(this._$currGroup.data('current').replace('{current}', (this._currIndex + 1)).replace('{total}', this._numItems));

					if (this._displayCaption) {
						if (this._outsideCaption) {
							if (!isEmpty(this._$outerCaption.html())) {
								this._$outerCaption.show();
							}
						}
						else {
							if (!this._$captionButton.hasClass('lb-expand') && !isEmpty(this._$innerCaption.html())) {
								this.showCaption();
							}
						}
					}
					
					this.enableControl();
					this._$innerBox.css({visibility:'visible'}).lbStop(true).lbTransition({opacity:1}, ANIMATE_SPEED,
						$.proxy(function() { 
							this.play();
						}, this));
				}, this));

				this._$container.lbStop(true).lbTransition({width:width, height:height}, duration, easing, 
					function() {
						deferred1.resolve();
					});

				width += this._padding;
				height += this._padding;
				
				this._$wrapper.lbStop(true).lbTransition({marginLeft:-(width + this._margin)/2, marginTop:-(height + this._margin)/2 - this._offset, width:width, height:height}, duration, easing, 
					function() {
						deferred2.resolve();
					});
			}
		},

		//display error message
		displayError: function() {
			var width, height;

			this._$errorBox.html(this._$currGroup.data('errorMessage'));
			this._$innerBox.empty().append(this._$errorBox);
			
			width = this._$errorBox.outerWidth(); 
			height = this._$errorBox.outerHeight();

			this._$item.data({'orgWidth':width, 'orgHeight':height});
			this.displayContent(width, height);
		},

		//display inner caption
		updateInnerCaption: function() {
			this._$innerCaption.empty().hide().lbReflow().css({transform:'translateY(0)'});
			
			var caption = this._$item.attr('title') || this._$item.data('title');
			if (!isEmpty(caption)) {
				this._$innerCaption.html(caption);
				this._$captionButton.toggleClass('lb-hide-el', !this._displayCaptionButton);
			}
			else {
				this._$captionButton.addClass('lb-hide-el');
			}
		},
		
		//display outer caption
		updateOuterCaption: function() {
			var caption = this._$item.attr('title') || this._$item.data('title');
			this._$outerCaption.empty().hide();
			if (!isEmpty(caption)) {
				this._$outerCaption.html(caption);
			}
		},

		enableControl: function() {
			this.unbindEvents();
			
			var data = this._$currGroup.data();
			if (data.responsive) {
				$(window).bind('resize' + NAMESPACE, $.proxy(this.resize, this));
			}

			if (data.keyboard) {
				$(document).bind('keyup' + NAMESPACE, $.proxy(this.keyControl, this));
			}
			
			if (data.mousewheel) {
				this._$wrapper.bind('mousewheel DOMMouseScroll', $.proxy(this.mousescroll, this));
			}
			
			if (IS_TOUCH && data.swipe) {
				this._$wrapper.bind('touchstart', $.proxy(this.touchStart, this));
			}
			
			this.updateNavs();
			this._$prevHalf.add(this._$nextHalf).removeClass('lb-hidden');
			this._$cpanel.toggle(this._displayCPanel);
		},

		disableControl: function() {
			this.unbindEvents();
			this._$prevHalf.add(this._$nextHalf).addClass('lb-hidden');
			this._$cpanel.hide();
		},

		unbindEvents: function() {
			$(window).unbind('resize' + NAMESPACE);
			$(document).unbind('keyup' + NAMESPACE);
			this._$wrapper.unbind('mousewheel DOMMouseScroll touchstart touchmove touchend');
		},

		//toggle caption
		toggleCaption: function()  {
			var title;
			this._$captionButton.toggleClass('lb-expand', !this._$captionButton.hasClass('lb-expand'));
			if (this._$captionButton.hasClass('lb-expand')) {
				this.hideCaption();
				title = this._$currGroup.data('openCaption');
			}
			else {
				this.showCaption();
				title = this._$currGroup.data('closeCaption');
			}
			this._$captionButton.attr('title', title);
		},
		
		//toggle play
		togglePlay: function() {
			this._$currGroup.data('autoPlay', !this._$currGroup.data('autoPlay'));
			if (this._$currGroup.data('autoPlay')) {
				this._$playButton.addClass('lb-pause').attr({title:this._$currGroup.data('pause')});
				this.play();
				$(document).trigger(LIGHTBOX_PLAY);
			}
			else {
				this._$playButton.removeClass('lb-pause').attr({title:this._$currGroup.data('play')});
				this.pause();
				$(document).trigger(LIGHTBOX_PAUSE);
			}
		},

		//previous
		prev: function() {
			this.resetTimer();
			if (this._currIndex > 0) {
				this._currIndex--;
			}
			else if (this._continuous) {
				this._currIndex = this._numItems - 1;
			}
			else {
				return;
			}

			this.loadContent();
			$(document).trigger(LIGHTBOX_PREV);
		},
		
		//next
		next: function() {
			this.resetTimer();
			if (this._currIndex < this._numItems - 1) {
				this._currIndex++;
			}
			else if (this._continuous) {
				this._currIndex = 0;
			}
			else {
				return;
			}
			
			this.loadContent();
			$(document).trigger(LIGHTBOX_NEXT);
		},

		//select index
		selectIndex: function(e) {
			e.preventDefault();

			var $item = $(e.currentTarget),
				index = $item.index();

			if (index !== this._currIndex) {
				this.resetTimer();
				this._currIndex = index;
				this.loadContent();
			}
		},

		//rotate next
		rotateNext: function() {
			this.resetTimer();
			this._currIndex = (this._currIndex < this._numItems - 1) ? this._currIndex + 1 : 0;
			this.loadContent();
		},

		//get fit dimension
		getResponsiveSize: function(width, height) {
			var ratio = height/width,
				orgWidth = this._$item.data('orgWidth'),
				orgHeight = this._$item.data('orgHeight'),
				outerSize = this._margin + this._padding,
				maxWidth = $(window).width() - outerSize,
				maxHeight = $(window).height() - outerSize,
				displayOuterCaption = this._displayCaption && this._outsideCaption && !isEmpty(this._$outerCaption.html()),
				constHeight;
			
			width = Math.max(maxWidth, MIN_SIZE);
			if (!isNaN(orgWidth)) {
				width = Math.min(width, orgWidth);
			}
			height = ratio * width;
			
			if (this._displayCPanel) {
				maxHeight -= this._$cpanel.outerHeight();
			}
			
			if (this._displayThumbs) {
				maxHeight -= this._$thumbPanel.height();
			}
			
			constHeight = maxHeight;

			if (displayOuterCaption) {
				this._$outerCaption.css({maxHeight:'none'}).removeClass('lb-concat').width(width);
				maxHeight -= this._$outerCaption.outerHeight();
			}
			
			if (height > maxHeight) {
				height = Math.max(maxHeight, MIN_SIZE);
				if (!isNaN(orgHeight)) {
					height = Math.min(height, orgHeight);
				}
				width = height/ratio;

				if (displayOuterCaption) {
					this._$outerCaption.css({width:width, maxHeight: Math.max(0, constHeight - height)}).addClass('lb-concat');
				}
			}

			return {width:width, height:height};
		},

		setOverlayToDocSize: function() {
			this._$overlay.css({width:$(document).width(), height:$(document).height()});
		},
	
		resize: function() {
			if ($(window).width() !== this._winWidth || $(window).height() !== this._winHeight) {
				this._winWidth = $(window).width();
				this._winHeight = $(window).height();
				this.resetTimer();
				
				var size = this.getResponsiveSize(this._$innerBox.width(), this._$innerBox.height()),
					width = size.width,
					height = size.height;
				
				this._$outerBox.css({width:width, height:height});

				if (this._displayCPanel) {
					height += this._$cpanel.outerHeight();
				}
					
				if (this._$outerCaption.is(':visible')) {
					this._$outerCaption.width(width);
					height += this._$outerCaption.outerHeight();
				}
				
				this._$container.lbStop(true).css({width:width, height:height});

				width += this._padding;
				height += this._padding;

				this._$wrapper.lbStop(true).css({marginLeft:-(width + this._margin)/2, marginTop:-(height + this._margin)/2 - this._offset, width:width, height:height});
				
				this.play();
			}
		},
	
		//start timer
		startTimer: function() {
			if (this._$currGroup.data('autoPlay') && null === this._timerId) {
				var delay = Math.round(this._$timer.data('pct') * this._$currGroup.data('delay'));
				this._$timer.animate({width:'100%'}, delay, 'linear');
				this._timerId = setTimeout($.proxy(this.rotateNext, this), delay);
			}
		},
		
		//reset timer
		resetTimer: function() {
			clearTimeout(this._timerId);
			this._timerId = null;
			this._$timer.stop(true).width(0).data('pct', 1);
		},
		
		//pause timer
		pause: function() {
			clearTimeout(this._timerId);
			this._timerId = null;
			var pct = 1 - (this._$timer.width()/(this._$timer.parent().width() + 1));
			this._$timer.stop(true).data('pct', pct);
		},
		
		//key press
		keyControl: function(e) {
			switch(e.keyCode) {
				case 27:
					this.close(e);
					break;
				case 37:
					this.prev();
					break;
				case 39:
					this.next();
					break;
				case 80:
					this.togglePlay();
					break;
			}
		},

		//mousewheel scroll
		mousescroll: function(e) {
			e.preventDefault();
			if (!this._$wrapper.is(':animated')) {
				var delta = (typeof e.originalEvent.wheelDelta === 'undefined') ? -e.originalEvent.detail : e.originalEvent.wheelDelta;
				if (0 < delta) {
					this.prev();
				}
				else {
					this.next();
				}
			}
		},
		
		touchStart: function(e) {
			this._swipeMove = 0;
			if (1 === e.originalEvent.touches.length) {
				this._swipeStart = new Date();
				this._startX = e.originalEvent.touches[0].pageX;
				this._startY = e.originalEvent.touches[0].pageY;
				
				this._$wrapper.bind('touchmove', $.proxy(this.touchMove, this)).one('touchend', $.proxy(this.touchEnd, this));
			}
		},
			
		touchMove: function(e) {
			var	yDist = this._startY - e.originalEvent.touches[0].pageY;
			this._swipeMove = this._startX - e.originalEvent.touches[0].pageX;
			this._touchScrolling = Math.abs(this._swipeMove) < Math.abs(yDist);
				
			if (!this._touchScrolling) {
				e.preventDefault();
			}
		},
			
		touchEnd: function(e) {
			this._$wrapper.unbind('touchmove');
				
			if (!this._touchScrolling) {
				if (Math.abs(this._swipeMove) > SWIPE_MIN) {
					if (this._swipeMove > 0) {
						this.next();
					}
					else if (this._swipeMove < 0) {
						this.prev();
					}
				}
			}
		},

		preloadGroup: function($items) {
			this._$wrapper.one(PRELOAD_IMAGES + '.' + ($items.data('callId') + '_' + $items.data('lightbox-group')), $.proxy(function() {
				this.loadNextImage($items.toArray());
			}, this));
		},
	
		//load next thumb
		loadNextThumb: function(items, callback) {
			if (items.length && $.contains(this._$thumbList[0], items[0])) {
				this.initThumb($(items.splice(0, 1))).always($.proxy(function() {
					this.loadNextThumb(items, callback);
				}, this));
			}
			else if ($.isFunction(callback)) {
				callback.call(this);
			}
		},

		//init thumb
		initThumb: function($item) {
			var deferred = $.Deferred(),
				$img = $item.find('>img'),
				url = $item.data('thumbUrl');

			$img.one('load', $.proxy(function(e) {
				var $content;
				if (SUPPORT.backgroundSize) {
					$content = $('<div></div>').css({backgroundImage:'url(' + url + ')'}).attr({title:$(e.currentTarget).attr('title')});
					$(e.currentTarget).hide().after($content);
				}
				else {
					$content = $(e.currentTarget);
					this.fillThumb($content);
				}				
				$content.lbAddClass('lb-opacity-transition').lbReflow().addClass('lb-loaded');
				deferred.resolve();
			}, this))
			.error(function(e) {
				$(e.currentTarget).remove();
				deferred.reject();
			}).attr('src', url);
			
			if ($img[0].complete || 'complete' === $img[0].readyState) {
				$img.trigger('load');
			}
		
			return deferred.promise();
		},

		//load next image
		loadNextImage: function(items, callback) {
			if (items.length) {
				this.preloadImage($(items.splice(0, 1))).always($.proxy(function() {
					this.loadNextImage(items, callback);
				}, this));
			}
			else if ($.isFunction(callback)) {
				callback.call(this);
			}
		},

		//preload image
		preloadImage: function($item) {
			var deferred = $.Deferred();
			if ('image' === $item.data('contentType')) {
				var img = document.createElement('img'),
					$img = $(img);

				$img.one('load', function() {
					deferred.resolve();
					img = null;
				})
				.error(function() {
					deferred.reject();
					img = null;
				}).attr('src', $item.attr('href'));
				
				if ($img[0].complete || 'complete' === $img[0].readyState) {
					$img.trigger('load');
				}
			}
			else {
				deferred.reject();
			}

			return deferred.promise();
		},

		destroy: function() {
			try {
				this.pause();
				this._$overlay.remove();
				$(window).add($(document)).unbind(NAMESPACE).unbind(NAMESPACE + '_extra');
				Lightbox.instance = null;
				Lightbox.instance = undefined;
			}
			catch (ex) {
			}
		},

		ie6_open:$.noop,
		ie6_close:$.noop
	};
		
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
	
	//get positive int
	function getPosInteger(val, defaultVal) {
		val = parseInt(val, 10);
		return (isNaN(val) || 0 >= val) ? defaultVal : val;
	}
	
	//check is empty
	function isEmpty(val) {
		return (typeof val === 'undefined' || '' === $.trim(val));
	}
	
	//get size
	function getSize(val, defaultVal) {
		return ((typeof val === 'undefined' || isNaN(val)) ? defaultVal  : Math.max(parseInt(val, 10), MIN_SIZE));
	}
	
	//get string value
	function getValue(val, defaultVal) {
		return (typeof val !== 'undefined') ? val : defaultVal;
	}
	
	//android check
	function androidCheck(ver) {
		var ua = navigator.userAgent,
			index = ua.indexOf('Android');
		
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
	
	function preventDefault(e) {
		e.preventDefault();
	}
	
	function stopPropagation(e) { 
		e.stopPropagation(); 
	}

	//get style property support
	function styleSupport(prop) {
		var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
			elem = document.body || document.documentElement,
			style = elem.style,
			supportedProp = false;
	
		if (typeof style[prop] !== 'undefined') {
			supportedProp = prop;
		}
		else {
			var capProp = prop.charAt(0).toUpperCase() + prop.slice(1);
			for (var i = 0; i < prefixes.length; i++) {
				var prefixProp = prefixes[i] + capProp;
				if (typeof style[prefixProp] !== 'undefined') {
					supportedProp = prefixProp;
					break;
				}
			}
		}

		SUPPORT[prop] = supportedProp;
		return supportedProp;
	}
	
	//check rgba support
	function rgbaSupport() {
		var el = document.createElement('div'),
    		style = el.style,
    		support;
    	
    	style.cssText = 'background-color:rgba(0, 0, 0, 0.5)';
    	support = (0 <= (style.backgroundColor + '').indexOf('rgba'));
    	el = null;

    	return support;
	}

	//transition
	$.fn.lbTransition = function() {
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
			if (3 === arguments.length) {
				complete = arguments[2];
			}
			else {
				easing = arguments[2];
				complete = arguments[3];
			}
		}
		duration = getValue(duration, 400);
		easing = getValue(easing, 'swing');
		
		return this.each(
			function() {
				$(this).queue(function(){
					if ($.isFunction(complete)) {
						$(this).one(CSS_TRANSITION_END, complete);
						$(this).lbForceTransitionEnd(duration + 50);
					}
					
					if ($.isFunction(always)) {
						$(this).one(CSS_TRANSITION_END + '.always', always);
					}
					
					$(this).one(CSS_TRANSITION_END, function() { 
						$(this).css(CSS_TRANSITION + '-duration', '0s').dequeue();
					});
					
					props[CSS_TRANSITION] = 'all ' + duration + 'ms ' + CUBIC_BEZIER[easing];
					$(this).lbReflow().css(props);
				});
			}
		);
	};
	
	//stop transition
	$.fn.lbStop = function(clearQueue, jumpToEnd) {
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
	$.fn.lbReflow = function() {
		return this.each(
			function() {
				var reflow = this.offsetWidth;
			}
		);
	};
	
	//force transition end
	$.fn.lbForceTransitionEnd = function(duration) {
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
	
	$.fn.lbAddClass = function(className) {
		return this.each(function(n, el) {
			if (SUPPORT.transition && !ANDROID2) {
				$(el).addClass(className);
			}
		});
	};

	//init group
	$.fn.fotobox = function() {
		var args = arguments,
			params = args[0];
		
		if (methods[params]) {
			methods[params].apply($(this), Array.prototype.slice.call(args, 1));
		}
		else if (typeof params === 'object' || !params) {
			var $obj = $(this),
				opts = $.extend(true, {}, $.fn.fotobox.defaults, params),
				groups = {},
				instance = Lightbox.getInstance();
			
			$.each(opts, function(opt, val) {
				$obj.data(opt, val);
			});
			
			$obj.data({callId:++Lightbox.fnCalled})
				.each(function(n, el) {
						var $el = $(el),
							name = $el.data('lightbox-group'),
							contentType = $el.data('lightbox-type'),
							$group, index;
						
						if (isEmpty(name)) {
							$group = $el;
							index = 0;
							$el.data({autoPlay:false, playButton:false, timer:false, navButtons:false, numberInfo:false, mousewheel:false, keyboard:false, swipe:false});
						}
						else {
							if (typeof groups[name] === 'undefined') {
								$group = $obj.filter('[data-lightbox-group="' + name + '"]');
								groups[name] = $group;
							}
							else {
								$group = groups[name];
							}
							index = $group.index($el);
						}
						
						if (typeof $el.attr('href') === 'undefined') {
							$el.attr('href', '');
						}
			
						if (isEmpty(contentType)) {
							contentType = getContentType($el.attr('href'));
						}
						
						$el.addClass('lb-link').data({index:index, contentType:contentType, group:$group}).unbind('click' + NAMESPACE).bind('click' + NAMESPACE, $.proxy(instance.open, instance));
				});
			
			//init groups	
			$.each(groups, function(name, group) {
				var $group = $(group);
				
				if (1 >= $group.length) {
					$group.data({autoPlay:false, playButton:false, timer:false, navButtons:false, numberInfo:false, mousewheel:false, keyboard:false, swipe:false});
				}
				else if (opts.preload) {
					instance.preloadGroup($group);
				}
			});
		}

		return this; 
	};
	
	$.fn.fotobox.defaults = {
		responsive:true,
		autoPlay:false,
		playButton:true,
		delay:5000,
		speed:600,
		easing:'',
		navButtons:true,
		numberInfo:true,
		timer:true,
		caption:true,
		captionPosition:'outside',
		captionButton:false,
		continuous:true,
		mousewheel:true,
		keyboard:true,
		swipe:true,
		color:'#fff',
		backgroundColor:'#333',
		overlayColor:'#000',
		overlayOpacity:0.7,
		preload:true,
		close:'close',
		previous:'previous',
		next:'next',
		play:'play',
		pause:'pause',
		current:'{current} / {total}',
		openCaption:'open caption',
		closeCaption:'close caption',
		errorMessage:'Error Loading Content',
		initialWidth:INITIAL_SIZE,
		initialHeight:INITIAL_SIZE,
		thumbnails: {
			enable:true,
        	width:50,
        	height:50,
        	position:'bottom',
        	title:false
        }
	};

	$.fn.wtLightBox = $.fn.gsLightBox = $.fn.fotobox;

	$(document).ready(function() {
		var lightbox = new Lightbox();
	});
})(jQuery);