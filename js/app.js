// Importar la clase Gift desde clases.js
import { Gift } from "./clases.js";

// URL del API backend
const API_URL = "http://localhost:3000/api/gifts";

// Variable global para el ID del gift en edición
let idGiftUpdate = null;

// Array para almacenar los datos
let datos = [];

// Capturar elemento del DOM: cuerpo de la tabla
const cuerpoTabla = document.querySelector("#cuerpo-tabla");

// Inicializar el modal de Bootstrap
const myModal = new bootstrap.Modal(
    document.getElementById("modal-gift")
);

// Capturar el formulario por su ID
const formAgregar = document.querySelector("#form-gift");

// Capturar el formulario dentro del modal
const formModal = document.querySelector("#form-modal");

// ==================== READ ====================
// Función para cargar datos desde el servidor
const cargarDatos = async () => {
    try {
        const response = await fetch(API_URL);
        datos = await response.json();
        cargarTabla();
    } catch (error) {
        console.error("Error al cargar datos:", error);
        alert("Error al cargar los datos del servidor");
    }
};

// Función para cargar la tabla
const cargarTabla = () => {
    // Limpiar tabla antes de cargar
    cuerpoTabla.innerHTML = "";
    
    // Recorrer el arreglo de datos
    datos.map((item) => {
        // Crear fila de tabla
        const fila = document.createElement("tr");
        
        // Crear contenido HTML de las celdas
        const celdas = `
            <td>${item.gift}</td>
            <td>${item.tipo}</td>
            <td>${item.tiempo}</td>
            <td>$${item.precio}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-warning" 
                        onclick="window.MostrarModal(${item.id})">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="btn btn-outline-danger" 
                        onclick="window.BorrarGift(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        `;
        
        fila.innerHTML = celdas;
        cuerpoTabla.appendChild(fila);
    });
};

// ==================== CREATE ====================
const agregarGift = async (e) => {
    // Prevenir el comportamiento por defecto del formulario
    e.preventDefault();
    
    // Capturar valores de los inputs
    const gift = document.querySelector("#gift").value;
    const tipo = document.querySelector("#tipo").value;
    const tiempo = document.querySelector("#tiempo").value;
    const precio = document.querySelector("#precio").value;
    const imagen = document.querySelector("#imagen").value;
    
    // Crear objeto nuevo
    const nuevoGift = {
        gift,
        tipo,
        tiempo,
        precio: parseFloat(precio),
        imagen
    };
    
    try {
        // Enviar al servidor
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoGift)
        });
        
        if (response.ok) {
            // Limpiar todos los campos del formulario
            formAgregar.reset();
            
            // Recargar datos desde el servidor
            await cargarDatos();
            
            alert("Gift Card agregada exitosamente");
        } else {
            throw new Error("Error al agregar Gift Card");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al agregar la Gift Card");
    }
};

// ==================== DELETE ====================
window.BorrarGift = async (id) => {
    // Encontrar el elemento en el arreglo local
    const index = datos.findIndex((item) => item.id === id);
    
    if (index === -1) {
        alert("Gift Card no encontrada");
        return;
    }
    
    // Mostrar diálogo de confirmación
    const validar = confirm(
        `¿Está seguro que quiere eliminar la gift Card ${datos[index].gift}?`
    );
    
    // Si el usuario confirma (presiona Aceptar)
    if (validar) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });
            
            if (response.ok) {
                // Recargar datos desde el servidor
                await cargarDatos();
                alert("Gift Card eliminada exitosamente");
            } else {
                throw new Error("Error al eliminar Gift Card");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al eliminar la Gift Card");
        }
    }
};

// ==================== UPDATE - Parte 1 ====================
window.MostrarModal = (id) => {
    // PASO 1: Guardar el ID globalmente
    idGiftUpdate = id;
    
    // PASO 2: Encontrar el elemento en el arreglo
    const index = datos.findIndex((item) => item.id === id);
    
    if (index === -1) {
        alert("Gift Card no encontrada");
        return;
    }
    
    // PASO 3: Pre-llenar los inputs del modal
    document.querySelector("#gift-modal").value = datos[index].gift;
    document.querySelector("#tipo-modal").value = datos[index].tipo;
    document.querySelector("#tiempo-modal").value = datos[index].tiempo;
    document.querySelector("#precio-modal").value = datos[index].precio;
    document.querySelector("#imagen-modal").value = datos[index].imagen;
    
    // PASO 4: Mostrar el modal
    myModal.show();
};

// ==================== UPDATE - Parte 2 ====================
const giftUpdate = async (e) => {
    // Prevenir recarga de página
    e.preventDefault();
    
    // Capturar nuevos valores del modal
    const giftActualizado = {
        gift: document.querySelector("#gift-modal").value,
        tipo: document.querySelector("#tipo-modal").value,
        tiempo: document.querySelector("#tiempo-modal").value,
        precio: parseFloat(document.querySelector("#precio-modal").value),
        imagen: document.querySelector("#imagen-modal").value
    };
    
    try {
        const response = await fetch(`${API_URL}/${idGiftUpdate}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(giftActualizado)
        });
        
        if (response.ok) {
            // Recargar datos desde el servidor
            await cargarDatos();
            
            // Cerrar el modal
            myModal.hide();
            
            alert("Gift Card actualizada exitosamente");
        } else {
            throw new Error("Error al actualizar Gift Card");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al actualizar la Gift Card");
    }
};

// ==================== EVENT LISTENERS ====================
// Escuchar el evento 'submit' del formulario de agregar
formAgregar.addEventListener("submit", agregarGift);

// Escuchar el evento 'submit' del formulario modal
formModal.addEventListener("submit", giftUpdate);

// ==================== INICIALIZACIÓN ====================
// Cargar datos al iniciar la aplicación
cargarDatos();