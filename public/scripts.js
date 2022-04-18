$(document).ready(function(){

	$(".scroll-offscreen").css("opacity", "0");  
		
	$(window).scroll(function() {
		
		for(var i = 1; i < 5; i++) {

			if ($(this).scrollTop() > ($(document).height() * ((.195 * i) - .165))){  
				$('.js-scroll'+i).addClass("scrolled");
			}
			else {
				$('.js-scroll'+i).removeClass("scrolled");
			}
		}
	});
	
	});
