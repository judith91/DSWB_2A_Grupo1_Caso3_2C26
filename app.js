require("dotenv").config();
const express = require("express");

const app = express();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Urbana Cult");
});
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});