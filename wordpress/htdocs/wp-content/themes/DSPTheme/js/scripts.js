$ = jQuery;

//Functions to run on scroll event
$(window).scroll(function(){

	 $("img").each(function() {  
		if(isElementInViewport(this, "edge"))
		{
			$(this).addClass('inView');
		}
		else
		{
			$(this).removeClass('inView');
		}
	});
	
	console.log("Scroll Detected");
});
//Functions to run on resize event
$(window).resize(function(){

	console.log("resize Detected");

});


function isElementInViewport (el, opt) {
    //opt has two possible values "edge" and "whole"
    //"edge" means the image will be considered in view once the edge appears
    //"whole" means the image will only be considered in view once the whole image is visible
    //Set default value of opt to edge

    if (typeof opt === "undefined" || opt === null) {
        opt = "edge";
    }

    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    if(opt == "edge")
    {
        console.log("'edge' opt selected");
        console.log(rect);
        return (
            (rect.top >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) ) ||
            (rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0) /*or $(window).height() */
        );
    }
    else if(opt == "whole")
    {
        console.log("'whole' opt selected");
        return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        );
    }
    else
    {
        console.log("isElementInViewport() opt parameter not valid must be 'edge' or 'whole' default is 'edge'");
        return false;
    }

};