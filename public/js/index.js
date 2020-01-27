import { response } from "express";

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

// POST con JAVASCRIPT
function addStudent() {
    let url = "";
    let settings = {
        method: "POST",
        headers: {
            Content-Type: "application/json"
        },
        body: JSON.stringify({nombre:"Alfredo", apellido:"Salazar"})
    };

    fetch();
}


// POST con jQuery
$.ajax({
    url: url,
    method: "POST",
    data: JSON.stringify({  nombre: "Alfredo",
                            apellido: "Salazar"}),
    contentType: "aplication/json",
    dataType: "json",
    success:
});


//PUT



//DELETE



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
