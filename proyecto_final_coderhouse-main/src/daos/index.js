let productosDao
let carritosDao
switch (process.env.PERS) {
   
    case 'mongodb':
        const { default: ProductosDaoMongoDb } = await import('./productos/ProductosDaoMongoDb.js')
        const { default: CarritosDaoMongoDb } = await import('./carritos/CarritosDaoMongoDb.js')

        productosDao = new ProductosDaoMongoDb()
        carritosDao = new CarritosDaoMongoDb()
        break
    default:
        const { default: ProductosDaoMem } = await import('./productos/ProductosDaoMongoDb.js')
        const { default: CarritosDaoMem } = await import('./carritos/CarritosDaoMongoDb.js')

        productosDao = new ProductosDaoMem()
        carritosDao = new CarritosDaoMem()
        break
}
export { productosDao, carritosDao }