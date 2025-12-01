// Importar módulos necesarios
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear aplicación Express
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json()); // Parsear JSON en el body

// Ruta al archivo de datos
const DATA_FILE = path.join(__dirname, 'Data', 'Data.json');

// ==================== FUNCIONES AUXILIARES ====================
// Leer datos del archivo JSON
const leerDatos = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer datos:', error);
        return [];
    }
};

// Escribir datos al archivo JSON
const escribirDatos = async (datos) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(datos, null, 2));
        return true;
    } catch (error) {
        console.error('Error al escribir datos:', error);
        return false;
    }
};

// ==================== RUTAS DE LA API ====================

// READ - Obtener todas las Gift Cards
app.get('/api/gifts', async (req, res) => {
    try {
        const datos = await leerDatos();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

// READ - Obtener una Gift Card por ID
app.get('/api/gifts/:id', async (req, res) => {
    try {
        const datos = await leerDatos();
        const id = parseInt(req.params.id);
        const gift = datos.find(item => item.id === id);
        
        if (gift) {
            res.json(gift);
        } else {
            res.status(404).json({ error: 'Gift Card no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el dato' });
    }
});

// CREATE - Agregar una nueva Gift Card
app.post('/api/gifts', async (req, res) => {
    try {
        const datos = await leerDatos();
        
        // Generar nuevo ID (último ID + 1)
        const nuevoId = datos.length > 0 ? datos[datos.length - 1].id + 1 : 1;
        
        // Crear nuevo objeto Gift
        const nuevoGift = {
            id: nuevoId,
            gift: req.body.gift,
            tipo: req.body.tipo,
            tiempo: req.body.tiempo,
            precio: parseFloat(req.body.precio),
            imagen: req.body.imagen
        };
        
        // Agregar al arreglo
        datos.push(nuevoGift);
        
        // Guardar en el archivo
        const guardado = await escribirDatos(datos);
        
        if (guardado) {
            res.status(201).json(nuevoGift);
        } else {
            res.status(500).json({ error: 'Error al guardar los datos' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la Gift Card' });
    }
});

// UPDATE - Actualizar una Gift Card existente
app.put('/api/gifts/:id', async (req, res) => {
    try {
        const datos = await leerDatos();
        const id = parseInt(req.params.id);
        const index = datos.findIndex(item => item.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Gift Card no encontrada' });
        }
        
        // Actualizar el objeto manteniendo el ID
        datos[index] = {
            id: id,
            gift: req.body.gift,
            tipo: req.body.tipo,
            tiempo: req.body.tiempo,
            precio: parseFloat(req.body.precio),
            imagen: req.body.imagen
        };
        
        // Guardar en el archivo
        const guardado = await escribirDatos(datos);
        
        if (guardado) {
            res.json(datos[index]);
        } else {
            res.status(500).json({ error: 'Error al guardar los datos' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la Gift Card' });
    }
});

// DELETE - Eliminar una Gift Card
app.delete('/api/gifts/:id', async (req, res) => {
    try {
        const datos = await leerDatos();
        const id = parseInt(req.params.id);
        const index = datos.findIndex(item => item.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Gift Card no encontrada' });
        }
        
        // Eliminar el elemento
        const giftEliminado = datos.splice(index, 1)[0];
        
        // Guardar en el archivo
        const guardado = await escribirDatos(datos);
        
        if (guardado) {
            res.json({ 
                mensaje: 'Gift Card eliminada exitosamente',
                gift: giftEliminado
            });
        } else {
            res.status(500).json({ error: 'Error al guardar los datos' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la Gift Card' });
    }
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api/gifts`);
});