//Se tiver em produção não precisa 
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express')
const app = express();
if(process.env.NODE_ENV !== 'production'){ 
 require('dotenv').config();
}

app.set('view engine','ejs');
app.set('views','src/views');

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
app.get('/', async (req,res)=>{
   
    /*Pegar token mas passando 
        Login e certificado
    */
   try{
        const resultNewToken = await axios({
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
        });

        console.log('Pegou novo token');
        const accessToken = resultNewToken.data?.access_token;
        
        const reqApiPix = axios.create({
            baseURL: process.env.EFI_ENDPOINT,
            httpsAgent: agent,
            headers:{
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
        })
        
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
        try{

            const responseNewCob = await reqApiPix.post('/v2/cob',dataCob);
            const idLocCob = responseNewCob.data.loc.id; 
            const responseQRcode = await reqApiPix.get(`/v2/loc/${idLocCob}/qrcode`,dataCob);
            
            // console.log(dataQRcode);
            console.log('Nova cobrança');
            res.render('qrcode',{qrcodeImage: responseQRcode.data.imagemQrcode});
            // res.json(responseQRcode.data)
            
        }catch(err){
            console.log('Erro na criação de nova cobrança');
            console.log(err);
        }
          
    
       
        
    }catch(err){
        console.log('Erro na Geração de um Novo Token');
        console.log(err);
    }
});

/*
curl --request POST \
  --url https://api-pix-h.gerencianet.com.br/oauth/token \
  --header 'Authorization: Basic Q2xM4Y2M3NDhlMjYyYThjYjYzZThk....' \
  --header 'Content-Type: application/json' \
  --data '{
    "grant_type": "client_credentials"
}'
*/
app.listen(8000,()=>{
    console.log('\t\tServido Rodando');
})

