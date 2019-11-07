'use strict';

const PLAYER_SIZE_HIDDEN = "hidden"; //player not visible
const PLAYER_SIZE_SMALL = "small"; //small preview in bottom/left bar
const PLAYER_SIZE_NORMAL = "normal"; //all bars open
const PLAYER_SIZE_WIDE = "wide"; //no left bar
const PLAYER_SIZE_LARGE = "large"; //no top, left bar
const PLAYER_SIZE_FULL = "fullscreen";

const NAV_OPEN = "open";
const NAV_CLOSED = "closed";

var global_player_state = { };

function toggleLeftNav()
{
    var open;

    var left_nav = document.querySelector('#left_nav');
    var media_content = document.querySelector('#content');

    var btn = document.querySelector('.leftnavbtn');

    if(left_nav.className == NAV_CLOSED)
    {
        open = true;

        left_nav.className = NAV_OPEN;
        media_content.className = PLAYER_SIZE_NORMAL;
        btn.innerHTML = "&times;";
    }
    else
    {
        open = false;

        left_nav.className = NAV_CLOSED;

        if (top_nav.clientHeight == 0)
            media_content.className = PLAYER_SIZE_LARGE;
        else
            media_content.className = PLAYER_SIZE_WIDE;

        btn.innerHTML = "&plus;";
    }

    resizeElems();

    return open;
}

function toggleTopNav()
{
    var open;

    var top_nav = document.querySelector('#top_nav');
    var left_nav = document.querySelector('#left_nav');
    var media_content = document.querySelector('#content');

    if (top_nav.className == NAV_CLOSED)
    {
        open = true;

        top_nav.className = NAV_OPEN;

        if (left_nav.clientWidth == 0)
            media_content.className = PLAYER_SIZE_WIDE;
        else
            media_content.className = PLAYER_SIZE_NORMAL;
    }
    else
    {
        open = false;
        top_nav.className = NAV_CLOSED;
        media_content.className = PLAYER_SIZE_LARGE;
    }

    resizeElems();

    return open;
}

function isFullScreen()
{
    if (document.fullscreenElement == document.querySelector('body'))
        return true;

    return false;
}

function toggleMediaPlayerSize(target = undefined)
{
    var media_player = document.querySelector('#media_player');
    var media_preview = document.querySelector('#media_player #content_preview');

    let all = [ PLAYER_SIZE_SMALL, PLAYER_SIZE_NORMAL, PLAYER_SIZE_WIDE, PLAYER_SIZE_LARGE, PLAYER_SIZE_FULL ];

    let cycle = [ PLAYER_SIZE_SMALL, PLAYER_SIZE_LARGE, PLAYER_SIZE_FULL ];

    let index;

    let openLeftNav = function() { while(!toggleLeftNav()); };
    let closeLeftNav = function() { while(toggleLeftNav()); };

    let openTopNav = function() { while(!toggleTopNav()); };
    let closeTopNav = function() { while(toggleTopNav()); };

    if (target)
    {
        console.log("Target specified: " + target);
    }
    else if ((index = cycle.indexOf(media_player.className)) > -1)
    {
        let targetIndex = (index - 1);

        if (targetIndex < 0)
            target = PLAYER_SIZE_HIDDEN;
        else
            target = cycle[targetIndex];
    }
    else if (all.indexOf(media_player.className) > -1)
    {
        target = PLAYER_SIZE_SMALL;
    }

    let fullscreen_icon = document.querySelector('#media_player #media_fullscreen i');
    let resize_icon = document.querySelector('#media_player #media_resize i');

    switch(target)
    {
        case PLAYER_SIZE_FULL:
        {
            try
            {
                if (!isFullScreen())
                    document.querySelector('body').requestFullscreen();
            }
            catch(err)
            {
                console.log("Failed to set fullscreen: " + err.message);
            }

            closeLeftNav();
            closeTopNav();

            resize_icon.innerHTML = 'keyboard_arrow_down';
            fullscreen_icon.innerHTML = 'fullscreen_exit';

            break;
        }
        case PLAYER_SIZE_LARGE:
        {
            if (isFullScreen())
                document.exitFullscreen();

            closeLeftNav();
            closeTopNav();

            resize_icon.innerHTML = 'keyboard_arrow_down';
            fullscreen_icon.innerHTML = 'fullscreen';

            break;
        }
        case PLAYER_SIZE_WIDE:
        {
            closeLeftNav();
            openTopNav();

            resize_icon.innerHTML = 'keyboard_arrow_down';
            fullscreen_icon.innerHTML = 'fullscreen';

            break;
        }
        case PLAYER_SIZE_HIDDEN:
        {
            stopMediaPlayback();
        }
        case PLAYER_SIZE_NORMAL:
        case PLAYER_SIZE_SMALL:
        {
            openLeftNav();
            openTopNav();

            resize_icon.innerHTML = 'close';
            fullscreen_icon.innerHTML = 'fullscreen';

            break;
        }
        default:
        {
            break;
        }
    }

    media_player.className = target;
    media_preview.className = target;

    resizeElems();
}

function resizeElems()
{
    var top_nav = document.querySelector('#top_nav');
    var left_nav = document.querySelector('#left_nav');

    var media_content = document.querySelector('#content');
    var media_player = document.querySelector('#media_player');
    var media_preview = document.querySelector('#media_player #content_preview');

    left_nav.style.height = (window.innerHeight - top_nav.offsetHeight - media_player.offsetHeight) + 'px';

    media_content.style.width = (window.innerWidth - left_nav.offsetWidth) + 'px';
    media_content.style.height = left_nav.style.height;

    switch(media_player.className)
    {
        case PLAYER_SIZE_SMALL:
        {
            let seek_bar = document.querySelector('#media_player #seek_bar');

            /* set 16:9 ratio for preview dimensions and make clearance for seek bar on height */
            let preview_height = parseInt(media_player.clientHeight - (2 * seek_bar.clientHeight));
            let preview_width = parseInt(preview_height / 9 * 16);

            media_preview.style.height =  preview_height + 'px';
            media_preview.style.width = preview_width + 'px';
            break;
        }
        case PLAYER_SIZE_FULL:
        {
            media_preview.style.height = (window.innerHeight - media_player.clientHeight) + 'px';
            media_preview.style.width = '100%';
            break;
        }
        default:
        {
            media_preview.style.height = media_content.clientHeight + 'px';
            media_preview.style.width = media_content.clientWidth + 'px';
            break;
        }
    }
}

/* populate the media and library sections */
function populateMediaLibraries()
{
    var libraryListing = document.querySelector('#left_nav #libraries #listing');
    var mediaListing = document.querySelector('#left_nav #media_groups #listing');

    clearChildren(libraryListing);
    clearChildren(mediaListing);

    var types = new Set();

    var libraries = global_player_state['library'];

    for (let library of libraries)
    {
        let entry = document.createElement('span');

        entry.setAttribute('id', 'library');

        if ((library['type'] == "photo") || (library['type'] == "video"))
            entry.innerHTML = '<i class="material-icons">'+ library['type'] + '_library</i> ' + library['name'];
        else
            entry.innerHTML = '<i class="material-icons">library_music</i> ' + library['name'];

        entry.onclick = function() {
            populateContentArea('library', library['library_id']);

            let active = document.querySelector("#listing > span.active");

            if (active)
                active.className = "";

            this.setAttribute("class", "active");
        }, entry;

        libraryListing.appendChild(entry);

        types.add(library['type']);
    }

    let entry = document.createElement('span');

    entry.setAttribute('id', 'add_library');

    entry.innerHTML = '<i class="material-icons">playlist_add</i> Add Library';

    libraryListing.appendChild(entry);

    for (let type of types)
    {
        let entry = document.createElement('span');

        entry.setAttribute('id', 'media');
        entry.innerHTML = type;

        if ((type == "photo") || (type == "video"))
            entry.innerHTML = '<i class="material-icons">'+ type + '_library</i> ' + type;
        else
            entry.innerHTML = '<i class="material-icons">library_music</i> ' + type;

        entry.onclick = function() {
            populateContentArea('type', type);

            let active = document.querySelector("#listing > span.active");

            if (active)
                active.className = "";

            this.setAttribute("class", "active");
        }, entry;

        mediaListing.appendChild(entry);
    }

    /* hide media section in left nav */
    if (mediaListing.childElementCount == 0)
        mediaListing.parentElement.hidden = true;

}

/* populate the playlist sections */
function populatePlaylists()
{
    var playlistListing = document.querySelector('#left_nav #playlists #listing');

    clearChildren(playlistListing);

    var playlists = global_player_state['playlist'];

    for(let playlist of playlists)
    {
        let entry = document.createElement('span');

        entry.setAttribute('id', 'playlist');
        entry.innerHTML = '<i class="material-icons">playlist_play</i> ' + playlist['name'];

        entry.onclick = function() {
            populateContentArea('playlist', playlist['playlist_id']);

            let active = document.querySelector("#listing > span.active");


            if (active)
                active.className = "";

            this.setAttribute("class", "active");
        }, entry;

        playlistListing.appendChild(entry);
    }

    let entry = document.createElement('span');

    entry.setAttribute('id', 'add_playlist');
    entry.innerHTML = '<i class="material-icons">playlist_add</i> ' + "Add playlist";

    playlistListing.appendChild(entry);
}

function getMediaQueue(group, value)
{
    var media = global_player_state['media'];

    var queue = [];
    var type = null;

    function filterMedia(constraint) {
        for (let medium of media)
        {
            let match = true;

            for (let key in constraint)
            {
                if (medium[key] != constraint[key])
                {
                    match = false;
                    break;
                }
            }

            if (match)
                queue.push(medium['media_id']);
        }
    }

    switch(group)
    {
        case 'playlist':
        {
            let playlist = global_player_state['playlist'].filter(
                function(e, i, a)
                { return (e['playlist_id'] == value); }
            )[0];

            if (playlist['playlist_id'] !== undefined)
                type = playlist['type'];

            let playlist_media = global_player_state['playlist_media'].filter(
                function(e, i, a)
                { return (e['playlist_id'] == value); }
            );

            //TODO: Incorporate rank into table ordering
            for (let playlist_item of playlist_media)
            {
                queue.push(playlist_item['media_id']);
            }

            break;
        }
        case 'library':
        {
            let library = global_player_state['library'].filter(
                function(e, i, a)
                { return (e['library_id'] == value); }
            )[0];


            if (library['library_id'] !== undefined)
                type = library['type'];

            filterMedia({'library_id':value});
            break;
        }
        case 'type':
        {
            filterMedia({'library_type':value});
            type = value;
            break;
        }
        default:
        {
            console.log("Unknown group selected");
            break;
        }
    }

    return {'queue': queue, 'type': type};
}

function rescanLibrary(id)
{
    let callback = function(json)
    {
        let result;

        try {
            result = JSON.parse(json);
        }
        catch(err) {
            console.log("Failed to parse: " + json);
        }
        finally
        {
            let btn = document.querySelector("button#library_rescan");
            btn.setAttribute("class", "scan-" + result['status']);
        }
    }

    asyncGetUrlResponse("api/force-scan/library/id/" + id, callback);
}

function createContentHeader(group, value)
{
    let actions = [];

    if (group == "library")
        actions = ["rescan", "edit", "delete", "view", "sort"];
    else if (group == "playlist")
        actions = ["add", "edit", "delete", "view", "sort"];
    else //type
        actions = ["view", "sort"];

    let callbacks = {
        "rescan": function() {
            rescanLibrary(value);
        }
    }


    let header = document.createElement('div');
    header.setAttribute("class", "content_page_header");
    header.setAttribute("id", group + "_page_header");

    for (let action of actions)
    {
        let btn = document.createElement('button');
        btn.setAttribute("id", group + "_" + action);
        btn.innerText = action;

        if (callbacks[action])
            btn.onclick = callbacks[action];

        header.appendChild(btn);
    }

    return header;
}

function populateContentArea(group, value)
{
    var play_queue = getMediaQueue(group, value);

    var queue = play_queue['queue'];
    var type = play_queue['type'];

    var content_area = document.querySelector('#content');

    clearChildren(content_area);

    var content;

    let header = createContentHeader(group, value);

    if (header)
        content_area.appendChild(header);

    if (queue.length == 0)
    {
        //no matching media, no media in playlist/media group/library
        content = document.createElement('p');
        content.setAttribute('id', 'no_content_msg');

        if (group == "playlist")
        {
            content.innerHTML = "This playlist is currently empty";
        }
        else
        {
            content.innerHTML = "It's lonely here. Add some files"
                + " to the library to get started."
        }
    }
    else
    {
        switch(type)
        {
            case 'music':
            {
                content = getMusicContent(queue);
                break;
            }
            case 'video':
            {
                content = getVideoContent(queue);
                break;
            }
            case 'photo':
            {
                content = getPhotoContent(queue);
                break;
            }
            default:
            {
                console.log("Invalid type");
                break;
            }
        }
    }

    if (content)
        content_area.appendChild(content);

}

function getMusicContent(queue)
{
    return getMusicList(queue);
}

function getVideoContent(ids)
{
    return getVideoList(ids);
}

function getPhotoContent(ids)
{
    return getPhotoList(ids);
}

function getMusicList(queue)
{
    var music = global_player_state['track'];

    var column_map = {
                   'title': 'Title',
                   'artist': 'Artist',
                   'album_artist': 'Album&nbsp;Artist',
                   'album': 'Album',
                   'genre': 'Genre',
                   'play_count': 'Play Count',
                   'duration': 'Length'
                };

    var columns = ['title', 'artist', 'album_artist', 'album', 'genre', 'duration'];

    var media_table = document.createElement('table');
    var header = document.createElement('tr');

    media_table.setAttribute('class', 'content_table');
    header.setAttribute('class', 'content_table_header');

    media_table.appendChild(header);

    /* play button */
    let heading = document.createElement('th');
    header.appendChild(heading);

    for (let column of columns)
    {
        let heading = document.createElement('th');
        heading.innerHTML = column_map[column];
        header.appendChild(heading);
    }

    for (let track of music)
    {
        if (queue.indexOf(track["media_id"]) == -1)
            continue;

        let row = document.createElement('tr');
        row.setAttribute('id', 'content_table_row');

        row.onclick = function() {
            let active = document.querySelector("#content_table_row.active");

            if (active)
                active.className = "";

            this.setAttribute("class", "active");
        }, row;

        /* play button */
        let play_btn = document.createElement('button');

        play_btn.innerHTML = '<i class="material-icons">play_arrow</i>';

        play_btn.onclick = function(){
            playMedia(track['media_id'], queue);
        };

        row.appendChild(play_btn);

        for (let column of columns)
        {
            let data = document.createElement('td');

            if (track[column] != null)
            {
                if (column == "duration")
                    data.innerHTML = formatTime(track[column]);
                else
                    data.innerHTML = track[column];
            }
            row.appendChild(data);
        }
        media_table.appendChild(row);
    }

    /* return table only if there are tracks to list */
    if (media_table.childElementCount > 1)
        return media_table;

    media_table.remove();
    return null;
}

function getVideoList(queue)
{
    var videos = global_player_state['video'];

    var column_map = {
                   'title': 'Title',
                   'genre': 'Genre',
                   'play_count': 'Play Count',
                   'duration': 'Length'
                };

    var columns = ['title', 'genre', 'play_count', 'duration'];

    var media_table = document.createElement('table');
    var header = document.createElement('tr');

    media_table.setAttribute('class', 'content_table');
    header.setAttribute('class', 'content_table_header');

    media_table.appendChild(header);

    /* play button */
    let heading = document.createElement('th');
    header.appendChild(heading);

    for (let column of columns)
    {
        let heading = document.createElement('th');
        heading.innerHTML = column_map[column];
        header.appendChild(heading);
    }

    for (let video of videos)
    {
        if (queue.indexOf(video["media_id"]) == -1)
            continue;

        let row = document.createElement('tr');
        row.setAttribute('id', 'content_table_row');

        row.onclick = function() {
            let active = document.querySelector("#content_table_row.active");

            if (active)
                active.className = "";

            this.setAttribute("class", "active");
        }, row;

        /* play button */
        let play_btn = document.createElement('button');

        play_btn.innerHTML = '<i class="material-icons">play_arrow</i>';

        play_btn.onclick = function(){
            playMedia(video['media_id'], queue);
        };

        row.appendChild(play_btn);

        for (let column of columns)
        {
            let data = document.createElement('td');

            if (video[column] != null)
            {

                if (column == "duration")
                {
                    data.innerHTML = formatTime(video[column]);
                }
                else if (column == "genre")
                {
                    if (!video['genre_id'])
                        continue;

                    let genre = global_player_state['genre'].filter(
                        function(e, i, a)
                        { return (e['genre_id'] == video['genre_id']); }
                    )[0];

                    data.innerHTML = genre['name'];
                }
                else
                    data.innerHTML = video[column];
            }
            row.appendChild(data);
        }
        media_table.appendChild(row);
    }

    /* return table only if there are tracks to list */
    if (media_table.childElementCount > 1)
        return media_table;

    media_table.remove();
    return null;
}

function getPhotoList(queue)
{
    var photos = global_player_state['photo'];

    var column_map = {
                   'title': 'Title',
                   'album': 'Album',
                };

    var columns = ['title', 'album'];

    var media_table = document.createElement('table');
    var header = document.createElement('tr');

    media_table.setAttribute('class', 'content_table');
    header.setAttribute('class', 'content_table_header');

    media_table.appendChild(header);

    /* play button */
    let heading = document.createElement('th');
    header.appendChild(heading);

    for (let column of columns)
    {
        let heading = document.createElement('th');
        heading.innerHTML = column_map[column];
        header.appendChild(heading);
    }

    for (let photo of photos)
    {
        if (queue.indexOf(photo["media_id"]) == -1)
            continue;

        let row = document.createElement('tr');
        row.setAttribute('id', 'content_table_row');

        row.onclick = function() {
            let active = document.querySelector("#content_table_row.active");

            if (active)
                active.className = "";

            this.setAttribute("class", "active");
        }, row;

        /* play button */
        let play_btn = document.createElement('button');

        play_btn.innerHTML = '<i class="material-icons">play_arrow</i>';

        play_btn.onclick = function(){
            playMedia(photo['media_id'], queue);
        };

        row.appendChild(play_btn);

        for (let column of columns)
        {
            let data = document.createElement('td');

            if (photo[column] != null)
            {
                if (column == "album")
                {
                    if (!photo['album_id'])
                        continue;

                    let album = global_player_state['photo_album'].filter(
                        function(e, i, a)
                        { return (e['album_id'] == photo['album_id']); }
                    )[0];

                    data.innerHTML = formatTime(album['name']);
                }
                else
                    data.innerHTML = photo[column];
            }
            row.appendChild(data);
        }
        media_table.appendChild(row);
    }

    /* return table only if there are tracks to list */
    if (media_table.childElementCount > 1)
        return media_table;

    media_table.remove();
    return null;
}

function updateSeekBar(currentTime, duration)
{
    if (duration < 1)
        return;

    function pcToPx(size, max)
    {
        let pcRegexp = /^[0-9]{1,3}%$/;
        let pxRegexp = /^[0-9]*px$/;

        if (pxRegexp.exec(size))
        {
            return parseInt(size);
        }
        else if (pcRegexp.exec(size))
        {
            return (parseInt(size) / 100.0) * max;
        }
        else
            return parseInt(size);
    }

    const seek_bar = document.querySelector('#media_player #seek_bar');

    clearChildren(seek_bar);

    var canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    seek_bar.appendChild(canvas);

    canvas.width = pcToPx(seek_bar.clientWidth, window.innerWidth);
    canvas.height = pcToPx(seek_bar.clientHeight, window.innerWidth);

    const percent_done = (currentTime/duration);
    const width = parseInt(canvas.width  * percent_done);

    ctx.lineWidth = canvas.height;
    ctx.strokeStyle = 'red';
    ctx.lineCap = 'round';

    const x = 0;
    const y = 0;

    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.stroke();
}

function playMedia(media_id, queue = null)
{
    let media = global_player_state['media'].filter(
        function(e, i, a)
        { return (e['media_id'] == media_id); }
    )[0];

    var element;

    switch (media['library_type'])
    {
        case "music":
        {
            element = 'audio';
            toggleMediaPlayerSize(PLAYER_SIZE_SMALL);
            break;
        }
        case "video":
        {
            element = 'video';
            toggleMediaPlayerSize(PLAYER_SIZE_LARGE);
            break;
        }
        case "photo":
        {
            element = 'img';
            toggleMediaPlayerSize(PLAYER_SIZE_LARGE);
            break;
        }
        default:
        {
            console.log("Unimplemented support for type");
            return;
        }
    }

    if (queue)
        global_player_state['queue'] = queue;

    global_player_state['playing'] = media['media_id'];

    stopMediaPlayback();

    var media_preview = document.querySelector('#media_player #content_preview');
    var media_element = document.createElement(element);

    media_element.setAttribute('class', 'media_element');
    media_element.setAttribute('id', element + '_element');

    media_element.controls = true;
    media_element.autoplay = true;

    media_element.ontimeupdate = function () {
        updateSeekBar(media_element.currentTime, media_element.duration);
    };

    media_element.onratechange = function() {
        console.log('The playback rate changed.');
    };

    if (element == 'img')
    {
        media_element.setAttribute('src', 'api/get/raw/media/id/' + media_id);

        let photos = global_player_state['photo'];

        for (let photo of photos)
        {
            if (photo['media_id'] == media_id)
                media_element.setAttribute('alt', photo['title']);
        }
    }
    else
    {
        let media_src = document.createElement('source');
        media_src.setAttribute('src', 'api/get/raw/media/id/' + media_id);
        media_element.appendChild(media_src);

        media_element.onended = playNext;

        if (element == 'audio')
        {
            // get album art;
            let url = 'api/get/album_art/id/' + media_id;
            let mime = syncGetUrlResponseHeader(url, 'Content-Type');

            if (mime != "text/html")
            {
                let image = document.createElement('img');
                image.setAttribute('src', url);
                image.setAttribute('alt', 'Album art');
                media_preview.appendChild(image);
            }
        }
    }

    media_preview.appendChild(media_element);

}

function playPrevious()
{
    var prev;

    if (global_player_state['playing'])
        prev = global_player_state['playing'];

    if (global_player_state['queue'])
    {
        let queue = global_player_state['queue'];
        let index = queue.length - 1;

        if (global_player_state['shuffle'])
        {
            index = Math.floor(Math.random() * queue.length);
            console.log("Shuffle set, picked media_id: " + queue[index]);
        }
        else if (prev && (index = queue.indexOf(prev)) !== -1)
        {
            index = (index - 1) % queue.length;

            // loop around queue
            if (index < 0)
                index = queue.length + index;
        }

        prev = queue[index];
    }

    if (prev)
        playMedia(prev);
}

function playNext()
{
    var next;

    if (global_player_state['playing'])
        next = global_player_state['playing'];


    if (global_player_state['queue'])
    {
        let queue = global_player_state['queue'];
        let index = 0;

        // loop around queue
        if (global_player_state['shuffle'])
        {
            index = Math.floor(Math.random() * queue.length);
            console.log("Shuffle set, picked media_id: " + queue[index]);
        }
        else if (next && (index = queue.indexOf(next)) !== -1)
            index = (index + 1) % queue.length;

        next = queue[index];
    }

    if (next)
        playMedia(next);
}



function stopMediaPlayback()
{
    var media_preview = document.querySelector('#media_player #content_preview');
    var seek_bar = document.querySelector('#media_player #seek_bar');

    var media_element = document.querySelector('#content_preview .media_element');

    if (media_element)
        media_element.ontimeupdate = undefined;

    var i = 0;
    var length = media_preview.children["length"];

    /* removal of elements from children affects item indices,
       so some trickery is needed to loop through all elements
       while modifying the collection
    */
    while (i < length)
    {
        let child = media_preview.children[i];

        if (child == undefined)
            break;
        else if (child.id !== "top_controls")
        {
            media_preview.removeChild(child);
            length = length - 1;
        }
        else
        {
            i = i + 1;
        }
    }

    clearChildren(seek_bar);
}

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

    document.querySelector('.leftnavbtn').onclick = toggleLeftNav;

    /* set handlers for media player buttons */
    document.querySelector('#media_player #media_fullscreen').onclick = function() {
       if (isFullScreen())
            toggleMediaPlayerSize();
        else
            toggleMediaPlayerSize(PLAYER_SIZE_FULL);
    }

    document.querySelector('#media_player #media_resize').onclick = function() {
        toggleMediaPlayerSize();
    }

    /* set up play button handler */
    document.querySelector('#bottom_controls #media_play_pause').onclick = function() {
        let media_element = document.querySelector('#content_preview .media_element');

        if (media_element.paused)
        {
            if (media_element.play)
            {
                media_element.play();
                this.innerHTML = '<i class="material-icons">pause_circle_outline</i>';
            }
        }
       else if (media_element.pause)
        {
            media_element.pause();
            this.innerHTML = '<i class="material-icons">play_circle_outline</i>';
        }
    }

    document.querySelector("#bottom_controls #media_shuffle").onclick = function() {
        if (global_player_state['shuffle'])
        {
            global_player_state['shuffle'] = false;
            this.classList.remove("shuffle-active");
        }
        else
        {
            global_player_state['shuffle'] = true;
            this.classList.add("shuffle-active");
        }
    }

    /* set up mute button handler */
    document.querySelector('#bottom_controls #media_mute').onclick = function() {
        let media_element = document.querySelector('#content_preview .media_element');

        if (media_element.muted)
        {
            media_element.muted = false;
            this.innerHTML = '<i class="material-icons">volume_up</i>';
        }
        else if (media_element.muted == false)
        {
            media_element.muted = true;
            this.innerHTML = '<i class="material-icons">volume_off</i>';
        }
    }

    document.querySelector('#bottom_controls #media_previous').onclick = playPrevious;
    document.querySelector('#bottom_controls #media_next').onclick = playNext;

    fetchDBData();

})();
