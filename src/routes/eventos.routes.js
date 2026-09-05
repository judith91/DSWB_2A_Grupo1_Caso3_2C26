const express = require("express");
const router = express.Router();

const {
  obtenerEventos,
  obtenerEventoPorId,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
} = require("../controllers/eventos.controllers");

router.get("/", obtenerEventos);
router.get("/:id", obtenerEventoPorId);
router.post("/", crearEvento);
router.put("/:id", actualizarEvento);
router.delete("/:id", eliminarEvento);

module.exports = router;