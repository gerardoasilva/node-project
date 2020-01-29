let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Se hace la colección de la base de colección de estudiante
let studentCollection = mongoose.Schema({
    nombre: {type : String},
    apellido: {type : String},
    matricula: {
        type : Number,
        require : true,
        unique : true
    }
});

let Student = mongoose.model('student', studentCollection);

let StudentList = {
    getAll : function(){
        return Student.find()
        .then( students => {
            return students;
        })
        .catch( error => {
            throw Error(error);
        });
    },
    findByMatricula: function(element) {
        return Student.findOne( {matricula: element} )
        .then( students => {
            return students;
        })
        .catch( error => {
            throw Error(error);
        })
    },
    getAllByName: function(name) {
        return Student.find( {nombre: name} )
        .then( students => {
            return students;
        })
        .catch( error => {
            throw Error(error);
        })
    },
    addStudent : function(newStudent) { 
        return Student.create(newStudent)
            .then( student => {
                return student;
            })
            .catch( error => {
                throw Error(error);
            });
     },
     updateStudent: function(element, data) {
        return Student.findOneAndUpdate({matricula: element}, data)
        .then( student => {
            return student;
        })
        .catch( error => {
            throw Error(error);
        });
     },
     deleteStudent: function(element) {
         return Student.findOneAndDelete( {matricula: element} )
         .then( student => {
            return student;
         })
         .catch( error => {
             throw Error(error);
         });
     }
};

module.exports = {
    StudentList
};