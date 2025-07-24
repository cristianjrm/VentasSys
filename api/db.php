<?php
// Encabezados para permitir peticiones desde cualquier origen (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Obtener la URL de la base de datos de las variables de entorno de Railway
$db_url = getenv('MYSQL_URL');

if ($db_url === false) {
    die("Error: No se encontró la variable de entorno MYSQL_URL.");
}

// Parsear la URL para obtener las credenciales
$db_parts = parse_url($db_url);

$servername = $db_parts['host'];
$username = $db_parts['user'];
$password = $db_parts['pass'];
$dbname = ltrim($db_parts['path'], '/');
$port = $db_parts['port'];

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname, $port);

// Chequear conexión
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Asegurarse de que la conexión use UTF-8
$conn->set_charset("utf8mb4");
?>
