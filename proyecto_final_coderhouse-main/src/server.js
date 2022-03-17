import express from 'express'
const { Router } = express
import passport from 'passport'
import dotenv from 'dotenv'
import localpassport from "passport-local"
import session from 'express-session'
const LocalStrategy=localpassport.Strategy
import user from'./user.js'
dotenv.config()


import {
    productosDao as productosApi,
    carritosDao as carritosApi
} from './daos/index.js'

//------------------------------------------------------------------------
// instancio servidor

const app = express()

/******************Configuracion Session*/
app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false
 }));
 passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
      });
    }
  ));
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(user.authenticate()));
 passport.serializeUser(user.serializeUser());
 passport.deserializeUser(user.deserializeUser());
 app.use(function(req, res, next){
     res.locals.currentUser = req.user;
     next();
 }); 
//--------------------------------------------
//RUTAS
app.post('/', 
  passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/productos.html');
  });

//
app.get('/',(req,res)=>{
    res.sendFile('public/login.html', { root: '.'})
})
app.get('/productos',(req,res)=>{
    res.sendFile('public/productos.html', { root: '.'})
})
// permisos de administrador

const esAdmin = true

function crearErrorNoEsAdmin(ruta, metodo) {
    const error = {
        error: -1,
    }
    if (ruta && metodo) {
        error.descripcion = `ruta '${ruta}' metodo '${metodo}' no autorizado`
    } else {
        error.descripcion = 'no autorizado'
    }
    return error
}

function soloAdmins(req, res, next) {
    if (!esAdmin) {
        res.json(crearErrorNoEsAdmin())
    } else {
        next()
    }
}

//--------------------------------------------
// configuro router de productos

const productosRouter = new Router()

productosRouter.get('/', async (req, res) => {
    const productos = await productosApi.listarAll()
    res.json(productos)
})

productosRouter.get('/:id', async (req, res) => {
    res.json(await productosApi.listar(req.params.id))
})

productosRouter.post('/', soloAdmins, async (req, res) => {
    res.json(await productosApi.guardar(req.body))
})

productosRouter.put('/:id', soloAdmins, async (req, res) => {
    res.json(await productosApi.actualizar(req.body))
})

productosRouter.delete('/:id', soloAdmins, async (req, res) => {
    res.json(await productosApi.borrar(req.params.id))
})

//--------------------------------------------
// configuro router de carritos

const carritosRouter = new Router()

carritosRouter.get('/', async (req, res) => {
    res.json((await carritosApi.listarAll()).map(c => c.id))
})

carritosRouter.post('/', async (req, res) => {
    res.json(await carritosApi.guardar())
})

carritosRouter.delete('/:id', async (req, res) => {
    res.json(await carritosApi.borrar(req.params.id))
})

//--------------------------------------------------
// router de productos en carrito

carritosRouter.get('/:id/productos', async (req, res) => {
    const carrito = await carritosApi.listar(req.params.id)
    res.json(carrito.productos)
})

carritosRouter.post('/:id/productos', async (req, res) => {
    const carrito = await carritosApi.listar(req.params.id)
    const producto = await productosApi.listar(req.body.id)
    carrito.productos.push(producto)
    await carritosApi.actualizar(carrito)
    res.end()
})

carritosRouter.delete('/:id/productos/:idProd', async (req, res) => {
    const carrito = await carritosApi.listar(req.params.id)
    const index = carrito.productos.findIndex(p => p.id == req.params.idProd)
    if (index != -1) {
        carrito.productos.splice(index, 1)
        await carritosApi.actualizar(carrito)
    }
    res.end()
})

//--------------------------------------------
// configuro el servidor

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('./public'))

app.use('/api/productos', productosRouter)
app.use('/api/carritos', carritosRouter)

export default app