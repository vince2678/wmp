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

    $path = $row['full_path'];

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
*/
function delete_media($kv_pair)
{
    $res = false;

    if (null !== ($row = get_row("library_media", $kv_pair)))
    {
        if ($res = unlink($row['full_path']))
            $res = delete_row("media", "media_id", $row['media_id']);
    }

    return $res;
}

/* go through the library's media and check media row's
    update time and compare to latest update time.
    if diff > library update interval, the record's associated file
    was missing on a previous update, so remove the record
*/
function clean_media_records($library_id)
{
    $constraint = array("library_id" => $library_id);

    $library = get_row("library", $constraint);

    if ($library == null) //no rows
        return false;

    $db = connect_to_db();

    $query = "SELECT MAX(last_update) as last FROM media WHERE"
        . " library_id='" . $library_id . "';";

    $result = $db->query($query);

    if (isset($result) && $result->num_rows > 0)
        $mru_row = $result->fetch_assoc();

    $result->free();
    $db->close();

    if (isset($mru_row['last']))
    {
        $library_update_time = new \DateTime($mru_row['last']);
        $interval = $library['update_interval'];
    }
    else
    {
        return false;
    }

    /* go through library's associated media records */
    while (null !== $m_row = get_row("library_media", $constraint, true))
    {
        $row_update_time = new \DateTime($m_row['last_update']);

        $diff = $library_update_time->getTimestamp()
            - $row_update_time->getTimestamp();

        if ($diff > $interval)
        {
            delete_row("media", "media_id", $m_row['media_id']);
        }
    }

    return true;
}

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

        if (null !== $m_row = get_row("library_media", $data))
        {
            /* Check file timestamp and update db metadata
               if timestamp on disk is newer than db last update
            */
            $mtime = filemtime($m_row['full_path']);

            $update_time = new \DateTime($m_row['last_update']);
            $diff = $mtime - $update_time->getTimestamp();

            if ($diff > 0)
            {
                //Update metadata
                $constraint = array("media_id" => $m_row['media_id']);
                switch($library['type'])
                {

                    case "music":
                        add_music($constraint);
                        break;
                    case "photo":
                        add_photo($m_row);
                        break;
                    case "video":
                        add_video($m_row);
                        break;
                }
            }

            update_media_timestamp($data);
        }
        // no rows, we need to create new ones for media
        elseif (null !== ($m_row = _add_media($data)))
        {
            $constraint = array("media_id" => $m_row['media_id']);
            switch($library['type'])
            {
                case "music":
                    add_music($constraint);
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

    while (null !== ($m_row = get_row("library_media", $kv_pair, true)))
    {
        $path = $m_row['full_path'];

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
            elseif (($data['type'] == "raw") || ($data['action'] == "delete"))
            {
                echo "No id value specified\n";
                die();
            }
            break;
        }
        case null:
        {
            //if (0 == strncmp($data['type'],"row", 3))
            if (($data['type'] !== "raw") && ($data['action'] !== "delete"))
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
        case 'file':
        {
            if ($data['action'] == 'delete')
            {
                $res = delete_media($constraint);

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
    . "(?<action>get)[/]+"
    . "(?<type>(metadata|raw))[/]*"
    . "((?<section>(tags|playtime_seconds|comments|video))[/]*){0,1}"
    . "((?<table>media)[/]*){0,1}"
    . "((?<column>id)[/]*){0,1}"
    //. "((?<like>like)[/]+){0,1}"
    . "(?<value>[^/]*)"
    . "$";

    $func = "media_url_handler";

    register_api_url_handler($regexp, $func);

    $regexp =
    "^[/]*api[/]+"
    . "(?<action>delete)[/]+"
    . "(?<type>(file))[/]*"
    . "(?<table>(media))[/]*"
    . "((?<column>(id))[/]*){0,1}"
    //. "((?<like>like)[/]+){0,1}"
    . "(?<value>[^/]*)"
    . "$";

    register_api_url_handler($regexp, $func);

};

$register_handlers();

?>