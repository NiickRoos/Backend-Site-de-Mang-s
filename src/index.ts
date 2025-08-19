import 'dotenv/config';

console.log(process.env.DBHOST);
import  express from 'express';

 
const app = express();
{
    app.get('/', (req, res) => {
    console.log('DBHOST:', process.env.DBHOST);
    console.log('DBUSER:', process.env.DBUSER);
    res.send('Olá ' + process.env.DBUSER);
    
    });
}
const port = process.env.DBPORT;
app.listen(port, () => {
    console.log(` A porta que está rodando é ${port}`);
});
export default app;
