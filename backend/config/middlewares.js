// Arquivo pra uso com Consign.

const express = require('express') 
// O cors serve pra tornar a aplicação acessível a partir de outras aplicações. O site são 2 aplicações, front e back, rodam na mesma máquina mas são duas. Por isso o cors.
const cors = require('cors')

module.exports = app => {
    app.use(express.json()) // pra interpretar o JSON q vem pro backend no corpo da requisição.
    app.use(cors())
}