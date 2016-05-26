<?php
//Index (default page template)
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