'use strict';

function seekHandler(event)
{
    var media_element = document.querySelector('#content_preview .media_element');

    if ((!media_element) || (!media_element.currentTime))
        return;

    let width = percentToPixel(this.clientWidth, window.innerWidth);
    let progress = (event.clientX / width);

    media_element.currentTime = (progress * media_element.duration);
}

function updateSeekBar(event)
{
    const seek_bar = document.querySelector('#media_player #seek_bar');
    let media_element = document.querySelector('#content_preview .media_element');

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

    let elapsed = document.querySelector("#bottom_controls #media_time_elapsed");
    let total = document.querySelector("#bottom_controls #media_time_duration");

    elapsed.innerText = formatTime(currentTime);
    total.innerText = formatTime(duration);
}

function stopMediaPlayback()
{
    var media_preview = document.querySelector('#media_player #content_preview');
    var seek_bar = document.querySelector('#media_player #seek_bar');

    var elapsed = document.querySelector("#bottom_controls #media_time_elapsed");
    var duration = document.querySelector("#bottom_controls #media_time_duration");

    var media_element = document.querySelector('#content_preview .media_element');

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