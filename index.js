
//Importando bibliotecas necessarias
const { urlencoded } = require('express')
const express = require('express')
const res = require('express/lib/response')
const app = express()
const mongoose = require('mongoose')
const net = require('net')

//Importando modelo Location
const Location = require('./models/Location')

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





///////////// FUNCOES PARA PROCESSAR OS DADOS  //////////////////////
/*handleData(buffer d)
Entrada:    buffer com sequencia de caracteres 'd' recebidos do servidor TCP
Retorna:    (string Type, var Data)
                string Type: variavel string que pode assumir '01' ou '02', com '01' representando
                que Data e uma string pingACK e '02' representa que data e um objeto do tipo Location,
                com os dados preenchidos para serem enviados ao servidor

                var Data: variavel que pode assumir uma string pingACK ou um objeto do tipo Location*/
        


const HEADER = "50F7"
const ENDCODE = "73C4"
function handleDataSFT(d){
    buff = d.toString('ascii')
    const regexHeader = RegExp(HEADER, 'g')
    const regexEndcode = RegExp(ENDCODE, 'g')
    DataArray = []
    //Processa todos os codigos recebidos validos
    while ((endCode_i = regexEndcode.exec(buff)) !== null){
        let init = regexHeader.exec(buff)
        i = init.index
        j = regexEndcode.lastIndex
        
        let wordFinded = buff.slice(i, j)
        DataArray.push(wordFinded)
    }
    //Extrai os dados a partir da quantidade de bytes descrita
    let resultArray = []
    for(let data of DataArray){
        Id = data.slice(4, 10)
        Type = data.slice(10, 12)
        if(Type == "01"){
            PingAck = HEADER + Id + Type + "0000000000" + ENDCODE
            resultArray.push([Type, PingAck])
            continue
        }
        Epoch = data.slice(12, 20)
        Dir = data.slice(20, 24)
        Dist = data.slice(24, 32)
        Time = data.slice(32, 40)
        Flags = data.slice(40, 48)
        Veloc = data.slice(48, 50)
        Lat = data.slice(50, 58)
        Long = data.slice(58, 66)
        
        Lat = parseInt(Lat, 16)
        Long = parseInt(Long, 16)
        Epoch = parseInt(Epoch, 16)

        //Converte epoch para UTC
        var date = new Date(0)
        date.setUTCSeconds(Epoch)
        Flags = parseInt(Flags, 16).toString(2)

        Fixado = false
        Historico = false

        //Testa se a localizacao e fixada
        if(Flags[0] == "1"){
            Fixado = true
        }
        //Testa se a localizacao e historica
        if(Flags[1] == "1"){
            Historico = true
        }
        //Testa se a lat ou long e multiplicada por -1
        if(Flags[3] == "1"){
            Lat = Lat * -1
        }
        if(Flags[4] == "1"){
            Long = Long * -1
        }

        const loc = {
            _device_id : Id,
            latitude : Lat,
            longitude : Long,
            data : date,
            fixado : Fixado,
            historico : Historico,
        }

        resultArray.push([Type, loc])
    }
    return resultArray
}