const fs = require("fs");
const path = require("path");
const Evento = require("../models/Evento");

const rutaArchivo = path.join(__dirname, "../../data/eventos.json");
const rutaSalas = path.join(__dirname, "../../data/salas.json");

// Función leer archivo de eventos
const leerEventos = () => {
  const data = fs.readFileSync(rutaArchivo, "utf-8");
  return JSON.parse(data);
};

// Función guardar archivo de eventos
const guardarEventos = (eventos) => {
  fs.writeFileSync(rutaArchivo, JSON.stringify(eventos, null, 2));
};

// Función leer salas
const leerSalas = () => {
  const data = fs.readFileSync(rutaSalas, "utf-8");
  return JSON.parse(data);
};

// Actualizar automáticamente el estado de los eventos según fecha y hora
const actualizarEstados = (eventos) => {
  const ahora = new Date();

  let huboCambios = false;

  eventos.forEach((evento) => {
    const fechaHoraEvento = new Date(`${evento.fecha}T${evento.hora}`);

    if (fechaHoraEvento < ahora && evento.estado === "activo") {
      evento.estado = "finalizado";
      huboCambios = true;
    }
  });

  if (huboCambios) {
    guardarEventos(eventos);
  }

  return eventos;
};

// GET ALL (API)
const obtenerEventos = (req, res) => {
  const eventos = leerEventos();
  actualizarEstados(eventos);
  res.json(eventos);
};

// GET BY ID (API)
const obtenerEventoPorId = (req, res) => {
  const eventos = leerEventos();
  const id = parseInt(req.params.id);
  const evento = eventos.find((e) => e.id === id);

  if (!evento) {
    return res.status(404).json({
      mensaje: "Evento no encontrado",
    });
  }

  res.json(evento);
};

// CREATE
const crearEvento = (req, res) => {
  const eventos = leerEventos();
  const salas = leerSalas();

  const { titulo, descripcion, fecha, hora, salaId } = req.body;

  // Validar datos obligatorios
  if (!titulo || !descripcion || !fecha || !hora || !salaId) {
    return res.status(400).json({
      mensaje: "Faltan datos obligatorios",
    });
  }

  // Convertir salaId a número
  const idSala = Number(salaId);

  // Validar que la sala exista
  const sala = salas.find((s) => s.id === idSala);

  if (!sala) {
    return res.status(404).json({
      mensaje: "La sala no existe",
    });
  }

  // Validar que la fecha sea válida
  const año = Number(fecha.substring(0, 4));

  if (año < 2026) {
    return res.status(400).json({
      mensaje: "La fecha no puede ser anterior al año 2026",
    });
  }

  // Validar que no haya otro evento en la misma sala, fecha y hora
  const conflicto = eventos.find(
    (evento) =>
      evento.salaId === idSala &&
      evento.fecha === fecha &&
      evento.hora === hora
  );

  if (conflicto) {
    return res.status(400).json({
      mensaje: "Ya existe un evento en esa sala, fecha y hora",
    });
  }

  // Generar automáticamente el próximo ID
  const nuevoId =
    eventos.reduce(
      (mayor, evento) => (evento.id > mayor ? evento.id : mayor),
      0
    ) + 1;

  // Crear evento nuevo
  // Todo evento nuevo comienza como activo
  const nuevoEvento = new Evento(
    nuevoId,
    titulo,
    descripcion,
    fecha,
    hora,
    idSala,
    "activo"
  );

  eventos.push(nuevoEvento);

  guardarEventos(eventos);

  res.status(201).json({
    mensaje: "Evento creado",
    evento: nuevoEvento,
  });
};

// UPDATE
const actualizarEvento = (req, res) => {
  const eventos = leerEventos();
  const id = parseInt(req.params.id);
  const evento = eventos.find((e) => e.id === id);

  if (!evento) {
    return res.status(404).json({
      mensaje: "Evento no encontrado",
    });
  }

  const { titulo, descripcion, fecha, hora, salaId, estado } = req.body;

  evento.titulo = titulo ?? evento.titulo;
  evento.descripcion = descripcion ?? evento.descripcion;
  evento.fecha = fecha ?? evento.fecha;
  evento.hora = hora ?? evento.hora;
  evento.salaId = salaId ? Number(salaId) : evento.salaId;
  evento.estado = estado ?? evento.estado;

  guardarEventos(eventos);

  res.json({
    mensaje: "Evento actualizado",
    evento,
  });
};

// DELETE
const eliminarEvento = (req, res) => {
  const eventos = leerEventos();
  const id = parseInt(req.params.id);
  const nuevosEventos = eventos.filter((e) => e.id !== id);

  if (eventos.length === nuevosEventos.length) {
    return res.status(404).json({
      mensaje: "Evento no encontrado",
    });
  }

  guardarEventos(nuevosEventos);

  res.json({
    mensaje: "Evento eliminado",
  });
};

module.exports = {
  obtenerEventos,
  obtenerEventoPorId,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
};