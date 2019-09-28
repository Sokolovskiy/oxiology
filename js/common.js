jQuery(document).ready(function($){
	//variables
	var hijacking= $('body').data('hijacking'),
		animationType = $('body').data('animation'),
		delta = 0,
        scrollThreshold = 1,
        actual = 1,
        animating = false;
    
    //DOM elements
    var sectionsAvailable = $('.cd-section'),
    	verticalNav = $('.cd-vertical-nav'),
    	prevArrow = verticalNav.find('a.cd-prev'),
    	nextArrow = verticalNav.find('a.cd-next');

	
	//check the media query and bind corresponding events
	var MQ = deviceType(),
		bindToggle = false;
	
	bindEvents(MQ, true);
	
	$(window).on('resize', function(){
		MQ = deviceType();
		bindEvents(MQ, bindToggle);
		if( MQ == 'mobile' ) bindToggle = true;
		if( MQ == 'desktop' ) bindToggle = false;
	});

    function bindEvents(MQ, bool) {
    	
    	if( MQ == 'desktop' && bool) {   		
    		//bind the animation to the window scroll event, arrows click and keyboard
			if( hijacking == 'on' ) {
				initHijacking();
				$(window).on('DOMMouseScroll mousewheel', scrollHijacking);
			} else {
				scrollAnimation();
				$(window).on('scroll', scrollAnimation);
			}
			prevArrow.on('click', prevSection);
    		nextArrow.on('click', nextSection);
    		
    		$(document).on('keydown', function(event){
				if( event.which=='40' && !nextArrow.hasClass('inactive') ) {
					event.preventDefault();
					nextSection();
				} else if( event.which=='38' && (!prevArrow.hasClass('inactive') || (prevArrow.hasClass('inactive') && $(window).scrollTop() != sectionsAvailable.eq(0).offset().top) ) ) {
					event.preventDefault();
					prevSection();
				}
			});
			//set navigation arrows visibility
			checkNavigation();
		} else if( MQ == 'mobile' ) {
			//reset and unbind
			resetSectionStyle();
			$(window).off('DOMMouseScroll mousewheel', scrollHijacking);
			$(window).off('scroll', scrollAnimation);
			prevArrow.off('click', prevSection);
    		nextArrow.off('click', nextSection);
    		$(document).off('keydown');
		}
    }

	function scrollAnimation(){
		//normal scroll - use requestAnimationFrame (if defined) to optimize performance
		(!window.requestAnimationFrame) ? animateSection() : window.requestAnimationFrame(animateSection);
	}

	function animateSection() {
		var scrollTop = $(window).scrollTop(),
			windowHeight = $(window).height(),
			windowWidth = $(window).width();
		
		sectionsAvailable.each(function(){
			var actualBlock = $(this),
				offset = scrollTop - actualBlock.offset().top;

			//according to animation type and window scroll, define animation parameters
			var animationValues = setSectionAnimation(offset, windowHeight, animationType);
			
			transformSection(actualBlock.children('div'), animationValues[0], animationValues[1], animationValues[2], animationValues[3], animationValues[4]);
			( offset >= 0 && offset < windowHeight ) ? actualBlock.addClass('visible') : actualBlock.removeClass('visible');		
		});
		
		checkNavigation();
	}

	function transformSection(element, translateY, scaleValue, rotateXValue, opacityValue, boxShadow) {
		//transform sections - normal scroll
		element.velocity({
			translateY: translateY+'vh',
			scale: scaleValue,
			rotateX: rotateXValue,
			opacity: opacityValue,
			boxShadowBlur: boxShadow+'px',
			translateZ: 0,
		}, 0);
	}

	function initHijacking() {
		// initialize section style - scrollhijacking
		var visibleSection = sectionsAvailable.filter('.visible'),
			topSection = visibleSection.prevAll('.cd-section'),
			bottomSection = visibleSection.nextAll('.cd-section'),
			animationParams = selectAnimation(animationType, false),
			animationVisible = animationParams[0],
			animationTop = animationParams[1],
			animationBottom = animationParams[2];

		visibleSection.children('div').velocity(animationVisible, 1, function(){
			visibleSection.css('opacity', 1);
	    	topSection.css('opacity', 1);
	    	bottomSection.css('opacity', 1);
		});
        topSection.children('div').velocity(animationTop, 0);
        bottomSection.children('div').velocity(animationBottom, 0);
	}

	function scrollHijacking (event) {
		// on mouse scroll - check if animate section
        if (event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0) { 
            delta--;
            ( Math.abs(delta) >= scrollThreshold) && prevSection();
			if ($('#header-section').hasClass('visible')) {
				$('#oxiologi-logo').hide('slow');
			}
			else {
				$('#oxiologi-logo').show('slow');
			}
			//Scroll Up Event
			if ( $('#recomendation-section').hasClass('visible') ) {
				
			}
        } else {
            delta++;
            (delta >= scrollThreshold) && nextSection();
			if ($('#header-section').hasClass('visible')) {
				$('#oxiologi-logo').hide('slow');
			}
			else {
				$('#oxiologi-logo').show('slow');
			}
			
			
			if ( $('#recomendation-section').hasClass('visible') ) {
				$('html, body').on('DOMMouseScroll mousewheel MozMousePixelScroll', function(e) {
					var stopScrollDown = $('#recomendation-section').hasClass('visible');
						var scrollTo = 0;
					  if (e.type == 'mousewheel') {
						  
						  scrollTo = (e.originalEvent.wheelDelta * -1);
					  }
					  else if (e.type == 'DOMMouseScroll') {
						  // scrollTo = 20 * e.originalEvent.detail; // turns out, this sometimes works better as expected...
						  scrollTo = e.originalEvent.detail;
					  }

					  if (scrollTo > 0 && stopScrollDown) {
						e.preventDefault();
						return false;
					  }
					});
			}
			else {
				
			}
        }
        return false;
    }

    function prevSection(event) {
    	//go to previous section
    	typeof event !== 'undefined' && event.preventDefault();
    	
    	var visibleSection = sectionsAvailable.filter('.visible'),
    		middleScroll = ( hijacking == 'off' && $(window).scrollTop() != visibleSection.offset().top) ? true : false;
    	visibleSection = middleScroll ? visibleSection.next('.cd-section') : visibleSection;

    	var animationParams = selectAnimation(animationType, middleScroll, 'prev');
    	unbindScroll(visibleSection.prev('.cd-section'), animationParams[3]);

        if( !animating && !visibleSection.is(":first-child") ) {
        	animating = true;
            visibleSection.removeClass('visible').children('div').velocity(animationParams[2], animationParams[3], animationParams[4])
            .end().prev('.cd-section').addClass('visible').children('div').velocity(animationParams[0] , animationParams[3], animationParams[4], function(){
            	animating = false;
            	if( hijacking == 'off') $(window).on('scroll', scrollAnimation);
            });
            
            actual = actual - 1;
        }

        resetScroll();
    }

    function nextSection(event) {
    	//go to next section
    	typeof event !== 'undefined' && event.preventDefault();

        var visibleSection = sectionsAvailable.filter('.visible'),
    		middleScroll = ( hijacking == 'off' && $(window).scrollTop() != visibleSection.offset().top) ? true : false;

    	var animationParams = selectAnimation(animationType, middleScroll, 'next');
    	unbindScroll(visibleSection.next('.cd-section'), animationParams[3]);

        if(!animating && !visibleSection.is(":last-of-type") ) {
            animating = true;
            visibleSection.removeClass('visible').children('div').velocity(animationParams[1], animationParams[3], animationParams[4] )
            .end().next('.cd-section').addClass('visible').children('div').velocity(animationParams[0], animationParams[3], animationParams[4], function(){
            	animating = false;
            	if( hijacking == 'off') $(window).on('scroll', scrollAnimation);
            });

            actual = actual +1;
        }
        resetScroll();
    }

    function unbindScroll(section, time) {
    	//if clicking on navigation - unbind scroll and animate using custom velocity animation
    	if( hijacking == 'off') {
    		$(window).off('scroll', scrollAnimation);
    		( animationType == 'catch') ? $('body, html').scrollTop(section.offset().top) : section.velocity("scroll", { duration: time });
    	}
    }

    function resetScroll() {
        delta = 0;
        checkNavigation();
    }

    function checkNavigation() {
    	//update navigation arrows visibility
		( sectionsAvailable.filter('.visible').is(':first-of-type') ) ? prevArrow.addClass('inactive') : prevArrow.removeClass('inactive');
		( sectionsAvailable.filter('.visible').is(':last-of-type')  ) ? nextArrow.addClass('inactive') : nextArrow.removeClass('inactive');
	}

	function resetSectionStyle() {
		//on mobile - remove style applied with jQuery
		sectionsAvailable.children('div').each(function(){
			$(this).attr('style', '');
		});
	}

	function deviceType() {
		//detect if desktop/mobile
		return window.getComputedStyle(document.querySelector('body'), '::before').getPropertyValue('content').replace(/"/g, "").replace(/'/g, "");
	}

	function selectAnimation(animationName, middleScroll, direction) {
		// select section animation - scrollhijacking
		var animationVisible = 'translateNone',
			animationTop = 'translateUp',
			animationBottom = 'translateDown',
			easing = 'ease',
			animDuration = 800;

		switch(animationName) {
		    case 'scaleDown':
		    	animationTop = 'scaleDown';
		    	easing = 'easeInCubic';
		        break;
		    case 'rotate':
		    	if( hijacking == 'off') {
		    		animationTop = 'rotation.scroll';
		    		animationBottom = 'translateNone';
		    	} else {
		    		animationTop = 'rotation';
		    		easing = 'easeInCubic';
		    	}
		        break;
		    case 'gallery':
		    	animDuration = 1500;
		    	if( middleScroll ) {
		    		animationTop = 'scaleDown.moveUp.scroll';
		    		animationVisible = 'scaleUp.moveUp.scroll';
		    		animationBottom = 'scaleDown.moveDown.scroll';
		    	} else {
		    		animationVisible = (direction == 'next') ? 'scaleUp.moveUp' : 'scaleUp.moveDown';
					animationTop = 'scaleDown.moveUp';
					animationBottom = 'scaleDown.moveDown';
		    	}
		        break;
		    case 'catch':
		    	animationVisible = 'translateUp.delay';
		        break;
		    case 'opacity':
		    	animDuration = 700;
				animationTop = 'hide.scaleUp';
				animationBottom = 'hide.scaleDown';
		        break;
		    case 'fixed':
		    	animationTop = 'translateNone';
		    	easing = 'easeInCubic';
		        break;
		    case 'parallax':
		    	animationTop = 'translateUp.half';
		    	easing = 'easeInCubic';
		        break;
		}

		return [animationVisible, animationTop, animationBottom, animDuration, easing];
	}

	function setSectionAnimation(sectionOffset, windowHeight, animationName ) {
		// select section animation - normal scroll
		var scale = 1,
			translateY = 100,
			rotateX = '0deg',
			opacity = 1,
			boxShadowBlur = 0;
		
		if( sectionOffset >= -windowHeight && sectionOffset <= 0 ) {
			// section entering the viewport
			translateY = (-sectionOffset)*100/windowHeight;
			
			switch(animationName) {
			    case 'scaleDown':
			        scale = 1;
					opacity = 1;
					break;
				case 'rotate':
					translateY = 0;
					break;
				case 'gallery':
			        if( sectionOffset>= -windowHeight &&  sectionOffset< -0.9*windowHeight ) {
			        	scale = -sectionOffset/windowHeight;
			        	translateY = (-sectionOffset)*100/windowHeight;
			        	boxShadowBlur = 400*(1+sectionOffset/windowHeight);
			        } else if( sectionOffset>= -0.9*windowHeight &&  sectionOffset< -0.1*windowHeight) {
			        	scale = 0.9;
			        	translateY = -(9/8)*(sectionOffset+0.1*windowHeight)*100/windowHeight;
			        	boxShadowBlur = 40;
			        } else {
			        	scale = 1 + sectionOffset/windowHeight;
			        	translateY = 0;
			        	boxShadowBlur = -400*sectionOffset/windowHeight;
			        }
					break;
				case 'catch':
			        if( sectionOffset>= -windowHeight &&  sectionOffset< -0.75*windowHeight ) {
			        	translateY = 100;
			        	boxShadowBlur = (1 + sectionOffset/windowHeight)*160;
			        } else {
			        	translateY = -(10/7.5)*sectionOffset*100/windowHeight;
			        	boxShadowBlur = -160*sectionOffset/(3*windowHeight);
			        }
					break;
				case 'opacity':
					translateY = 0;
			        scale = (sectionOffset + 5*windowHeight)*0.2/windowHeight;
			        opacity = (sectionOffset + windowHeight)/windowHeight;
					break;
			}

		} else if( sectionOffset > 0 && sectionOffset <= windowHeight ) {
			//section leaving the viewport - still has the '.visible' class
			translateY = (-sectionOffset)*100/windowHeight;
			
			switch(animationName) {
			    case 'scaleDown':
			        scale = (1 - ( sectionOffset * 0.3/windowHeight)).toFixed(5);
					opacity = ( 1 - ( sectionOffset/windowHeight) ).toFixed(5);
					translateY = 0;
					boxShadowBlur = 40*(sectionOffset/windowHeight);

					break;
				case 'rotate':
					opacity = ( 1 - ( sectionOffset/windowHeight) ).toFixed(5);
					rotateX = sectionOffset*90/windowHeight + 'deg';
					translateY = 0;
					break;
				case 'gallery':
			        if( sectionOffset >= 0 && sectionOffset < 0.1*windowHeight ) {
			        	scale = (windowHeight - sectionOffset)/windowHeight;
			        	translateY = - (sectionOffset/windowHeight)*100;
			        	boxShadowBlur = 400*sectionOffset/windowHeight;
			        } else if( sectionOffset >= 0.1*windowHeight && sectionOffset < 0.9*windowHeight ) {
			        	scale = 0.9;
			        	translateY = -(9/8)*(sectionOffset - 0.1*windowHeight/9)*100/windowHeight;
			        	boxShadowBlur = 40;
			        } else {
			        	scale = sectionOffset/windowHeight;
			        	translateY = -100;
			        	boxShadowBlur = 400*(1-sectionOffset/windowHeight);
			        }
					break;
				case 'catch':
					if(sectionOffset>= 0 &&  sectionOffset< windowHeight/2) {
						boxShadowBlur = sectionOffset*80/windowHeight;
					} else {
						boxShadowBlur = 80*(1 - sectionOffset/windowHeight);
					} 
					break;
				case 'opacity':
					translateY = 0;
			        scale = (sectionOffset + 5*windowHeight)*0.2/windowHeight;
			        opacity = ( windowHeight - sectionOffset )/windowHeight;
					break;
				case 'fixed':
					translateY = 0;
					break;
				case 'parallax':
					translateY = (-sectionOffset)*50/windowHeight;
					break;

			}

		} else if( sectionOffset < -windowHeight ) {
			//section not yet visible
			translateY = 100;

			switch(animationName) {
			    case 'scaleDown':
			        scale = 1;
					opacity = 1;
					break;
				case 'gallery':
			        scale = 1;
					break;
				case 'opacity':
					translateY = 0;
			        scale = 0.8;
			        opacity = 0;
					break;
			}

		} else {
			//section not visible anymore
			translateY = -100;

			switch(animationName) {
			    case 'scaleDown':
			        scale = 0;
					opacity = 0.7;
					translateY = 0;
					break;
				case 'rotate':
					translateY = 0;
			        rotateX = '90deg';
			        break;
			    case 'gallery':
			        scale = 1;
					break;
				case 'opacity':
					translateY = 0;
			        scale = 1.2;
			        opacity = 0;
					break;
				case 'fixed':
					translateY = 0;
					break;
				case 'parallax':
					translateY = -50;
					break;
			}
		}

		return [translateY, scale, rotateX, opacity, boxShadowBlur]; 
	}
	
	//Tabs
	$('ul.tabs li').click(function(){
		var tab_id = $(this).attr('data-tab');

		$('ul.tabs li').removeClass('current');
		$('.tab-content').removeClass('current');
		$('.slider-container').removeClass('current');
		$('.slider-container .slick-arrow').removeClass('current');
		$(this).addClass('current');
		$("."+tab_id).addClass('current');
		$('.slick-arrow').show();
		$('.slick-arrow').addClass('current');
		$('.slick-arrow').hide();
		$('.current .slick-arrow').show();
	});
	//Molecula Tabs
	$('.molecula-tab-button').click(function(){
		var tab_id = $(this).attr('data-tab');
		$('.molecula-tab-button').removeClass('active');
		$('.technology-tab-item').removeClass('active');
		$(this).addClass('active');
		$("#"+tab_id).addClass('active');
		$('.'+tab_id).addClass('active');
	});
	//Slick Slider
	$('.tab-1-slide').slick({
		arrows: true,
		slidesToShow: 1,
		prevArrow: $('.prev'),
      	nextArrow: $('.next')
	});
	$('.tab-2-slide').slick({
		arrows: true,
		slidesToShow: 1,
		prevArrow: $('.prev-tab-2'),
      	nextArrow: $('.next-tab-2')

	});
	$('.tab-3-slide').slick({
		arrows: true,
		slidesToShow: 1,
		prevArrow: $('.prev-tab-3'),
      	nextArrow: $('.next-tab-3')
	});
	$('.tab-4-slide').slick({
		arrows: true,
		slidesToShow: 1,
		prevArrow: $('.prev-tab-4'),
      	nextArrow: $('.next-tab-4')

	});
	$('.tab-5-slide').slick({
		arrows: true,
		slidesToShow: 1,
		prevArrow: $('.prev-tab-5'),
      	nextArrow: $('.next-tab-5')
	});
	$('.slick-arrow').hide();
    $('.current .slick-arrow').show(); 

	//Program Slider
	$('.program-slider').slick({
		arrows: true,
		centerMode: true,
		centerPadding: '0',
		slidesToShow: 3,
		slidesToScroll: 1,
		autoplay: false,
		autoplaySpeed: 4000,
		cssEase: 'ease-in-out',
		prevArrow: $('.program-slider-left-arrow'),
      	nextArrow: $('.program-slider-right-arrow'),
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 1
				}
			},
			{
				breakpoint: 480,
				settings: {
					slidesToShow: 1
				}
			}
		]
	});

	
	//Animated Molecula
	$('.content-wrapper').each(function(){
		$(this).append('<div class="molecula-icon"></div>');
		$(this).append('<div class="molecula-icon-2"></div>');
		$(this).append('<div class="molecula-icon-3"></div>');
	});
	$('#header-section .molecula-icon').hide();
	$('#header-section .molecula-icon-2').hide();
	$('#header-section .molecula-icon-3').hide();

	

if($(window).innerWidth() <= 1024) {
	
	$('#test-section, #program-section').insertAfter($('#choose-program-section'));
	
  	$("a.cd-link").click(function() {
    var targetDiv = $(this).attr('href');
    $('html, body').animate({
        scrollTop: $(targetDiv).offset().top
    }, 1000);
	if ( $('.mobile-navigation').hasClass('active') ) {
		$('.header .navigation').slideToggle();
	 	$('.mobile-navigation').removeClass('active');
	}
});
	$(document).mouseup(function (e) {
    var container = $(".navigation");
	var containerPlus = $('.mobile-navigation');
    if (container.has(e.target).length === 0 && containerPlus.has(e.target).length === 0 && $('.mobile-navigation').hasClass('active') ){
        container.slideToggle();
		$('.mobile-navigation').removeClass('active');
    };
	});
	$('#test-section, #program-section').slideToggle();
	$('.pass-test-button, .footer-test-again').click(function(e) {
		$('#test-section, #program-section').slideToggle();
		e.preventDefault();
		setTimeout(function(){

		$(this).parent().addClass('active');
	   	var slideno = $(this).data('slide');
   		$('.program-slider').slick('slickGoTo', slideno - 1);
		$(".program-slider .slick-slide").each(function(){
			if ($(this).hasClass('slick-active')) {
				$(this).fadeTo( "fast", 1 );
			}
			else {
				$(this).fadeTo( "fast", 1 );
			}
		});	
		},100);
		 $('html, body').animate({
        scrollTop: $('#test-section').offset().top
    }, 1000);
	});
	$(window).bind('mousewheel DOMMouseScroll', function(event){
		
		var sectHeight = $('#daily-care-section').position().top;
		console.log(sectHeight);
	});
	$(".popup-link").on("click", function (event) {
	event.preventDefault();
		$('#youtube-popup').fadeIn();

		if ( $('.mobile-navigation').hasClass('active') ) {
		$('.navigation').slideToggle();
	 	$('.mobile-navigation').removeClass('active');
	}
});
	
		$('.program-slider-left-arrow, .program-slider-right-arrow').click(function(e) {
		$(".slider-menu-list li").each(function(){
			$(this).removeClass('active');
		});
		var itemIndex = $('.program-slider .slick-current').data('slide-index');
		//$('.slide-link[data-slide ='" + itemIndex +"']').addClass('active');
		$(".slide-link[data-slide='" + itemIndex +"']").parent().addClass('active');
		console.log(itemIndex);
		$(".program-slider .slick-slide").each(function(){
			if ($(this).hasClass('slick-active')) {
				$(this).fadeTo( "fast", 1 );
			}
			else {
				$(this).fadeTo( "fast", 1 );
			}
		});
	});
	
		$('.slide-link').click(function(e) {
	   e.preventDefault();
		$(".slider-menu-list li").each(function(){
			$(this).removeClass('active');
		});
		$(this).parent().addClass('active');
	   var slideno = $(this).data('slide');
   		$('.program-slider').slick('slickGoTo', slideno - 1);
		$(".program-slider .slick-slide").each(function(){
			if ($(this).hasClass('slick-active')) {
				$(this).fadeTo( "fast", 1 );
			}
			else {
				$(this).fadeTo( "fast", 1 );
			}
		});
	 });
	
	$('.program-slider').on('swipe', function(event, slick, direction) {
		
		$(".slider-menu-list li").each(function(){
			$(this).removeClass('active');
		});
		var itemIndex = $('.program-slider .slick-current').data('slide-index');
		//$('.slide-link[data-slide ='" + itemIndex +"']').addClass('active');
		$(".slide-link[data-slide='" + itemIndex +"']").parent().addClass('active');
		console.log(itemIndex);
		$(".program-slider .slick-slide").each(function(){
			if ($(this).hasClass('slick-active')) {
				$(this).fadeTo( "fast", 1 );
			}
			else {
				$(this).fadeTo( "fast", 0.1 );
			}
		});
	
	});
	
} else {
	

   	var cdLinks = $("a.cd-link");

	cdLinks.click(function(e) {
	e.preventDefault();
	goToSection($(this).attr("href"));
		setTimeout(function(){
		
			var recomendationSectionVisible = $('#recomendation-section').hasClass('visible');
			var testSectionVisible = $('#test-section').hasClass('visible');
			var programSectionVisible = $('#program-section').hasClass('visible');
			var chooseProgramSectionVisible = $('#choose-program-section').hasClass('visible');
			var careSectionVisible = $('#daily-care-section').hasClass('visible');
			var technologySectionVisible = $('#new-technology-section').hasClass('visible');

		if ( recomendationSectionVisible || testSectionVisible || programSectionVisible || chooseProgramSectionVisible) {
			$('a.cd-link[href="#choose-program-section"]').addClass('active');

	}	
		else {
			$('a.cd-link[href="#choose-program-section"]').removeClass('active');
		}
		
		if (careSectionVisible) {
			$('a.cd-link[href="#daily-care-section"]').addClass('active');
		}
		else {
			$('a.cd-link[href="#daily-care-section"]').removeClass('active');
		}
		if (technologySectionVisible) {
			$('a.cd-link[href="#new-technology-section"]').addClass('active');
		}
		else {
			$('a.cd-link[href="#new-technology-section"]').removeClass('active');
		}
	},100);
		
		$(".popup-link").on("click", function (event) {
	event.preventDefault();
		$('#youtube-popup').fadeIn();
});
var animatePageItems =	setTimeout(function(){
		//Header Section Animations
		if ($('#header-section').hasClass('visible')) {
			$('.quadcopter-img').addClass('animated bounceInRight');
			$('.oxiologi-img').addClass('animated fadeIn');
		}
		else {
			$('.quadcopter-img').removeClass('animated bounceInRight');
			$('.oxiologi-img').removeClass('animated fadeIn');
		}
		//Daily Care Section Animations
		if ($('#daily-care-section').hasClass('visible')) {
		$('.tabs-wrapper').addClass('animated bounceInLeft');
		$('.round-arrow').addClass('safari-round-arrow');
		$('.tabs-container h3').addClass('animated fadeIn');	
		$('.tab-inner-wrapper').addClass('animated bounceInLeft');
		$('.daily-care-slider').each(function(){
			$(this).addClass('animated bounceIn');	
		});
		}
		else {
			$('.tabs-wrapper').removeClass('animated bounceInLeft');
			//$('.molecula-wrapper .round-arrow').removeClass('animated rotateIn');
			$('.tabs-container h3').removeClass('animated fadeIn');
			$('.tab-inner-wrapper').removeClass('animated bounceInLeft');
			$('.daily-care-slider').each(function(){
			$(this).removeClass('animated bounceIn');	
		});
		}
		//New Technology Section Animations
		if ($('#new-technology-section').hasClass('visible')) {
			$('.round-arrow').addClass('safari-round-arrow');
			$('.technology-logo').addClass('animated pulse');
			$('.target-technology').addClass('animated bounceInUp');
			$('.technology-wrapper h3').addClass('animated flipInX');
		}
		else {
			//$('.round-arrow').removeClass('animated rotateIn');
			$('.technology-logo').removeClass('animated pulse');
			$('.target-technology').removeClass('animated bounceInUp');
			$('.technology-wrapper h3').removeClass('animated flipInX');
		}
		//New Technology Section Animations
		if ($('#choose-program-section').hasClass('visible')) {
			$('.pop-up-inner-wrapper').addClass('animated bounceInDown');
			$('.pop-up-inner-wrapper .pass-test-button').addClass('animated fadeIn');
		}
		else {
			$('.pop-up-inner-wrapper').removeClass('animated bounceInDown');
			$('.pop-up-inner-wrapper .pass-test-button').removeClass('animated fadeIn');
		}
		//Test Section Animations
		if ($('#test-section').hasClass('visible')) {
			$('.camera-inner-wrapper').addClass('animated slideInUp');
			$('.question-inner-wrapper').addClass('animated slideInDown');
			
		}
		else {
			$('.camera-inner-wrapper').removeClass('animated slideInUp');
			$('.question-inner-wrapper').removeClass('animated slideInDown');
		}
		//Program Section Animations
		if ($('#program-section').hasClass('visible')) {
			$('#program h3').addClass('animated pulse');
			$('.description-block').addClass('animated bounceIn');
			$('.program-slider').addClass('animated pulse');
			
		}
		else {
			$('#program h3').removeClass('animated pulse');
			$('.description-block').removeClass('animated bounceIn');
			$('.program-slider').removeClass('animated pulse');
		}
		//Recomendation Section Animations
		if ($('#recomendation-section').hasClass('visible')) {
			$('.recomendation-item').addClass('animated fadeInLeft');
			$('#recomendation h3').addClass('animated zoomInDown');
			
		}
		else {
			$('.recomendation-item').removeClass('animated fadeInLeft');
			$('#recomendation h3').removeClass('animated zoomInDown');
		}
		
	}, 100);
	});

	function goToSection(targetId) {
	var targetIndex = sectionsAvailable.index( $(targetId) );
	if ((targetIndex + 1) == actual) { return; }
	var animIndexForCurrent = (actual > (targetIndex + 1))? 2 : 1;

	var visibleSection = sectionsAvailable.filter('.visible');
	var middleScroll = false;
	var animationParams = selectAnimation(animationType, middleScroll, 'prev');
	
	$('.section-wrapper').css('transform', 'translateY(100%)');
		
		
	visibleSection.removeClass('visible').children('div').velocity(animationParams[animIndexForCurrent], animationParams[3], animationParams[4]);
	sectionsAvailable.eq(targetIndex).addClass('visible').children('div').velocity(animationParams[0] , animationParams[3], animationParams[4], function(){
	animating = false;
	});

	actual = targetIndex + 1;
		if ($('#header-section').hasClass('visible')) {
				$('#oxiologi-logo').hide('slow');
			}
			else {
				$('#oxiologi-logo').show('slow');
			}
	};
	$('.pass-test-button').click(function(e) {
	   e.preventDefault(); 
	$('#recomendation-section').insertAfter($('#program-section'));
	setTimeout(function(){
		if ($('#test-section').hasClass('visible')) {
			$('.camera-inner-wrapper').addClass('animated slideInUp');
			$('.question-inner-wrapper').addClass('animated slideInDown');
			
		}
		else {
			$('.camera-inner-wrapper').removeClass('animated slideInUp');
			$('.question-inner-wrapper').removeClass('animated slideInDown');
		}
	},100)
});
	
	$('.test-again').click(function(e) {
	   e.preventDefault(); 
	$('#recomendation-section').insertAfter($('#program-section'));
	$('#recomendation-section').find('.section-wrapper').css('opacity','0');
});
	
		$('.program-slider-left-arrow, .program-slider-right-arrow').click(function(e) {
		$(".slider-menu-list li").each(function(){
			$(this).removeClass('active');
		});
		var itemIndex = $('.program-slider .slick-current').data('slide-index');
		//$('.slide-link[data-slide ='" + itemIndex +"']').addClass('active');
		$(".slide-link[data-slide='" + itemIndex +"']").parent().addClass('active');
		console.log(itemIndex);
		$(".program-slider .slick-slide").each(function(){
			if ($(this).hasClass('slick-active')) {
				$(this).fadeTo( "fast", 1 );
			}
			else {
				$(this).fadeTo( "fast", 0.1 );
			}
		});
	});
	
		$('.slide-link').click(function(e) {
	   e.preventDefault();
		$(".slider-menu-list li").each(function(){
			$(this).removeClass('active');
		});
		$(this).parent().addClass('active');
	   var slideno = $(this).data('slide');
   		$('.program-slider').slick('slickGoTo', slideno - 1);
		$(".program-slider .slick-slide").each(function(){
			if ($(this).hasClass('slick-active')) {
				$(this).fadeTo( "fast", 1 );
			}
			else {
				$(this).fadeTo( "fast", 0.1 );
			}
		});
	 });

	
}

});

/* Custom effects registration - feature available in the Velocity UI pack */
//none
$.Velocity
    .RegisterEffect("translateUp", {
    	defaultDuration: 1,
        calls: [ 
            [ { translateY: '-100%'}, 1]
        ]
    });
$.Velocity
    .RegisterEffect("translateDown", {
    	defaultDuration: 1,
        calls: [ 
            [ { translateY: '100%'}, 1]
        ]
    });
$.Velocity
    .RegisterEffect("translateNone", {
    	defaultDuration: 1,
        calls: [ 
            [ { translateY: '0', opacity: '1', scale: '1', rotateX: '0', boxShadowBlur: '0'}, 1]
        ]
    });

//scale down
$.Velocity
    .RegisterEffect("scaleDown", {
    	defaultDuration: 1,
        calls: [ 
            [ { opacity: '0', scale: '0.7', boxShadowBlur: '40px' }, 1]
        ]
    });
//rotation
$.Velocity
    .RegisterEffect("rotation", {
    	defaultDuration: 1,
        calls: [ 
            [ { opacity: '0', rotateX: '90', translateY: '-100%'}, 1]
        ]
    });
$.Velocity
    .RegisterEffect("rotation.scroll", {
    	defaultDuration: 1,
        calls: [ 
            [ { opacity: '0', rotateX: '90', translateY: '0'}, 1]
        ]
    });
//gallery
$.Velocity
    .RegisterEffect("scaleDown.moveUp", {
    	defaultDuration: 1,
        calls: [ 
        	[ { translateY: '-10%', scale: '0.9', boxShadowBlur: '40px'}, 0.20 ],
        	[ { translateY: '-100%' }, 0.60 ],
        	[ { translateY: '-100%', scale: '1', boxShadowBlur: '0' }, 0.20 ]
        ]
    });
$.Velocity
    .RegisterEffect("scaleDown.moveUp.scroll", {
    	defaultDuration: 1,
        calls: [ 
        	[ { translateY: '-100%', scale: '0.9', boxShadowBlur: '40px' }, 0.60 ],
        	[ { translateY: '-100%', scale: '1', boxShadowBlur: '0' }, 0.40 ]
        ]
    });
$.Velocity
    .RegisterEffect("scaleUp.moveUp", {
    	defaultDuration: 1,
        calls: [ 
        	[ { translateY: '90%', scale: '0.9', boxShadowBlur: '40px' }, 0.20 ],
        	[ { translateY: '0%' }, 0.60 ],
        	[ { translateY: '0%', scale: '1', boxShadowBlur: '0'}, 0.20 ]
        ]
    });
$.Velocity
    .RegisterEffect("scaleUp.moveUp.scroll", {
    	defaultDuration: 1,
        calls: [ 
        	[ { translateY: '0%', scale: '0.9' , boxShadowBlur: '40px' }, 0.60 ],
        	[ { translateY: '0%', scale: '1', boxShadowBlur: '0'}, 0.40 ]
        ]
    });
$.Velocity
    .RegisterEffect("scaleDown.moveDown", {
    	defaultDuration: 1,
        calls: [ 
        	[ { translateY: '10%', scale: '0.9', boxShadowBlur: '40px'}, 0.20 ],
        	[ { translateY: '100%' }, 0.60 ],
        	[ { translateY: '100%', scale: '1', boxShadowBlur: '0'}, 0.20 ]
        ]
    });
$.Velocity
    .RegisterEffect("scaleDown.moveDown.scroll", {
    	defaultDuration: 1,
        calls: [ 
        	[ { translateY: '100%', scale: '0.9', boxShadowBlur: '40px' }, 0.60 ],
        	[ { translateY: '100%', scale: '1', boxShadowBlur: '0' }, 0.40 ]
        ]
    });
$.Velocity
    .RegisterEffect("scaleUp.moveDown", {
    	defaultDuration: 1,
        calls: [ 
        	[ { translateY: '-90%', scale: '0.9', boxShadowBlur: '40px' }, 0.20 ],
        	[ { translateY: '0%' }, 0.60 ],
        	[ { translateY: '0%', scale: '1', boxShadowBlur: '0'}, 0.20 ]
        ]
    });
//catch up
$.Velocity
    .RegisterEffect("translateUp.delay", {
    	defaultDuration: 1,
        calls: [ 
            [ { translateY: '0%'}, 0.8, { delay: 100 }],
        ]
    });
//opacity
$.Velocity
    .RegisterEffect("hide.scaleUp", {
    	defaultDuration: 1,
        calls: [ 
            [ { opacity: '0', scale: '1.2'}, 1 ]
        ]
    });
$.Velocity
    .RegisterEffect("hide.scaleDown", {
    	defaultDuration: 1,
        calls: [ 
            [ { opacity: '0', scale: '0.8'}, 1 ]
        ]
    });
//parallax
$.Velocity
    .RegisterEffect("translateUp.half", {
    	defaultDuration: 1,
        calls: [ 
            [ { translateY: '-50%'}, 1]
        ]
    });


//Youtube Pop Up
$(document).mouseup(function (e) {
    var container = $(".youtube-video");
    if (container.has(e.target).length === 0){
        $('#youtube-popup').fadeOut();
    }
});
$('.close-button').click(function() {
	$('#youtube-popup').fadeOut();
});


$('#oxiologi-logo').click(function(e) {
	var hideSections = $('#test-section, #program-section').detach();
});


//
//Animations
$(window).bind('mousewheel DOMMouseScroll', function(event){
	
var animatePageItems =	setTimeout(function(){
		//Header Section Animations
		if ($('#header-section').hasClass('visible')) {
			$('.quadcopter-img').addClass('animated bounceInRight');
			$('.oxiologi-img').addClass('animated fadeIn');
		}
		else {
			$('.quadcopter-img').removeClass('animated bounceInRight');
			$('.oxiologi-img').removeClass('animated fadeIn');
		}
		//Daily Care Section Animations
		if ($('#daily-care-section').hasClass('visible')) {
		$('.tabs-wrapper').addClass('animated bounceInLeft');
		$('.tabs-container h3').addClass('animated fadeIn');	
		$('.tab-inner-wrapper').addClass('animated bounceInLeft');
		$('.daily-care-slider').each(function(){
			$(this).addClass('animated bounceIn');	
		});
		}
		else {
			$('.tabs-wrapper').removeClass('animated bounceInLeft');
			$('.tabs-container h3').removeClass('animated fadeIn');
			$('.tab-inner-wrapper').removeClass('animated bounceInLeft');
			$('.daily-care-slider').each(function(){
			$(this).removeClass('animated bounceIn');	
		});
		}
		//New Tachnology Section Animations
		if ($('#new-technology-section').hasClass('visible')) {
			$('.round-arrow').addClass('safari-round-arrow');
			$('.technology-logo').addClass('animated pulse');
			$('.target-technology').addClass('animated bounceInUp');
			$('.technology-wrapper h3').addClass('animated flipInX');
		}
		else {
			//$('.round-arrow').removeClass('animated rotateIn');
			$('.technology-logo').removeClass('animated pulse');
			$('.target-technology').removeClass('animated bounceInUp');
			$('.technology-wrapper h3').removeClass('animated flipInX');
		}
		//New Tachnology Section Animations
		if ($('#choose-program-section').hasClass('visible')) {
			$('.pop-up-inner-wrapper').addClass('animated bounceInDown');
			$('.pop-up-inner-wrapper .pass-test-button').addClass('animated fadeIn');
		}
		else {
			$('.pop-up-inner-wrapper').removeClass('animated bounceInDown');
			$('.pop-up-inner-wrapper .pass-test-button').removeClass('animated fadeIn');
		}
		//Test Section Animations
		if ($('#test-section').hasClass('visible')) {
			$('.camera-inner-wrapper').addClass('animated slideInUp');
			$('.question-inner-wrapper').addClass('animated slideInDown');
			
		}
		else {
			$('.camera-inner-wrapper').removeClass('animated slideInUp');
			$('.question-inner-wrapper').removeClass('animated slideInDown');
		}
		//Program Section Animations
		if ($('#program-section').hasClass('visible')) {
			$('#program h3').addClass('animated pulse');
			$('.description-block').addClass('animated bounceIn');
			$('.program-slider').addClass('animated pulse');
			
		}
		else {
			$('#program h3').removeClass('animated pulse');
			$('.description-block').removeClass('animated bounceIn');
			$('.program-slider').removeClass('animated pulse');
		}
		//Recomendation Section Animations
		if ($('#recomendation-section').hasClass('visible')) {
			$('.recomendation-item').addClass('animated fadeInLeft');
			$('#recomendation h3').addClass('animated zoomInDown');
			
		}
		else {
			$('.recomendation-item').removeClass('animated fadeInLeft');
			$('#recomendation h3').removeClass('animated zoomInDown');
		}
		
	}, 100);

});

//Mobile Navigation
	$('.mobile-navigation').click(function(){
		$(this).toggleClass('active');
		$('.navigation').slideToggle();
		
	});
$('html, body').on('DOMMouseScroll mousewheel MozMousePixelScroll', function(e) {
	

	setTimeout(function(){
		
			var recomendationSectionVisible = $('#recomendation-section').hasClass('visible');
			var testSectionVisible = $('#test-section').hasClass('visible');
			var programSectionVisible = $('#program-section').hasClass('visible');
			var chooseProgramSectionVisible = $('#choose-program-section').hasClass('visible');
			var careSectionVisible = $('#daily-care-section').hasClass('visible');
			var technologySectionVisible = $('#new-technology-section').hasClass('visible');

		if ( recomendationSectionVisible || testSectionVisible || programSectionVisible || chooseProgramSectionVisible) {
			$('a.cd-link[href="#choose-program-section"]').addClass('active');

	}	
		else {
			$('a.cd-link[href="#choose-program-section"]').removeClass('active');
		}
		
		if (careSectionVisible) {
			$('a.cd-link[href="#daily-care-section"]').addClass('active');
		}
		else {
			$('a.cd-link[href="#daily-care-section"]').removeClass('active');
		}
		if (technologySectionVisible) {
			$('a.cd-link[href="#new-technology-section"]').addClass('active');
		}
		else {
			$('a.cd-link[href="#new-technology-section"]').removeClass('active');
		}
	},100);


	});




	//Switch
	$('.switch').on('change', function(e) {
  		if($(this).children().prop("checked")) {
			$(this).addClass('active');
		$('#camera_click2').css('display', 'block');
		$('#camera_click2').fadeIn();
		$('.switch').addClass('active');
		//$('.switch').attr('id', 'camera_click2');
        $('.mirror').css('display', 'none');
        $('#virt').remove();
//        $(this).css('display', 'none');
       // $('<img id ="camera_click2" class="center-block" src="img/k.png">').insertAfter(this);

        $('#videoElement').fadeIn();
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        var video = document.getElementById('videoElement');
        var localstream;
        var mediaConfig = {video: true};
        var errBack = function (e) {
            console.log('An error has occurred!', e)
        };
        if (navigator.mediaDevices && mediaConfig) {
            navigator.mediaDevices.getUserMedia(mediaConfig).then(function (stream) {
                video.src = window.URL.createObjectURL(stream);
                localstream = stream;
                video.play();
            });
        }


        /* Legacy code below! */
        else if (navigator.getUserMedia) { // Standard
            navigator.getUserMedia(mediaConfig, function (stream) {
                video.src = stream;
                video.play();
            }, errBack);
        } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
            navigator.webkitGetUserMedia(mediaConfig, function (stream) {
                video.src = window.webkitURL.createObjectURL(stream);
                video.play();
            }, errBack);
        } else if (navigator.mozGetUserMedia) { // Mozilla-prefixed
            navigator.mozGetUserMedia(mediaConfig, function (stream) {
                video.src = window.URL.createObjectURL(stream);
                video.play();
            }, errBack);
        }
        function vidOff() {
            video.pause();
            video.src = "";
            localstream.getTracks()[0].stop();
            console.log("Vid off");
        }

        $('<img src="img/face.png" id="frame" class="center-block">').insertAfter('#videoElement');

        document.getElementById("camera_click2").addEventListener("click", function () {
            $('#frame').css('display', 'none');
            $('.mirror').css('display', 'none');
            $('canvas').css('display', 'block').addClass('mirror');
            context.canvas.height = video.videoHeight;
            context.canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            $('#videoElement').css('display', 'none');
            video.pause();
				 $('#camera_click').css('display', 'block');
				$('#camera_click').fadeIn();
				
			$('#mirror').css('display', 'none');
				
        });

		}
		else {
			
			$(this).removeClass('active');
			 $('#videoElement').css('display', 'none');
			$('#canvas').css('display', 'none');
			$('#frame').css('display', 'none');
			$('.mirror').css('display', 'none');
            $('.mirror').css('display', 'block');
            $('canvas').css('display', 'none').addClass('mirror');
            //context.canvas.height = video.videoHeight;
            //context.canvas.width = video.videoWidth;
            //context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            $('#videoElement').css('display', 'none');
           // vidOff();
			$('#mirror').css('display', 'block');
            $('#camera_click').css('display', 'block');
			$('#camera_click').fadeIn();
			
			$('#camera_click2').fadeOut();
		}
	});

    var camera = $('#camera_click'),
            tab_next = $('.tab-button-next, .pagination-right-arrow'),
			tab_prev = $('.pagination-left-arrow');

    camera.click(function (e) {
		$('.switch').addClass('active');
		//$('.switch').attr('id', 'camera_click2');
        $('.mirror').css('display', 'none');
        $('#virt').remove();
        $(this).css('display', 'none');

        $('#videoElement').fadeIn();
		$( ".switch").children().prop('checked', true);
		
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        var video = document.getElementById('videoElement');
        var localstream;
        var mediaConfig = {video: true};
        var errBack = function (e) {
            console.log('An error has occurred!', e)
        };
        if (navigator.mediaDevices && mediaConfig) {
            navigator.mediaDevices.getUserMedia(mediaConfig).then(function (stream) {
                video.src = window.URL.createObjectURL(stream);
                localstream = stream;
                video.play();


            });
        }


        /* Legacy code below! */
        else if (navigator.getUserMedia) { // Standard
            navigator.getUserMedia(mediaConfig, function (stream) {
                video.src = stream;
                video.play();
            }, errBack);
        } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
            navigator.webkitGetUserMedia(mediaConfig, function (stream) {
                video.src = window.webkitURL.createObjectURL(stream);
                video.play();
            }, errBack);
        } else if (navigator.mozGetUserMedia) { // Mozilla-prefixed
            navigator.mozGetUserMedia(mediaConfig, function (stream) {
                video.src = window.URL.createObjectURL(stream);
                video.play();
            }, errBack);
        }
        function vidOff() {
            video.pause();
            video.src = "";
            localstream.getTracks()[0].stop();
            console.log("Vid off");
        }

        $('<img src="img/face.png" id="frame" class="center-block">').insertAfter('#videoElement');
//
//        document.getElementById("camera_click2").addEventListener("click", function () {
//            $('#frame').css('display', 'none');
//            $('.mirror').css('display', 'none');
//            $('canvas').css('display', 'block').addClass('mirror');
//            context.canvas.height = video.videoHeight;
//            context.canvas.width = video.videoWidth;
//            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
//            $('#videoElement').css('display', 'none');
//            video.pause();
//
//        });

        document.getElementById("camera_click2").addEventListener("click", function () {
            $('#frame').css('display', 'none');
            $('.mirror').css('display', 'none');
            $('canvas').css('display', 'block').addClass('mirror');
            context.canvas.height = video.videoHeight;
            context.canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            $('#videoElement').css('display', 'none');
            vidOff();
			$('#mirror').css('display', 'none');
			$('#mirror').fadeOut();
            $('#camera_click2').css('display', 'block');
            $('#camera_click').css('display', 'block');
			$('#camera_click2').fadeIn();
			$('#camera_click').fadeIn();
        });


    
	});

	tab_prev.click(function (e) {
		
        e.preventDefault();
        var count = parseInt($(this).attr("data-count")),
                count_next = parseInt($(this).attr("data-next"));
				count_prev = count - 1;
        $(this).attr("data-count", count_prev).attr("data-next", count);
		$('.photo-item').removeClass('active');
		$('.pagination-right-arrow').attr("data-count", count - 1).attr("data-next", count);
        if (count != 11) {
            $('#' + count + '-tab').removeClass('active');
            $('a[href$="#' + count + '-tab"]').parent().removeClass('active');
            $('#' + count_prev + '-tab').addClass('active');
            $('a[href$="#' + count_prev + '-tab"]').parent().addClass('active');
			$(".tab-button-next").each(function(){
				$(this).attr("data-count", count_prev).attr("data-next", count);
			});
			console.log(count);
			if(count < 10) {
				$('.pagination-right-arrow').fadeIn();
			}
			else if (count == 1) {
				$('.pagination-left-arrow').fadeOut();
			}
			else {
				$('.pagination-right-arrow').fadeOut();
				$('.pagination-left-arrow').fadeIn();
			}
			setTimeout(function(){
				var newId = $('.tab-pane.active').attr('id');
				$('.'+newId).addClass('active');
				console.log(newId);
			}, 10);
        }

        if (count == 10) {
            // $('.tab-button-next').addClass('disabled');
            var form = (jQuery)('#test');

            (jQuery)("#11-tab-row").hide();
            (jQuery)(".wait").show();

            (jQuery).ajax({
                url: form.attr('action'),
                type: 'post',
                data: form.serialize(),
                dataType: 'json',
                success: function (json) {
                    (jQuery)(".wait").hide();
                    console.log(json.result.add_care._2);
                    var array = json.answers;
                    var newHTML = [];
                    $.each(array, function (index, value) {
                        newHTML.push('<li>' + value + '</li>');
                    });

                    (jQuery)("#res").empty().html('<div class="center-block res-p" style=""><p id="p_program" style="color: #6ec3d7;font-weight: 700;">Программа ухода: </p><dl id="listprod">Рекоммендуемые продукты: <dt id="clean_stage">ОЧИЩЕНИЕ</dt><dt id="tonic">ТОНИЗАЦИЯ</dt><dt id="d_cream">УТРЕННИЙ УХОД</dt><dt id="e_cream">ВЕЧЕРНИЙ УХОД</dt><dt id="eye_care">УХОД ЗА КОЖЕЙ ВОКРУГ ГЛАЗ</dt><dt id="add_care">ДОПОЛНИТЕЛЬНЫЙ УХОД</dt></dl></div>');
                    (jQuery)("#res2").empty().html('<div class="center-block" style=""><ol style="line-height:1">' + newHTML.join("") + '</ol></div>');

                    if (json.result.type !== undefined) {
                        (jQuery)(".res-p").prepend('<strong style="color:#0b0">Ваш тип кожи: "' + json.result.type + '" </strong><br/>');
                    }
                    if (json.result.program.name !== undefined) {
                        (jQuery)("#p_program").append(json.result.program.name);
                    }


                    if (json.result.clean_stage !== undefined) {
                        (jQuery)("#clean_stage").after('<dd style=""> - ' + json.result.clean_stage + '</dd>');
                    }

                    if (json.result.program.tonic !== undefined) {
                        (jQuery)("#tonic").after('<dd style=""> - ' + json.result.program.tonic + '</dd>');
                    }
                    if (json.result.program.d_cream !== undefined) {
                        (jQuery)("#d_cream").after('<dd style=""> - ' + json.result.program.d_cream + '</dd>');
                    }
                    if (json.result.program.e_cream !== undefined) {
                        (jQuery)("#e_cream").after('<dd style=""> - ' + json.result.program.e_cream + '</dd>');
                    }

                    if (json.result.eye_care !== undefined) {
                        (jQuery)("#eye_care").after('<dd style=""> - ' + json.result.eye_care + '</dd>');
                    }

                    if (json.result.add_care._2 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._2 + '</dd>');
                    }

                    if (json.result.add_care._3 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._3 + '</dd>');
                    }

                    if (json.result.add_care._4 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._4 + '</dd>');
                    }

                    if (json.result.add_care._5 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._5 + '</dd>');
                    }

                    if (json.result.add_care._6 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._6 + '</dd>');
                    }

                    if (json.result.add_care._7 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._7 + '</dd>');
                    }

                    if (json.result.add_care._8 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._8 + '</dd>');
                    }

                    if (json.result.add_prod !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_prod + '</dd>');
                    }
                }
            });
            return false;
        }

     
	});

		
    tab_next.click(function (e) {
        e.preventDefault();
        var count = parseInt($(this).attr("data-count")),
                count_next = parseInt($(this).attr("data-next"));
        $(this).attr("data-count", count_next).attr("data-next", count_next + 1);
		$('.pagination-left-arrow').attr("data-count", count_next).attr("data-next", count_next + 1);
		$('.pagination-right-arrow').attr("data-count", count_next).attr("data-next", count_next + 1);
		$('.photo-item').removeClass('active');
        if (count != 11) {
            $('#' + count + '-tab').removeClass('active');
            $('a[href$="#' + count + '-tab"]').parent().removeClass('active');
            $('#' + count_next + '-tab').addClass('active');
            $('a[href$="#' + count_next + '-tab"]').parent().addClass('active');
			$(".tab-button-next").each(function(){
				$(this).attr("data-count", count_next).attr("data-next", count_next + 1);
			});
			console.log(count);
			if(count < 10) {
				$('.pagination-right-arrow').fadeIn();
			}
			else if (count == 1) {
				$('.pagination-left-arrow').fadeOut();
			}
			else {
				$('.pagination-right-arrow').fadeOut();
				$('.pagination-left-arrow').fadeIn();
			}
			setTimeout(function(){
				var newId = $('.tab-pane.active').attr('id');
				$('.'+newId).addClass('active');
				console.log(newId);
			}, 10);
        }

        if (count == 10) {
            // $('.tab-button-next').addClass('disabled');
            var form = (jQuery)('#test');

            (jQuery)("#11-tab-row").hide();
            (jQuery)(".wait").show();

            (jQuery).ajax({
                url: form.attr('action'),
                type: 'post',
                data: form.serialize(),
                dataType: 'json',
                success: function (json) {
                    (jQuery)(".wait").hide();
                    console.log(json.result.add_care._2);
                    var array = json.answers;
                    var newHTML = [];
                    $.each(array, function (index, value) {
                        newHTML.push('<li>' + value + '</li>');
                    });

                    (jQuery)("#res").empty().html('<div class="center-block res-p" style=""><p id="p_program" style="color: #6ec3d7;font-weight: 700;">Программа ухода: </p><dl id="listprod">Рекоммендуемые продукты: <dt id="clean_stage">ОЧИЩЕНИЕ</dt><dt id="tonic">ТОНИЗАЦИЯ</dt><dt id="d_cream">УТРЕННИЙ УХОД</dt><dt id="e_cream">ВЕЧЕРНИЙ УХОД</dt><dt id="eye_care">УХОД ЗА КОЖЕЙ ВОКРУГ ГЛАЗ</dt><dt id="add_care">ДОПОЛНИТЕЛЬНЫЙ УХОД</dt></dl></div>');
                    (jQuery)("#res2").empty().html('<div class="center-block" style=""><ol style="line-height:1">' + newHTML.join("") + '</ol></div>');

                    if (json.result.type !== undefined) {
                        (jQuery)(".res-p").prepend('<strong style="color:#0b0">Ваш тип кожи: "' + json.result.type + '" </strong><br/>');
                    }
                    if (json.result.program.name !== undefined) {
                        (jQuery)("#p_program").append(json.result.program.name);
                    }


                    if (json.result.clean_stage !== undefined) {
                        (jQuery)("#clean_stage").after('<dd style=""> - ' + json.result.clean_stage + '</dd>');
                    }

                    if (json.result.program.tonic !== undefined) {
                        (jQuery)("#tonic").after('<dd style=""> - ' + json.result.program.tonic + '</dd>');
                    }
                    if (json.result.program.d_cream !== undefined) {
                        (jQuery)("#d_cream").after('<dd style=""> - ' + json.result.program.d_cream + '</dd>');
                    }
                    if (json.result.program.e_cream !== undefined) {
                        (jQuery)("#e_cream").after('<dd style=""> - ' + json.result.program.e_cream + '</dd>');
                    }

                    if (json.result.eye_care !== undefined) {
                        (jQuery)("#eye_care").after('<dd style=""> - ' + json.result.eye_care + '</dd>');
                    }

                    if (json.result.add_care._2 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._2 + '</dd>');
                    }

                    if (json.result.add_care._3 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._3 + '</dd>');
                    }

                    if (json.result.add_care._4 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._4 + '</dd>');
                    }

                    if (json.result.add_care._5 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._5 + '</dd>');
                    }

                    if (json.result.add_care._6 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._6 + '</dd>');
                    }

                    if (json.result.add_care._7 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._7 + '</dd>');
                    }

                    if (json.result.add_care._8 !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_care._8 + '</dd>');
                    }

                    if (json.result.add_prod !== undefined) {
                        (jQuery)("#add_care").after('<dd> - ' + json.result.add_prod + '</dd>');
                    }
                }
            });
            return false;
        }

    });
    $('.sex').click(function (e) {
        $(this).removeClass('btn-default').addClass('btn-info');
        $(".sex").not(this).removeClass('btn-info').addClass('btn-default');
        e.preventDefault();
        var sex = $(this).attr("data-sex");
        $('#sex').attr("value", sex);
    });

    $(document).ready(function () {

        $('a[data-toggle="tab"]').on('click', function (e) {
			$('.photo-item').removeClass('active');
            var count = parseInt($(this).attr("data-count")), count_next = parseInt($(this).attr("data-next"));
            $('.tab-button-next').attr("data-count", count).attr("data-next", count_next);	
			$(".pagination-right-arrow").each(function(){
				$(this).attr("data-count", count).attr("data-next", count_next);
			});
			$(".pagination-left-arrow").each(function(){
				$(this).attr("data-count", count).attr("data-next", count_next);
			});
			if(count < 10) {
				$('.pagination-right-arrow').fadeIn();
			}
			else if (count == 1) {
				$('.pagination-left-arrow').fadeOut();
			}
			else {
				$('.pagination-right-arrow').fadeOut();
				$('.pagination-left-arrow').fadeIn();
			}
			setTimeout(function(){
				var newId = $('.tab-pane.active').attr('id');
				$('.'+newId).addClass('active');
				console.log(newId);
			}, 10);
			
        });
//		data-item
		
        $("#wash").roundSlider({
            sliderType: "min-range",
            circleShape: "custom-quarter",
            min: 0,
            max: 1,
            step: 0.1,
            value: 0.5,
            startAngle: 225,
            editableTooltip: false,
            radius: 115,
            width: 5,
            handleShape: "dot",
            mouseScrollAction: true,
            handleSize: "+20",
            tooltipFormat: function (e) {
                var val = e.value, answer_value, answer_key;
                if (val <= 0.3) {
                    answer_value = "по-разному (и с водой и без воды)";
                    answer_key = 'c';
                }
                else if (val > 0.3 && val <= 0.6) {
                    answer_value = "без воды";
                    answer_key = 'b';
                }
                else {
                    answer_value = "с водой";
                    answer_key = 'a';
                }
                return "<div>" + answer_value + "</div><input  name='wash_' type='hidden' value='" + answer_key + "'>";
            },

            drag: function(event) {
                $(".young_wash").css('opacity', event.value);
            },
            change: function(event) {
                $(".young_wash").css('opacity', event.value);
            }
        });
        $("#skin_texture").roundSlider({
            sliderType: "min-range",
            circleShape: "custom-quarter",
            min: 0,
            max: 1,
            step: 0.1,
            value: 0.5,
            startAngle: 225,
            editableTooltip: false,
            radius: 115,
            width: 5,
            handleShape: "dot",
            mouseScrollAction: true,
            handleSize: "+20",
            tooltipFormat: function (e) {
                var val = e.value, answer_value, answer_key;
                if (val <= 0.3) {
                    answer_value = "утолщенная, с неровным рельефом";
                    answer_key = 'c';
                }
                else if (val > 0.3 && val <= 0.6) {
                    answer_value = "местами гладкая, местами неровная";
                    answer_key = 'b';
                }
                else {
                    answer_value = "гладкая и мягкая";
                    answer_key = 'a';
                }
                return "<div>" + answer_value + "</div><input  name='skin_texture_' type='hidden' value='" + answer_key + "'>";
            },

            drag: function(event) {
                $(".young_skin_texture").css('opacity', event.value);
            },
            change: function(event) {
                $(".young_skin_texture").css('opacity', event.value);
            }
        });
        $("#day_condition").roundSlider({
            sliderType: "min-range",
            circleShape: "custom-quarter",
            min: 0,
            max: 1,
            step: 0.1,
            value: 0.5,
            startAngle: 225,
            editableTooltip: false,
            radius: 115,
            width: 5,
            handleShape: "dot",
            mouseScrollAction: true,
            handleSize: "+20",
            tooltipFormat: function (e) {
                var val = e.value, answer_value, answer_key;
                if (val <= 0.3) {
                    answer_value = "появляется жирный блеск и ощущение &#039;загрязненности&#039; лица";
                    answer_key = 'c';
                }
                else if (val > 0.3 && val <= 0.6) {
                    answer_value = "обычно комфортное состояние, с утра до вечера без изменний";
                    answer_key = 'b';
                }
                else {
                    answer_value = "часто ощущение сухости, стянутости, бывают раздражения";
                    answer_key = 'a';
                }
                return "<div>" + answer_value + "</div><input  name='day_condition_' type='hidden' value='" + answer_key + "'>";
            },

            drag: function(event) {
                $(".young_day_condition").css('opacity', event.value);
            },
            change: function(event) {
                $(".young_day_condition").css('opacity', event.value);
            }
        });
        $("#sensitive").roundSlider({
            sliderType: "min-range",
            circleShape: "custom-quarter",
            min: 0,
            max: 1,
            step: 0.1,
            value: 0.5,
            startAngle: 225,
            editableTooltip: false,
            radius: 115,
            width: 5,
            handleShape: "dot",
            mouseScrollAction: true,
            handleSize: "+20",
            tooltipFormat: function (e) {
                var val = e.value, answer_value, answer_key;
                if (val <= 0.3) {
                    answer_value = "кожа сразу реагирует покраснением";
                    answer_key = 'c';
                }
                else if (val > 0.3 && val <= 0.6) {
                    answer_value = "иногда появляются раздражения и покраснения";
                    answer_key = 'b';
                }
                else {
                    answer_value = "ожа хорошо переносит косметические процедуры";
                    answer_key = 'a';
                }
                return "<div>" + answer_value + "</div><input  name='sensitive_' type='hidden' value='" + answer_key + "'>";
            },

            drag: function(event) {
                $(".young_sensitive").css('opacity', event.value);
            },
            change: function(event) {
                $(".young_sensitive").css('opacity', event.value);
            }
        });
        $("#pores").roundSlider({
            sliderType: "min-range",
            circleShape: "custom-quarter",
            min: 0,
            max: 1,
            step: 0.1,
            value: 0.5,
            startAngle: 225,
            editableTooltip: false,
            radius: 115,
            width: 5,
            handleShape: "dot",
            mouseScrollAction: true,
            handleSize: "+20",
            tooltipFormat: function (e) {
                var val = e.value, answer_value, answer_key;
                if (val <= 0.3) {
                    answer_value = "расширенные загрязненные поры";
                    answer_key = 'c';
                }
                else if (val > 0.3 && val <= 0.6) {
                    answer_value = "немного заметны";
                    answer_key = 'b';
                }
                else {
                    answer_value = "незаметны";
                    answer_key = 'a';
                }
                return "<div>" + answer_value + "</div><input  name='pores_' type='hidden' value='" + answer_key + "'>";
            },

            drag: function(event) {
                $(".young_pores").css('opacity', event.value);
            },
            change: function(event) {
                $(".young_pores").css('opacity', event.value);
            }
        });
        $("#combustion").roundSlider({
            sliderType: "min-range",
            circleShape: "custom-quarter",
            min: 0,
            max: 1,
            step: 0.1,
            value: 0.5,
            startAngle: 225,
            editableTooltip: false,
            radius: 115,
            width: 5,
            handleShape: "dot",
            mouseScrollAction: true,
            handleSize: "+20",
            tooltipFormat: function (e) {
                var val = e.value, answer_value, answer_key;
                if (val <= 0.3) {
                    answer_value = "кожа склонна к воспалениям";
                    answer_key = 'c';
                }
                else if (val > 0.3 && val <= 0.6) {
                    answer_value = "иногда появляются несколько высыпаний";
                    answer_key = 'b';
                }
                else {
                    answer_value = "нет";
                    answer_key = 'a';
                }
                return "<div>" + answer_value + "</div><input  name='combustion_' type='hidden' value='" + answer_key + "'>";
            },

            drag: function(event) {
                $(".young_combustion").css('opacity', event.value);
            },
            change: function(event) {
                $(".young_combustion").css('opacity', event.value);
            }
        });
        $("#description").roundSlider({
            sliderType: "min-range",
            circleShape: "custom-quarter",
            min: 0,
            max: 1,
            step: 0.1,
            value: 0.5,
            startAngle: 225,
            editableTooltip: false,
            radius: 115,
            width: 5,
            handleShape: "dot",
            mouseScrollAction: true,
            handleSize: "+20",
            tooltipFormat: function (e) {
                var val = e.value, answer_value, answer_key;
                if (val <= 0.3) {
                    answer_value = "кожа уставшая и тусклая, с серым отливом";
                    answer_key = 'c';
                }
                else if (val > 0.3 && val <= 0.6) {
                    answer_value = "обычно кожа выглядит хорошо";
                    answer_key = 'b';
                }
                else {
                    answer_value = "кожа выглядит свежей и сияющей";
                    answer_key = 'a';
                }
                return "<div>" + answer_value + "</div><input  name='description_' type='hidden' value='" + answer_key + "'>";
            },

            drag: function(event) {
                $(".young_description").css('opacity', event.value);
            },
            change: function(event) {
                $(".young_description").css('opacity', event.value);
            }
        });
        $("#environment").roundSlider({
            sliderType: "min-range",
            circleShape: "custom-quarter",
            min: 0,
            max: 1,
            step: 0.1,
            value: 0.5,
            startAngle: 225,
            editableTooltip: false,
            radius: 115,
            width: 5,
            handleShape: "dot",
            mouseScrollAction: true,
            handleSize: "+20",
            tooltipFormat: function (e) {
                var val = e.value, answer_value, answer_key;
                if (val <= 0.3) {
                    answer_value = "я живу в экологисчески неблагоприятном районе";
                    answer_key = 'c';
                }
                else if (val > 0.3 && val <= 0.6) {
                    answer_value = "я живу в городе";
                    answer_key = 'b';
                }
                else {
                    answer_value = "я живу в экологически чистом районе";
                    answer_key = 'a';
                }
                return "<div>" + answer_value + "</div><input  name='environment_' type='hidden' value='" + answer_key + "'>";
            },

            drag: function(event) {
                $(".young_environment").css('opacity', event.value);
            },
            change: function(event) {
                $(".young_environment").css('opacity', event.value);
            }
        });
        $("#eyedescription").roundSlider({
            sliderType: "min-range",
            circleShape: "custom-quarter",
            min: 0,
            max: 1,
            step: 0.1,
            value: 0.5,
            startAngle: 225,
            editableTooltip: false,
            radius: 115,
            width: 5,
            handleShape: "dot",
            mouseScrollAction: true,
            handleSize: "+20",
            tooltipFormat: function (e) {
                var val = e.value, answer_value, answer_key;
                if (val <= 0.3) {
                    answer_value = "коже вокруг глаз заметны мелкие морщинки";
                    answer_key = 'c';
                }
                else if (val > 0.3 && val <= 0.6) {
                    answer_value = "иногда появляются темные круги и отеки под глазами";
                    answer_key = 'b';
                }
                else {
                    answer_value = "чувствительная, склонна к покраснениям и сухости";
                    answer_key = 'a';
                }
                return "<div>" + answer_value + "</div><input  name='eyedescription_' type='hidden' value='" + answer_key + "'>";
            },

            drag: function(event) {
                $(".young_eyedescription").css('opacity', event.value);
            },
            change: function(event) {
                $(".young_eyedescription").css('opacity', event.value);
            }
        });
    })
