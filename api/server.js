var express = require('express'),
    bodyParser = require('body-parser'),
    multiparty = require('connect-multiparty'),
    mysql = require('mysql'),
    fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(multiparty());

var port = 8080;

app.listen(port);

var con = ()=>{
    return mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1234",
        database: "restapi"
    });
}

con().query("create table if not exists postagens (id int not null auto_increment,titulo varchar(255) not null,imagem varchar(255) not null,primary key(id));",(error,result)=>{
    if(error){
        console.log("Erro ao criar a tabela postagens. Erro: "+error);
    }else{
        console.log("Tabela postagens criada com sucesso!");
    }
});

console.log('Servidor escutando na porta: '+port);

app.get('/', (req,res)=>{
    res.send({msg:"Olá a todos!"});
});

app.get('/imagens/:imagem',(req,res)=>{
    var img = req.params.imagem;
    fs.readFile('./uploads/'+img,(err, result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            res.writeHead(200, {'Content-type':'image/png'});
            res.end(result);
        }
    });
});

// POST (cria)
app.post('/api', (req,res)=>{

    res.setHeader("Access-Control-Allow-Origin", "*");  
    var date = new Date();

    var nomeArquivo = date.getTime()+"_"+req.files.arquivo.originalFilename;
    var path_origem = req.files.arquivo.path;
    var path_destino = './uploads/' + nomeArquivo;

    fs.rename(path_origem,path_destino, (err)=>{
        if(err){
            res.status(500).json({error: err});
        }else{
            var dados = {
                imagem: nomeArquivo,
                titulo: req.body.titulo
            }
            con().query("insert into postagens SET ? ;",dados, (error,result)=>{
                if(error){
                    res.json(error);
                }else{
                    if(result.affectedRows>0){
                        res.json(
                            {
                                status: 'OK',
                                message: 'Postagem cadastrada com sucesso!'
                            });
                    }else{
                        res.status(500).res.json(
                            {
                                status: 'Fail',
                                message: 'Não foi possível inserir os dados no Banco de Dados.'
                            }
                        );
                    }
                }
            });
        }
    });
});

// GET (retorna todos as postagens)
app.get('/api', (req,res)=>{
    //
    res.setHeader("Access-Control-Allow-Origin", "*");  
    con().query("select * from postagens ;", (error,result)=>{
        if(error){
            res.json(error);
        }else{
            if(result.length>0){
                res.json(result);
            }else{
                res.status(404).res.json(
                    {
                        status: 'Fail',
                        message: 'Nenhum dado encontrado!'
                    }
                );
            }
        }
    });
});

// GET by ID
app.get('/api/:id', (req,res)=>{
    //
    res.setHeader("Access-Control-Allow-Origin", "*");  
    con().query("select * from postagens where id="+req.params.id+";", (error,result)=>{
        if(error){
            res.json(error);
        }else{
            if(result.length>0){
                res.json(result);
            }else{
                res.status(404).res.json(
                    {
                        status: 'Fail',
                        message: 'Nenhum dado encontrado!'
                    }
                );
            }
        }
    });
});

// PUT (Update)
app.put('/api/:id', (req,res)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");  
    var dados = req.body;
    var id = req.params.id;
    //
    con().query("UPDATE postagens SET ? WHERE id="+id+";",dados, (error,result)=>{
        if(error){
            res.json(error);
        }else{
            if(result.affectedRows>0){
                res.json(
                    {
                        status: 'OK',
                        message: 'ID '+id+' atualizado com sucesso!'
                    });
            }else{
                res.status(304).res.json(
                    {
                        status: 'Fail',
                        message: 'Nenhuma linha afetada!'
                    }
                );
            }
        }
    });
});


// DELETE (Deletar)
app.delete('/api/:id', (req,res)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");  
    var dados = req.body;
    //
    con().query("DELETE FROM postagens WHERE id="+req.params.id+";", (error,result)=>{
        if(error){
            res.json(error);
        }else{
            if(result.affectedRows>0){
                res.json(
                    {
                        status: 'OK'
                    });
            }else{
                res.status(304).res.json(
                    {
                        status: 'Fail',
                        message: 'Nenhum dado afetado!'
                    }
                );
            }
        }
    });
});

