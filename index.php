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

        <div id='media_overlay' hidden='true'>
            <button id="media_close" class="overlay_controls">&times;</button>
        </div>

        <div id='media_player' class='nav'>
            <div id='content_preview'>
                <p class='placeholder'>Media preview</p>
            </div>
            <div id='seek_bar'>
            </div>
            <div id='media_controls'>
                <button id="media_previous">Previous</button>
                <button id="media_play_pause">Play/Pause</button>
                <button id="media_next">Next</button>
                <button id="media_mute">Mute</button>
                <button id="media_size_large">Big</button>
                <button id="media_size_small">Small</button>
                <button id="media_size_normal">Normal</button>
            </div>
        </div>
    </body>

</html>
