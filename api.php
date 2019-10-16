<?php

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

api_request_handler();

?>
