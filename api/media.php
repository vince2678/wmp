<?php

require_once(__DIR__ . "../lib/getid3/getid3.php");

/* Get raw media output */
function get_raw_media($kv_pair)
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

    $query = "SELECT * from library_media WHERE "
        . $constraint;

    if (false == ($result = $db->query($query)))
    {
        printf("Query failed: %s\n", $db->error);
        return;
    }

    if (null == ($row = $result->fetch_assoc()))
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
    $db->close();
}

/* 
Remove media from database
*/
function remove_media($id)
{

}

/* Delete media from disk
*/
function delete_media($id)
{

}
*/

/* create media record given k/v pairs in $kv_pair */
function _add_media($kv_pair)
{
    if (false == insert_row("media", $kv_pair))
        return null;

    $db = connect_to_db();

    $k = array_keys($kv_pair);

    // get media id
    $query = "SELECT * FROM media WHERE ";

    for ($i = 0; $i < count($k) - 1; $i++)
    {
        $query .= $db->escape_string($k[$i]) . '='
            . "'" . $db->escape_string($kv_pair[$k[$i]]) . "' AND ";
    }
    $query .= $db->escape_string($k[$i]) . '='
        . "'" . $db->escape_string($kv_pair[$k[$i]]) . "'";;

    if (false == ($result = $db->query($query)))
    {
        printf("Query failed: %s\n", $db->error);
        return null;
    }

    $m_row = $result->fetch_assoc();

    $result->free();

    $db->close();

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
    $db = connect_to_db();

    $k = array_keys($kv_pair);

    // get media id
    $query = "SELECT * FROM library_media";

    if (isset($kv_pair) && (count($kv_pair) > 0))
    {
        $query .= " WHERE ";
        for ($i = 0; $i < count($k) - 1; $i++)
        {
            $query .= $db->escape_string($k[$i]) . '='
                . "'" . $db->escape_string($kv_pair[$k[$i]]) . "' AND ";
        }
        $query .= $db->escape_string($k[$i]) . '='
            . "'" . $db->escape_string($kv_pair[$k[$i]]) . "'";;
    }
    $query .= ";";

    if (false == ($result = $db->query($query)))
    {
        printf("Query failed: %s\n", $db->error);
        return null;
    }

    $metadata = null;

    $id3 = new getID3;

    while (null !== ($m_row = $result->fetch_assoc()))
    {
        $path = $m_row['full_path'] . "/" . $m_row['relative_path'];

        $meta = $id3->analyze($path);
        getid3_lib::CopyTagsToComments($meta);

        $metadata[$m_row['media_id']] = $meta;
    }

    $result->free();

    $db->close();

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

?>