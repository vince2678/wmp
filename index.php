<?php
include "helpers.php";
include "cfg.php";
include "db.php";
include "cookies.php";
include "api.php";
?>

<!DOCTYPE html>
<html lang="en" dir="ltr">

    <head>
        <meta charset="utf8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <?php $css = "css/theme/dark/default.css"?>
        <?php $basedir = dirname($_SERVER['SCRIPT_FILENAME']) ?>
        <?php $mtime = filemtime($basedir . '/' . $css)?> 
        <link rel='stylesheet' href='<?php echo $css . "?" . $mtime?>'>
        <script src='js/misc.js'></script>
        <script src='js/ajax.js'></script>
        <script src='js/interface.js' type='module'></script>
    </head>

    <body>
        <div id='left_nav' class='sidenav'>
            <div id='media_groups'>
                <p class='title'>Media</p>
                <div id='listing'></div>
            </div>
            <div id='libraries'>
                <p class='title'>Libraries</p>
                <div id='listing'></div>
            </div>
            <div id='playlists'>
                <p class='title'>Playlists</p>
                <div id='listing'></div>
            </div>
        </div>

        <div id='top_nav' class='nav'>
            <a href="javascript:void(0)" class="leftnavbtn"></a>
            <div id='search'>
                <p class='placeholder'>Search</p>
            </div>
            <div id='user_area'>
                <p class='placeholder'>User area</p>
            </div>
        </div>

        <div id='content'>
        </div>

        <div id='media_player' class='nav'>
            <div id='content_preview'>
                <p class='placeholder'>Media preview</p>
            </div>
            <div id='seek_bar'>
            </div>
            <div id='media_controls'>
                <p class='placeholder'>Media controls</p>
            </div>
        </div>
    </body>

</html>
