<?php

function add_music($media_id)
{
    $meta = get_media_metadata($media_id)[$media_id];
    
    /*
    if (isset($meta['tags']['id3v2']))
        $tags = $meta['tags']['id3v2'];
    elseif (isset($meta['tags']['id3v1']))
        $tags = $meta['tags']['id3v1'];
    elseif (isset($meta['tags']['vorbiscomment']))
        $tags = $meta['tags']['vorbiscomment'];
    else
        $tags = $meta['comments'];
    */
    $tags = $meta['comments'];

    $track_data = array();
    $album_data = array();

    $track_data["media_id"] = $media_id;

    if (isset($meta['playtime_seconds']))
        $track_data['duration'] = (int) $meta['playtime_seconds'];

    if (isset($tags['title'][0]))
        $track_data['title'] = $tags['title'][0];

    if (isset($tags['track_number'][0]))
        $track_data['track_number'] = $tags['track_number'][0];
    elseif (isset($tags['tracknumber'][0]))
        $track_data['track_number'] = $tags['tracknumber'][0];
    elseif (isset($tags['track'][0]))
        $track_data['track_number'] = $tags['track'][0];

    /* get album artist */
    if (isset($tags['text']['Album Artist Credit']))
        $album_artist = $tags['text']['Album Artist Credit'];
    elseif (isset($tags['band'][0]))
        $album_artist = $tags['band'][0];
    else
        $album_artist = $tags['artist'][0];
    
    /* get track artist */
    if (isset($tags['text']['Artist Credit']))
        $track_artist = $tags['text']['Artist Credit'];
    elseif (isset($tags['artist'][0]))
        $track_artist = $tags['artist'][0];
    else
        $track_artist = $album_artist;

    if (isset($tags['album'][0]))
        $album_data['name'] = $tags['album'][0];

    if (isset($tags['totaltracks'][0]))
        $album_data['track_count'] = $tags['totaltracks'][0];

    // add artist if not exists
    if (isset($album_artist))
    {
        if (add_artist($album_artist))
            $album_data['artist_id'] = get_artist_id($album_artist);
    }

    if (isset($track_artist))
    {
        if (add_artist($track_artist))
            $track_data['artist_id'] = get_artist_id($track_artist);
    }

    // add album if not exists
    if(add_album($album_data))
        $track_data['album_id'] = get_album_id($album_data);

    // add genre if not exists
    if (isset($tags['genre'][0]))
    {
        $genre = $tags['genre'][0];

        if (add_genre($genre))
            $track_data['genre_id'] = get_genre_id($genre);
    }

    $constraint = array("media_id" => $media_id);

    if (count_rows("r_track", $constraint) < 1)
        return insert_row("r_track", $track_data);
    else
        return update_row("r_track", $constraint, $track_data);

    return true;
}

function get_album_art($media_id)
{
    $meta = get_media_metadata($media_id)[$media_id];

    $picture = $meta['comments']['picture'][0];

    /* try for embedded art first */
    if (isset($picture) AND isset($picture['data']))
    {
        header("Content-Type: " . $picture['image_mime']);
        header("Content-Length: " . $picture['datalength']);

        echo $picture['data'];
        die();
    }

    /* look for media on disk in track directory */
    if (null == ($row = get_row("media", array("media_id" => $media_id))))
    {
        echo "Failed to get media information";
        die();
    }

    if (false == ($dh = opendir(dirname($row['full_path']))))
    {
        echo "Failed to open cover art directory";
        die();
    }

    $regexp = '([aA][lL][bB][uU][mM]|'
        . '[cC][oO][vV][eE][rR])\.[jJ][pP][eE]{0,1}[gG]$';

    $cover_art_file = null;


    while (false !== ($file = readdir($dh)))
    {
        if (1 == ($ret = preg_match("#$regexp#", $file, $matches)))
        {
            $cover_art_file = $file;
            break;
        }
    }

    if (null == $cover_art_file)
    {
        echo "Failed to find cover art";
        die();
    }

    $art_path = dirname($row['full_path']) . "/" . $cover_art_file;

    if (false == ($fh = fopen($art_path, "r")))
    {
        echo "Failed to open cover art";
        die();
    }

    header("Content-Type: " . 'image/jpeg');
    header("Content-Length: " . filesize($art_path));

    $bs = 256;

    while (!feof($fh))
    {
        $data = fread($fh, $bs);
        echo $data;
    }
    die();
}

function get_album_art_metadata($media_id)
{
    header("Content-Type: application/json");

    $meta = get_media_metadata($media_id)[$media_id];

    $picture = $meta['comments']['picture'][0];

    $data = array("status" => "failure");

    /* try for embedded art first */
    if (isset($picture) AND isset($picture['data']))
    {
        header("Content-Type: application/json");

        $data["status"] = "success";

        $data["mime"] = $picture["image_mime"];
        $data["description"] = $picture["description"];
        $data["type"] = $picture["picturetype"];
        $data["width"] = $picture["image_width"];
        $data["height"] = $picture["image_height"];
        $data["length"] = $picture["datalength"];

        echo json_encode($data);
        die();
    }

    /* look for media on disk in track directory */
    if (null == ($row = get_row("media", array("media_id" => $media_id))))
    {
        $data["message"] = "Failed to get media information";
        echo json_encode($data);
        die();
    }

    if (false == ($dh = opendir(dirname($row['full_path']))))
    {
        $data["message"] = "Failed to open cover art directory";
        echo json_encode($data);
        die();
    }

    $regexp = '([aA][lL][bB][uU][mM]|'
        . '[cC][oO][vV][eE][rR])\.[jJ][pP][eE]{0,1}[gG]$';

    $cover_art_file = null;


    while (false !== ($file = readdir($dh)))
    {
        if (1 == ($ret = preg_match("#$regexp#", $file, $matches)))
        {
            $cover_art_file = $file;
            break;
        }
    }

    if (null == $cover_art_file)
    {
        $data["message"] = "Failed to find cover art";
        echo json_encode($data);
        die();
    }

    $art_path = dirname($row['full_path']) . "/" . $cover_art_file;

    if (false == ($fh = fopen($art_path, "r")))
    {
        $data["message"] = "Failed to open cover art";
        echo json_encode($data);
        die();
    }

    $data["status"] = "success";
    $data["mime"] = "image/jpeg";
    $data["description"] = $matches[1]; //first part of regexp
    $data["length"] = filesize($art_path);

    $id3 = new getID3;

    $meta = $id3->analyze($art_path);

    $data["width"] = $meta["video"]["resolution_x"];
    $data["height"] = $meta["video"]["resolution_y"];

    echo json_encode($data);

    die();
}

function music_url_handler($data)
{

    $constraint = array();

    switch($data['column'])
    {
        case 'id':
        {
            if (isset($data['value']) && ("" !== $data['value']))
            {
                $constraint = array(
                    "media_id" => $data['value'],
                );
            }
            break;
        }
        case null:
        {
            echo "No id specified\n";
            die();
        }
        default:
        {
            echo "Invalid column specified\n";
            die();
        }
    }

    switch($data['type'])
    {
        case 'album_art':
        {
            if (isset($data['section']))
                get_album_art_metadata($constraint['media_id']);
            else
            get_album_art($constraint['media_id']);
        }
        case null:
        default:
        {
            echo "Invalid request specified\n";
            die();
        }
    }
}

$register_handlers = function ()
{
    $regexp =
    "^[/]*api[/]+"
    . "(?<action>(get))[/]+"
    . "(?<type>album_art)[/]*"
    . "((?<section>(metadata))[/]*){0,1}"
    . "((?<column>(id))[/]*){0,1}"
    //. "((?<like>like)[/]+){0,1}"
    . "(?<value>[^/]*)"
    . "$";

    $func = "music_url_handler";

    register_api_url_handler($regexp, $func);

};

$register_handlers();

?>