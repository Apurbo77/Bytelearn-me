<?php
$db = new mysqli('127.0.0.1', 'root', '', 'bytelearn');

if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

$result = $db->query('DESCRIBE courses');

echo "Table Structure:\n";
echo str_pad("Field", 20) . str_pad("Type", 20) . str_pad("Null", 10) . str_pad("Default", 20) . "\n";
echo str_repeat("-", 70) . "\n";

while($row = $result->fetch_assoc()) {
    echo str_pad($row['Field'], 20) 
        . str_pad($row['Type'], 20) 
        . str_pad($row['Null'], 10) 
        . str_pad($row['Default'] ?? 'NULL', 20) . "\n";
}

$db->close();
?>
