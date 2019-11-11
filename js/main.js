'use strict';

function fetchDBData()
{
    let tables = ["media", "library", "playlist", "playlist_media", "genre", "track", "photo", "video", "photo_album"];
    let callbacks = {"library": populateMediaLibraries, "playlist": populatePlaylists};

    for (let table of tables)
    {
        let callback = function(result) {
            try
            {
                global_player_state[table] = JSON.parse(result);
            }
            catch(err)
            {
                global_player_state[table] = null;
                console.log("Failed to parse JSON: " + err.message);
            }
            finally
            {
                if (callbacks[table])
                    callbacks[table]();
            }
        }
        asyncGetUrlResponse("api/get/row/" + table, callback);
    }
}

(function()
{
    window.onresize = resizeElems;

    //set content area dimensions
    resizeElems();

    document.querySelector('.leftnavbtn').onclick = function() {
        toggleLeftNav();
        resizeElems();
    }

    /* set up media player area handlers */
    document.querySelector('#media_player #media_fullscreen').onclick = fullScreenHandler;
    document.querySelector('#media_player #media_resize').onclick = mediaPlayerSizeHandler;

    document.querySelector('#bottom_controls #media_play_pause').onclick = playPauseHandler;
    document.querySelector("#bottom_controls #media_shuffle").onclick = shuffleHandler;
    document.querySelector('#bottom_controls #media_mute').onclick = muteHandler;
    document.querySelector('#bottom_controls #media_repeat i').onclick = repeatHandler;

    document.querySelector('#bottom_controls #media_previous').onclick = playPrevious;
    document.querySelector('#bottom_controls #media_next').onclick = playNext;

    document.querySelector('#media_player #seek_bar').onclick = seekHandler;

    fetchDBData();

})();
