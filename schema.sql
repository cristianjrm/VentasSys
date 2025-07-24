--
-- Estructura de la base de datos para `ventassys`
--

-- Tabla para los gastos
CREATE TABLE `expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla para el inventario
CREATE TABLE `inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `purchasePrice` decimal(10,2) NOT NULL DEFAULT 0.00,
  `salePrice` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla para los items de una venta
CREATE TABLE `sale_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sale_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `salePrice` decimal(10,2) NOT NULL,
  `purchasePrice` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla para las ventas
CREATE TABLE `sales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `totalSecondary` decimal(10,2) NOT NULL,
  `profit` decimal(10,2) NOT NULL,
  `exchangeRate` decimal(10,2) NOT NULL,
  `paymentMethod` varchar(255) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `transactionType` varchar(50) NOT NULL DEFAULT 'Venta',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla para las configuraciones
CREATE TABLE `settings` (
  `setting_key` varchar(255) NOT NULL,
  `setting_value` text NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar configuraciones por defecto
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('companyAddress', 'Calle Principal 123, Ciudad'),
('companyName', 'Mi Negocio'),
('companyPhone', '0412-345-6789'),
('exchangeRate', '36.50'),
('primaryCurrencySymbol', '$'),
('secondaryCurrencySymbol', 'Bs.'),
('taxEnabled', 'false'),
('taxRate', '16');

-- Tabla para los usuarios
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar usuario administrador por defecto
INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
(1, 'admin', 'admin123', 'Administrador');

--
-- Índices para tablas volcadas
--
ALTER TABLE `sale_items`
  ADD KEY `sale_id` (`sale_id`);

--
-- Restricciones para tablas volcadas
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE;
