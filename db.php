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

    $keys = "";
    $values = "";

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

/* Count the number of rows returned by query
*/
function count_rows($table, $kv_pair)
{
    $db = connect_to_db();

    $query = "SELECT * FROM " . $db->escape_string($table);

    $k = array_keys($kv_pair);

    if (count($kv_pair) > 0)
    {
        $query .= " WHERE ";
        for ($i = 0; $i < count($k) - 1; $i++)
        {
            $query .= $db->escape_string($k[$i]) . '='
                . "'" . $db->escape_string($kv_pair[$k[$i]]) . "' AND ";
        }
        $query .= $db->escape_string($k[$i]) . '='
            . "'" . $db->escape_string($kv_pair[$k[$i]]) . "'";
    }
    $query .= ";";

    $count = -1;

    if (false !== ($result = $db->query($query)))
    {
        $count = $result->num_rows;
        $result->free();
    }
    $db->close();

    return $count;
}

function get_row($table, $constraint, $persist = false)
{
    static $result = null;
    static $db = null;

    if (!isset($db))
        $db = connect_to_db();

    if (!isset($result))
    {
        $keys = array_keys($constraint);

        $query = "SELECT * FROM " . $table;

        if (count($keys) > 0)
        {
            $query .= " WHERE";
            for ($i = 0; $i < count($keys) - 1; $i++)
            {
                $k = $db->escape_string($keys[$i]);
                $v = $db->escape_string($constraint[$keys[$i]]);

                $query .= " {$k}='{$v}' AND";
            }
            $k = $db->escape_string($keys[$i]);
            $v = $db->escape_string($constraint[$keys[$i]]);

            $query .= " {$k}='{$v}';";
        }
        else
        {
            $query .= ";";
        }

        if (false == ($result = $db->query($query)))
        {
            printf("Error %s\n", $db->error);
            $result = null;
            return null;
        }
    }

    if ((null == ($row = $result->fetch_assoc())) || !$persist)
    {
        $result->free();
        $db->close();

        $result = null;
        $db = null;
    }

    return $row;

}

function get_rows($table, $constraint)
{
    $rows = [];

    while (null !== ($row = get_row($table, $constraint, true)))
    {
        $rows[] = $row;
    }

    return $rows;

}

function get_rows_json($table, $constraint)
{
    $rows = get_rows($table, $constraint);

    if (isset($rows))
        $encoded = json_encode($rows);
    else
        $encoded = "[]" . PHP_EOL;

    return $encoded;
}

?>
