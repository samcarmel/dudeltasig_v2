<?php
/**
 * The main template file
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 *
 * @link http://codex.wordpress.org/Template_Hierarchy
 *
 * @package WordPress
 */
    get_header();
?>

	<!--About Us Page-->
	<?php 
	require('page-templates/page-aboutUs.php');
	?>
	
	<!--Recruitment Page-->
	<?php 
	require('page-templates/page-recruitment.php');
	?>
	
	<!--Brothers Page-->
	<?php 
	require('page-templates/page-brothers.php');
	?>
	
	<!--Donate Page-->
	<?php 
	require('page-templates/page-donate.php');
	?>
	

	<?php get_footer(); ?>