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