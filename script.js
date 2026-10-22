const ADMIN_FIJO = {
  usuario:"Arturo",
  password:"123",
  rol:"admin",
  nombre:"Arturo"
};

let usuarioActual = null;

let rolLogin = "";

if(!localStorage.getItem("usuarios")){
  localStorage.setItem("usuarios", JSON.stringify([]));
}

function toast(mensaje, tipo){

  tipo = tipo || "info";

  const contenedor = document.getElementById("toast");

  const div = document.createElement("div");

  div.className = "toast-msg toast-" + tipo;

  div.innerText = mensaje;

  contenedor.appendChild(div);

  setTimeout(()=>{
    div.style.opacity = "0";
    div.style.transition = "opacity .4s";
    setTimeout(()=>div.remove(), 400);
  }, 3200);
}

function elegirRol(rol){

  rolLogin = rol;

  const btnAdmin = document.getElementById("btnRolAdmin");
  const btnEst = document.getElementById("btnRolEstudiante");

  btnAdmin.classList.remove("btn-rol-activo","btn-rol-off");
  btnEst.classList.remove("btn-rol-activo","btn-rol-off");

  const correo = document.getElementById("correoLogin");

  if(rol==="admin"){

    btnAdmin.classList.add("btn-rol-activo");
    btnEst.classList.add("btn-rol-off");

    correo.placeholder = "Usuario";

    document.getElementById("btnRegistrarLogin").classList.remove("btn-oculto");
    document.getElementById("btnEliminarLogin").classList.remove("btn-oculto");

    correo.focus();

  }else{

    btnEst.classList.add("btn-rol-activo");
    btnAdmin.classList.add("btn-rol-off");

    correo.placeholder = "Correo";

    document.getElementById("btnRegistrarLogin").classList.add("btn-oculto");
    document.getElementById("btnEliminarLogin").classList.add("btn-oculto");

    correo.focus();
  }

  correo.value = "";
  document.getElementById("passwordLogin").value = "";
}

function registrar(){
  document.getElementById("registroUsuario").classList.remove("oculto");
  document.getElementById("nombreRegistro").focus();
}

function guardarUsuario(){

  const nombre = document.getElementById("nombreRegistro").value.trim();
  const correo = document.getElementById("correoRegistro").value.trim();
  const cedula = document.getElementById("cedulaRegistro").value.trim();
  const telefono = document.getElementById("telefonoRegistro").value.trim();
  const direccion = document.getElementById("direccionRegistro").value.trim();

  if(!nombre || !correo || !cedula){
    toast("Complete nombre, correo y cédula", "error");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios"));

  if(usuarios.some(u=>u.correo===correo)){
    toast("El correo ya existe", "error");
    return;
  }

  const estudiante = {
    nombre,
    correo,
    password:cedula,
    rol:"estudiante",
    cedula,
    telefono,
    direccion
  };

  usuarios.push(estudiante);

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  usuarioActual = estudiante;

  sincronizarArchivo();

  mostrarPanel();

  toast("Registro exitoso. Su contraseña inicial es su cédula.", "exito");
}

function ingresar(){

  const valor = document.getElementById("correoLogin").value.trim();
  const password = document.getElementById("passwordLogin").value;

  if(!rolLogin){
    toast("Seleccione Administrador o Estudiantes", "error");
    return;
  }

  if(!valor || !password){
    toast("Complete todos los campos", "error");
    return;
  }

  if(rolLogin==="admin"){

    const usuarios = JSON.parse(localStorage.getItem("usuarios"));

    const adminImportado = usuarios.find(
      u=>u.rol==="admin" && u.usuario===valor && u.password===password
    );

    if((valor===ADMIN_FIJO.usuario && password===ADMIN_FIJO.password) || adminImportado){
      usuarioActual = adminImportado || ADMIN_FIJO;
      mostrarPanel();
      toast("Bienvenido " + usuarioActual.nombre, "exito");
      return;
    }

    toast("Usuario o contraseña incorrectos", "error");
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios"));

  const encontrado = usuarios.find(
    u=>u.rol==="estudiante" && u.correo===valor && u.password===password
  );

  if(!encontrado){
    toast("Credenciales incorrectas", "error");
    return;
  }

  usuarioActual = encontrado;

  mostrarPanel();

  toast("Bienvenido " + usuarioActual.nombre, "exito");
}

function mostrarPanel(){

  document.querySelector(".contenedor-login").style.display="none";

  document.getElementById("registroUsuario").classList.add("oculto");

  document.getElementById("panel").classList.remove("oculto");

  document.getElementById("usuarioActivo").innerText = usuarioActual.nombre;

  actualizarContador();

  if(usuarioActual.rol==="estudiante"){

    document.getElementById("btnEliminar").style.display="none";
    document.getElementById("btnExcel").style.display="none";

    cargarDatosEstudiante();
  }
}

function cargarDatosEstudiante(){
  document.getElementById("cedula").value = usuarioActual.cedula || "";
  document.getElementById("telefono").value = usuarioActual.telefono || "";
  document.getElementById("direccion").value = usuarioActual.direccion || "";
}

function cerrarSesion(){
  location.reload();
}

function obtenerRegistros(){
  return JSON.parse(localStorage.getItem("registros")) || [];
}

function guardarRegistro(){

  let registros = obtenerRegistros();

  const registro = {
    cedula: document.getElementById("cedula").value.trim(),
    nombre1: document.getElementById("nombre1").value.trim(),
    nombre2: document.getElementById("nombre2").value.trim(),
    apellido1: document.getElementById("apellido1").value.trim(),
    apellido2: document.getElementById("apellido2").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    direccion: document.getElementById("direccion").value.trim()
  };

  if(!registro.cedula){
    toast("La cédula es obligatoria", "error");
    return;
  }

  const existe = registros.find(r => r.cedula === registro.cedula);

  if(existe){
    toast("La cédula ya existe", "error");
    return;
  }

  registros.push(registro);

  localStorage.setItem("registros", JSON.stringify(registros));

  actualizarContador();

  sincronizarArchivo();

  toast("Guardado correctamente", "exito");
}

function consultarRegistro(){

  const cedula = document.getElementById("buscarCedula").value.trim();

  const registros = obtenerRegistros();

  const encontrado = registros.find(r=>r.cedula===cedula);

  if(!encontrado){
    toast("No encontrado", "error");
    return;
  }

  document.getElementById("cedula").value=encontrado.cedula;
  document.getElementById("nombre1").value=encontrado.nombre1;
  document.getElementById("nombre2").value=encontrado.nombre2;
  document.getElementById("apellido1").value=encontrado.apellido1;
  document.getElementById("apellido2").value=encontrado.apellido2;
  document.getElementById("telefono").value=encontrado.telefono;
  document.getElementById("direccion").value=encontrado.direccion;

  toast("Registro encontrado", "exito");
}

function editarRegistro(){

  const cedula = document.getElementById("cedula").value.trim();

  let registros = obtenerRegistros();

  const indice = registros.findIndex(r=>r.cedula===cedula);

  if(indice===-1){
    toast("Registro no encontrado", "error");
    return;
  }

  registros[indice] = {
    cedula,
    nombre1: document.getElementById("nombre1").value.trim(),
    nombre2: document.getElementById("nombre2").value.trim(),
    apellido1: document.getElementById("apellido1").value.trim(),
    apellido2: document.getElementById("apellido2").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    direccion: document.getElementById("direccion").value.trim()
  };

  localStorage.setItem("registros", JSON.stringify(registros));

  sincronizarArchivo();

  toast("Registro actualizado", "exito");
}

function eliminarRegistro(){

  if(!confirm("¿Eliminar registro?")){
    return;
  }

  const cedula = document.getElementById("cedula").value.trim();

  let registros = obtenerRegistros();

  registros = registros.filter(r=>r.cedula!==cedula);

  localStorage.setItem("registros", JSON.stringify(registros));

  actualizarContador();

  sincronizarArchivo();

  toast("Eliminado", "exito");
}

function eliminarUsuario(){

  let correo = prompt("Ingrese correo o usuario del usuario a eliminar");

  if(!correo){
    return;
  }

  correo = correo.trim();

  let usuarios = JSON.parse(localStorage.getItem("usuarios"));

  const antes = usuarios.length;

  usuarios = usuarios.filter(u=>u.correo!==correo && u.usuario!==correo);

  if(usuarios.length===antes){
    toast("Usuario no encontrado", "error");
    return;
  }

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  sincronizarArchivo();

  toast("Usuario eliminado", "exito");
}

function actualizarContador(){
  document.getElementById("contador").innerText = obtenerRegistros().length;
}

/* ===================== ARCHIVO ÚNICO registros.xlsx ===================== */

const COLUMNAS = ["rol","nombre","usuario","correo","password","cedula",
                  "nombre1","nombre2","apellido1","apellido2","telefono","direccion"];

let archivoHandle = null;

function abrirDB(){
  return new Promise((res,rej)=>{
    try{
      const req = indexedDB.open("sistemaRegistro",1);
      req.onupgradeneeded = ()=>{ req.result.createObjectStore("archivos"); };
      req.onsuccess = ()=>res(req.result);
      req.onerror = ()=>rej(req.error);
    }catch(e){ rej(e); }
  });
}

async function guardarHandle(h){
  try{
    const db = await abrirDB();
    await new Promise((res,rej)=>{
      const tx = db.transaction("archivos","readwrite");
      tx.objectStore("archivos").put(h,"registros");
      tx.oncomplete = res;
      tx.onerror = ()=>rej(tx.error);
    });
  }catch(e){}
}

async function obtenerHandleGuardado(){
  try{
    const db = await abrirDB();
    return await new Promise((res)=>{
      const tx = db.transaction("archivos","readonly");
      const r = tx.objectStore("archivos").get("registros");
      r.onsuccess = ()=>res(r.result || null);
      r.onerror = ()=>res(null);
    });
  }catch(e){ return null; }
}

function manejarAbrirArchivo(ev){
  if(window.showOpenFilePicker){
    ev.preventDefault();
    conectarArchivo();
    return false;
  }
  return true;
}

async function conectarArchivo(){

  if(!window.showOpenFilePicker){
    toast("Su navegador no permite guardar en el mismo archivo. Use Chrome o Edge.", "error");
    document.getElementById("archivoUsuarios").click();
    return;
  }

  try{
    const [h] = await window.showOpenFilePicker({
      multiple:false,
      types:[{ description:"Excel", accept:{
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":[".xlsx"]
      }}]
    });
    archivoHandle = h;
    await guardarHandle(h);
    if(await verificarPermiso(true)){
      await leerArchivoConectado();
    }
  }catch(e){
    if(e && e.name !== "AbortError"){
      toast("No se pudo abrir el archivo", "error");
    }
  }

  actualizarEstadoArchivo();
}

async function verificarPermiso(pedir){
  if(!archivoHandle){
    return false;
  }
  try{
    let p = await archivoHandle.queryPermission({mode:"readwrite"});
    if(p === "granted"){
      return true;
    }
    if(pedir){
      p = await archivoHandle.requestPermission({mode:"readwrite"});
    }
    return p === "granted";
  }catch(e){
    return false;
  }
}

async function leerArchivoConectado(){
  try{
    const file = await archivoHandle.getFile();
    const buf = await file.arrayBuffer();
    const libro = XLSX.read(new Uint8Array(buf), {type:"array"});
    const hoja = libro.Sheets[libro.SheetNames[0]];
    const filas = XLSX.utils.sheet_to_json(hoja, {defval:""});
    if(filas.length===0){
      toast("El archivo no contiene datos", "error");
      return;
    }
    procesarFilas(filas);
    actualizarContador();
    toast("Conectado a " + archivoHandle.name + " (" + obtenerRegistros().length + " registros)", "exito");
  }catch(e){
    toast("Error al leer el archivo", "error");
  }
}

function procesarFilas(filas){

  const usuarios = [];
  const registros = [];

  filas.forEach(f=>{

    const rol = String(f.rol || f.Rol || f.tipo || f.Tipo || "estudiante").toLowerCase();

    const nombre = f.nombre || f.Nombre || "";
    const usuario = f.usuario || f.Usuario || "";
    const correo = f.correo || f.Correo || "";
    const cedula = f.cedula || f.Cedula || "";
    const password = f.password || f.Password || f["contraseña"] || f["Contraseña"] || "";
    const telefono = f.telefono || f.Telefono || "";
    const direccion = f.direccion || f.Direccion || "";
    const nombre1 = f.nombre1 || f.Nombre1 || "";
    const nombre2 = f.nombre2 || f.Nombre2 || "";
    const apellido1 = f.apellido1 || f.Apellido1 || "";
    const apellido2 = f.apellido2 || f.Apellido2 || "";

    if(rol.includes("admin")){
      usuarios.push({
        nombre: nombre || usuario,
        usuario,
        password: password || "123",
        rol:"admin"
      });
    }else{
      usuarios.push({
        nombre,
        correo,
        password: password || cedula,
        rol:"estudiante",
        cedula,
        telefono,
        direccion,
        nombre1,
        nombre2,
        apellido1,
        apellido2
      });

      if(cedula || nombre1 || apellido1){
        registros.push({cedula,nombre1,nombre2,apellido1,apellido2,telefono,direccion});
      }
    }
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  localStorage.setItem("registros", JSON.stringify(registros));
}

function construirFilas(){

  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const registros = obtenerRegistros();
  const filas = [];
  const usados = new Set();

  usuarios.forEach(u=>{

    if(u.rol === "admin"){
      filas.push({
        rol:"admin", nombre:u.nombre || u.usuario || "", usuario:u.usuario || "",
        correo:"", password:u.password || "", cedula:"", nombre1:"", nombre2:"",
        apellido1:"", apellido2:"", telefono:"", direccion:""
      });
      return;
    }

    const reg = registros.find(r=>r.cedula && u.cedula && r.cedula===u.cedula) || {};
    if(reg.cedula){
      usados.add(reg.cedula);
    }

    filas.push({
      rol:"estudiante",
      nombre: u.nombre || "",
      usuario: u.usuario || "",
      correo: u.correo || "",
      password: u.password || u.cedula || "",
      cedula: u.cedula || reg.cedula || "",
      nombre1: reg.nombre1 || u.nombre1 || "",
      nombre2: reg.nombre2 || u.nombre2 || "",
      apellido1: reg.apellido1 || u.apellido1 || "",
      apellido2: reg.apellido2 || u.apellido2 || "",
      telefono: reg.telefono || u.telefono || "",
      direccion: reg.direccion || u.direccion || ""
    });
  });

  registros.forEach(r=>{
    if(r.cedula && usados.has(r.cedula)){
      return;
    }
    filas.push({
      rol:"estudiante", nombre:"", usuario:"", correo:"",
      password: r.cedula || "", cedula: r.cedula || "",
      nombre1: r.nombre1 || "", nombre2: r.nombre2 || "",
      apellido1: r.apellido1 || "", apellido2: r.apellido2 || "",
      telefono: r.telefono || "", direccion: r.direccion || ""
    });
  });

  return filas;
}

async function guardarEnArchivo(mostrarMensaje){

  if(!archivoHandle){
    if(mostrarMensaje){
      toast("Conecte primero registros.xlsx", "error");
    }
    return false;
  }

  if(!await verificarPermiso(true)){
    toast("Permiso denegado para escribir el archivo", "error");
    return false;
  }

  try{
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.json_to_sheet(construirFilas(), {header:COLUMNAS});
    XLSX.utils.book_append_sheet(libro, hoja, "Registros");
    const datos = XLSX.write(libro, {bookType:"xlsx", type:"array"});
    const w = await archivoHandle.createWritable();
    await w.write(datos);
    await w.close();
    if(mostrarMensaje){
      toast("Guardado en " + archivoHandle.name, "exito");
    }
    return true;
  }catch(e){
    toast("No se pudo escribir el archivo (¿está abierto en Excel/LibreOffice?)", "error");
    return false;
  }
}

function sincronizarArchivo(){
  if(archivoHandle){
    guardarEnArchivo(false);
  }
}

async function guardarExcel(){
  if(archivoHandle){
    await guardarEnArchivo(true);
    return;
  }

  const filas = construirFilas();
  if(filas.length===0){
    toast("No hay registros para exportar", "error");
    return;
  }

  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(filas, {header:COLUMNAS});
  XLSX.utils.book_append_sheet(libro, hoja, "Registros");
  XLSX.writeFile(libro, "registros.xlsx");
  toast("Archivo descargado (conecte el archivo para actualizarlo directamente)", "info");
}

function actualizarEstadoArchivo(){
  const texto = archivoHandle
    ? "Archivo conectado: " + archivoHandle.name + " — los cambios se guardan automáticamente."
    : "Sin archivo conectado. Conecte registros.xlsx para guardar en ese mismo archivo.";

  ["estadoArchivo","estadoArchivoPanel"].forEach(id=>{
    const el = document.getElementById(id);
    if(!el){
      return;
    }
    el.innerText = texto;
    el.classList.toggle("conectado", !!archivoHandle);
  });
}

function importarUsuarios(event){

  const archivo = event.target.files[0];

  if(!archivo){
    return;
  }

  const lector = new FileReader();

  lector.onload = function(e){

    try{

      const datos = new Uint8Array(e.target.result);
      const libro = XLSX.read(datos, {type:"array"});
      const hoja = libro.Sheets[libro.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json(hoja, {defval:""});

      if(filas.length===0){
        toast("El archivo está vacío", "error");
        return;
      }

      procesarFilas(filas);

      actualizarContador();

      guardarEnArchivo(false);

      toast("Se importaron " + filas.length + " filas desde " + archivo.name, "exito");

      event.target.value = "";

    }catch(err){
      toast("Error al leer el archivo", "error");
    }
  };

  lector.readAsArrayBuffer(archivo);
}

(async function iniciarArchivo(){
  archivoHandle = await obtenerHandleGuardado();
  if(archivoHandle && await verificarPermiso(false)){
    await leerArchivoConectado();
  }else if(archivoHandle){
    archivoHandle = null;
  }
  actualizarEstadoArchivo();
})();
