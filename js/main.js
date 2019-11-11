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

    document.querySelector(SELECTOR_LEFT_NAV_TOGGLE).onclick = function() {
        toggleLeftNav();
        resizeElems();
    }

    /* set up media player area handlers */
    document.querySelector(SELECTOR_MEDIA_PLAYER_FULLSCREEN).onclick = fullScreenHandler;
    document.querySelector(SELECTOR_MEDIA_PLAYER_RESIZE).onclick = mediaPlayerSizeHandler;

    document.querySelector(SELECTOR_MEDIA_PLAY_PAUSE).onclick = playPauseHandler;
    document.querySelector(SELECTOR_MEDIA_SHUFFLE).onclick = shuffleHandler;
    document.querySelector(SELECTOR_MEDIA_MUTE).onclick = muteHandler;
    document.querySelector(SELECTOR_MEDIA_REPEAT + " i").onclick = repeatHandler;

    document.querySelector(SELECTOR_MEDIA_PREVIOUS).onclick = playPrevious;
    document.querySelector(SELECTOR_MEDIA_NEXT).onclick = playNext;

    document.querySelector(SELECTOR_SEEK_BAR).onclick = seekHandler;

    fetchDBData();

})();
