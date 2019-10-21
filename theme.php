<?php

function import_font($font = 'Ubuntu')
{
    echo '<link href="https://fonts.googleapis.com/css?family='
        . $font . '&amp;display=swap" rel="stylesheet">';
}

function import_theme($theme = 'dark')
{
    $base_dir = dirname($_SERVER['SCRIPT_FILENAME']);

    $theme_dir = 'css/theme/' . $theme;

    // use default theme
    if (!is_dir($base_dir . "/" . $theme_dir))
        $theme_dir = 'css/theme/' . "dark";

    if (false == ($dh = opendir($theme_dir)))
        return;

    //$regexp ="^[A-Za-z0-9_.-]*\.css$";
    $regexp ="^.*\.css$";

    while (false !== ($file = readdir($dh)))
    {
        // skip 'dot' files
        if (strncmp(".", $file, 1) == 0)
            continue;

        // skip non-css files
        if (!preg_match("#$regexp#", $file))
            continue;

        $mtime = filemtime($base_dir . '/' . $theme_dir . '/' . $file);

        echo "<link rel='stylesheet' href='"
         . $theme_dir . '/' . $file . "?" . $mtime . "'>\n";
    }

    return;

}

?>