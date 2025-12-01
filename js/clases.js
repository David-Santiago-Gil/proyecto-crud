// La palabra 'export' permite usar esta clase
// en otros archivos JavaScript
export class Gift {
    // El 'constructor' se ejecuta automáticamente
    // cuando creamos un objeto con 'new Gift(...)'
    constructor(id, gift, tipo, tiempo, precio, imagen) {
        // 'this' hace referencia al objeto específico
        // que se está creando en este momento
        this.id = id;
        this.gift = gift;
        this.tipo = tipo;
        this.tiempo = tiempo;
        this.precio = precio;
        this.imagen = imagen;
    }
}