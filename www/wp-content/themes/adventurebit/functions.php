<?php

/* menu
----------------------------------------------------------------------------- */

if(function_exists('add_theme_support')) {
    add_theme_support('menus');
}

register_nav_menu('main', 'Главное меню');


function loop_blog() {
    require_once 'single.php';
}
    add_shortcode ('blog', 'loop_blog');

?>