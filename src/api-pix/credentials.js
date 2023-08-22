const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');
var number = 0;
//Se tiver em produção não precisa 
if(process.env.NODE_ENV !== 'production'){ 
    require('dotenv').config();
   }

//Pegando certificado
const certificate = fs.readFileSync(
    path.resolve(__dirname,`../../certificates/${process.env.EFI_NAME_CERT}`)
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



//Pegar token, passando login e certificado
const getAccessToken = ()=> {
    
    number += 1
    console.log('Heloo', number)

    return axios({
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
} 

const pixRequest = async () =>{
    // try{

        const newToken = await getAccessToken();
        console.log(newToken.data.expires_in)
        const accessToken = newToken.data?.access_token;
           console.log('Pegou novo token');
            
            return axios.create({
                baseURL: process.env.EFI_ENDPOINT,
                httpsAgent: agent,
                headers:{
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
            })
    // }catch(err){
       
    // }
}

module.exports = {pixRequest}