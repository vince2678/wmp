'use strict';

const openLeftNav = function() { while(!toggleLeftNav()); };
const closeLeftNav = function() { while(toggleLeftNav()); };

const openTopNav = function() { while(!toggleTopNav()); };
const closeTopNav = function() { while(toggleTopNav()); };

function toggleLeftNav()
{
    var open;

    var left_nav = document.querySelector(SELECTOR_LEFT_NAV);
    var media_content = document.querySelector(SELECTOR_CONTENT);

    var btn = document.querySelector(SELECTOR_LEFT_NAV_TOGGLE);

    if(left_nav.classList.contains(NAV_CLOSED))
    {
        open = true;

        left_nav.classList.remove(NAV_CLOSED);
        left_nav.classList.add(NAV_OPEN);

        media_content.className = PLAYER_SIZE_NORMAL;
        btn.innerHTML = "&times;";
    }
    else
    {
        open = false;

        left_nav.classList.remove(NAV_OPEN);
        left_nav.classList.add(NAV_CLOSED);

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

    var top_nav = document.querySelector(SELECTOR_TOP_NAV);
    var left_nav = document.querySelector(SELECTOR_LEFT_NAV);
    var media_content = document.querySelector(SELECTOR_CONTENT);

    if (top_nav.classList.contains(NAV_CLOSED))
    {
        open = true;

        top_nav.classList.remove(NAV_CLOSED);
        top_nav.classList.add(NAV_OPEN);

        if (left_nav.clientWidth == 0)
            media_content.className = PLAYER_SIZE_WIDE;
        else
            media_content.className = PLAYER_SIZE_NORMAL;
    }
    else
    {
        open = false;
        top_nav.classList.remove(NAV_OPEN);
        top_nav.classList.add(NAV_CLOSED);

        media_content.className = PLAYER_SIZE_LARGE;
    }

    return open;
}

function resizeElems()
{
    var top_nav = document.querySelector(SELECTOR_TOP_NAV);
    var left_nav = document.querySelector(SELECTOR_LEFT_NAV);

    var media_content = document.querySelector(SELECTOR_CONTENT);
    var media_player = document.querySelector(SELECTOR_MEDIA_PLAYER);
    var media_preview = document.querySelector(SELECTOR_CONTENT_PREVIEW);

    left_nav.style.height = (window.innerHeight - top_nav.offsetHeight - media_player.offsetHeight) + 'px';

    media_content.style.width = (window.innerWidth - left_nav.offsetWidth) + 'px';
    media_content.style.height = left_nav.style.height;

    switch(media_player.className)
    {
        case PLAYER_SIZE_SMALL:
        {
            let seek_bar = document.querySelector(SELECTOR_SEEK_BAR);

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
    var media_player = document.querySelector(SELECTOR_MEDIA_PLAYER);
    var media_preview = document.querySelector(SELECTOR_CONTENT_PREVIEW);

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

    let fullscreen_icon = document.querySelector(SELECTOR_MEDIA_PLAYER_FULLSCREEN + ' i');
    let resize_icon = document.querySelector(SELECTOR_MEDIA_PLAYER_RESIZE + ' i');

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
    var libraryListing = document.querySelector(SELECTOR_LIBRARY_LIST);
    var mediaListing = document.querySelector(SELECTOR_MEDIA_TYPE_LIST);

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

            let active = document.querySelector(SELECTOR_ACTIVE_LIST_ITEM);

            if (active)
                active.classList.remove("active");

            this.classList.add("active");
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

            let active = document.querySelector(SELECTOR_ACTIVE_LIST_ITEM);

            if (active)
                active.classList.remove("active");

            this.classList.add("active");
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
    function getClickHandler(group, value) {
        return function()
        {
            populateContentArea(group, value);

            let active = document.querySelector(SELECTOR_ACTIVE_LIST_ITEM);

            if (active)
                active.classList.remove("active");

            this.classList.add("active");
        };
    }

    var playlistListing = document.querySelector(SELECTOR_PLAYLIST_LIST);

    clearChildren(playlistListing);

    var playlists = global_player_state['playlist'];

    for(let playlist of playlists)
    {
        let entry = document.createElement('span');

        entry.setAttribute('id', 'playlist');
        entry.innerHTML = '<i class="material-icons">playlist_play</i> ' + playlist['name'];

        entry.onclick = getClickHandler('playlist', playlist['playlist_id']);

        playlistListing.appendChild(entry);
    }

    let queue_entry = document.createElement('span');

    queue_entry.setAttribute('id', 'play_queue');
    queue_entry.innerHTML = '<i class="material-icons">queue_music</i> Play Queue';

    queue_entry.onclick = getClickHandler('queue', null);

    playlistListing.appendChild(queue_entry);

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

    var content_area = document.querySelector(SELECTOR_CONTENT);

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
                + " to the " + group + " to get started."
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

function getFilterFn(table, column)
{
    return function(data)
    {
        if (!data)
            return;

        let ret = global_player_state[table].filter(
            function(e, i, a)
            { return (e[column] == data); }
        )[0];

        return ret;
    }
}

function getMusicContent(queue)
{
    var column_map = {
                   'album_artist': {'name': 'Album&nbsp;Artist'},
                   'play_count': {'name': 'Play Count'},
                   'duration': {'name': 'Length', 'callback': formatTime }

                };

    var columns = ['title', 'artist', 'album_artist', 'album', 'genre', 'duration'];

    return getContentList(queue, columns, column_map);
}

function getVideoContent(queue)
{
    var column_map = {
                   'genre': {'callback': getFilterFn('genre', 'genre_id')},
                   'play_count': {'name': 'Play Count'},
                   'duration': {'name': 'Length', 'callback': formatTime }
                };

    var columns = ['title', 'genre', 'play_count', 'duration'];

    return getContentList(queue, columns, column_map);
}

function getPhotoContent(queue)
{
    var column_map = {
                   'album': {'callback': getFilterFn('photo_album', 'album_id')},
                };

    var columns = ['title', 'album'];

    return getContentList(queue, columns, column_map);
}

function getContentList(media_ids, columns, column_map = undefined)
{
    if (media_ids.length == 0)
        return null;

    var media_row = getFilterFn('media', 'media_id')(media_ids[0]);

    var source;

    if (media_row['library_type'] == 'music')
        source = global_player_state['track'];
    else if (media_row['library_type'] == 'video')
        source = global_player_state['video'];
    else
        source = global_player_state['photo'];

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

        if (column_map && column_map[column] && column_map[column]['name'])
            heading.innerHTML = column_map[column]['name'];
        else
            heading.innerHTML = column;

        header.appendChild(heading);
    }

    for (let i = 0; i < media_ids.length; i++)
    {
        let media_id = media_ids[i];

        media_row = source.filter(
            function(e, i, a) { return (e['media_id'] == media_id); }
        )[0];

        /* should not happen normally */
        if (!media_row)
        {
            console.log("Failed to create row for media_id: " + media_id);
            media_ids.splice(i, 1); //remove media_id from queue
            continue;
        }

        let row = document.createElement('tr');
        row.setAttribute('id', 'content_table_row');

        row.onclick = function() {
            let active = document.querySelector(SELECTOR_ACTIVE_CONTENT_ITEM);

            if (active)
                active.classList.remove("active");

            this.classList.add("active");
        }, row;

        /* play button */
        let play_btn = document.createElement('button');
        let icon = document.createElement('i');

        icon.setAttribute('class', 'material-icons');
        icon.innerText = 'play_arrow';

        play_btn.onclick = function(){
            playMedia(media_id, media_ids);
        };

        play_btn.appendChild(icon);
        row.appendChild(play_btn);

        for (let column of columns)
        {
            let data = document.createElement('td');

            let column_data;

            if (media_row[column] != null)
            {
                if (column_map && column_map[column] && column_map[column]['callback'])
                    column_data = column_map[column]['callback'](media_row[column]);
                else
                    column_data = media_row[column];

                if (column_data)
                    data.innerText = column_data;
                else
                    data.innerText = "";

            }
            row.appendChild(data);
        }
        media_table.appendChild(row);
    }

    return media_table;
}