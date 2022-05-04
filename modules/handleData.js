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
const handleDataSFT = (input) =>{
    buff = input.toString('ascii')
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

module.exports = handleDataSFT