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
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <?php import_font('Ubuntu') ?> 
        <?php import_theme() ?>
        <script src='js/misc.js'></script>
        <script src='js/ajax.js'></script>
        <script src='js/media_player.js'></script>
        <script src='js/interface.js' type='module'></script>
    </head>

    <body>
        <div id='left_nav'>
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

        <div id='top_nav'>
            <button class="leftnavbtn">&times;</button>
            <div id='search'>
                <p class='placeholder'>Search</p>
            </div>
            <div id='user_area'>
                <p class='placeholder'>User area</p>
            </div>
        </div>

        <div id='content'>
        </div>

        <div id='media_player'>
            <div id='seek_bar'>
            </div>
            <div id='content_preview'>
                <div id='top_controls' class="media_controls">
                    <button id="media_resize" class="media_controls">&times;</button>
                    <button id="media_fullscreen" class="media_controls">&gt;&lt;</button>
                </div>
            </div>
            <div id='bottom_controls' class="media_controls">
                <button id="media_previous">Previous</button>
                <button id="media_play_pause">Play/Pause</button>
                <button id="media_next">Next</button>
                <button id="media_mute">Mute</button>
            </div>
        </div>
    </body>

</html>
