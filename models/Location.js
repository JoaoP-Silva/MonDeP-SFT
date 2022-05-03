//Inicializando mongoose
const mongoose = require('mongoose')

//Criando modelo location
const Location = mongoose.model('Location' , {
    _device_id: String,
    latitude: Number,
    longitude: Number,
    data: String,
    fixado: Boolean,
    historico: Boolean,
})

module.exports = Location