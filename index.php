<?php
include "helpers.php";
include "cfg.php";
include "db.php";
include "cookies.php";
include "api.php";
include "theme.php";
?>

<!DOCTYPE html>
<html lang="en" dir="ltr">

    <head>
        <meta charset="utf8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <?php import_font('Ubuntu') ?> 
        <?php import_theme() ?>
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
            <button class="leftnavbtn"></button>
            <div id='search'>
                <p class='placeholder'>Search</p>
            </div>
            <div id='user_area'>
                <p class='placeholder'>User area</p>
            </div>
        </div>

        <div id='content'>
        </div>
    </body>

</html>
