# MonDeP-SFT
Sistema de gerenciamento de requisições e tratamento de dados via Node, MongoDB(Atlas) e comunicação TCP.

# Sobre o projeto
O MonDeP-SFT é um projeto que visa desenvolver um sistema que integra requisicões via Node/Express, com dados em um banco Mongodb(Atlas) na nuvem.
Estes dados são recebidos através de uma rede TCP e seguem o modelo de comunicação do hardware SFT9001. O objetivo do projeto é, além de gerar informação com os dados vindos do servidor TCP, salvar estes dados em um banco Mongodb e gerar um endpoint que retorne a informação quando for requisitada.
O protocolo de comunicação do SFT9001 é descrito no próximo tópico.

# Protocolo de comunicação do SFT9001
As tabelas as seguir descrevem o protocolo de comunicação do SFT9001, e o tipo de dado que será tratado na entrada da rede TCP:

![image](https://user-images.githubusercontent.com/73205375/166707887-c0e158fa-eaec-4355-aa0e-31ff5f908777.png)
![image](https://user-images.githubusercontent.com/73205375/166707927-49afd4bb-253c-4e44-832a-9bc96981e9f8.png)
![image](https://user-images.githubusercontent.com/73205375/166707991-46057f09-695c-4f6a-98d1-79e2b0db9559.png)
![image](https://user-images.githubusercontent.com/73205375/166708031-e1b1eae4-a5f6-475a-9fed-1143ec74e632.png)
![image](https://user-images.githubusercontent.com/73205375/166708135-0d517898-218d-469e-aff6-ac53446a6547.png)
![image](https://user-images.githubusercontent.com/73205375/166708226-b37a58d8-1504-43e6-9612-b72ccb58fd8d.png)
![image](https://user-images.githubusercontent.com/73205375/166708262-948679fb-eaa0-4350-8e54-0ad000a35f26.png)

# Instruções de compilação e execução
Para o funcionamento do MonDeP-SFT, primeiro é necessário ter o Node instalado na máquina. O download pode ser feito no [site da companhia](https://nodejs.org/en/),foi utilizada a versão **v16.15.0** do Node no desenvolvimento do projeto.
Além do node, é necessário a instalação do Express(requisições e rotas), Mongoose(banco de dados) e Nodemon(ferramenta de auxílio de desenvolvimento) Para isso é preciso executar, no diretório do projeto, o comando abaixo:
```
npm install express mongoose nodemon
```
Após a instalação dos pacotes, é necessário configurar o banco de dados Mongodb/Atlas. Para isso é necessário inicalizar um banco de dados na nuvem através do [site da Mongodb](www.mongodb.com/). Após a inicialização do banco com usuário e senha criados, é necessário mudar as variáveis abaixo(em index.js) com os dados do banco para que a conexão seja feita com sucesso:
```javascript
//Inserindo dados do AtlasDB
const DBUSERNAME = '<yourUser>'
const DBPASSWORD = '<yourPassword>'
```
Além disso, pode-se alterar as portas com quais os servidores irão se comunicar:
```javascript
//Porta de conexão da API
const DBPORT = 3000
//Porta de conexao do servior TCP
const TCPPORT = 2000
```
Com isso, execute ```npm start``` e o console deverá imprimir a mensagem ```Mongodb connected``` indicando que o sistema está funcionando.

# Testes
Para testar o funcionamento do sistema foram utilizados dois softarwes em conjunto com o MonDeP-SFT: [PacketSender](https://packetsender.com/) e o [Postman](https://www.postman.com/downloads/?utm_source=postman-home).
O Packet sender foi utilizado para simular o envio de pacotes ao servidor TCP. A imagem abaixo mostra um exemplo de uma simulação de envio de pacote de dados através do PacketSender, o pacote foi enviado à porta 2000(que é a porta definida como padrão do servidor TCP):
![image](https://user-images.githubusercontent.com/73205375/166717737-f3313065-42f8-462c-91c8-d63c5fedb806.png)
Caso o pacote seja recebido com êxito, o console irá imprimir:
```
New client connection in ::ffff:ENDEREÇOENVIO
Received data on TCP server
```
Caso seja uma mensagem de dados, o console indica que os dados foram salvos no banco com a mensagem ```Data uploaded to Atlas DB```, ou caso for um heartbeat o console imprime ```Sended pingACK to ::ffff:ENDEREÇOSAIDA```.
**Obs.:** Para fim de testes, assumiu-se que os pacotes recebidos no servidor TCP sempre são enviados por completo, a entrada aceita múltiplos pacotes em série e com ruído entre eles, porém assume-se que todos os pacotes válidos são enviados em sua completude.

Já o Postman é usado para testar requisições sobre dados de algum dispositivo específico. O exemplo abaixo faz a requisição dos dados do dispositivo de id _0A3F73_ e retorna a informação encontrada:
![image](https://user-images.githubusercontent.com/73205375/166718108-97f6e358-3607-48de-ba1d-33dca2989ab0.png)

Deixo abaixo os códidos de comunicação utilizados nos exemplos:
```
Mensagem Heartbeat: 50F70A3F730150494E4773C4
Mensagem de dados: 50F70A3F73025EFCF950156F017D784000008CA0F80084003C013026A1029E72BD73C4
```
# Resultados e discussões
O projeto obteve resultados satisfatórios, com o sistema MonDeP-SFT conseguindo executar com sucesso as funcionalidades básicas citadas até aqui. Porém é importante ressaltar que novas funcionalidades são importantes para melhorar a robustez e confiabilidade do sistema. Um exemplo é tentar tratar casos em que a comunicação do servidor TCP seja perdida no meio da transmissão de um pacote, isso preveniria que dados indesejados chegassem ao banco. Além disso é importante que testes automatizados locais sejam implementados para garantir o funcionamento do sistema sem ter de utilizar softwares terceiros.
No geral foi uma ótima primeira experiência com desenvolvimento utilizando Javascript, Node e Mongodb, pude aprender muito sobre estas ferramentas e sobre conceitos gerais de rede e comunicação.

## Autores

| [<img src="https://avatars.githubusercontent.com/u/73205375?v=4" width=115><br><sub>João Pedro Fernandes Silva</sub>](https://github.com/JoaoP-Silva)
