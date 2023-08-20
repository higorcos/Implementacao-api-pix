const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

//Se tiver em produção não precisa 
if(process.env.NODE_ENV !== 'production'){ 
 require('dotenv').config();
}

//Pegando certificado
const certificate = fs.readFileSync(
    path.resolve(__dirname,`../certificates/${process.env.EFI_NAME_CERT}`)
)
//Certificado na requisição
const agent = new https.Agent({
    pfx: certificate,
    passphrase: '' //password
})
//Usuário na requisição (base64)
const credentials = Buffer.from(
    `${process.env.EFI_CLIENTE_ID}:${process.env.EFI_CLIENTE_SECRET}`
).toString('base64');

/*Pegar token mas passando 
    Login e certificado
*/
axios({
    method: 'POST',
    url: `${process.env.EFI_ENDPOINT}/oauth/token`,
    headers:{
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json'
    },
    httpsAgent: agent,
    data:{
        grant_type: 'client_credentials'
    }
})

/*
curl --request POST \
  --url https://api-pix-h.gerencianet.com.br/oauth/token \
  --header 'Authorization: Basic Q2xM4Y2M3NDhlMjYyYThjYjYzZThk....' \
  --header 'Content-Type: application/json' \
  --data '{
    "grant_type": "client_credentials"
}'
*/