let express = require('express');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let jsonParser = bodyParser.json();
let {StudentList} = require('./model'); // Exporta objeto para usarlo en model
let {DATABASE_URL, PORT} = require('./config'); // Importa variabñes de config.js

let app = express();

// Habilita acceso de api al cliente
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  if (req.method === "OPTIONS") {
    return res.send(204);
  }
  next();
});

app.use(express.static('public')); // Folder estático que contiene lo que se muestra al usr
app.use(morgan('dev')); // El formato del string

let estudiantes = [{
    nombre : "Miguel",
    apellido : "Ángeles",
    matricula : 1730939
},
{
    nombre : "Erick",
    apellido : "González",
    matricula : 1039859
    
},
{
    nombre : "Victor",
    apellido : "Villarreal",
    matricula : 1039863
},
{
    nombre : "Victor",
    apellido : "Cárdenas",
    matricula : 816350
}];


// GET all estudiantes
app.get('/api/students', (req, res) => {
  // Llama el método que está en module
  StudentList.getAll()
      .then( studentList => {
        return res.status(200).json(studentList);
      })
      .catch(error => {
        res.statusMessage = "Hubo un error de conexión con la base de Base de Datos"
        return res.status(500).send();
      });
});

// GET student by ID 
// PARAMETER
app.get('/api/getById', (req, res) => {
    let id = req.query.id;

    let result =  estudiantes.find((elemento) => {
        if (elemento.matricula == id) {
            return elemento;
        }
    });

    if (result) {
        return res.status(200).json({result});
    }
    else  {
        res.statusMessage = "El alumno no se encuentra en la lista";
        return res.status(404).send();
    }
});

// GET estudiantes by name
// ATRIBUTE
app.get('/api/getByName/:name', (req, res) => {
    let name = req.params.name;

    let result =  estudiantes.filter((elemento) => {
        if (elemento.nombre === name) {
            return elemento;
        }
    });

    if (result.length > 0) {
        return res.status(200).json(result);
    }
    else  {
        res.statusMessage = "El alumno no se encuentra en la lista";
        return res.status(404).send();
    }
});

// POST new student
/* 
    url = /api/newStudent
    - validar que el request tenga nombre, apellido y matrícula
       · Error 406 si falta alguno "Faltó alguno de los campos"
    - Validar que la matrícula del estudiante sea única
       · Error 409 y dar mensaje de qu eya existe
    - Agregar el estudiante a la listay regresar res con esatatus 201 (create) y el estudiante agregado

*/

function yaExiste(id) {
  for(let student of estudiantes) {
    if (student.matricula === id) {
      return true;
    }
  }
  return false;
}

app.post('/api/newStudent', jsonParser, (req, res) => {
    let name = req.body.nombre;
    let lastName = req.body.apellido;
    let id = req.body.matricula;
    
    // Valida que el request tenga todos los parámetros
    if ((name && lastName && id) && (name != "" && lastName != "" && id != "")) {
      
      // Valida si ya existe el estudiante
      let existe = yaExiste(id);

      // Regresa error si ya existe estudiante
      if (existe) {
        res.statusMessage = "Ya existe el alumno";
        return res.status(409).send();
      } else {
        // Crea objeto de nuevo estudiante
        let newStudent = {
          nombre: name,
          apellido: lastName,
          matricula: id
        };
        
        // Agrega nuevo estudiante a la lista de estudiantes
        estudiantes.push(newStudent);
        console.log(estudiantes);
        res.statusMessage = "Nuevo estudiante agregado exitosamente";
        return res.status(201).send();
      }
    // Regresa error de que faltan parámetros
    } else {
      res.statusMessage = "No es posible agregar estudiante, faltan datos";
      return res.status(406).send();
    }
});

// PUT
/* 
    url = /api/updateStudent/:id
    - Validar que el request tenga matrícula y alguno de los siguientes: nombre o apellido
      Arrojar 406 si falta alguno
    - Que el parámetro id coincida con la matrícula del body
      Arrojar 409 si no son iguales
    - Que el id a modificar exista en el arreglo de estudiantes
      Arrojar 404 si no se encuentra
    - En el éxito, actualizar estudiante y regresar res 201 con status

*/

app.put("/api/updateStudent/:id", jsonParser, (req, res) => {
  let name = req.body.nombre;
  let lastName = req.body.apellido;
  let idBody = req.body.matricula;
  let idParam = req.params.id;

  // Valida req
  if (idBody != "" && (name != "" || lastName != "")) {
    // Compara matricula de body con param, valida que sean iguales
    if (idBody == idParam) {
      // Busca estudiante en arreglo
      let resultado = estudiantes.find(elemento => {
        if (elemento.matricula == idBody) {
          return elemento;
        }
      });
      // Si existe estudiante
      if (resultado) {
        let index = estudiantes.indexOf(resultado);
        estudiantes[index].nombre = (name != "") ? name : resultado.nombre;
        estudiantes[index].apellido = (lastName != "") ? lastName : resultado.apellido;

        res.statusMessage = "Datos de estudiante actualizados exitosamente";
        return res.status(201).send();
      } else {
        res.statusMessage = "El estudiante con matrícula ${idBody} no existe";
        return res.status(404).send();
      }
    } else {
      res.statusMessage = "La matrícula del url y del body no son iguales";
      return res.status(409).send();
    }
  } else {
    res.statusMessage = "No es posible actualizar estudiante, falta dato";
    return res.status(406).send();
  }
});


// DELETE
/* 
    url = /api/deleteStudent?id=matricula
    - Validar que el request tenga la matrícula
      Arrojar 406 si no se encuentra
    - Que el parametro id coincida con la matrícula del body
      Arrojar 409 si no son iguales
    - Que el id a eliminar exista en el aerreglo de estudiantes
      Arrokar 404 si no se enceuntra
    - En el éxito 204 borrar el estudiante de la lista y regresar res con status 202 (no regresa nada)

*/

app.delete('/api/deleteStudent', jsonParser, (req, res) => {
  let idBody = req.body.matricula;
  if (req.query.id) {
    let id = req.query.id;

    if (id == idBody) {

      let resultado =  estudiantes.find((elemento) => {
        if (elemento.matricula === id) {
            return elemento;
        }

        if (elemento) {
          estudiantes.splice(estudiantes.indexOf(elemento), 1);
          return res.status(202).send();
        }
        else {
          res.statusMessage = "El estudiante con matrícula " + id + " no existe";
          return res.status(404).send();
        }
    });

    } 
    else {
      res.statusMessage = "Los parámetros del URL no coinciden con el del cuerpo"
      return res.status(409).send();
    }
  }
  else {
    res.statusMessage = "Dato faltante";
    return res.status(406).send();
  }
});

let server;

function runServer(port, databaseUrl) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, response => {
      if (response) {
        return reject(response);
      } else {
        server = app
          .listen(port, () => {
            console.log("App is running on port " + port);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            return reject(err);
          });
      }
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing the server");
      server.close(err => {
        if (err) {
          return reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

runServer(PORT, DATABASE_URL);

module.exports = {app, runServer, closeServer} 