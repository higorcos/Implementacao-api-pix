const {pixRequest} = require('./api-pix/credentials');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.set('view engine','ejs');
app.set('views','src/views');


//Pegar Novo Token quando a aplicação for startada 
const apiPixA = pixRequest();


app.get('/api-pix', async (req,res)=>{
    //Pegar Novo Token quando a aplicação for startada 
    const apiPix = await apiPixA;
    console.log('acess')
    // const apiPix = await pixRequest();
    const dataCob = {
        calendario: {
            expiracao: 3600
        },
        devedor: {
            cpf: "61666917346",
            nome: "Nathalya de Jesus Pinheiro Costa"
        },
        valor: {
            original: "0.05"
        },
        chave: "154dc5b2-2ed2-44db-82fe-d9ff82088e4e",
        solicitacaoPagador: "Cobrança dos serviços prestados."
    }
    
    try{
    
        const responseNewCob = await apiPix.post('/v2/cob',dataCob);

        // let responseNewCob = ''
        // apiPix.post('/v2/cob',dataCob).then((reponse)=>{
        //     console.log(reponse.data)
        //     responseNewCob = reponse
        // }).catch((err)=>{
        //     console.log('err')
        //     console.log(err)
            
        // })
        const idLocCob = responseNewCob.data.loc.id; 
        const responseQRcode = await apiPix.get(`/v2/loc/${idLocCob}/qrcode`,dataCob);
        
        // console.log(dataQRcode);
        console.log('Nova cobrança');
        res.render('qrcode',{qrcodeImage: responseQRcode.data.imagemQrcode});
        // res.json(responseQRcode.data)
            
    }catch(err){
        res.json({err:true, msgErro: `Erro na criação de nova cobrança`})
    }

});
app.get('/api-pix/cobrancas', async (req,res)=>{
    const apiPix = await pixRequest();
    try{
        
        const listCob = await apiPix.get('/v2/cob?inicio=2023-08-22T00:00:00Z&fim=2023-12-30T00:00:00Z');
        res.json(listCob.data);
            
    }catch(err){
        res.json({err:true, msgErro: `Erro na listagem das cobrança`});
    }

});
app.post('/webhook(/pix)?',(req,res)=>{
    console.log(req.body);
    res.send('200');
}); 

app.listen(8000,()=>{
    console.log('\t\tServido Rodando');
})

