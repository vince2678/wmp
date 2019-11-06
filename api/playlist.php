<?php

/*
Add playlist with $name, duplicate names allowed
*/
function add_playlist($name)
{
    $data = array("name" => $name);
    return insert_row("playlist", $data);
}

function update_playlist($id, $name)
{
    $constraint = array("playlist_id" => $id);
    $data = array("name" => $name);

    return update_row("playlist", $constraint, $data);
}

function add_playlist_media($playlist_id, $media_id, $rank = NULL)
{
    $data = array(
        "media_id" => $media_id,
        "playlist_id" => $playlist_id,
    );

    $count = count_rows("playlist_media", $data);

    if (isset($rank))
        $data['rank'] = $rank;

    if ($count == 0)
        return insert_row("playlist_media", $data);
    elseif ($count > 0)
    {
        $constraints = array(
            "media_id" => $media_id,
            "playlist_id" => $playlist_id,
        );

        return update_row("playlist_media", $constraints, $data);
    }
    /*else //($count < 0)*/

    return false;
}

function remove_playlist_media($playlist_id, $media_id)
{
    $constraints = array(
        "media_id" => $media_id,
        "playlist_id" => $playlist_id,
    );

    return delete_row("playlist_media", $constraints);
}

function playlist_url_handler($data)
{

    $constraint = array();

    header("Content-Type: application/json");

    switch($data['column'])
    {
        case 'id':
        {
            if (isset($data['value']) && ("" !== $data['value']))
            {
                $constraint = array(
                    "playlist_id" => $data['value'],
                );
            }
            break;
        }
        case null:
            break;
        default:
        {
            echo '{"status" : "failure",'
                .' "message": "Invalid column"}' . PHP_EOL;
            die();
        }
    }

    switch($data['type'])
    {
        case 'row':
        case 'rows':
        {
            if ($data['action'] == "get")
            {
                $rows = get_rows($data['table'], $constraint);
                break;
            }
        }
        case null:
        default:
        {
            echo '{"status" : "failure",'
                .' "message": "Invalid request"}' . PHP_EOL;
            die();
        }
    }

    if (isset($rows))
    {
        $encoded = json_encode($rows, JSON_INVALID_UTF8_SUBSTITUTE);

        if (false != $encoded)
        {
            echo $encoded;
        }
        else
        {
            echo '{"status" : "failure",'
                .' "message": "Could not display data"}' . PHP_EOL;
        }
        die();
    }
}

$register_handlers = function ()
{
    // make sure to order regexp conditions with precedence
    // to avoid greedy matching, e.g photo_album|photo instead of photo|photo_album

    $regexp =
    "^[/]*api[/]+"
    . "(?<action>(get))[/]+"
    . "(?<type>row([s]{0,1}))[/]*"
    . "(?<table>(playlist_media|playlist))[/]*"
    . "((?<column>(id))[/]*){0,1}"
    //. "((?<like>like)[/]+){0,1}"
    . "(?<value>[^/]*)"
    . "$";

    $func = "playlist_url_handler";

    register_api_url_handler($regexp, $func);

};

$register_handlers();


?>
