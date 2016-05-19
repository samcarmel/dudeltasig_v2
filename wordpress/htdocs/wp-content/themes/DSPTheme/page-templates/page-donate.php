<?php /* Template Name: Donate Template */ ?>
<a  name="donate"></a>
<div class="banner2">
<?php
    //Query posts to select all posts with this page's title category
    query_posts( 'category_name=donate_title' );
	
	//Start the loop
	while ( have_posts() ) : the_post();
		$htmlString = ' <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <h2>' . get_the_title() . '</h2>
                    <h3>' . get_the_content() . '</h3>
                </div>
            </div>
        </div>
        <!-- /.container -->';
	
	endwhile;
	
	echo $htmlString;
	$htmlString = "";
	?>
</div>
<!-- /.banner -->
    <div class="banner">

        <div class="container">

            <div class="row">
                <div class="col-lg-6">
                    <h2>Connect to Start Bootstrap:</h2>
                </div>
                <div class="col-lg-6">
                    <ul class="list-inline banner-social-buttons">
                        <li>
                            <a href="https://twitter.com/SBootstrap" class="btn btn-default btn-lg"><i class="fa fa-twitter fa-fw"></i> <span class="network-name">Twitter</span></a>
                        </li>
                        <li>
                            <a href="https://github.com/IronSummitMedia/startbootstrap" class="btn btn-default btn-lg"><i class="fa fa-github fa-fw"></i> <span class="network-name">Github</span></a>
                        </li>
                        <li>
                            <a href="#" class="btn btn-default btn-lg"><i class="fa fa-linkedin fa-fw"></i> <span class="network-name">Linkedin</span></a>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
        <!-- /.container -->

    </div>
    <!-- /.banner -->