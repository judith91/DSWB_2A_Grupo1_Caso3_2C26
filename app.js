require("dotenv").config();
const express = require("express");

const eventoRoutes = require("./src/routes/eventos.routes");

const app = express();

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.send("Urbana Cult");
});


// Middlewares
app.use(express.json());

// Rutas
app.use("/eventos", eventoRoutes);


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});