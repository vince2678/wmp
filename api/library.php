<?php

/*
function add_library($name, $path, $type, $interval = 3600)
{

}
*/

/*
function update_library($id, $path, $type, $interval)
{

}
*/

/*
function remove_library($key, $value)
{

}
*/

/* take in a library $row */
function scan_library($row)
{
    $mimes['music'] =
        array(
            "audio/mpeg",
            "audio/wav",
            "audio/ogg"
        );

    $mimes['video'] =
        array(
            "video/mp4",
            "video/webm",
            "video/ogg"
        );

    $mimes['photo'] =
        array(
            "image/jpeg",
            "image/pjpeg",
            "image/png",
            "image/svg+xml",
            "image/gif"
        );

    $group_mimes = $mimes[$row['type']];

    $finfo = new \finfo(FILEINFO_MIME_TYPE, "/usr/lib/file/magic.mgc");

    $d_stack = array();
    $f_stack = array();

    $d_stack[] = $row['full_path'];

    //  add files to file stack
    while (null !== ($dir = array_pop($d_stack)))
    {
        if (false == ($dh = opendir($dir)))
        {
            continue;
        }

        while (false !== ($file = readdir($dh)))
        {
            $path = $dir . "/" . $file;

            $ft = filetype($path);

            // dont add hidden files or . and .. entries
            if (("dir" == $ft) && (0 !== strncmp('.', $file, 1)))
            {
                $d_stack[] = $path;
            }
            elseif ("file" == $ft)
            {
                if (false !== array_search($finfo->file($path), $group_mimes))
                {
                    $rpath = substr($path, strlen($row['full_path']));

                    while ($rpath[0] == "/")
                        $rpath = substr($rpath, 1);

                    $f_stack[] = $rpath;
                }
            }
        }
        closedir($dh);
    }

    add_media($row, $f_stack);

    return true;
}

function scan_libraries($kv_pair)
{
    $rows = get_rows("library", $kv_pair);

    if ($rows == null) //no rows
        return false;

    $db = connect_to_db();

    foreach ($rows as $row)
    {
        $query = "SELECT MAX(last_update) as last FROM media WHERE"
            . " library_id='" . $row['library_id'] . "';";

        $result = $db->query($query);

        if (isset($result) && $result->num_rows > 0)
            $m_row = $result->fetch_assoc();

        if (isset($m_row['last']))
        {
            $current_time = new \DateTime();
            $update_time = new \DateTime($m_row['last']);
            $diff = $current_time->getTimestamp() - $update_time->getTimestamp();

            // don't rescan if the update interval hasn't passed yet
            if ($diff < $row['update_interval'])
                continue;
        }

        scan_library($row);

        $result->free();
    }
    $db->close();

    return true;
}

/*
function get_library($key, $value)
{

}
*/

/*
function get_libraries()
{

}
*/

?>
