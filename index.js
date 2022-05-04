
//Importando bibliotecas necessarias
const { urlencoded } = require('express')
const express = require('express')
const res = require('express/lib/response')
const app = express()
const mongoose = require('mongoose')
const net = require('net')

//Importando modelo Location
const Location = require('./models/Location')

const handleDataSFT = require('./modules/handleData')

//Inserindo dados do AtlasDB
const DBUSERNAME = '<yourUser>'
const DBPASSWORD = '<yourPassword>'
const DBPORT = 3000

//Porta de conexao do servior TCP
const TCPPORT = 2000

//Leitura de JSON
app.use(urlencoded({extended: true}))
app.use(express.json())


//endpoints
app.get('/api/v1/location/:device_id', async (req, res) => {
    //Extraindo id da requisicao
    const id = req.params.device_id
        //Filtrando id
        await Location.findOne({ _device_id: id}, (err, data) =>{
            if(err){
                console.log(err)
                res.status(500).json({error: err})
            }else{
                res.status(200).json(data)
                
            }
        }).clone().catch(function(err){ console.log(err)})
})

//TCP Server
var tcpServer = net.createServer()
tcpServer.on("connection", function(socket){
    var remoteAddress = socket.remoteAddress + socket.remotePort
    console.log("New client connection in %s", remoteAddress)
    socket.on("data", function(d){
        console.log("Received data on TCP server")
        resultArray = handleDataSFT(d)
        //Procedimento para todas as mensagens processadas no servidor TCP
        for(let result of resultArray){
            Type = result[0]
            if(Type == "01"){
                //Se a msg e um heartbeat, responde com ping ACK
                pingACK = result[1]
                socket.write(pingACK)
                rmtadrss = socket.remoteAddress
                rmtprt = socket.remotePort
                console.log("Sended pingACK to %s", remoteAddress)
            }
            else{
                //Caso seja uma mensagem de localizacao, processa a mensagem
                Loc = result[1]
                filter = {_device_id: Loc._device_id}
                updated = {
                    latitude: Loc.latitude,
                    longitude: Loc.longitude,
                    data: Loc.data,
                    fixado: Loc.fixado,
                    historico: Loc.historico,
                }
                //Envia o pacote para o banco de dados
                Location.updateOne(filter, updated,{upsert : true}, function(err, result){
                    if(err){console.log(err)
                    }else{console.log("Data uploaded to Atlas DB")}
                })
            }
        } 
    })
})

tcpServer.listen(TCPPORT)

//Conectando o servidor ao mongodb
mongoose
    .connect('mongodb+srv://' + DBUSERNAME + ':'+ DBPASSWORD + '@apicluster.8izoi.mongodb.net/apidb?retryWrites=true&w=majority')
    .then(() => {
        console.log("Mongodb connected")
        app.listen(DBPORT)
    })
    .catch((err) =>  console.log(err))