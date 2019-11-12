'use strict';

/* set up fullscreen button handler */
function fullScreenHandler() {
    if (isFullScreen())
        toggleMediaPlayerSize();
    else
        toggleMediaPlayerSize(PLAYER_SIZE_FULL);
}

/* set up player resize button handler */
function mediaPlayerSizeHandler() {
    toggleMediaPlayerSize();
}

/* set up play button handler */
function playPauseHandler()
{
    let media_element = document.querySelector(SELECTOR_MEDIA_ELEMENT);
    let icon = this.children[0];

    if (media_element.paused)
    {
        if (media_element.play)
        {
            media_element.play();
            icon.innerText = 'pause_circle_outline';
        }
    }
    else if (media_element.pause)
    {
        media_element.pause();
        icon.innerText = 'play_circle_outline';
    }
}

/* shuffle button handler */
function shuffleHandler()
{
    if (global_player_state['shuffle'])
    {
        let old_queue = global_player_state['old_queue'];

        if (old_queue)
            global_player_state['queue'] = old_queue;

        global_player_state['shuffle'] = false;
        this.classList.remove("shuffle-active");
    }
    else
    {
        let queue = global_player_state['queue'];

        global_player_state['old_queue'] = queue;
        global_player_state['queue'] = getShuffle(queue);

        global_player_state['shuffle'] = true;
        this.classList.add("shuffle-active");
    }
}

/* set up mute button handler */
function muteHandler()
{
    let media_element = document.querySelector(SELECTOR_MEDIA_ELEMENT);
    let icon = this.children[0];

    if (media_element.muted)
    {
        media_element.muted = false;
        icon.innerText = 'volume_up';
    }
    else if (media_element.muted == false)
    {
        media_element.muted = true;
        icon.innerText = 'volume_off';
    }
}

/* repeat button handler */
function repeatHandler()
{
    let mode = global_player_state['repeat'];

    if (mode == undefined)
        mode = REPEAT_NONE;

    this.parentElement.classList.remove("repeat-" + REPEAT_MODES[mode]);

    mode = (mode + 1) % REPEAT_MODES.length;
    global_player_state['repeat'] = mode;

    this.parentElement.classList.add("repeat-" + REPEAT_MODES[mode]);

    if (mode == REPEAT_ONE)
        this.innerText = "repeat_one";
    else
        this.innerText = "repeat";
}

function seekHandler(event)
{
    var media_element = document.querySelector(SELECTOR_MEDIA_ELEMENT);

    if ((!media_element) || (!media_element.currentTime))
        return;

    let width = percentToPixel(this.clientWidth, window.innerWidth);
    let progress = (event.clientX / width);

    media_element.currentTime = (progress * media_element.duration);
}

function updateSeekBar(event)
{
    const seek_bar = document.querySelector(SELECTOR_SEEK_BAR);
    let media_element = document.querySelector(SELECTOR_MEDIA_ELEMENT);

    if (media_element)
    {
        var currentTime = media_element.currentTime;
        var duration = media_element.duration;

        if (duration < 1)
            return;
    }
    else
    {
        return;
    }

    clearChildren(seek_bar);

    var canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    seek_bar.appendChild(canvas);

    canvas.width = percentToPixel(seek_bar.clientWidth, window.innerWidth);
    canvas.height = percentToPixel(seek_bar.clientHeight, window.innerWidth);

    const percent_done = (currentTime/duration);
    const percent_seekable = (media_element.seekable.end(0)/duration);

    const width = parseInt(canvas.width  * percent_done);
    const width_seekable = parseInt(canvas.width * percent_seekable);

    let x = 0;
    let y = 0;

    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, width, canvas.height);

    if (width_seekable > width)
    {
        x = width;

        ctx.fillStyle = 'grey';
        ctx.fillRect(x, y, width_seekable - width, canvas.height);
    }

    let elapsed = document.querySelector(SELECTOR_MEDIA_TIME_ELAPSED);
    let total = document.querySelector(SELECTOR_MEDIA_DURATION);

    elapsed.innerText = formatTime(currentTime);
    total.innerText = formatTime(duration);
}

function stopMediaPlayback()
{
    var media_preview = document.querySelector(SELECTOR_CONTENT_PREVIEW);
    var seek_bar = document.querySelector(SELECTOR_SEEK_BAR);

    var elapsed = document.querySelector(SELECTOR_MEDIA_TIME_ELAPSED);
    var duration = document.querySelector(SELECTOR_MEDIA_DURATION);

    var media_element = document.querySelector(SELECTOR_MEDIA_ELEMENT);

    if (media_element)
        media_element.ontimeupdate = undefined;

    document.title = "";

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

    elapsed.innerHTML = "";
    duration.innerHTML = "";
}

function playPrevious()
{
    var prev;

    let repeat_mode = global_player_state['repeat'];
    let queue = global_player_state['queue'];
    let current = global_player_state['playing'];
    let index = 0;

    if (current)
        index = queue.indexOf(current);

    if (repeat_mode == REPEAT_ALL)
    {
        index = (index - 1) % queue.length;

        if (index < 0)
            index = queue.length + index;

        prev = queue[index];
    }
    else if (repeat_mode == REPEAT_ONE)
    {
        prev = queue[index];
    }
    else
    {
        index = index - 1;

        if (index >= 0)
            prev = queue[index];
    }

    if (prev)
        playMedia(prev);
}

function playNext()
{
    var next;

    let repeat_mode = global_player_state['repeat'];
    let queue = global_player_state['queue'];
    let current = global_player_state['playing'];
    let index = 0;

    if (current)
        index = queue.indexOf(current);

    if (repeat_mode == REPEAT_ALL)
    {
        index = (index + 1) % queue.length;
        next = queue[index];
    }
    else if (repeat_mode == REPEAT_ONE)
    {
        next = queue[index];
    }
    else
    {
        index = index + 1;

        if (index < queue.length)
            next = queue[index];
    }

    if (next)
        playMedia(next);
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
    {
        if (global_player_state['shuffle'])
        {
            global_player_state['old_queue'] = queue;
            global_player_state['queue'] = getShuffle(queue);
        }
        else
        {
            global_player_state['queue'] = queue;
        }
    }

    global_player_state['playing'] = media['media_id'];

    stopMediaPlayback();

    var media_preview = document.querySelector(SELECTOR_CONTENT_PREVIEW);
    var media_element = document.createElement(element);

    media_element.setAttribute('class', 'media_element');
    media_element.setAttribute('id', element + '_element');

    media_element.autoplay = true;

    media_element.ontimeupdate = updateSeekBar;

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
            {
                media_element.setAttribute('alt', photo['title']);
                document.title = photo['title'];
                break;
            }
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

            for (let track of global_player_state['track'])
            {
                if (track['media_id'] == media_id)
                {
                    document.title = track['artist'] + " - " + track['title'];
                    break;
                }
            }
        }
        else
        {
            for (let video of global_player_state['video'])
            {
                if (video['media_id'] == media_id)
                {
                    document.title = video['title'];
                    break;
                }
            }
        }
    }

    media_preview.appendChild(media_element);

}