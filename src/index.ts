import 'dotenv/config';
import mysql from 'mysql2/promise';

console.log(process.env.DBHOST);
import  express, {Request, Response} from 'express';

 
const app = express();
{
    app.get('/', async (req:Request, res:Response) => {
        if(!process.env.DBUSER){
            res.status(500).send('DBUSER não está definido');
            return;
        }
        if(process.env.DBPASSWORD==undefined){
            res.status(500).send('DBPASSWORD não está definido');
            return;
        }
        if(!process.env.DBHOST){
            res.status(500).send('DBHOST não está definido');
             return;
        }
       
        if(!process.env.DBPORT){
            res.status(500).send('DBPORT não está definido');
            return;

        }
        try{
                const connection =  await mysql.createConnection({
                host: process.env.DBHOST,
                user: process.env.DBUSER,
                password: process.env.DBPASSWORD,
             
                port: Number(process.env.DBPORT)
                
            });   
            res.send("Conectado ao banco de dados com sucesso!");
            await connection.end();
        }
   catch(error){
    console.error('Erro ao conectar ao banco de dados:', error);
    res.status(500).send('Erro ao conectar ao banco de dados');
    return;
    }

     
    console.log('DBHOST:', process.env.DBHOST);
    console.log('DBUSER:', process.env.DBUSER);
    res.send('Olá ' + process.env.DBUSER);
    
    });
}
app.listen(8000, () => {
    console.log(` A porta que está rodando é ${8000}`);
});
export default app;