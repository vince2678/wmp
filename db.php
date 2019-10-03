<?php

function connect_to_db()
{
    $host = $GLOBALS['cfg']['db']['host'];
    $user = $GLOBALS['cfg']['db']['username'];
    $pass = $GLOBALS['cfg']['db']['password'];
    $dbname = $GLOBALS['cfg']['db']['schema'];

    if ($host && $user && $pass && $dbname)
    {
        $mysqli = new \mysqli($host, $user, $pass, $dbname);
    }
    else // try connecting with defaults
        $mysqli = new \mysqli();

    if ($mysqli->connect_errno)
        die("Failed to connect to db: " . $mysqli->connect_errno . " - " . $mysqli->connect_error);

    // Set connection character set
    if(false == $mysqli->set_charset("utf8"))
    {
        die("Failed to set charset: " . $mysqli->errno . " - " . $mysqli->error);
    }

    return $mysqli;
}

function insert_row($table, $kv_pair)
{
    $db = connect_to_db();

    $k = array_keys($kv_pair);

    for ($i = 0; $i < count($k) - 1; $i++)
    {
        $key = $k[$i];
        $keys .= $db->escape_string($key) . ",";
        $values .= "'" . $db->escape_string($kv_pair[$key]) . "',";
    }
    $key = $k[$i];
    $keys .= $db->escape_string($key);
    $values .= "'" . $db->escape_string($kv_pair[$key]) . "'";

    $query = "INSERT INTO " . $db->escape_string($table)
        . "(" . $keys . ")"
        . " value(" . $values . ");";

    if (false == ($res = $db->query($query)))
        printf("Failed to insert: %s\n", $db->error);

    $db->close();

    return $res;
}

function update_row($table, $key, $value, $kv_pair)
{
    $db = connect_to_db();

    $k = array_keys($kv_pair);

    for ($i = 0; $i < count($k) - 1; $i++)
    {
        $row .= $db->escape_string($k[$i]) . '='
            . "'" . $db->escape_string($kv_pair[$k[$i]]) . "',";
    }
    $row .= $db->escape_string($k[$i]) . '='
        . "'" . $db->escape_string($kv_pair[$k[$i]]) . "'";

    $query = "UPDATE " . $db->escape_string($table) . " SET " . $row
        . " WHERE "
        . $db->escape_string($key)
        . "='" . $db->escape_string($value) . "';";

    if (false == ($res = $db->query($query)))
        printf("Failed to update: %s\n", $db->error);

    $db->close();

    return $res;
}

function delete_row($table, $key, $value)
{
    $db = connect_to_db();

    $query = "DELETE FROM " . $db->escape_string($table) . " WHERE "
        . $db->escape_string($key) . "="
        . "'" . $db->escape_string($value) . "';";

    if (false == ($res = $db->query($query)))
        printf("Failed to delete: %s\n", $db->error);

    $db->close();

    return $res;
}

?>
