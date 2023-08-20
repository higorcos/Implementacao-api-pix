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
}).then((response)=>{
    console.log('Pegou novo token');
    const accessToken = response.data?.access_token;
    const endPoint = `${process.env.EFI_ENDPOINT}/v2/cob`;

    const dataCob = {
        calendario: {
          expiracao: 3600
        },
        devedor: {
          cpf: "12345678909",
          nome: "Francisco da Silva"
        },
        valor: {
          original: "123.45"
        },
        chave: "71cdf9ba-c695-4e3c-b010-abb521a3f1besdsds",
        solicitacaoPagador: "Cobrança dos serviços prestados."
      }
    const configAxios= {
        httpsAgent: agent,
        headers:{
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
    }
    axios.post(endPoint,dataCob,configAxios).then(({data})=>{
        console.log('Nova cobrança');
        console.log(data)
    }).catch((err)=>{

    });
}).catch((err)=>{
    console.log(err);
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