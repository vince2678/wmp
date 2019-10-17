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

/* take in a library $row */
function scan_library($library_id)
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

    $library = get_row("library", array("library_id" => $library_id));

    if (!isset($library))
        return false;

    $group_mimes = $mimes[$library['type']];

    $finfo = new \finfo(FILEINFO_MIME_TYPE, "/usr/lib/file/magic.mgc");

    $d_stack = array();
    $f_stack = array();

    $d_stack[] = $library['full_path'];

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
                    $rpath = substr($path, strlen($library['full_path']));

                    while ($rpath[0] == "/")
                        $rpath = substr($rpath, 1);

                    $f_stack[] = $rpath;
                }
            }
        }
        closedir($dh);
    }

    add_media($library_id, $f_stack);

    return true;
}

function scan_libraries($constraint)
{
    $rows = get_rows("library", $constraint);

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

        scan_library($row['library_id']);
        clean_media_records($row['library_id']);

        $result->free();
    }
    $db->close();

    return true;
}

function library_url_handler($data)
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
        {
            if (isset($data['value']) && ("" !== $data['value']))
            {
                $constraint = array(
                    $data['column'] => htmlspecialchars_decode($data['value']),
                );
            }
            break;
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
        case 'scan':
        {
            header("Content-Type: application/json");
            if(scan_libraries($constraint))
                echo '{"status" : "success"}' . PHP_EOL;
            else
                echo '{"status" : "failure",'
                    .' "message": "Invalid id/name"}' . PHP_EOL;

            die();
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
    // make sure to order regexp conditions with precedence
    // to avoid greedy matching, e.g photo_album|photo instead of photo|photo_album

    $regexp =
    "^[/]*api[/]+"
    . "(?<table>library)[/]+"
    . "(?<type>(scan))[/]*"
    . "((?<column>(id|name))[/]*){0,1}"
    //. "((?<like>like)[/]+){0,1}"
    . "(?<value>[^/]*)"
    . "$";

    $func = "library_url_handler";

    register_api_url_handler($regexp, $func);

};

$register_handlers();

?>
