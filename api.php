<?php

include __DIR__ . "/api/" . "album.php";
include __DIR__ . "/api/" . "artist.php";
include __DIR__ . "/api/" . "genre.php";
include __DIR__ . "/api/" . "library.php";
include __DIR__ . "/api/" . "playlist.php";
include __DIR__ . "/api/" . "media.php";

include __DIR__ . "/api/" . "music.php";
include __DIR__ . "/api/" . "photo.php";
include __DIR__ . "/api/" . "video.php";

function register_api_url_handler($regexp, $handler)
{
    global $url_regexps;
    $url_regexps[] = array("regexp" => $regexp, "handler" => $handler);
}

function api_request_handler()
{
    global $url_regexps;

    if (isset($_SERVER["PATH_INFO"]))
        $request_path = $_SERVER['PATH_INFO'];
    else
    {
        $s = strlen(dirname($_SERVER['SCRIPT_NAME']));
        $request_path = substr($_SERVER['REQUEST_URI'], $s);
    }

    $regexp ="^[/]*api[/]+";

    if (!preg_match("#$regexp#", $request_path))
        return;

    $matched = false;

    for ($i = 0; $i < count($url_regexps); $i++)
    {
        $regexp = $url_regexps[$i]["regexp"];
        $handler = $url_regexps[$i]["handler"];

        $ret = preg_match("#$regexp#", $request_path, $matches, PREG_UNMATCHED_AS_NULL);

        if ($ret)
        {
            $handler($matches);
            $matched = true;
            break;
        }
    }

    if (!$matched)
    {
        echo "Invalid api request\n";
    }

    die();
}

function row_url_handler($data)
{

    $constraint = array();

    switch($data['column'])
    {
        case 'id':
        {
            if (isset($data['value']) && ("" !== $data['value']))
            {
                $constraint = array(
                    $data['table'] . "_id" => $data['value'],
                );
            }
            break;
        }
        case 'name':
        case 'title':
        {
            if (($data['table'] == "track")
                OR ($data['table'] == "photo")
                OR ($data['table'] == "video")
               )
            {
                $column = "title";
            }
            else
            {
                $column = "name";
            }

            if (isset($data['value']) && ("" !== $data['value']))
            {
                $constraint = array(
                    $column => htmlspecialchars_decode($data['value']),
                );
                break;
            }

            echo "Requested column does not exist in table\n";
            die();
        }
        case null:
            break;
        default:
        {
            echo "Invalid column specified\n";
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
            elseif ($data['action'] == 'delete')
            {
                $res = delete_row($data['table'], $constraint);

                header("Content-Type: application/json");

                if ($res)
                    echo '{"status" : "success"}' . PHP_EOL;
                else
                    echo '{"status" : "failure"}' . PHP_EOL;

                die();
            }
        }
        case null:
        default:
        {
            echo "Invalid request specified\n";
            die();
        }
    }

    if (isset($rows))
    {
        $encoded = json_encode($rows, JSON_INVALID_UTF8_SUBSTITUTE);

        if (false != $encoded)
        {
            header("Content-Type: application/json");
            echo $encoded;
        }
        else
        {
            echo "Could not display data\n";
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
    . "(?<action>(get|delete))[/]+"
    . "(?<type>row([s]{0,1}))[/]*"
    . "(?<table>(genre|library|artist|track|"
     . "music_album|photo_album|photo|video|media))[/]*"
    . "((?<column>(id|title|name))[/]*){0,1}"
    //. "((?<like>like)[/]+){0,1}"
    . "(?<value>[^/]*)"
    . "$";

    $func = "row_url_handler";

    register_api_url_handler($regexp, $func);

};

$register_handlers();

api_request_handler();

?>
