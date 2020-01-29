let express = require("express");
let morgan = require("morgan");
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
let jsonParser = bodyParser.json();
let { StudentList } = require("./model"); // Importa objeto de model
let jwt = require("jsonwebtoken");
let { DATABASE_URL, PORT } = require("./config"); // Importa variables de config

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

app.use(express.static("public")); // Folder estático que contiene lo que se muestra al usr
app.use(morgan("dev")); // El formato del string

let estudiantes = [
  {
    nombre: "Miguel",
    apellido: "Ángeles",
    matricula: 1730939
  },
  {
    nombre: "Erick",
    apellido: "González",
    matricula: 1039859
  }
];

// GET all estudiantes
app.get("/api/students", (req, res) => {
  // Llama el método que está en module
  StudentList.getAll()
    .then(studentList => {
      return res.status(200).json(studentList);
    })
    .catch(error => {
      res.statusMessage =
        "Hubo un error de conexión con la base de Base de Datos";
      return res.status(500).send();
    });
});

// GET student by ID
// PARAMETER
app.get("/api/getById", (req, res) => {
  let matricula = req.query.id;

  StudentList.findByMatricula(matricula)
    .then(result => {
      if (!result) {
        res.statusMessage = "El alumno no se encuentra en la lista";
        return res.status(404).send();
      }
      return res.status(200).json(result);
    })
    .catch(error => {
      res.statusMessage =
        "Hubo un error de conexión con la base de Base de Datos";
      return res.status(500).send();
    });
});

// GET estudiantes by name
// NO ME JALA CUANDO ES UNO QUE NO EXISTE RETORNA VACIO
app.get("/api/getByName/:name", (req, res) => {
  let name = req.params.name;

  StudentList.getAllByName(name)
    .then(result => {
      if (!result.length) {
        res.statusMessage = "El alumno no se encuentra en la lista";
        return res.status(404).send();
      }
      return res.status(200).json(result);
    })
    .catch(error => {
      res.statusMessage =
        "Hubo un error de conexión con la base de Base de Datos";
      return res.status(500).send();
    });
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
  for (let student of estudiantes) {
    if (student.matricula === id) {
      return true;
    }
  }
  return false;
}

app.post("/api/newStudent", jsonParser, (req, res) => {
  let student = req.body;
  if (
    Object.keys(student).length < 3 ||
    student.nombre == "" || student.apellido == "" || student.matricula == ""
  ) {
    res.statusMessage = "No es posible agregar estudiante, faltan datos";
    return res.status(406).send();
  }

  StudentList.findByMatricula(student.matricula).then(result => {
    if (result) {
      res.statusMessage = "Ya existe el alumno";
      return res.status(409).send();
    } else {
      let newStudent = {
        nombre: student.nombre,
        apellido: student.apellido,
        matricula: student.matricula
      };
      StudentList.addStudent(newStudent)
        .then(result => {
          return res.status(201).json(result);
        })
        .catch(error => {
          res.statusMessage = "Hubo un error con la base de datos";
          return res.status(500).send();
        });
    }
  });
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
  // Valida si faltan datos
  if (!req.body.matricula || (!req.body.nombre && !req.body.apellido)) {
    res.statusMessage = "No es posible actualizar estudiante, falta dato";
    return res.status(406).send();
  }
  let idBody = req.body.matricula;
  let idParam = req.params.id;
  // Compara matricula de body con param, valida si son diferentes
  if (idBody != idParam) {
    res.statusMessage = "La matrícula del url y del body no son iguales";
    return res.status(409).send();
  }

  let data = {};

  if (req.body.nombre) {
    data.nombre = req.body.nombre;
  }

  if (req.body.apellido) {
    data.apellido = req.body.apellido;
  }

  // Busca estudiante en BD
  StudentList.updateStudent(idParam, data)
    .then(result => {
      if (result) {
        res.statusMessage = "Datos de estudiante actualizados exitosamente";
        return res.status(201).send();
      } else {
        res.statusMessage = "El estudiante con matrícula ${idBody} no existe";
        return res.status(404).send();
      }
    })
    .catch(error => {
      res.statusMessage = "Hubo un error con la base de datos";
      return res.status(500).send();
    });
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

app.delete("/api/deleteStudent", jsonParser, (req, res) => {
  if (!req.query.id || !req.body.matricula) {
    res.statusMessage = "Dato faltante";
    return res.status(406).send();
  }
  let id = req.query.id;
  let idBody = req.body.matricula;

  if (id != idBody) {
    res.statusMessage = "El id del URL no coincide con el del cuerpo";
    return res.status(409).send();
  }

  StudentList.deleteStudent(id)
    .then(result => {
      if (result) {
        return res.status(202).send();
      } else {
        res.statusMessage = "El estudiante con matrícula " + id + " no existe";
        return res.status(404).send();
      }
    })
    .catch(error => {
      res.statusMessage = "No es posible actualizar estudiante, falta dato";
      return res.status(406).send();
    });
});

//LOGIN sin BD
app.post("/api/login", jsonParser, (req, res) => {
  let user = req.body.user;
  let password = req.body.password;

  // Validar el usuario en la BD antes de generar TOKEN
  let data = {
    user
  };

  let token = jwt.sign(data, "secret", { expiresIn: 60 * 5 });

  return res.status(200).json({ token });
});

// Valida TOKEN
app.get("/api/validate", (req, res) => {
  let token = req.headers.authorization;
  token = token.replace("Bearer ", "");

  jwt.verify(token, "secret", (err, user) => {
    if (err) {
      res.statusMessage = "Token no válido";
      return res.status(400).send();
    }
    console.log(user);
    return res.status(200).json({ message: "Exito" });
  });
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

module.exports = { app, runServer, closeServer };
