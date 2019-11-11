'use strict';

const openLeftNav = function() { while(!toggleLeftNav()); };
const closeLeftNav = function() { while(toggleLeftNav()); };

const openTopNav = function() { while(!toggleTopNav()); };
const closeTopNav = function() { while(toggleTopNav()); };

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

    return open;
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

function toggleMediaPlayerSize(target = undefined)
{
    var media_player = document.querySelector('#media_player');
    var media_preview = document.querySelector('#media_player #content_preview');

    let all = [ PLAYER_SIZE_SMALL, PLAYER_SIZE_NORMAL, PLAYER_SIZE_WIDE, PLAYER_SIZE_LARGE, PLAYER_SIZE_FULL ];

    let cycle = [ PLAYER_SIZE_SMALL, PLAYER_SIZE_LARGE, PLAYER_SIZE_FULL ];

    let index;

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