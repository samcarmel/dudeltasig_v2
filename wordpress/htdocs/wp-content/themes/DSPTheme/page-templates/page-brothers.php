<?php /* Template Name: AboutUs Template */ ?>
<!-- Page Content -->
<a  name="brothers"></a>
<div class="banner2">
<?php
    //Query posts to select all posts with this page's title category
    query_posts( 'category_name=brothers_title' );
	
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

<!-- Brother Slider Styles and Scripts From Demo Page -->
<style type="text/css">
    body{
        background-color:#eee;
    }
    .container{
        margin-top:100px;
        margin-bottom:100px;
    }
    .main{
        -webkit-box-shadow:0 10px 6px -6px rgba(0,0,0,0.4);
        -moz-box-shadow:0 10px 6px -6px rgba(0,0,0,0.4);
        box-shadow:0 10px 6px -6px rgba(0,0,0,0.4);
    }
</style>

<script type="text/javascript">
    $(window).load(function() {
        //initialize lightbox
        $('#slider1 li>a').fotobox({
            responsive:true,
            autoPlay:false,
            delay:5000,
            speed:600,
            easing:'swing',
            navButtons:'hover',
            playButton:true,
            numberInfo:true,
            timer:true,
            continuous:true,
            mousewheel:true,
            keyboard:true,
            swipe:true,
            errorMessage:'Error Loading Content',
            thumbnails: {
                enable:false,
                width:50,
                height:50,
                position:'bottom'
            }
        });
         
         //initialize grid slider   
        $("#slider1").gridSlider({
            responsive:true,
            numCols:4,
            numRows:2,
            slideWidth:250,
            slideHeight:125,
            slideBorder:5,
            slideMargin:10, 
            padding:10,
            panelEffect:'coverDown',
            captionEffect:'slide',
            captionWidth:100,
            captionHeight:'auto',
            hoverEffect:'zoomIn',
            keyboard:true,          
            mousewheel:true,
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


<?php
//Gather brothers information
$brotherArray = array();
$brotherListPath = get_bloginfo('template_url') . "/brothersSlider/deltasig-rx.csv";
$row = 1;
try
{

    if (($handle = fopen($brotherListPath, "r")) !== FALSE) {

        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            if($row != 1 && strtolower($data[1]) != "nickname" && strtolower($data[1]) != "chapter admin")
            {
                $num = count($data);
                $brotherSingleHTML = "";
                $nameFormatted = "";
                $brotherFirstName = "";
                $brotherLastName = "";
                if (strpos($data[1], '.') !== false || strpos($data[1], '@') !== false) {
                    $nameFormatted = str_replace(str_split('@.'), ' ', $data[1]);
                    $nameFormatted = preg_replace('/[0-9]+/', '', $nameFormatted);


                }
                else {
                    $nameFormatted = $data[1];
                }

                $nameSplit = explode(' ', $nameFormatted);
                $ct = 0;
                foreach ($nameSplit as $ns) {
                    $nameSplit[$ct] = ucfirst($ns);
                    $ct++;
                }
                $brotherFirstName = $nameSplit[0];
                $brotherLastName = $nameSplit[1];
                $brotherID = strtolower($brotherFirstName . "_" . $brotherLastName);

                $brotherImgPath =  $_SERVER['DOCUMENT_ROOT'] . '/wp-content/themes/DSPTheme/brothersSlider/img/' . strtoupper($brotherFirstName . "_" . $brotherLastName) . ".jpg";
                //echo $brotherImgPath;
                var_dump(file_exists($brotherImgPath));
                if(!file_exists($brotherImgPath))
                {
                    $brotherImgPath = get_bloginfo("template_url"). '/brothersSlider/img/man_placeholder.gif';
                }
                else
                {
                    $brotherImgPath = get_bloginfo("template_url"). '/brothersSlider/img/' . strtoupper($brotherFirstName . "_" . $brotherLastName) . ".jpg";
                }

                $brotherSingleHTML = '<li data-colspan="1" data-rowspan="2" data-caption-align="top" data-hover-effect="zoomOut">
                        <a href="' . $brotherImgPath . '" data-lightbox-group="brothers"><img src="' . $brotherImgPath . '" alt=""/></a>
                        <div>
                            '. $brotherFirstName . ' ' . $brotherLastName .'
                        </div>
                        <div class="gs-content" data-title="3D Abstract Art">
                            <h3>HERE LI 1</h3>
                            <img src="' . $brotherImgPath . '" alt="" class="img-polaroid" style="float:left;margin-right:10px;margin-bottom:10px;width:400px;"/>
                            <p>'. $brotherFirstName . ' ' . $brotherLastName .'</p>
                            <p>'. $brotherFirstName . ' ' . $brotherLastName .'</p>
                            <p>'. $brotherFirstName . ' ' . $brotherLastName .'</p>
                        </div>
                        <div class="gs-hover">
                            <h4>'. $brotherFirstName . ' ' . $brotherLastName .'</h4>
                            <p>
                                '. $brotherFirstName . ' ' . $brotherLastName .'
                            </p>
                            <p>
                                '. $brotherFirstName . ' ' . $brotherLastName .'
                            </p>
                            <a href="http://codecanyon.net">CodeCanyon &raquo;</a>
                        </div>
                    </li>';

                $brotherArray[$brotherID] = $brotherSingleHTML;


            }
            $row++;
        }
        fclose($handle);

        ksort($brotherArray);
    }

}
catch(Exception $e)
{
    var_dump($e);
}


?>


<div class="content-section-a">
    <div class="container">
        <!-- BEGIN jQuery Slider -->

<div class="row">
        <div class="span12 main">
            <!-- grid slider begin -->
            <div id="slider1" class="grid-slider">
                <!-- 1st category -->
                <ul class="gs-list" data-title="Brothers" data-effect="horizontalSlide">
                    <!--BEGIN Brother Slides (Section 1)-->    
                    
                    <?php
                        foreach($brotherArray as $sbHTML)
                        {
                            echo $sbHTML;
                        }

                     ?>



                    <!--END Brother Slides (Section 1)-->    


                </ul>
                
                <!-- 2nd category -->
                <ul class="gs-list" data-title="Architecture" data-effect="fade">
                    
                </ul>
                
                <!-- 3rd category -->
                <ul class="gs-list" data-title="Portfolio" data-effect="verticalSlide">
                    
                </ul>            
            </div>
            <!-- grid slider end -->
        </div>
    </div>



        <!-- END jQuery Slider -->

    </div>
</div>