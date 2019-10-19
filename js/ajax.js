'use strict';

function syncGetUrlResponse(url)
{
    var response = new XMLHttpRequest();

    response.open('GET', url, false);
    response.send();

    return response.responseText;
}

function asyncGetUrlResponse(url, callback)
{
    var response = new XMLHttpRequest();

    response.open('GET', url, true);

    response.onreadystatechange = function()
    {
        if (this.status == 200)
        {
            callback(this.responseText);
            this.onreadystatechange = null;
        }
    };

    response.send();
}