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
        <script src='js/globals.js'></script>
        <script src='js/misc.js'></script>
        <script src='js/queue.js'></script>
        <script src='js/media_player.js'></script>
        <script src='js/content.js'></script>
        <script src='js/navigation.js'></script>
        <script src='js/ajax.js'></script>
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
                <form id='search_form'>
                    <i class="material-icons">search</i>
                    <input class="search_input" type="text">
                </form>
            </div>
            <div id='user_area'>
                <span><i class="material-icons">person</i></span>
            </div>
        </div>

        <div id='content'>
        </div>

        <div id='media_player'>
            <div id='seek_bar'>
            </div>
            <div id='content_preview'>
                <div id='top_controls' class="media_controls">
                    <button id="media_resize" class="media_controls"><i class="material-icons">close</i></button>
                    <button id="media_fullscreen" class="media_controls"><i class="material-icons">fullscreen</i></button>
                </div>
            </div>
            <div id='bottom_controls' class="media_controls">
                <button id="media_repeat"><i class="material-icons">repeat</i></button>
                <button id="media_previous"><i class="material-icons">skip_previous</i></button>
                <span id="media_time_elapsed"></span>
                <button id="media_play_pause"><i class="material-icons">pause_circle_outline</i></button>
                <span id="media_time_duration"></span>
                <button id="media_next"><i class="material-icons">skip_next</i></button>
                <button id="media_mute"><i class="material-icons">volume_up</i></button>
                <button id="media_shuffle"><i class="material-icons">shuffle</i></button>
            </div>
        </div>
    </body>

</html>
