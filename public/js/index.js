// GET
function loadStudents() {
  let url = "/api/students";
  let settings = {
    method: "GET"
  };
  fetch(url, settings)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
    })
    .then(responseJSON => {
      displayResults(responseJSON);
    });
}

function displayResults(responseJSON) {
  $("#studentList").empty();

  for (let i = 0; i < responseJSON.length; i++) {
    $("#studentList").append(`
        <li>
            ${responseJSON[i].nombre} ${responseJSON[i].apellido}
        </li>
        `);
  }
}

function init() {
  loadStudents();
}

init();

// // POST con JAVASCRIPT
// function addStudent() {
//     let url = "";
//     let settings = {
//         method: "POST",
//         headers: {
//             Content-Type: "application/json"
//         },
//         body: JSON.stringify({nombre:"Alfredo", apellido:"Salazar"})
//     };

//     fetch();
// }

// POST con jQuery
// function addStudent() {
//   $.ajax({
//     url: "/api/newStudent",
//     method: "POST",
//     data: JSON.stringify({ nombre, apellido, matricula }),
//     contentType: "aplication/json",
//     dataType: "json",
//     success: function(response) {
//       return response.status(200).send(responseJSON);
//     },
//     error: function(err) {
//       console.log(err);
//     }
//   });
// }

//PUT

//DELETE
