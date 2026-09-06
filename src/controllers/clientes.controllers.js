const fs = require("fs");
const path = require("path");

const Cliente = require("../models/Cliente");
const rutaArchivo = path.join(__dirname, "../../data/clientes.json");


// función leer archivo
const leerClientes = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);

};

// función guardar archivo
const guardarClientes = (clientes) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(clientes, null, 2)
    );
};


// GET ALL
const obtenerClientes = (req, res) => {
    const clientes = leerClientes();
    res.json(clientes);
};


// GET BY ID
const obtenerClientePorId = (req, res) => {
    const clientes = leerClientes();
    const id = parseInt(req.params.id);
    const cliente = clientes.find(p => p.id === id);

    // Verificar si se encontró el cliente
    if (!cliente) {
        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });
    }

    res.json(cliente);
};


// CREATE
const crearCliente = (req, res) => {
    const clientes = leerClientes();
    const { id, nombre, apellido, email, telefono} = req.body;
    
    // Validar datos obligatorios
    if (!nombre || !apellido || !email || !telefono) {
        return res.status(400).json({
        mensaje: "Faltan datos obligatorios",
        });
    }
    
    // Generar un nuevo ID para el cliente
    const nuevoid = clientes.length > 0 ? clientes[clientes.length - 1].id + 1 : 1;

    const nuevoCliente = new Cliente(nuevoid, nombre, apellido, email, telefono);

    clientes.push(nuevoCliente);

    guardarClientes(clientes);

    res.status(201).json({
        mensaje: "Cliente creado exitosamente",
        cliente: nuevoCliente
    });

};


// UPDATE
const actualizarCliente = (req, res) => {
    const clientes = leerClientes();
    const id = parseInt(req.params.id);
    const cliente = clientes.find(p => p.id === id);

    if (!cliente) {
        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });
    }
   
    
    // actualizar los campos del cliente
    const { nombre, apellido, email, telefono } = req.body;

    cliente.nombre = nombre ?? cliente.nombre;
    cliente.apellido = apellido ?? cliente.apellido;
    cliente.email = email ?? cliente.email;
    cliente.telefono = telefono ?? cliente.telefono;

   
    guardarClientes(clientes);

    res.json({
        mensaje: "Cliente actualizado exitosamente",
        cliente
    });

};


// DELETE
const eliminarCliente = (req, res) => {
    const clientes = leerClientes();
    const id = parseInt(req.params.id);
    const nuevosClientes = clientes.filter(p => p.id !== id);

    // Verificar si se eliminó algún cliente
    if (clientes.length === nuevosClientes.length) {
        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });

    }

    guardarClientes(nuevosClientes);

    res.json({
        mensaje: "Cliente eliminado exitosamente"
    });
};

// exportar funciones
module.exports = {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente

};