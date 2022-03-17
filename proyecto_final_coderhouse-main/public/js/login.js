
let iniciarSesion = ()=>{
   let username= document.getElementById('username').value
   let password= document.getElementById('password').value
   return username, password
}
let formaInicioSesion=document.getElementById("formaInicioSesion")
formaInicioSesion.onsubmit=iniciarSesion;
