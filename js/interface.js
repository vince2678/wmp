'use strict';

const PLAYER_SIZE_HIDDEN = "hidden"; //player not visible
const PLAYER_SIZE_SMALL = "small"; //small preview in bottom/left bar
const PLAYER_SIZE_NORMAL = "normal"; //all bars open
const PLAYER_SIZE_WIDE = "wide"; //no left bar
const PLAYER_SIZE_LARGE = "large"; //no top, left bar
const PLAYER_SIZE_FULL = "fullscreen";

const NAV_OPEN = "open";
const NAV_CLOSED = "closed";

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

            break;
        }
        case PLAYER_SIZE_LARGE:
        {
            if (isFullScreen())
                document.exitFullscreen();

            closeLeftNav();
            closeTopNav();

            break;
        }
        case PLAYER_SIZE_WIDE:
        {
            closeLeftNav();
            openTopNav();

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
function populateMediaLibraries(libraryJSON)
{
    var libraryListing = document.querySelector('#left_nav #libraries #listing');
    var mediaListing = document.querySelector('#left_nav #media_groups #listing');

    var types = new Set();

    var libraries = JSON.parse(libraryJSON);

    for (let library of libraries)
    {
        let entry = document.createElement('span');

        entry.setAttribute('class', 'library');
        entry.innerHTML = library['name'];

        entry.onclick = function() {
            populateContentArea('library', library['library_id']);
        };

        libraryListing.appendChild(entry);

        types.add(library['type']);
    }

    let entry = document.createElement('span');

    entry.setAttribute('id', 'add_library');
    entry.innerHTML = "&plus; Add Library";

    libraryListing.appendChild(entry);

    for (let type of types)
    {
        let entry = document.createElement('span');

        entry.setAttribute('class', 'media');
        entry.innerHTML = type;

        entry.onclick = function() {
            populateContentArea('type', type);
        };

        mediaListing.appendChild(entry);
    }

    /* hide media section in left nav */
    if (mediaListing.childElementCount == 0)
        mediaListing.parentElement.hidden = true;

}

/* populate the playlist sections */
function populatePlaylists(playlistJSON)
{
    var playlistListing = document.querySelector('#left_nav #playlists #listing');

    var playlists = JSON.parse(playlistJSON);

    for(let playlist of playlists)
    {
        let entry = document.createElement('span');

        entry.setAttribute('class', 'playlist');
        entry.innerHTML = playlist['name'];

        entry.onclick = function() {
            populateContentArea('playlist', playlist['playlist_id']);
        };

        playlistListing.appendChild(entry);
    }

    let entry = document.createElement('span');

    entry.setAttribute('id', 'add_playlist');
    entry.innerHTML = "&plus; Add playlist";

    playlistListing.appendChild(entry);
}

function populateContentArea(group, value)
{

    var media_json = syncGetUrlResponse("api/get/rows/media");
    var media = JSON.parse(media_json);
    var ids = new Set();

    var type;

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
                ids.add(medium['media_id']);
        }
    }

    switch(group)
    {
        case 'playlist':
        {
            var playlist_json = syncGetUrlResponse("api/get/rows/playlist/id/" + value);
            var playlist = JSON.parse(playlist_json);

            if (playlist[0]['playlist_id'] !== undefined)
                type = playlist[0]['type'];

            var playlist_media_json = syncGetUrlResponse("api/get/rows/playlist_media/id/" + value);
            var playlist_media = JSON.parse(playlist_media_json);

            //TODO: Incorporate rank into table ordering
            for (let playlist_item of playlist_media)
            {
                ids.add(playlist_item['media_id']);
            }

            break;
        }
        case 'library':
        {
            var library_json = syncGetUrlResponse("api/get/rows/library/id/" + value);
            var library = JSON.parse(library_json);

            if (library[0]['library_id'] !== undefined)
                type = library[0]['type'];

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

    var content_area = document.querySelector('#content');

    clearChildren(content_area);

    var content;

    if (ids.size == 0)
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
                content = getMusicContent(ids);
                break;
            }
            case 'video':
            {
                content = getVideoContent(ids);
                break;
            }
            case 'photo':
            {
                content = getPhotoContent(ids);
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

function getMusicContent(media_ids)
{
    return getMusicList(media_ids);
}

function getVideoContent(ids)
{
    return getVideoList(ids);
}

function getPhotoContent(ids)
{
    return getPhotoList(ids);
}

function getMusicList(media_ids)
{
    var music_json = syncGetUrlResponse("api/get/row/track");
    var music = JSON.parse(music_json);

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
        if (!media_ids.has(track["media_id"]))
            continue;

        let row = document.createElement('tr');
        row.setAttribute('class', 'content_table_row');

        /* play button */
        let link = document.createElement('a');
        link.innerHTML = 'Play';
        link.setAttribute('href', 'javascript:void(0)');

        link.onclick = function(){
            playMedia(track['media_id']);
        };

        row.appendChild(link);

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

function getVideoList(media_ids)
{
    var video_json = syncGetUrlResponse("api/get/row/video");
    var videos = JSON.parse(video_json);

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
        if (!media_ids.has(video["media_id"]))
            continue;

        let row = document.createElement('tr');
        row.setAttribute('class', 'content_table_row');

        /* play button */
        let link = document.createElement('a');
        link.innerHTML = 'Play';
        link.setAttribute('href', 'javascript:void(0)');

        link.onclick = function(){
            playMedia(video['media_id']);
        };

        row.appendChild(link);

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

                    let genre_json = syncGetUrlResponse("api/get/row/genre/id/" + video['genre_id']);
                    let genre = JSON.parse(genre_json);

                    data.innerHTML = formatTime(genre['name']);
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

function getPhotoList(media_ids)
{
    var photo_json = syncGetUrlResponse("api/get/row/photo");
    var photos = JSON.parse(photo_json);

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
        if (!media_ids.has(photo["media_id"]))
            continue;

        let row = document.createElement('tr');
        row.setAttribute('class', 'content_table_row');

        /* play button */
        let link = document.createElement('a');
        link.innerHTML = 'Play';
        link.setAttribute('href', 'javascript:void(0)');

        link.onclick = function(){
            playMedia(photo['media_id']);
        };

        row.appendChild(link);

        for (let column of columns)
        {
            let data = document.createElement('td');

            if (photo[column] != null)
            {
                if (column == "album")
                {
                    if (!photo['album_id'])
                        continue;

                    let album_json = syncGetUrlResponse("api/get/row/photo_album/id/" + photo['album_id']);
                    let album = JSON.parse(album_json);

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

function playMedia(media_id)
{
    var media_json = syncGetUrlResponse("api/get/row/media/id/" + media_id);
    var media = JSON.parse(media_json);

    var element;

    switch (media[0]['library_type'])
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

        let photo_json = syncGetUrlResponse('api/get/row/photo');

        let photos = JSON.parse(photo_json);

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

function stopMediaPlayback()
{
    var media_preview = document.querySelector('#media_player #content_preview');
    var seek_bar = document.querySelector('#media_player #seek_bar');

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

    asyncGetUrlResponse("api/get/row/library", populateMediaLibraries);
    asyncGetUrlResponse("api/get/row/playlist", populatePlaylists);

})();
