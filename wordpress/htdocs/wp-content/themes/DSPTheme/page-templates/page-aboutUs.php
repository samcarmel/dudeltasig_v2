<?php /* Template Name: AboutUs Template */ ?>
 <!-- Page Content -->
 <a  name="about"></a>
  <div class="banner2">
<?php
    //Query posts to select all posts with this page's title category
    query_posts( 'category_name=aboutUs_title' );
	
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
	<?php
    //Query posts to select all posts with this pages category
    query_posts( 'category_name=aboutUs' );

    //Init variables that exist outside of the loop
	$count = 1;
	$array = array();

    //Start the loop
	while ( have_posts() ) : the_post();

        //Wipe these variables on each iteration
        $htmlString = "";
        $key = 0;

        //If statement to alternate that html structure for every other post
		if($count%2 == 0)
		{
            $htmlString = '<div class="content-section-b">
        <div class="container">

            <div class="row">
                <div class="col-lg-5 col-lg-offset-1 col-sm-push-6  col-sm-6">
                    <!--<hr class="section-heading-spacer">-->
                    <div class="clearfix"></div>';
		}
		else
		{
			$htmlString = '<div class="content-section-a">
        <div class="container">
            <div class="row">
                <div class="col-lg-5 col-sm-6">
                   <!--<hr class="section-heading-spacer">-->
                    <div class="clearfix"></div>';
		}

        //Add content from WordPress (same for both layouts)
        $htmlString .= '<h2 class="section-heading">' . get_the_title() . '</h2>
						<p class="lead">'  . get_the_content() . '</p>';

        //If statement to alternate html structure (closing tags and img)
        if($count%2 == 0)
        {
            $htmlString .= '    </div>
                <div class="col-lg-5 col-sm-pull-6  col-sm-6">
                    <img class="img-responsive" src="' . get_field("Image") .'" alt="">
                </div>
            </div>

        </div>
        <!-- /.container -->

    </div>
    <!-- /.content-section-b -->
';
        }
        else
        {
            $htmlString .= '</div>
					<div class="col-lg-5 col-lg-offset-2 col-sm-6">
						<img class="img-responsive" src="' . get_field("Image") .'" alt="">
					</div>
				</div>

			</div>
			<!-- /.container -->

		</div>
		<!-- /.content-section-a -->';
        }

        //Get post's tags
		$posttags = get_the_tags();
		if ($posttags) {
		  foreach($posttags as $tag) {
             //Check if the tag length is 1
             //Posts are ordered by a number tag
             //IMPORTANT: There should only be one 1 digit tag per post and no more than 9 posts per category...
             //if there are more than 9 posts per category only 9 can show up (those should be tagged 1-9 accordingly...
             //all other posts not tagged or with a tag greater than 9 will not be shown.
			 if(strlen($tag->name) == 1)
			 {
                //Convert the tag to an integer and assign its value to $key
				$key = intval($tag->name); 
				
			 }
		  }
		}

        //Add post's htmlString to array with an index equal to the tag (the tag that is a single digit)
		$array[$key] = $htmlString;
		//Increment $count (used to trigger alternating layouts)
		$count = $count + 1;
		
	endwhile;

    //Sort array by keys/index in ascending order (1-9)
	ksort($array);

    //Print each post's html
	foreach($array as $k => $v)
	{
		echo $v;
	}
	
	
	?>
   
