<?php
// Encabezados para permitir peticiones desde cualquier origen (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// --- CONFIGURA TUS DATOS AQUÍ ---
$servername = "localhost";      // Generalmente 'localhost'
$username = "tu_usuario_db";    // El usuario de tu base de datos
$password = "tu_contraseña_db"; // La contraseña de tu base de datos
$dbname = "tu_nombre_db";       // El nombre de tu base de datos

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Chequear conexión
if ($conn->connect_error) {
  // En una aplicación real, se manejaría este error de forma más elegante
  die("Connection failed: " . $conn->connect_error);
}

// Asegurarse de que la conexión use UTF-8
$conn->set_charset("utf8mb4");
?>
