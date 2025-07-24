<?php
require 'db.php'; // Incluye la conexión a la base de datos

// --- Lógica para manejar las diferentes acciones ---

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Función para enviar una respuesta JSON
function send_json($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// --- MANEJO DE PETICIONES ---

switch ($action) {
    case 'login':
        if ($method === 'POST') {
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            
            $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
            $stmt->bind_param("ss", $username, $password);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($user = $result->fetch_assoc()) {
                send_json(['success' => true, 'user' => ['username' => $user['username'], 'role' => $user['role']]]);
            } else {
                send_json(['success' => false, 'message' => 'Credenciales incorrectas']);
            }
        }
        break;

    case 'get_all_data':
        if ($method === 'GET') {
            $state = [];
            // Obtener inventario
            $state['inventory'] = $conn->query("SELECT * FROM inventory ORDER BY name ASC")->fetch_all(MYSQLI_ASSOC);
            // Obtener ventas
            $state['sales'] = $conn->query("SELECT * FROM sales ORDER BY date DESC")->fetch_all(MYSQLI_ASSOC);
            // Obtener items de ventas
            foreach($state['sales'] as $key => $sale) {
                $stmt = $conn->prepare("SELECT * FROM sale_items WHERE sale_id = ?");
                $stmt->bind_param("i", $sale['id']);
                $stmt->execute();
                $state['sales'][$key]['items'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            }
            // Obtener gastos
            $state['expenses'] = $conn->query("SELECT * FROM expenses ORDER BY date DESC")->fetch_all(MYSQLI_ASSOC);
            // Obtener configuraciones
            $settings_result = $conn->query("SELECT * FROM settings")->fetch_all(MYSQLI_ASSOC);
            $state['settings'] = [];
            foreach ($settings_result as $row) {
                $state['settings'][$row['setting_key']] = $row['setting_value'];
            }
            send_json($state);
        }
        break;
        
    case 'get_users':
        if ($method === 'GET') {
            $users = $conn->query("SELECT id, username, role FROM users")->fetch_all(MYSQLI_ASSOC);
            send_json($users);
        }
        break;

    case 'add_user':
        if ($method === 'POST') {
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            $role = $input['role'] ?? 'Vendedor';

            $stmt = $conn->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $username, $password, $role);
            if ($stmt->execute()) {
                send_json(['success' => true, 'id' => $conn->insert_id]);
            } else {
                send_json(['success' => false, 'message' => $conn->error]);
            }
        }
        break;

    case 'update_user':
        if ($method === 'POST') {
            $id = $input['id'] ?? 0;
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            $role = $input['role'] ?? '';

            if ($password) {
                $stmt = $conn->prepare("UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?");
                $stmt->bind_param("sssi", $username, $password, $role, $id);
            } else {
                $stmt = $conn->prepare("UPDATE users SET username = ?, role = ? WHERE id = ?");
                $stmt->bind_param("ssi", $username, $role, $id);
            }

            if ($stmt->execute()) {
                send_json(['success' => true]);
            } else {
                send_json(['success' => false, 'message' => $conn->error]);
            }
        }
        break;

    case 'delete_user':
        if ($method === 'POST') {
            $id = $input['id'] ?? 0;
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                send_json(['success' => true]);
            } else {
                send_json(['success' => false, 'message' => $conn->error]);
            }
        }
        break;

    case 'save_sale':
        if ($method === 'POST') {
            $sale = $input['sale'];
            $items = $input['items'];

            $conn->begin_transaction();
            try {
                // 1. Insertar la venta
                $stmt = $conn->prepare("INSERT INTO sales (date, subtotal, tax, total, totalSecondary, profit, exchangeRate, paymentMethod, reference, transactionType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("sddddddsss", $sale['date'], $sale['subtotal'], $sale['tax'], $sale['total'], $sale['totalSecondary'], $sale['profit'], $sale['exchangeRate'], $sale['paymentMethod'], $sale['reference'], $sale['transactionType']);
                $stmt->execute();
                $sale_id = $conn->insert_id;

                // 2. Insertar los items de la venta y actualizar inventario
                $stmt_item = $conn->prepare("INSERT INTO sale_items (sale_id, product_id, name, quantity, salePrice, purchasePrice) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt_update_inv = $conn->prepare("UPDATE inventory SET quantity = quantity - ? WHERE id = ?");

                foreach ($items as $item) {
                    $stmt_item->bind_param("iisidd", $sale_id, $item['id'], $item['name'], $item['quantity'], $item['salePrice'], $item['purchasePrice']);
                    $stmt_item->execute();
                    
                    $stmt_update_inv->bind_param("ii", $item['quantity'], $item['id']);
                    $stmt_update_inv->execute();
                }
                
                $conn->commit();
                send_json(['success' => true, 'sale_id' => $sale_id]);
            } catch (mysqli_sql_exception $exception) {
                $conn->rollback();
                http_response_code(500);
                send_json(['success' => false, 'message' => $exception->getMessage()]);
            }
        }
        break;

    default:
        http_response_code(404);
        send_json(['error' => 'Acción no encontrada']);
        break;
}

$conn->close();
?>
