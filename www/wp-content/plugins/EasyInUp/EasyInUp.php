<?php
/*
Plugin Name: Easy Registration/Authorization
Plugin URI: http://adventurebit.com/
Description: Easy Registration/Authorization in wordpress
Author: Selikhov Dmitry
Version: 1.0
Author URI: http://adventurebit.com/
*/
    
include_once 'modules/form.php';    
    
function files() {

  $styleUrl = plugins_url('css/style.css', __FILE__);
  $styleFile = WP_PLUGIN_DIR . '/EasyInUp/css/style.css';
  if(file_exists($styleFile)) {
    wp_register_style('inout_css', $styleUrl);
    wp_enqueue_style('inout_css');
  }
   
  $scriptUrl = plugins_url('js/script.js', __FILE__);
  $scriptFile = WP_PLUGIN_DIR . '/EasyInUp/js/script.js';
  if(file_exists($scriptFile)) {
    wp_register_script('inout_js', $scriptUrl); 
    wp_enqueue_script('inout_js');
  }
  
  $options = get_option('inout');
  $type = $options['type'];  
  $redirect = $options['redirect'];
  
  ?>
  <script>
    var INOUT_TYPE = '<?= $type ?>';
    var INOUT_REDIRECT = '<?= $redirect ?>';
  </script>
  <?php

}
 
add_action('wp_footer', 'files'); 
 
function inout()
{ 
}
 

/* Shortcode
------------------------------------------------------------------------------*/ 

function inout_shortcode($args) {
  echo FORM_CONTENT();  
}

add_shortcode('easy_in_up', 'inout_shortcode');

/* Widget
------------------------------------------------------------------------------*/ 
 
function widget_inout_content($args) {

  $options = get_option('inout');
  $type = $options['type']; 

  switch($type) {
    case 'dialog': 
    break; 
    
    case 'list': 
    break; 
    
    default:
      extract($args);
    
      $title = $options['title'];  
         
      echo $before_widget;
      echo $before_title;
      echo $title;
      echo $after_title;
      echo FORM_CONTENT();
      echo $after_widget;
    break;
  }
}

function widget_inout_control() {

  $options = get_option('inout', array(
    'title' => 'Easy Sign In/Up',
    'type' => 'sidebar',
    'redirect' => ''
  ));
  
  if(isset($_POST['nonce'])) {
    $options['title'] = $_POST['title'];
    $options['redirect'] = $_POST['redirect'];
    
    $options['registration'] = $_POST['registration'];
    $options['authorization'] = $_POST['authorization'];
    $options['exit'] = $_POST['exit'];
    
    $options['type'] = $_POST['type']; 
  }      

  update_option('inout', $options);
?>

<div>
  <label for="title">Title:</label>
</div>
<input class="widefat" type="text" id="title" name="title" maxlength="30" value="<?= $options['title'] ?>" />

<p>
  <div>
    <label for="redirect">Redirect to:</label>
  </div>   
  <input class="widefat" type="text" id="redirect" name="redirect" maxlength="100" value="<?= $options['redirect'] ?>" /> 
</p>

<p>
  <div>
    <label>
      Type:  
    </label>
  </div>
  <select name="type">
    <option value="dialog"  <?= $options['type']=='dialog'?'selected':'' ?>>Dialog</option>
    <option value="sidebar" <?= $options['type']=='sidebar'?'selected':'' ?>>Sidebar</option>
    <option value="list" <?= $options['type']=='list'?'selected':'' ?>>List</option>
  </select>
</p>

<input type="hidden" name="nonce" value="<?= wp_create_nonce('inout'); ?>" /> 
  
<?php
}
 
register_sidebar_widget(__('Easy Registration/Authorization'), 'widget_inout_content', 'widget_inout');   
register_widget_control(__('Easy Registration/Authorization'), 'widget_inout_control');   

add_action('plugins_loaded', 'inout');

?>