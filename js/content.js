'use strict';

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