<?php
/**
 * The template for displaying the header
 *
 * Displays all of the head element and everything up until the "site-content" div.
 *
 * @package WordPress
 * @subpackage DSPTheme
 * @since DSPTheme 1.0
 */
?>
<head profile="http://gmpg.org/xfn/11">
<meta http-equiv="Content-Type" content="<?php bloginfo('html_type'); ?>; charset=<?php bloginfo('charset'); ?>" />
<meta name="generator" content="WordPress <?php bloginfo('version'); ?>" /> <!-- leave this for stats -->
<link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); ?>" type="text/css" media="screen" />

<link rel="alternate" type="application/rss+xml" title="<?php bloginfo('name'); ?> RSS 2.0" href="<?php bloginfo('rss2_url'); ?>" />
<link rel="alternate" type="application/atom+xml" title="<?php bloginfo('name'); ?> Atom 0.3" href="<?php bloginfo('atom_url'); ?>" />
<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />

<title><?php bloginfo('name'); ?><?php wp_title(); ?></title>

<!--FAVICON LINKS (use http://realfavicongenerator.net/ to generate replacement) -->

    <link rel="apple-touch-icon" sizes="180x180" href="<?php bloginfo('template_url'); ?>/img/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" href="<?php bloginfo('template_url'); ?>/img/favicons/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="<?php bloginfo('template_url'); ?>/img/favicons/favicon-16x16.png" sizes="16x16">
    <link rel="manifest" href="<?php bloginfo('template_url'); ?>/img/favicons/manifest.json">
    <link rel="mask-icon" href="<?php bloginfo('template_url'); ?>/img/favicons/safari-pinned-tab.svg" color="#005b3c">
    <link rel="shortcut icon" href="<?php bloginfo('template_url'); ?>/img/favicons/favicon.ico">
    <meta name="msapplication-config" content="<?php bloginfo('template_url'); ?>/img/favicons/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">
<!--END FAVICON LINKS ------------------------------------------------------------->

<!--CUSTOM FONTS-->
<link href="http://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic" rel="stylesheet" type="text/css">

<?php wp_head(); ?><meta name="verify-v1" content="53/AHENoYym8RbXpIdO+Aa2GaVPVpX8G79ehG6+NYTw=" />

<!-- GRID SLIDER STYLES and SCRIPT -->
    <style type="text/css">
        body{
            background-color:#eee;
        }
        .sliderContainer{
            /*margin-top:100px;
            margin-bottom:100px;*/
        }
        .main{
            -webkit-box-shadow:0 10px 6px -6px rgba(0,0,0,0.4);
            -moz-box-shadow:0 10px 6px -6px rgba(0,0,0,0.4);
            box-shadow:0 10px 6px -6px rgba(0,0,0,0.4);
        }
        #slider1{
        }
        .gs-slide-panel{
            min-height: 30vw !IMPORTANT;
            max-height: 500px !IMPORTANT;
        }
        .gs-container{
            height: auto !IMPORTANT;
            max-width: 90%;
            margin: auto;
        }
    </style>
 
    <script type="text/javascript">
           jQuery(window).load(function() {
            //initialize lightbox
            jQuery('#slider1 li>a').fotobox({
                responsive:true,
                autoPlay:false,
                delay:5000,
                speed:600,
                easing:'swing',
                navButtons:'hover',
                playButton:false,
                numberInfo:false,
                timer:false,
                continuous:true,
                mousewheel:false,
                keyboard:true,
                swipe:true,
                fitImagesInViewport:true,
                errorMessage:'Error Loading Content',
                thumbnails: {
                    enable:false,
                    width:50,
                    height:50,
                    position:'bottom'
                }
            });
             
             //initialize grid slider   
            jQuery("#slider1").gridSlider({
                responsive:true,
                numCols:4,
                numRows:2,
                slideWidth:100,
                slideHeight:150,
                slideBorder:5,
                slideMargin:10, 
                padding:10,
                panelEffect:'coverDown',
                keyboard:true,         
                pageInfo:'page',
                current:'{current} / {total}',
                hoverBox: {
                    width:250,
                    height:'auto',
                    delay:1000,
                    toggle:true
                }
            });
        });

    </script>


</head>

<!--BEGIN-NAV-->

<body style="overflow-x: hidden;" class="dudeltasig">

    <!-- Navigation -->
    <nav class="navbar navbar-default navbar-fixed-top topnav" role="navigation">
        <div class="container topnav">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand topnav dspTopLeft" href="#">&Delta; &Sigma; &Phi;</a>
            </div>
            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul class="nav navbar-nav navbar-right">
                    <li>
                        <a href="#about">About</a>
                    </li>
                    <li>
                        <a href="#recruitment">Recruitment</a>
                    </li>
                    <li>
                        <a href="#brothers">Brothers</a>
                    </li>
					<li>
                        <a href="#donate">Donate</a>
                    </li>
                </ul>
            </div>
            <!-- /.navbar-collapse -->
        </div>
        <!-- /.container -->
    </nav>
<?php
//Query posts to select all posts with this pages category
query_posts( 'category_name=intro' );

//Init variables that exist outside of the loop
$array = array();

//Start the loop
while ( have_posts() ) : the_post();

    //Wipe these variables on each iteration
    $htmlString = "";
    $key = 0;

   // <!-- Header -->
   $htmlString .= '<a name="intro"></a>
    <div class="intro-header">
          <div class="video-overlay"></div>
            <div class="video-wrap">
                <video autoplay="autoplay" muted="muted" loop="loop" poster="' . get_bloginfo("template_url") . '/img/recruitment_cups.jpg" class="bg-video">
                <source src="http://res.cloudinary.com/dvbijpnfw/video/upload/v1470802163/banner_greekWeekCompressed_yiqi2y.mp4">
                
            </video>
    </div>
        <div class="container intro-container">

            <div class="row">
                <div class="col-lg-12">
                    <div class="intro-message">
                        <h1>' . get_the_title() . '</h1>
                        <h3>' . get_the_content() . '</h3>
                        <hr class="intro-divider">
                        <ul class="list-inline intro-social-buttons">
                        <li>
                            <a href="https://twitter.com/DrexelDeltaSig" class="btn btn-default btn-lg"><i class="fa fa-twitter fa-fw"></i> <span class="network-name">Twitter</span></a>
                        </li>
                        <li>
                            <a href="https://www.facebook.com/DUDeltaSig/" class="btn btn-default btn-lg"><i class="fa fa-facebook fa-fw"></i> <span class="network-name">Facebook</span></a>
                        </li>
                        <li>
                            <a href="" class="btn btn-default btn-lg" onclick="function(){jQuery("#donateForm").submit();}"><i class="fa fa-paypal fa-fw"></i> <span class="network-name">Donate</span></a>
                           <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" align="right" id="donateForm" style="display: none;">
                                <!-- Paypal Button-->
                                <input type="hidden" name="cmd" value="_s-xclick">
                                <input type="hidden" name="hosted_button_id" value="FG4VAEKA8N8HU">
                                <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
                            </form>
                        </li>
                    </ul>
                    </div>
                </div>
            </div>

        </div>
        <!-- /.container -->

    </div>
    <!-- /.intro-header -->';

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

endwhile;

//Sort array by keys/index in ascending order (1-9)
ksort($array);

//Print each post's html
foreach($array as $k => $v)
{
    echo $v;
}


?>




