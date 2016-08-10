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
                //var_dump(file_exists($brotherImgPath));
                if(!file_exists($brotherImgPath))
                {
                    $brotherImgPath = get_bloginfo("template_url"). '/brothersSlider/img/man_placeholder.gif';
                }
                else
                {
                    $brotherImgPath = get_bloginfo("template_url"). '/brothersSlider/img/' . strtoupper($brotherFirstName . "_" . $brotherLastName) . ".jpg";
                }

                $brotherSingleHTML = '<li data-rowspan="2" data-hover-effect="zoomOut"><a href="' . $brotherImgPath .'" alt=""/></a><div>Descr. 1 : dolor sit amet, consectetur adipiscing elit. Fusce faucibus ipsum ut dapibus auctor.</div><div class="gs-hover"><h4>' . $brotherFirstName . ' ' . $brotherLastName . '</h4><img src="' . $brotherImgPath .'" alt="" style="width:250px;height:250px;"/><p>Descr. 2 :  dolor sit amet, consectetur adipiscing elit. 
                                Curabitur nec vulputate lacus. Maecenas ipsum ipsum, porttitor at ipsum quis, fringilla pharetra odio. 
                                Nam sed odio orci. Quisque gravida congue velit, eget dapibus nisi molestie ut.</p></div></li>';

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
    <div class="sliderContainer">
        <!-- BEGIN jQuery Slider -->

<div class="row">
        <div class="span12 main">
            <!-- grid slider begin -->
            <div id="slider1" class="grid-slider">
                
                
                <!-- 2nd category -->
                <ul class="gs-list" data-title="Brothers" data-effect="fade">
                    
                       <?php
                        foreach($brotherArray as $sbHTML)
                        {
                            echo $sbHTML;
                        }

                     ?>

             
                    
                </ul>
                
                </ul>            
            </div>
            <!-- grid slider end -->
                

        </div>
    </div>



        <!-- END jQuery Slider -->

    </div>

<div id="inline1" style="display:none">
    <h3>Lorem Ipsum Dolor</h3>
    <p><strong>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur in dignissim nisl. Integer nisl lorem, rhoncus sit amet aliquet eu, mollis ut sapien. Curabitur pellentesque eros quis ipsum tempor in malesuada erat mattis. Vestibulum pulvinar interdum placerat. Nunc posuere mi a eros consectetur nec rutrum massa rutrum. Fusce venenatis, ante non tincidunt fringilla, enim nulla malesuada massa, sit amet bibendum orci dui non felis. Aenean ornare, lectus sit amet rhoncus aliquam, mauris metus dapibus turpis, id volutpat orci justo nec nibh.</strong></p>
    <p><em>Curabitur hendrerit nisi id orci scelerisque lacinia. Sed euismod scelerisque neque sit amet ultricies. Pellentesque metus turpis, ullamcorper condimentum sagittis id, bibendum vitae velit. Cras vitae sapien odio. Etiam vehicula varius odio, sed hendrerit dui varius at. Nunc nibh risus, euismod ut tincidunt non, lacinia vitae felis. Nulla sit amet eros quis lorem tempor luctus et luctus lorem. Nam non justo odio. Aliquam condimentum ultricies bibendum. Integer pharetra posuere cursus. In egestas, elit et porta tristique, risus magna interdum ipsum, at aliquet eros est nec augue. Suspendisse a augue non diam eleifend consectetur vel eget arcu. Sed orci velit, facilisis quis pellentesque at, pulvinar eu metus. In dignissim tempor velit.</em></p>
    <blockquote>Fusce ut consectetur nisl. In sed est id ligula interdum malesuada. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed ornare, velit in dignissim tempor, est neque euismod nibh, non pretium neque nisl et magna. Vestibulum eu ligula nunc, sed tincidunt lorem. Donec cursus fermentum justo a accumsan. Vivamus a erat tellus, sit amet convallis massa. Maecenas mollis rhoncus vestibulum. Suspendisse aliquet leo sed diam venenatis tristique. Donec eu auctor quam. Morbi ac augue lorem. In aliquet adipiscing erat, bibendum posuere augue viverra eget. Cras non metus vitae magna consequat iaculis sit amet ut ipsum. Integer gravida urna sit amet nibh suscipit mollis.</blockquote>
    <ul>
        <li>Lorem ipsum dolor sit amet</li>
        <li>Consectetur adipiscing elit</li>
        <li>Integer molestie lorem at massa</li>
        <li>Facilisis in pretium nisl aliquet</li>
        <li>Nulla volutpat aliquam velit</li>
        <li>Phasellus iaculis neque</li>
        <li>Purus sodales ultricies</li>
        <li>Vestibulum laoreet porttitor sem</li>
        <li>Ac tristique libero volutpat at</li>
    </ul>
    <pre>Nunc vulputate dolor a libero pretium a congue dolor facilisis. Suspendisse luctus iaculis quam sit amet tempus. Maecenas eu ante iaculis nisi gravida condimentum ac in est. Quisque lectus sem, euismod quis vestibulum sodales, rutrum in dui. Vivamus elit odio, auctor vestibulum facilisis in, egestas sit amet tellus. In hac habitasse platea dictumst. Phasellus vitae est tincidunt metus consequat sodales. Donec mattis luctus nulla ac tempus. In hac habitasse platea dictumst. Aliquam odio massa, ullamcorper et interdum non, consectetur eget nunc. Praesent molestie arcu quis ante varius volutpat. Phasellus porttitor, massa vel vulputate vulputate, augue tellus rutrum orci, vel convallis eros urna eget nunc.</pre>
</div>
<div id="inline2" style="display:none">
    <h3>Lorem Ipsum Dolor</h3>
    <table class="table table-bordered table-striped table-hover">
    <tr>
        <th>#</th>
        <th>Lorem Ipsum</th>
        <th>Dolor Sit Amet</th>
        <th>Consectetur Adipiscing</th>
        <th>Integer Molestie</th>
    </tr>
    <tr>
        <td>1</td>
        <td>Nulla volutpat aliquam velit</td>
        <td>Phasellus iaculis neque</td>
        <td>Purus sodales ultricies</td>
        <td>Vestibulum laoreet porttitor sem</td>
    </tr>
    <tr>
        <td>2</td>
        <td>Lorem ipsum dolor sit amet</td>
        <td>Consectetur adipiscing elit</td>
        <td>Integer molestie lorem at massa</td>
        <td>Facilisis in pretium nisl aliquet</td>
    </tr>
    <tr>
        <td>3</td>
        <td>Ac tristique libero volutpat at</td>
        <td>Faucibus porta lacus fringilla vel</td>
        <td>Aenean sit amet erat nunc</td>
        <td>Eget porttitor lorem</td>
    </tr>
    <tr>
        <td>4</td>
        <td>Nulla volutpat aliquam velit</td>
        <td>Phasellus iaculis neque</td>
        <td>Purus sodales ultricies</td>
        <td>Vestibulum laoreet porttitor sem</td>
    </tr>
    <tr>
        <td>5</td>
        <td>Lorem ipsum dolor sit amet</td>
        <td>Consectetur adipiscing elit</td>
        <td>Integer molestie lorem at massa</td>
        <td>Facilisis in pretium nisl aliquet</td>
    </tr>
    <tr>
        <td>6</td>
        <td>Ac tristique libero volutpat at</td>
        <td>Faucibus porta lacus fringilla vel</td>
        <td>Aenean sit amet erat nunc</td>
        <td>Eget porttitor lorem</td>
    </tr>
    </table>
</div>
</div>