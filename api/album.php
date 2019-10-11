<?php
/* add album and/or return album_id */
function add_album($row)
{
    if (count_rows("music_album", $row) < 1)
        return insert_row("music_album", $row);
    //else

    return true;
}

function get_album_id($row)
{
    $id = -1;

    $db = connect_to_db();

    $query = "SELECT * from music_album WHERE ";

    $k = array_keys($row);

    if (count($row) > 0)
    {
        for ($i = 0; $i < count($k) - 1; $i++)
        {
            $query .= $db->escape_string($k[$i]) . '='
                . "'" . $db->escape_string($row[$k[$i]]) . "' AND ";
        }
        $query .= $db->escape_string($k[$i]) . '='
            . "'" . $db->escape_string($row[$k[$i]]) . "'";
    }
    $query .= ";";
    
    if (false == ($result = $db->query($query)))
        return $id;
    
    if (null == ($row = $result->fetch_assoc()))
        return $id;

    $id = $row['album_id'];

    $result->free();
    $db->close();

    return $id;
}

?>