<?php

require_once(__DIR__ . "/../lib/getid3/getid3.php");

/* Get raw media output */
function get_raw_media($kv_pair)
{
    if (null == ($row = get_row("library_media", $kv_pair)))
    {
        printf("No rows in query\n");
        return;
    }

    $path = $row['full_path'] . "/". $row['relative_path'];

    $finfo = new \finfo(FILEINFO_MIME_TYPE, "/usr/lib/file/magic.mgc");

    $fsize = filesize($path);

    header('Content-Type: ' . $finfo->file($path));
    header('Content-Length: ' . $fsize);

    if (false == ($fh = fopen($path, "r")))
    {
        printf("Failed to open file\n");
        return;
    }

    $bs = 256;

    while (!feof($fh))
    {
        $data = fread($fh, $bs);
        echo $data;
    }

    fclose($fh);
}

/* 
Remove media from database
function remove_media($id)
{

}
*/

/* Delete media from disk
function delete_media($id)
{

}
*/

/* create media record given k/v pairs in $kv_pair */
function _add_media($kv_pair)
{
    if (false == insert_row("media", $kv_pair))
        return null;

    // get media id
    $m_row = get_row("media", $kv_pair);

    return $m_row;
}

function add_media($library, $files)
{
    $db = connect_to_db();

    while (null !== ($file = array_pop($files)))
    {
        $data = array(
            "library_id" => $library['library_id'],
            "relative_path" => $file
        );

        /* TODO: Check file timestamp and update db metadata
                 if timestamp on disk is newer than db last update
        */

        if (count_rows("media", $data) > 0)
        {
            update_media_timestamp($data);
        }
        // no rows, we need to create new ones for media
        elseif (null !== ($m_row = _add_media($data)))
        {
            switch($library['type'])
            {
                case "music":
                    add_music($m_row);
                    break;
                case "photo":
                    add_photo($m_row);
                    break;
                case "video":
                    add_video($m_row);
                    break;
            }
        }
    }
    $db->close();
}

function get_media_metadata($kv_pair)
{
    $metadata = null;

    $id3 = new getID3;

    while (null !== ($m_row = get_row("library_media", $kv_pair)))
    {
        $path = $m_row['full_path'] . "/" . $m_row['relative_path'];

        $meta = $id3->analyze($path);
        getid3_lib::CopyTagsToComments($meta);

        $metadata[$m_row['media_id']] = $meta;
    }

    return $metadata;
}

function update_media_timestamp($kv_pair)
{
    $db = connect_to_db();

    $k = array_keys($kv_pair);

    $constraint = null;

    for ($i = 0; $i < count($k) - 1; $i++)
    {
        $constraint .= $db->escape_string($k[$i]) . '='
            . "'" . $db->escape_string($kv_pair[$k[$i]]) . "' AND ";
    }
    $constraint .= $db->escape_string($k[$i]) . '='
        . "'" . $db->escape_string($kv_pair[$k[$i]]) . "';";

    $query = "UPDATE media SET last_update=CURRENT_TIMESTAMP WHERE "
        . $constraint;

    if (false == $result = $db->query($query))
        printf("Failed to update: %s\n", $db->error);

    //continue;
    $db->close();

    return $result;
}

function media_url_handler($data)
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
            //elseif (0 !== strncmp($data['type'],"row", 3))
            elseif ($data['type'] == "raw")
            {
                echo "No id value specified\n";
                die();
            }
            break;
        }
        case null:
        {
            //if (0 == strncmp($data['type'],"row", 3))
            if ($data['type'] != "raw")
                break;
        }
        default:
        {
            echo "Invalid column specified\n";
            die();
        }
    }

    switch($data['type'])
    {
        case 'metadata':
        {
            if (!isset($data['section']))
                $data['section'] = 'tags';

            $meta = get_media_metadata($constraint);

            if (isset($meta))
            {
                $rows = array();
                foreach (array_keys($meta) as $key)
                {
                    if (array_key_exists($data['section'], $meta[$key]))
                    {
                        $rows[$key] = $meta[$key][$data['section']];
                    }
                }
            }
            break;
        }
        case 'raw':
        {
            get_raw_media($constraint);
            break;
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
    . "get[/]+"
    . "(?<type>(metadata|raw))[/]*"
    . "((?<section>(tags|playtime_seconds|comments|video))[/]*){0,1}"
    . "((?<table>media)[/]*){0,1}"
    . "((?<column>id)[/]*){0,1}"
    //. "((?<like>like)[/]+){0,1}"
    . "(?<value>[^/]*)"
    . "$";

    $func = "media_url_handler";

    register_api_url_handler($regexp, $func);

};

$register_handlers();

?>