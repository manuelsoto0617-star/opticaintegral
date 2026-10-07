
"use strict";
    const SUPABASE_URL = "https://qwjnhtlpezytaiglztqt.supabase.co";

const SUPABASE_KEY = "sb_publishable_KMr_Gx45OD6_XOdrgyISOw_aFxOV-GD";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL, 
    SUPABASE_KEY
// ============================================
// ÓPTICA INTEGRAL - SISTEMA DE GESTIÓN
// ============================================

// Datos temporales: se reinician al recargar la página.
let clientes = [];
let historias = [];
let citas = [];
let productos = [];
let ventas = [];
let ordenes = [];
let proveedores = [];
let notificaciones = [];

let siguienteId = {
    cliente: 1,
    historia: 1,
    cita: 1,
    producto: 1,
    venta: 1,
    orden: 1,
    proveedor: 1
};

function obtenerElemento(id) {
    return document.getElementById(id);
}

function mostrarMensaje(mensaje) {
    alert(mensaje);
}

// ============================================
// INICIO DEL SISTEMA Y LOGIN
// ============================================

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = obtenerElemento("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const usuario = obtenerElemento("usuario").value.trim();
            const password = obtenerElemento("password").value.trim();
            const errorLogin = obtenerElemento("errorLogin");
            const login = obtenerElemento("login");
            const sistema = obtenerElemento("sistema");

            if (usuario === "admin" && password === "1234") {
                if (errorLogin) {
                    errorLogin.textContent = "";
                }

                if (login) {
                    login.style.display = "none";
                }

                if (sistema) {
                    sistema.classList.remove("oculto");
                    sistema.style.display = "";
                }

                mostrarPagina("dashboard");
                actualizarFecha();
                actualizarDashboard();
                cargarClientesEnSelects();
                cargarProductosEnSelects();
                actualizarInventario();
            } else {
                if (errorLogin) {
                    errorLogin.textContent =
                        "Usuario o contraseña incorrectos. Intenta nuevamente.";
                } else {
                    mostrarMensaje("Usuario o contraseña incorrectos.");
                }
            }
        });
    }

    // Permitir mostrar la contraseña con el navegador.
    const sistema = obtenerElemento("sistema");
    if (sistema) {
        sistema.classList.add("oculto");
    }

    const login = obtenerElemento("login");
    if (login) {
        login.style.display = "";
    }

    conectarFormularios();
    actualizarFecha();
});

// ============================================
// CERRAR SESIÓN
// ============================================

function cerrarSesion() {
    const sistema = obtenerElemento("sistema");
    const login = obtenerElemento("login");

    if (sistema) {
        sistema.classList.add("oculto");
        sistema.style.display = "none";
    }

    if (login) {
        login.style.display = "";
    }

    const formulario = obtenerElemento("loginForm");
    if (formulario) {
        formulario.reset();
    }

    const error = obtenerElemento("errorLogin");
    if (error) {
        error.textContent = "";
    }
}

// ============================================
// NAVEGACIÓN ENTRE PÁGINAS
// ============================================

function mostrarPagina(nombrePagina) {
    const paginas = document.querySelectorAll(".pagina");

    paginas.forEach(function (pagina) {
        pagina.style.display = "none";
    });

    const paginaSeleccionada = obtenerElemento(nombrePagina);

    if (paginaSeleccionada) {
        paginaSeleccionada.style.display = "block";
    }

    const titulo = obtenerElemento("tituloPagina");
    if (titulo) {
        const titulos = {
            dashboard: "Panel principal",
            clientes: "Gestión de clientes",
            historias: "Historias optométricas",
            citas: "Gestión de citas",
            productos: "Gestión de productos",
            ventas: "Registro de ventas",
            ordenes: "Órdenes de trabajo",
            inventario: "Control de inventario",
            proveedores: "Gestión de proveedores",
            notificaciones: "Notificaciones",
            portal: "Portal del cliente"
        };

        titulo.textContent = titulos[nombrePagina] || "Óptica Integral";
    }

    if (nombrePagina === "dashboard") {
        actualizarDashboard();
    }

    if (nombrePagina === "inventario") {
        actualizarInventario();
    }

    if (nombrePagina === "portal") {
        actualizarPortal();
    }
}

// ============================================
// FECHA ACTUAL
// ============================================

function actualizarFecha() {
    const fecha = obtenerElemento("fechaActual");

    if (fecha) {
        fecha.textContent = new Date().toLocaleDateString("es-CO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
}

// ============================================
// CONEXIÓN DE FORMULARIOS
// ============================================

function conectarFormularios() {
    const formCliente = obtenerElemento("formCliente");
    if (formCliente) {
        formCliente.addEventListener("submit", guardarCliente);
    }

    const formHistoria = obtenerElemento("formHistoria");
    if (formHistoria) {
        formHistoria.addEventListener("submit", guardarHistoria);
    }

    const formCita = obtenerElemento("formCita");
    if (formCita) {
        formCita.addEventListener("submit", guardarCita);
    }

    const formProducto = obtenerElemento("formProducto");
    if (formProducto) {
        formProducto.addEventListener("submit", guardarProducto);
    }

    const formVenta = obtenerElemento("formVenta");
    if (formVenta) {
        formVenta.addEventListener("submit", guardarVenta);
    }

    const formOrden = obtenerElemento("formOrden");
    if (formOrden) {
        formOrden.addEventListener("submit", guardarOrden);
    }

    const formProveedor = obtenerElemento("formProveedor");
    if (formProveedor) {
        formProveedor.addEventListener("submit", guardarProveedor);
    }
}

// ============================================
// CLIENTES
// ============================================

function guardarCliente(event) {
    event.preventDefault();

    const nombre = obtenerElemento("clienteNombre").value.trim();
    const documento = obtenerElemento("clienteDocumento").value.trim();
    const nacimiento = obtenerElemento("clienteNacimiento").value;
    const telefono = obtenerElemento("clienteTelefono").value.trim();
    const correo = obtenerElemento("clienteCorreo").value.trim();
    const direccion = obtenerElemento("clienteDireccion").value.trim();
    const observaciones = obtenerElemento("clienteObservaciones").value.trim();

    if (!nombre || !documento) {
        mostrarMensaje("Ingresa el nombre y documento del cliente.");
        return;
    }

    if (clientes.some(c => c.documento === documento)) {
        mostrarMensaje("Ya existe un cliente con ese documento.");
        return;
    }

    clientes.push({
        id: siguienteId.cliente++,
        nombre,
        documento,
        nacimiento,
        telefono,
        correo,
        direccion,
        observaciones
    });

    event.target.reset();
    actualizarClientes();
    cargarClientesEnSelects();
    actualizarDashboard();
    agregarNotificacion("Se registró un nuevo cliente: " + nombre);

    mostrarMensaje("Cliente registrado correctamente.");
}

function actualizarClientes() {
    const tabla = obtenerElemento("tablaClientes");
    if (!tabla) return;

    tabla.innerHTML = "";

    clientes.forEach(function (cliente) {
        const fila = document.createElement("tr");

        [
            cliente.nombre,
            cliente.documento,
            cliente.telefono,
            cliente.correo,
            cliente.direccion
        ].forEach(function (dato) {
            const celda = document.createElement("td");
            celda.textContent = dato || "-";
            fila.appendChild(celda);
        });

        const acciones = document.createElement("td");
        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = "Eliminar";
        boton.addEventListener("click", function () {
            eliminarCliente(cliente.id);
        });

        acciones.appendChild(boton);
        fila.appendChild(acciones);
        tabla.appendChild(fila);
    });
}

function eliminarCliente(id) {
    if (!confirm("¿Deseas eliminar este cliente?")) return;

    clientes = clientes.filter(c => c.id !== id);
    actualizarClientes();
    cargarClientesEnSelects();
    actualizarDashboard();
}

// ============================================
// HISTORIAS OPTOMÉTRICAS
// ============================================

function guardarHistoria(event) {
    event.preventDefault();

    const clienteId = obtenerElemento("historiaCliente").value;
    const cliente = clientes.find(c => String(c.id) === String(clienteId));

    if (!cliente) {
        mostrarMensaje("Primero registra un cliente y selecciónalo.");
        return;
    }

    historias.push({
        id: siguienteId.historia++,
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        fecha: obtenerElemento("historiaFecha").value,
        optometra: obtenerElemento("historiaOptometra").value.trim(),
        motivo: obtenerElemento("historiaMotivo").value.trim(),
        antecedentes: obtenerElemento("historiaAntecedentes").value.trim(),
        odLejos: obtenerElemento("odLejos").value.trim(),
        oiLejos: obtenerElemento("oiLejos").value.trim(),
        odCerca: obtenerElemento("odCerca").value.trim(),
        oiCerca: obtenerElemento("oiCerca").value.trim(),
        adicion: obtenerElemento("adicion").value.trim(),
        dp: obtenerElemento("dp").value.trim(),
        altura: obtenerElemento("altura").value.trim(),
        agudeza: obtenerElemento("agudeza").value.trim(),
        tipoLente: obtenerElemento("tipoLente").value,
        observaciones: obtenerElemento("historiaObservaciones").value.trim()
    });

    event.target.reset();
    actualizarHistorias();
    agregarNotificacion("Se registró una historia optométrica.");

    mostrarMensaje("Historia optométrica registrada correctamente.");
}

function actualizarHistorias() {
    const tabla = obtenerElemento("tablaHistorias");
    if (!tabla) return;

    tabla.innerHTML = "";

    historias.forEach(function (historia) {
        const fila = document.createElement("tr");

        [
            historia.clienteNombre,
            historia.fecha,
            historia.optometra,
            historia.motivo,
            historia.tipoLente
        ].forEach(function (dato) {
            const celda = document.createElement("td");
            celda.textContent = dato || "-";
            fila.appendChild(celda);
        });

        tabla.appendChild(fila);
    });
}

// ============================================
// LISTAS DE CLIENTES
// ============================================

function cargarClientesEnSelects() {
    const ids = [
        "historiaCliente",
        "citaCliente",
        "ventaCliente",
        "ordenCliente"
    ];

    ids.forEach(function (id) {
        const select = obtenerElemento(id);
        if (!select) return;

        const valorAnterior = select.value;
        select.innerHTML = "";

        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = "Seleccionar cliente";
        select.appendChild(opcionInicial);

        clientes.forEach(function (cliente) {
            const opcion = document.createElement("option");
            opcion.value = cliente.id;
            opcion.textContent = cliente.nombre + " - " + cliente.documento;
            select.appendChild(opcion);
        });

        if (clientes.some(c => String(c.id) === String(valorAnterior))) {
            select.value = valorAnterior;
        }
    });
}

// ============================================
// CITAS
// ============================================

function guardarCita(event) {
    event.preventDefault();

    const clienteId = obtenerElemento("citaCliente").value;
    const cliente = clientes.find(c => String(c.id) === String(clienteId));

    if (!cliente) {
        mostrarMensaje("Selecciona un cliente registrado.");
        return;
    }

    citas.push({
        id: siguienteId.cita++,
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        fecha: obtenerElemento("citaFecha").value,
        hora: obtenerElemento("citaHora").value,
        profesional: obtenerElemento("citaProfesional").value.trim(),
        motivo: obtenerElemento("citaMotivo").value.trim(),
        estado: obtenerElemento("citaEstado").value
    });

    event.target.reset();
    actualizarCitas();
    actualizarDashboard();
    agregarNotificacion("Se registró una nueva cita para " + cliente.nombre);

    mostrarMensaje("Cita registrada correctamente.");
}

function actualizarCitas() {
    const tabla = obtenerElemento("tablaCitas");
    if (!tabla) return;

    tabla.innerHTML = "";

    citas.forEach(function (cita) {
        const fila = document.createElement("tr");

        [
            cita.clienteNombre,
            cita.fecha,
            cita.hora,
            cita.profesional,
            cita.motivo,
            cita.estado
        ].forEach(function (dato) {
            const celda = document.createElement("td");
            celda.textContent = dato || "-";
            fila.appendChild(celda);
        });

        tabla.appendChild(fila);
    });

    const resumen = obtenerElemento("resumenCitas");
    if (resumen) {
        const proximas = citas.filter(c =>
            c.fecha >= new Date().toISOString().slice(0, 10)
        );

        resumen.textContent = proximas.length
            ? proximas.map(c =>
                c.fecha + " " + c.hora + " - " + c.clienteNombre
            ).join("\n")
            : "No hay citas próximas.";
    }
}

// ============================================
// PRODUCTOS
// ============================================

function guardarProducto(event) {
    event.preventDefault();

    const codigo = obtenerElemento("productoCodigo").value.trim();
    const nombre = obtenerElemento("productoNombre").value.trim();
    const categoria = obtenerElemento("productoCategoria").value;
    const marca = obtenerElemento("productoMarca").value.trim();
    const modelo = obtenerElemento("productoModelo").value.trim();
    const proveedor = obtenerElemento("productoProveedor").value.trim();
    const precio = Number(obtenerElemento("productoPrecio").value);
    const existencia = Number(obtenerElemento("productoExistencia").value);

    if (!codigo || !nombre || precio < 0 || existencia < 0) {
        mostrarMensaje("Verifica los datos del producto.");
        return;
    }

    if (productos.some(p => p.codigo === codigo)) {
        mostrarMensaje("Ya existe un producto con ese código.");
        return;
    }

    productos.push({
        id: siguienteId.producto++,
        codigo,
        nombre,
        categoria,
        marca,
        modelo,
        proveedor,
        precio,
        existencia
    });

    event.target.reset();
    actualizarProductos();
    cargarProductosEnSelects();
    actualizarInventario();
    actualizarDashboard();
    agregarNotificacion("Se registró el producto: " + nombre);

    mostrarMensaje("Producto registrado correctamente.");
}

function actualizarProductos() {
    const tabla = obtenerElemento("tablaProductos");
    if (!tabla) return;

    tabla.innerHTML = "";

    productos.forEach(function (producto) {
        const fila = document.createElement("tr");

        [
            producto.codigo,
            producto.nombre,
            producto.categoria,
            producto.marca,
            producto.modelo,
            producto.proveedor,
            formatoMoneda(producto.precio),
            producto.existencia
        ].forEach(function (dato) {
            const celda = document.createElement("td");
            celda.textContent = dato ?? "-";
            fila.appendChild(celda);
        });

        tabla.appendChild(fila);
    });
}

function cargarProductosEnSelects() {
    const ids = ["ventaProducto", "ordenProducto"];

    ids.forEach(function (id) {
        const select = obtenerElemento(id);
        if (!select) return;

        const valorAnterior = select.value;
        select.innerHTML = "";

        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = "Seleccionar producto";
        select.appendChild(opcionInicial);

        productos.forEach(function (producto) {
            const opcion = document.createElement("option");
            opcion.value = producto.id;
            opcion.textContent =
                producto.nombre + " - Stock: " + producto.existencia;
            select.appendChild(opcion);
        });

        if (productos.some(p => String(p.id) === String(valorAnterior))) {
            select.value = valorAnterior;
        }
    });
}

// ============================================
// VENTAS
// ============================================

function guardarVenta(event) {
    event.preventDefault();

    const clienteId = obtenerElemento("ventaCliente").value;
    const productoId = obtenerElemento("ventaProducto").value;
    const cantidad = Number(obtenerElemento("ventaCantidad").value);
    const pago = obtenerElemento("ventaPago").value;

    const cliente = clientes.find(c => String(c.id) === String(clienteId));
    const producto = productos.find(p => String(p.id) === String(productoId));

    if (!cliente || !producto) {
        mostrarMensaje("Selecciona un cliente y un producto válidos.");
        return;
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        mostrarMensaje("La cantidad debe ser un número entero mayor que cero.");
        return;
    }

    if (cantidad > producto.existencia) {
        mostrarMensaje("No hay suficiente inventario para esta venta.");
        return;
    }

    const total = producto.precio * cantidad;

    ventas.push({
        id: siguienteId.venta++,
        clienteNombre: cliente.nombre,
        productoNombre: producto.nombre,
        cantidad,
        precio: producto.precio,
        total,
        pago,
        fecha: new Date().toLocaleDateString("es-CO")
    });

    producto.existencia -= cantidad;

    event.target.reset();
    actualizarVentas();
    actualizarProductos();
    cargarProductosEnSelects();
    actualizarInventario();
    actualizarDashboard();
    agregarNotificacion("Venta registrada por " + formatoMoneda(total));

    mostrarMensaje(
        "Venta registrada correctamente.\nTotal: " + formatoMoneda(total)
    );
}

function actualizarVentas() {
    const tabla = obtenerElemento("tablaVentas");
    if (!tabla) return;

    tabla.innerHTML = "";

    ventas.forEach(function (venta) {
        const fila = document.createElement("tr");

        [
            venta.fecha,
            venta.clienteNombre,
            venta.productoNombre,
            venta.cantidad,
            formatoMoneda(venta.precio),
            formatoMoneda(venta.total),
            venta.pago
        ].forEach(function (dato) {
            const celda = document.createElement("td");
            celda.textContent = dato || "-";
            fila.appendChild(celda);
        });

        tabla.appendChild(fila);
    });
}

// ============================================
// ÓRDENES DE TRABAJO
// ============================================

function guardarOrden(event) {
    event.preventDefault();

    const clienteId = obtenerElemento("ordenCliente").value;
    const productoId = obtenerElemento("ordenProducto").value;
    const observaciones = obtenerElemento("ordenObservaciones").value.trim();

    const cliente = clientes.find(c => String(c.id) === String(clienteId));
    const producto = productos.find(p => String(p.id) === String(productoId));

    if (!cliente || !producto) {
        mostrarMensaje("Selecciona un cliente y un producto válidos.");
        return;
    }

    ordenes.push({
        id: siguienteId.orden++,
        clienteNombre: cliente.nombre,
        productoNombre: producto.nombre,
        observaciones,
        estado: "Pendiente",
        fecha: new Date().toLocaleDateString("es-CO")
    });

    event.target.reset();
    actualizarOrdenes();
    actualizarDashboard();
    agregarNotificacion("Se creó una nueva orden para " + cliente.nombre);

    mostrarMensaje("Orden registrada correctamente.");
}

function actualizarOrdenes() {
    const tabla = obtenerElemento("tablaOrdenes");
    if (!tabla) return;

    tabla.innerHTML = "";

    ordenes.forEach(function (orden) {
        const fila = document.createElement("tr");

        [
            orden.id,
            orden.fecha,
            orden.clienteNombre,
            orden.productoNombre,
            orden.observaciones,
            orden.estado
        ].forEach(function (dato) {
            const celda = document.createElement("td");
            celda.textContent = dato || "-";
            fila.appendChild(celda);
        });

        const celdaAcciones = document.createElement("td");
        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = "Avanzar estado";

        boton.addEventListener("click", function () {
            avanzarOrden(orden.id);
        });

        celdaAcciones.appendChild(boton);
        fila.appendChild(celdaAcciones);
        tabla.appendChild(fila);
    });

    const resumen = obtenerElemento("resumenOrdenes");
    if (resumen) {
        resumen.textContent = ordenes.length
            ? ordenes.map(o =>
                "#" + o.id + " - " + o.clienteNombre + " - " + o.estado
            ).join("\n")
            : "No hay órdenes registradas.";
    }
}

function avanzarOrden(id) {
    const orden = ordenes.find(o => o.id === id);
    if (!orden) return;

    const estados = [
        "Pendiente",;
        "En proceso",
        "Listo para entregar",
        "Entregado"
    ];

    const posicion = estados.indexOf(orden.estado);

    if (posicion < estados.length - 1) {
        orden.estado = estados[posicion + 1];
        actualizarOrdenes();
        actualizarDashboard();
        agregarNotificacion(
            "La orden #" + orden.id + " cambió a: " + orden.estado
        );
    } else {
        mostrarMensaje("Esta orden ya fue entregada.");
    }
}

// ============================================
// INVENTARIO
// ============================================

function actualizarInventario() {
    const tabla = obtenerElemento("tablaInventario");
    if (!tabla) return;

    tabla.innerHTML = "";

    productos.forEach(function (producto) {
        const fila = document.createElement("tr");

        [
            producto.codigo,
            producto.nombre,
            producto.categoria,
            producto.existencia,
            formatoMoneda(producto.precio),
            producto.existencia <= 5 ? "Stock bajo" : "Disponible"
        ].forEach(function (dato) {
            const celda = document.createElement("td");
            celda.textContent = dato;
            fila.appendChild(celda);
        });

        tabla.appendChild(fila);
    });
}

// ============================================
// PROVEEDORES
// ============================================

function guardarProveedor(event) {
    event.preventDefault();

    const nombre = obtenerElemento("proveedorNombre").value.trim();
    const nit = obtenerElemento("proveedorNit").value.trim();
    const contacto = obtenerElemento("proveedorContacto").value.trim();
    const telefono = obtenerElemento("proveedorTelefono").value.trim();
    const correo = obtenerElemento("proveedorCorreo").value.trim();
    const direccion = obtenerElemento("proveedorDireccion").value.trim();

    if (!nombre) {
        mostrarMensaje("Ingresa el nombre del proveedor.");
        return;
    }

    proveedores.push({
        id: siguienteId.proveedor++,
        nombre,
        nit,
        contacto,
        telefono,
        correo,
        direccion
    });

    event.target.reset();
    actualizarProveedores();
    agregarNotificacion("Se registró el proveedor: " + nombre);

    mostrarMensaje("Proveedor registrado correctamente.");
}

function actualizarProveedores() {
    const tabla = obtenerElemento("tablaProveedores");
    if (!tabla) return;

    tabla.innerHTML = "";

    proveedores.forEach(function (proveedor) {
        const fila = document.createElement("tr");

        [
            proveedor.nombre,
            proveedor.nit,
            proveedor.contacto,
            proveedor.telefono,
            proveedor.correo,
            proveedor.direccion
        ].forEach(function (dato) {
            const celda = document.createElement("td");
            celda.textContent = dato || "-";
            fila.appendChild(celda);
        });

        tabla.appendChild(fila);
    });
}

// ============================================
// PANEL PRINCIPAL
// ============================================

function actualizarDashboard() {
    const totalClientes = obtenerElemento("totalClientes");
    const totalVentas = obtenerElemento("totalVentas");
    const totalOrdenes = obtenerElemento("totalOrdenes");
    const bajoStock = obtenerElemento("productosBajoStock");

    if (totalClientes) {
        totalClientes.textContent = clientes.length;
    }

    if (totalVentas) {
        const sumaVentas = ventas.reduce(
            (suma, venta) => suma + venta.total,
            0
        );
        totalVentas.textContent = formatoMoneda(sumaVentas);
    }

    if (totalOrdenes) {
        totalOrdenes.textContent = ordenes.length;
    }

    if (bajoStock) {
        bajoStock.textContent = productos.filter(
            producto => producto.existencia <= 5
        ).length;
    }

    const resumenOrdenes = obtenerElemento("resumenOrdenes");
    if (resumenOrdenes) {
        resumenOrdenes.textContent = ordenes.length
            ? ordenes.map(o =>
                "#" + o.id + " - " + o.clienteNombre + " - " + o.estado
            ).join("\n")
            : "No hay órdenes registradas.";
    }
}

// ============================================
// NOTIFICACIONES
// ============================================

function agregarNotificacion(mensaje) {
    notificaciones.unshift({
        mensaje,
        fecha: new Date().toLocaleString("es-CO")
    });

    actualizarNotificaciones();
}

function actualizarNotificaciones() {
    const lista = obtenerElemento("listaNotificaciones");
    if (!lista) return;

    lista.innerHTML = "";

    if (notificaciones.length === 0) {
        const elemento = document.createElement("p");
        elemento.textContent = "No hay notificaciones.";
        lista.appendChild(elemento);
        return;
    }

    notificaciones.forEach(function (notificacion) {
        const elemento = document.createElement("div");
        elemento.className = "notificacion";

        const mensaje = document.createElement("p");
        mensaje.textContent = notificacion.mensaje;

        const fecha = document.createElement("small");
        fecha.textContent = notificacion.fecha;

        elemento.appendChild(mensaje);
        elemento.appendChild(fecha);
        lista.appendChild(elemento);
    });
}

// ============================================
// PORTAL DEL CLIENTE
// ============================================

function actualizarPortal() {
    const contenido = obtenerElemento("portalContenido");
    if (!contenido) return;

    contenido.innerHTML = "";

    if (clientes.length === 0) {
        contenido.textContent = "Todavía no hay clientes registrados.";
        return;
    }

    clientes.forEach(function (cliente) {
        const tarjeta = document.createElement("div");
        tarjeta.className = "panel";

        const titulo = document.createElement("h3");
        titulo.textContent = cliente.nombre;

        const documento = document.createElement("p");
        documento.textContent = "Documento: " + cliente.documento;

        const telefono = document.createElement("p");
        telefono.textContent = "Teléfono: " + (cliente.telefono || "No registrado");

        const citasCliente = citas.filter(
            c => c.clienteId === cliente.id
        );

        const citaTexto = document.createElement("p");
        citaTexto.textContent = "Citas registradas: " + citasCliente.length;

        const historiasCliente = historias.filter(
            h => h.clienteId === cliente.id
        );

        const historiaTexto = document.createElement("p");
        historiaTexto.textContent =
            "Historias optométricas: " + historiasCliente.length;

        tarjeta.appendChild(titulo);
        tarjeta.appendChild(documento);
        tarjeta.appendChild(telefono);
        tarjeta.appendChild(citaTexto);
        tarjeta.appendChild(historiaTexto);

        contenido.appendChild(tarjeta);
    });
}

// ============================================
// UTILIDADES
// ============================================

function formatoMoneda(valor) {
    return Number(valor || 0).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    });
}
