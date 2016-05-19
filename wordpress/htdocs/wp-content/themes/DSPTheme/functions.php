<?php
//Functions File (loaded for all pages)

function init_function()
{
	//Scripts to load
	wp_enqueue_script( 'jQuery', get_bloginfo('template_url') . "/js/jQuery.js");
	wp_enqueue_script( 'bootstrap', get_bloginfo('template_url') . "/js/bootstrap.min.js");
	
	//Styles to load
	wp_enqueue_style( 'style', get_bloginfo('template_url') . "/css/style.css");
	wp_enqueue_style( 'bootstrap', get_bloginfo('template_url') . "/css/bootstrap.min.css");
	wp_enqueue_style( 'lading-page', get_bloginfo('template_url') . "/css/landing-page.css");
	wp_enqueue_style( 'font-awesome', get_bloginfo('template_url') . "/font-awesome/css/font-awesome.min.css");
}

//Attach init_function to init action
add_action('init', 'init_function');

?>