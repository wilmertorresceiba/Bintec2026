-- Esquema generado desde database/bintec.db (SQLite). Fuente de verdad: los modelos SQLAlchemy de cada modulo.

CREATE TABLE creditos (
	id VARCHAR(36) NOT NULL, 
	usuario_id INTEGER NOT NULL, 
	tipo VARCHAR(40) NOT NULL, 
	ultimos_digitos VARCHAR(4) NOT NULL, 
	monto_original INTEGER NOT NULL, 
	saldo_capital INTEGER NOT NULL, 
	valor_cuota INTEGER NOT NULL, 
	cuotas_pagadas INTEGER NOT NULL, 
	cuotas_totales INTEGER NOT NULL, 
	tasa_mensual FLOAT NOT NULL, 
	proximo_pago DATETIME NOT NULL, 
	estado VARCHAR(20) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE cuentas_ahorro (
	id VARCHAR(36) NOT NULL, 
	usuario_id INTEGER NOT NULL, 
	tipo VARCHAR(40) NOT NULL, 
	ultimos_digitos VARCHAR(4) NOT NULL, 
	saldo_total INTEGER NOT NULL, 
	saldo_disponible INTEGER NOT NULL, 
	rendimientos_mes INTEGER NOT NULL, 
	tasa_efectiva_anual FLOAT NOT NULL, 
	fecha_apertura DATETIME NOT NULL, 
	estado VARCHAR(20) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE movimientos (
	id VARCHAR(36) NOT NULL, 
	usuario_id INTEGER NOT NULL, 
	fecha DATETIME NOT NULL, 
	descripcion VARCHAR(200) NOT NULL, 
	producto VARCHAR(80) NOT NULL, 
	tipo VARCHAR(20) NOT NULL, 
	valor INTEGER NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE notificaciones (
	id VARCHAR(36) NOT NULL, 
	usuario_id INTEGER NOT NULL, 
	tipo VARCHAR(40) NOT NULL, 
	titulo VARCHAR(120) NOT NULL, 
	mensaje VARCHAR(400) NOT NULL, 
	fecha DATETIME NOT NULL, 
	estado VARCHAR(20) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE tarjetas_credito (
	id VARCHAR(36) NOT NULL, 
	usuario_id INTEGER NOT NULL, 
	marca VARCHAR(20) NOT NULL, 
	nombre VARCHAR(80) NOT NULL, 
	ultimos_digitos VARCHAR(4) NOT NULL, 
	cupo_total INTEGER NOT NULL, 
	cupo_utilizado INTEGER NOT NULL, 
	pago_minimo INTEGER NOT NULL, 
	pago_total INTEGER NOT NULL, 
	fecha_limite_pago DATETIME NOT NULL, 
	estado VARCHAR(20) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE usuarios (
	id INTEGER NOT NULL, 
	nombre VARCHAR(120) NOT NULL, 
	correo VARCHAR(254) NOT NULL, 
	clave_hash VARCHAR(255) NOT NULL, 
	clave_cajero_hash VARCHAR(255) NOT NULL, 
	intentos_fallidos INTEGER NOT NULL, 
	bloqueado_hasta DATETIME, 
	PRIMARY KEY (id)
);

CREATE INDEX ix_creditos_usuario_id ON creditos (usuario_id);

CREATE INDEX ix_cuentas_ahorro_usuario_id ON cuentas_ahorro (usuario_id);

CREATE INDEX ix_movimientos_fecha ON movimientos (fecha);

CREATE INDEX ix_movimientos_usuario_id ON movimientos (usuario_id);

CREATE INDEX ix_notificaciones_estado ON notificaciones (estado);

CREATE INDEX ix_notificaciones_usuario_id ON notificaciones (usuario_id);

CREATE INDEX ix_tarjetas_credito_usuario_id ON tarjetas_credito (usuario_id);

CREATE UNIQUE INDEX ix_usuarios_correo ON usuarios (correo);
