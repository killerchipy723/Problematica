// app.js (Node.js + Express)
const express = require('express');
const path = require('path');
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');
const excel = require('exceljs');

const app = express();
const PORT = 3100;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); 

// Registro de alumnos
app.post('/registrar', (req, res) => {
    const { apenomb, dni, carrera, año} = req.body;
    const query = 'INSERT INTO registros (apenomb, dni, carrera, año) VALUES (?, ?, ?, ?)';
    db.query(query, [apenomb.toUpperCase(), dni, carrera, año], (err, result) => {
        if (err) return res.status(500).send('Error al registrar alumno');
        res.status(200).send('Alumno registrado correctamente');
    });
});

// Obtener todos los registros
app.get('/registros', (req, res) => {
    db.query('SELECT * FROM registros', (err, results) => {
        if (err) return res.status(500).send('Error al obtener registros');
        res.json(results);
    });
});

// Exportar a Excel
app.get('/exportar', (req, res) => {
    db.query('SELECT * FROM registros', async (err, results) => {
        if (err) return res.status(500).send('Error al exportar');

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Alumnos');

        worksheet.columns = [
            { header: 'ID', key: 'idregistros', width: 10 },
            { header: 'Nombre y Apellido', key: 'apenomb', width: 30 },
            { header: 'DNI', key: 'dni', width: 20 },
            { header: 'Carrera', key: 'carrera', width: 25 },
            { header: 'Año', key: 'anio', width: 10 },
        ];

        worksheet.addRows(results);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=alumnos.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    });
});

app.listen(PORT, '0.0.0.0',() => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
