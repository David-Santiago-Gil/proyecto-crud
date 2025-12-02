// server.js (CRUD con Node.js Vanilla y Logs Detallados)

import http from 'http';
import fs from 'fs'; 
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;
const host = 'localhost';

// Ruta al archivo de datos (asumiendo que está en Data/Data.json)
const DATA_FILE = path.join(__dirname, 'Data', 'Data.json');

// ==================== FUNCIONES AUXILIARES DE DATOS (SÍNCRONAS) ====================
const leerDatos = () => {
    try {
        // Lee el archivo de forma síncrona (bloqueante)
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const escribirDatos = (datos) => {
    try {
        // Escribe el archivo de forma síncrona (bloqueante)
        fs.writeFileSync(DATA_FILE, JSON.stringify(datos, null, 2));
        return true;
    } catch (error) {
        console.error('❌ ERROR AL ESCRIBIR DATOS:', error);
        return false;
    }
};

// Función auxiliar para leer el cuerpo de la petición (debe ser Promise)
function getBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error("Error 400: El cuerpo de la petición no es un JSON válido."));
            }
        });
        req.on('error', (err) => {
            reject(err);
        });
    });
}

// ==================== DEFINICIÓN DEL SERVIDOR ====================
const server = http.createServer(async (req, res) => {

    const url = req.url;
    const method = req.method;

    // Log de la Petición (Mensaje en la terminal de VS Code)
    console.log(`\n➡️ Petición [${method}] recibida en: ${url}`);

    // --- MANEJO DE CORS ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Manejar la petición OPTIONS (preflight)
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        // Establecer Content-Type por defecto para las rutas API
        res.setHeader('Content-Type', 'application/json');

        // --- 1. RUTAS DE PRUEBA DEL TESTER ---
        if (url === '/ruta-vanilla' && method === 'GET') {
            res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 200;
            console.log(`   ✅ Respuesta 200: Ruta de prueba de texto enviada.`);
            res.end('¡Servidor HTTP Vanilla en funcionamiento en la ruta principal!');
            return;
        }

        if (url === '/api/prueba' && method === 'GET') {
            res.statusCode = 200;
            console.log(`   ✅ Respuesta 200: Ruta de prueba JSON enviada.`);
            res.end(JSON.stringify({
                "status": 200,
                "mensaje": "Esta es la respuesta de la ruta /api/prueba (JSON)."
            }));
            return;
        }


        // --- 2. LÓGICA DE RUTEO CRUD: /api/gifts ---
        
        // RUTA BASE: /api/gifts
        if (url === '/api/gifts') {

            // 2.1. READ (GET) - Leer todos los registros
            if (method === 'GET') {
                const datos = leerDatos();
                res.statusCode = 200;
                console.log(`   ✅ Respuesta 200: Enviando ${datos.length} Gift Cards.`);
                res.end(JSON.stringify(datos));
                return;
            }

            // 2.2. CREATE (POST) - Crear un nuevo registro
            if (method === 'POST') {
                const body = await getBody(req); // Lectura del body es asíncrona
                const { gift, tipo, tiempo, precio, imagen } = body;
                
                // Validación de datos
                if (!gift || !tipo || !tiempo || !precio || !imagen || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
                    res.statusCode = 400;
                    console.log(`   ❌ ERROR 400: Intento de creación con datos faltantes o inválidos.`);
                    res.end(JSON.stringify({ error: 'Error 400: Datos incompletos o precio inválido.' }));
                    return;
                }

                const datos = leerDatos(); // Operación síncrona
                const nuevoId = datos.length > 0 ? datos[datos.length - 1].id + 1 : 1;
                
                const nuevoGift = {
                    id: nuevoId,
                    gift, tipo, tiempo, 
                    precio: parseFloat(precio), imagen
                };
                
                datos.push(nuevoGift);
                escribirDatos(datos); // Operación síncrona

                res.statusCode = 201; // 201 Created
                console.log(`   ➕ Éxito 201: Nueva Gift Card creada: [ID: ${nuevoId}, Nombre: ${gift}]`);
                res.end(JSON.stringify(nuevoGift));
                return;
            }
        }

        // RUTA CON ID: /api/gifts/:id
        const matchId = url.match(/^\/api\/gifts\/(\d+)$/);

        if (matchId) {
            const id = parseInt(matchId[1]);
            const datos = leerDatos(); // Operación síncrona
            const index = datos.findIndex(l => l.id === id);
            
            // Verificar si el recurso existe
            if (index === -1) {
                res.statusCode = 404;
                console.log(`   ⚠️ ERROR 404: Intento de acceder a ID ${id} (No encontrado).`);
                res.end(JSON.stringify({ mensaje: `Error 404: Gift Card con ID ${id} no encontrada.` }));
                return;
            }

            // 2.3. READ (GET) - Leer un registro por ID
            if (method === 'GET') {
                res.statusCode = 200;
                console.log(`   ✅ Respuesta 200: Enviando Gift Card con ID ${id}.`);
                res.end(JSON.stringify(datos[index]));
                return;
            }

            // 2.4. UPDATE (PUT) - Modificar un registro por ID
            if (method === 'PUT') {
                const body = await getBody(req); // Lectura del body es asíncrona
                const { gift, tipo, tiempo, precio, imagen } = body;

                // Validación de datos
                if (!gift || !tipo || !tiempo || !precio || !imagen || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
                    res.statusCode = 400;
                    console.log(`   ❌ ERROR 400: Intento de actualizar ID ${id} con datos inválidos.`);
                    res.end(JSON.stringify({ error: 'Error 400: Datos incompletos o precio inválido para actualizar.' }));
                    return;
                }
                
                datos[index] = { id: id, gift, tipo, tiempo, precio: parseFloat(precio), imagen };
                escribirDatos(datos); // Operación síncrona

                res.statusCode = 200;
                console.log(`   📝 Éxito 200: Gift Card actualizada: [ID: ${id}, Nuevo Nombre: ${gift}]`);
                res.end(JSON.stringify(datos[index]));
                return;
            }

            // 2.5. DELETE (DELETE) - Eliminar un registro por ID
            if (method === 'DELETE') {
                const giftEliminado = datos.splice(index, 1)[0];
                escribirDatos(datos); // Operación síncrona
                
                res.statusCode = 200;
                console.log(`   🗑️ Éxito 200: Gift Card ELIMINADA: [ID: ${id}, Nombre: ${giftEliminado.gift}]`);
                res.end(JSON.stringify({ mensaje: `Gift Card con ID ${id} eliminada.`, gift: giftEliminado }));
                return;
            }
        }

        // --- 3. Manejo de Rutas No Encontradas (404) ---
        res.statusCode = 404;
        console.log(`   ❌ ERROR 404: Ruta [${method}] no encontrada: ${url}`);
        res.end(JSON.stringify({ mensaje: 'Error 404: Ruta no encontrada.' }));

    } catch (error) {
        // Manejo de Errores Internos
        console.error('   🛑 ERROR 500: Fallo crítico del servidor:', error.message);
        res.statusCode = 500;
        res.end(JSON.stringify({ mensaje: 'Error 500: Error interno del servidor.', detalle: error.message }));
    }
});

// ==================== INICIO DEL SERVIDOR ====================
server.listen(port, host, () => {
    console.log('----------------------------------------------------');
    console.log(`🚀 SERVIDOR ACTIVO: http://${host}:${port}`);
    console.log('✅ Logs de CRUD activados en esta terminal de VS Code.');
    console.log('❗ RECUERDA: Abre index.html directamente en el navegador.');
    console.log('----------------------------------------------------');
});