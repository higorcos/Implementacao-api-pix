const pixRequest = require('./api-pix/credentials');
const express = require('express');
const app = express();



app.set('view engine','ejs');
app.set('views','src/views');


//Pegar Novo Token quando a aplicação for startada 
// const apiPixA = pixRequest();


app.get('/', async (req,res)=>{
    //Pegar Novo Token quando a aplicação for startada 
    // const apiPix = await apiPixA;

    const apiPix = await pixRequest();
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
    
        const responseNewCob = await apiPix.post('/v2/cob',dataCob);
        const idLocCob = responseNewCob.data.loc.id; 
        const responseQRcode = await apiPix.get(`/v2/loc/${idLocCob}/qrcode`,dataCob);
        
        // console.log(dataQRcode);
        console.log('Nova cobrança');
        res.render('qrcode',{qrcodeImage: responseQRcode.data.imagemQrcode});
        // res.json(responseQRcode.data)
            
        }catch(err){
            console.log('Erro na criação de nova cobrança');
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

