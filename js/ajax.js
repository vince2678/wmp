'use strict';

function syncGetUrlResponse(url)
{
    var response = new XMLHttpRequest();

    response.open('GET', url, false);
    response.send();

    return response.responseText;
}

function syncGetUrlResponseHeader(url, header)
{
    var response = new XMLHttpRequest();

    response.open('HEAD', url, false);
    response.send();

    return response.getResponseHeader(header);
}

function asyncGetUrlResponse(url, callback)
{
    var response = new XMLHttpRequest();

    response.open('GET', url, true);

    response.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            callback(this.responseText);
            this.onreadystatechange = null;
        }
    };

    response.send();
}