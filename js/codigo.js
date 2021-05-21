let usuConectado;
let favoritos;
let posDevice;

document.addEventListener("deviceready", onDeviceReady, false);

ons.ready(init);

document.addEventListener("offline",function () {
    console.log('offline callback')
    ons.notification.toast('No se capturo ningun codigo QR',{timeout:1000});
  },
  false
);

document.addEventListener(
  "online",
  function () {
    myNavigator.popPage();
  },
  false
);

function onDeviceReady() {
  QRScanner.prepare(prepareCallback);
}


function prepareCallback(err, status) {
  if (err) {
    ons.notification.toast('Error, intente otra vez!',{timeout:1000});
  }
  if (status.authorized) {
    irDetalle(status);
  } else if (status.denied) {
    ons.notification.toast("Cancelado", { timeout: 1000 });
  } else {
    ons.notification.toast("Cancelado", { timeout: 1000 });
  }
} 

function init(){

  let token = window.localStorage.getItem("token");

  if (token) {
    $.ajax({
      type: "GET",
      url: "http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/usuarios/session",
      contentType: "application/json",
      beforeSend: confirmacionUsuario,
      success: function (confirmacionLogin) { 
        usuConectado = confirmacionLogin;
        document.querySelector('#myNavigator').pushPage('menu.html');
        // cargoProductos();
      },
      error: function() { 
      },
      complete: function(){
      },
    });
  } 

  window.navigator.geolocation.getCurrentPosition(
    function (pos) {
      posDevice = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
    },
    function () {
      posDevice = {
        latitude: -34.9176711,
        longitude: -56.152399,
      };
    }
  );
}

document.addEventListener(
  'offline',
  function(){
    console.log('offline')
    ons.notification.toast('Usuario Creado',{timeout:1000});
  }
)

function confirmacionUsuario(request) {
  let token = window.localStorage.getItem('token');
  request.setRequestHeader("x-auth", token);
}

function salir(){
  usuConectado = null;
  window.localStorage.removeItem("token");
  document.querySelector('#myNavigator').resetToPage('inicio.html');
}

document.addEventListener('init', function(event) {
  var page = event.target;

  switch (page.id){
    case 'qrPage':
      let qr = page.data.scanText;
      irDetalle(qr);      
      break;
    case 'catalogo':
      cargoProductos();
      break;
    case 'favoritos':
      obtenerFavoritos();
      mostrarFavoritos();
      break;
    case 'pedidos':
      verPedidos();
      break;
    case 'detalle':
      let id = page.data.id;
      irDetalle(id);
      
      var mymap = L.map('mapid').setView([posDevice.latitude, posDevice.longitude], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(mymap);
      var posUser = L.marker([posDevice.latitude, posDevice.longitude]).addTo(mymap).bindPopup('Yo').openPopup();
      var marker1 = L.marker([-34.90275348754379, -56.178794659438]).addTo(mymap);
      var marker2 = L.marker([-34.92402612998003, -56.15855864224328]).addTo(mymap);
      var marker3 = L.marker([-34.90207550242177, -56.13402058087038]).addTo(mymap);
      var marker4 = L.marker([-34.88928107210954, -56.18663563854235]).addTo(mymap);
      var marker5 = L.marker([-34.906095509529706, -56.195111815794895]).addTo(mymap);
    }
});

function escanear() {
  if (window.QRScanner) {
      window.QRScanner.show(function (status) {
      window.QRScanner.scan(scanCallback);
    });
  }
}

function scanCallback(err, text) {
  if (err) {
    ons.notification.toast('No se capturo ningun codigo QR',{timeout:1000});
  } else {
    QRScanner.hide();
    myNavigator.popPage({ data: { scanText: text } });
  }
}

function verificarRegistro(){
  let nombre = $('#regNombre').val();
  let pass = $('#regPass').val();
  let apellido = $('#regApellido').val();
  let direccion = $('#regDireccion').val();
  let correo = $('#regCorreo').val();

  if(!nombre || !apellido || !direccion){
      ons.notification.alert('Campos incompletos',{timeout:1000})
  }else{
    if(!validarEmail(correo)){
      ons.notification.alert('Mail incorrecto',{timeout:1000})
    }else{
      if(pass.length >= 8){
      confirmarRegistro(nombre,pass,apellido,direccion,correo)
      }else{
      ons.notification.alert('error en la password',{timeout:1000})
      }
    }
  }  
}

function validarEmail(_correo) {
  let posicionArroba = _correo.indexOf('@');
  let posicionPunto = _correo.indexOf('.', posicionArroba); 
  let largoCorreo = _correo.length -1; 
  let validoTextos = false; 

  if (posicionArroba >=1 && _correo.indexOf('@', posicionArroba+1) === -1 && _correo.indexOf('.', posicionPunto +1) === -1) {
      validoTextos = true;
      return true;
  }
  if(validarNombre(_correo) && posicionArroba < posicionPunto -1 && posicionPunto < largoCorreo && validoTextos) { 
      return true;
  } else {
      return false;
  }
}

function confirmarRegistro(nombre,password,apellido,direccion,email){
    
  probando = {
    nombre: nombre,
    apellido: apellido,
    direccion: direccion,
    email: email,
    password: password
  };

  $.ajax({
      url: "http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/usuarios",
      type: `POST`,
      dataType: `json`,
      contentType: `application/json`,
      data:JSON.stringify(probando),

      success: function(data){
        ons.notification.toast('Usuario Creado',{timeout:1000});
        document.querySelector('#myNavigator').popPage();     
        console.log(`la data`,data);      
      },
      error: function(e1, e2, e3){
        ons.notification.toast('Lamentablemente ese usario ya existe, pruebe con otro!',{timeout:1000});      
        console.log(`Error..`,e1, e2, e3);
      },
      complete: function(){
      console.log(`Fin!`);
      },
});
}

function btnIrAlRegistro() {
  document.querySelector('#myNavigator').pushPage('registro.html');
}

function login() {
  let correo = $("#txtLogin").val();
  let pass = $("#txtPassword").val();

  probando = {
    email: correo,
    password: pass
  };

  $.ajax({
    type: "POST",
    url: "http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/usuarios/session",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(probando),
      success: function(data){
        ons.notification.toast('LOGIN EXITOSO', {timeout: 1000});
        localStorage.setItem('userId',data.data.email);
        localStorage.setItem('token',data.data.token);
        document.querySelector('#myNavigator').pushPage('menu.html');     
        console.log(`la data`,data);
       },
       error: function(e1, e2, e3){
        ons.notification.toast('USUARIO INCORRECTO', {timeout: 1000});
        console.log(`Error..`,e1, e2, e3);
       },
       complete: function(){
       console.log(`Fin!`)
       },
  });
}

function cargoProductos() {

  let token = window.localStorage.getItem("token");

  $.ajax({
    url: 'http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/productos',
    type: 'GET',
    contentType: "application/json",
    headers: {"x-auth": token},
    dataType: 'json',
    success: function (data) {
      let listado = $('#listaCatalogo');
      console.log('la data.....',data);
      data.data.forEach(elem => {
          listado.append(`<ons-list-item>
          <div class="left">
            <img class="list-item__thumbnail" src='http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/assets/imgs/${elem.urlImagen}.jpg' />
          </div>
          <div class="center" onclick="document.querySelector('#myNavigator').pushPage('detalle.html', {data: { id: '${elem._id}'}})">
            <span class="list-item__title">${elem.nombre}</span>
            <span class="list-item__subtitle">
            <br/> Precio: $${elem.precio} 
            <br/> Estado: ${elem.estado}
            <br/> Etiquetas: ${elem.etiquetas}
          </div> 
          <div class="right">
          <ons-button icon="md-favorite" onclick="guardarFavorito('${elem._id}')"></ons-button>
          <ons-button style="margin: 5px; border: 10px" icon="md-favorite-outline" onclick="eliminarFavorito('${elem._id}')"></ons-button>
          </div>
          </ons-list-item>`);
        });
    },
    error: function (e1, e2, e3) {
    console.log('Error...', e1, e2, e3);
    },
    complete: function () {
    console.log('Fin!');
    },
  });
}

function irDetalle(id){

  let token = window.localStorage.getItem("token");

  $.ajax({
    url: `http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/productos/${id}`,
    type: 'GET',
    contentType: "application/json",
    headers: {"x-auth": token},
    dataType: 'json',
    success: function (data) {
      let detalle = $('#listaDetalle');
      detalle.append(`
      <div style="text-align: center; margin-top: 30px;">
      <span class="list-item__title">${data.data.nombre}</span>
      <span class="list-item__subtitle">
      <br/> Precio: $${data.data.precio} 
      <br/> Estado: ${data.data.estado}
      <br/> Etiquetas: ${data.data.etiquetas}
      <br/> Codigo: ${data.data.codigo}
      <br/> Puntaje: ${data.data.puntaje}
      <br/> Etiquetas: ${data.data.etiquetas}    
      <br/> Descripcion: ${data.data.descripcion}       
      <br/> <img style="display: block;margin:auto; height:200px; width: 200px;" class="list-item__thumbnail" src='http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/assets/imgs/${data.data.urlImagen}.jpg' />
      </ons-list-item>
      </div>`);
      if(data.data.estado === "sin stock"){
        $('#formularioCompra').hide();
      }

      $('#btnDetalleCompra').on('click', function(){
        comprarProducto(data.data.precio,data.data._id)
      });
        $("#cargaDetalle").hide(); 
    },
    error: function (e1, e2, e3) {
    console.log('PROBLEMA DETALLE', e1, e2, e3);
    },
    complete: function () {
    console.log('Fin!');
    },
  });
}

function verPedidos(){

  let token = window.localStorage.getItem("token");
  let listaPedidos = $("#listadoPedidos");
  let contadorBtn = 0;

  $.ajax({
    url: `http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/pedidos`,
    type: 'GET',
    contentType: "application/json",
    dataType: 'json',
    headers: {"x-auth": token},
    success: function (data) {
      data.data.forEach(elem => {
        listaPedidos.append(`<ons-list-item>
        <div class="left">
        <img class="list-item__thumbnail" src='http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/assets/imgs/${elem.producto.urlImagen}.jpg' />
        </div>
        <div class="center">
        <span class="list-item__title">${elem.producto.nombre}</span>
        <span class="list-item__subtitle">
        <br/> Sucurusal: ${elem.sucursal.nombre} 
        <br/> Estado: ${elem.estado}
        <br/> Total: ${elem.total}
        </div> 
        <div class="right">
        <ons-button onclick="alerta('${elem._id}')" icon="md-check" id="btn"></ons-button>
        </div>
        </ons-list-item>`);     
      });
    },
    error: function (e1, e2, e3) {
    console.log('PROBLEMA SUCURSAL', e1, e2, e3);
    },
    complete: function () {
    console.log('Fin!');
    },
  });
}  

function alerta(id){

  let token = window.localStorage.getItem("token");

  ons.notification.prompt('Gracias por su compra! Algun comentario para dejarnos?')
    .then(function(input) {
      var message = input ? 'Su comentario sera visto! Gracias por su compra!': 'Queriamos saber su comentario, para lo proxima!';
      ons.notification.alert(message);

      let comen = {
        comentario: input,
      };

      $.ajax({
        url: `http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/pedidos/${id}`,
        type: 'PUT',
        contentType: "application/json",
        dataType: 'json',
        headers: {"x-auth": token},
        path: {"_id": id},
        data: JSON.stringify(comen),
        success: function (data) {
          console.log('PEDIDO RECIBIDO!', data)
          location.reload(true);
          ons.notification.toast('Gracias por su compra', {timeout: 1000});
        },
        error: function (e1, e2, e3) {
        console.log('PROBLEMA SUCURSAL', e1, e2, e3);
        },
        complete: function () {
        console.log('Fin!');
        },
      });
    
    });

}

function comprarProducto(precio,id){

  let token = window.localStorage.getItem("token");

  let cantidad = $("#txtCantidad").val();
  let sucursal = $("#sLocales").val();
  let precioTotal = precio * cantidad;

  let compra = {
    cantidad: cantidad, 
    idProducto: id,
    idSucursal:sucursal,
  };

  $.ajax({
    url: `http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/pedidos`,
    type: 'POST',
    contentType: "application/json",
    dataType: 'json',
    headers: {"x-auth": token},
    data: JSON.stringify(compra),
    success: function (data) {
      console.log('EXITO COMPRA', data);
      location.reload(true);
      ons.notification.toast('COMPRA REALIZADA!', {timeout: 1000});
    },
    error: function (e1, e2, e3) {
    console.log('PROBLEMA SUCURSAL', e1, e2, e3);
    },
    complete: function () {
    console.log('Fin!');
    },
  });
}

function buscar(){
  let token = window.localStorage.getItem("token");

  $("#listaCatalogo").empty().hide();
  let busqueda = $("#txtBusqueda").val();
 
  $.ajax({
    url: 'http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/productos',
    type: 'GET',
    headers: { 'x-auth': token },
    data: JSON.stringify ({nombre: busqueda}),
    contentType: "application/json",
    dataType: 'json',
    success: function (data) {
      let listado = $("#listaCatalogo");
      console.log('la data.....',data);
      data.data.forEach(elem => {
        if(elem.nombre.toLowerCase().includes(busqueda.toLowerCase()) || elem.etiquetas.includes(busqueda)){
          listado.append(`<ons-list-item onclick="document.querySelector('#myNavigator').pushPage('detalle.html', {data: { id: '${elem._id}'}})">
          <div class="left">
          <img class="list-item__thumbnail" src='http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/assets/imgs/${elem.urlImagen}.jpg' />
          </div>
          <div class="center">
          <span class="list-item__title">${elem.nombre}</span>
          <span class="list-item__subtitle">
          <br/> Precio: $${elem.precio} 
          <br/> Estado: ${elem.estado}
          <br/> Etiquetas: ${elem.etiquetas}
          </div> 
          <div class="right">
          <ons-button icon="md-favorite" onclick="guardarFavorito('${elem._id}')"></ons-button>
          <ons-button style="margin: 5px; border: 10px" icon="md-favorite-outline" onclick="eliminarFavorito('${elem._id}')"></ons-button>
          </div>
          </ons-list-item>`);}
        });
        $("#listaCatalogo").show(); 
    },
    error: function (e1, e2, e3) {
    console.log('Error...', e1, e2, e3);
    },
    complete: function () {
    console.log('Fin!');
    },
  });
 }

function obtenerIds(id){
    id.forEach(elem => {
      mostrarFavoritos(elem)
    });
}

function mostrarFavoritos(idFav){

  let token = window.localStorage.getItem("token");

  $.ajax({
    url: 'http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/productos',
    type: 'GET',
    contentType: "application/json",
    headers: {"x-auth": token},
    dataType: 'json',
    success: function (data) {
      let listado = $('#listadoFavoritos');
      console.log('la data.....',data);
      data.data.forEach(elem => {
        if(elem._id===idFav){
          listado.append(`<ons-list-item>
          <div class="left">
          <img class="list-item__thumbnail" src='http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/assets/imgs/${elem.urlImagen}.jpg' />
          </div>
          <div class="center" onclick="document.querySelector('#myNavigator').pushPage('detalle.html', {data: { id: '${elem._id}'}})">
          <span class="list-item__title">${elem.nombre}</span>
          <span class="list-item__subtitle">
          <br/> Precio: $${elem.precio} 
          <br/> Estado: ${elem.estado}
          <br/> Etiquetas: ${elem.etiquetas}
          </div> 
          <div class="right">
          <ons-button icon="md-favorite" onclick="guardarFavorito('${elem._id}')"></ons-button>
          <ons-button style="margin: 5px; border: 10px" icon="md-favorite-outline" onclick="eliminarFavorito('${elem._id}')"></ons-button>
          </div>
          </ons-list-item>`)
        }
        });
    },
    error: function (e1, e2, e3) {
    console.log('Error...', e1, e2, e3);
    },
    complete: function () {
    console.log('Fin!');
    },
  });
}


function obtenerFavoritos() {

  if (localStorage.getItem('favoritos') === null) {
    localStorage.setItem('favoritos', '[]');
  }
  let userId = localStorage.getItem('userId');
  let vecFavs = JSON.parse(localStorage.getItem('favoritos'));
  let favs = [];
  vecFavs.forEach(function (elem) {
    if (elem.idUsuario === userId) {
      favs = elem.favoritos;
    }
  });
     obtenerIds(favs);
  return favs;
}

function guardarFavorito(idFavorito) {
  
  if (localStorage.getItem('favoritos') === null) {
    localStorage.setItem('favoritos', '[]');
  }
  let userId = localStorage.getItem('userId');
  let vecFavs = JSON.parse(localStorage.getItem('favoritos'));
  let agregado = false;
  vecFavs.forEach(function (elem) {
    if (elem.idUsuario === userId) {
      if (!elem.favoritos.includes(idFavorito)) {
        elem.favoritos.push(idFavorito);
      }
      agregado = true;
    }
  });
  if (!agregado) {
    vecFavs.push({ idUsuario: userId, favoritos: [idFavorito] });
  }
  localStorage.setItem('favoritos', JSON.stringify(vecFavs));
  location.reload(true);


}

function eliminarFavorito(idFavorito) {
  if (localStorage.getItem('favoritos') === null) {
    localStorage.setItem('favoritos', '[]');
  }
  let userId = localStorage.getItem('userId');
  let vecFavs = JSON.parse(localStorage.getItem('favoritos'));
  vecFavs.forEach(function (elem) {
    if (elem.idUsuario === userId) {
      if (elem.favoritos.includes(idFavorito)) {
        let pos = elem.favoritos.indexOf(idFavorito);
        elem.favoritos.splice(pos, 1);
      }
    }
  });
  localStorage.setItem('favoritos', JSON.stringify(vecFavs));
  location.reload(true);
}
