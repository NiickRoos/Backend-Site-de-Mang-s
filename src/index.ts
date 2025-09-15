import 'dotenv/config'
import mysql from 'mysql2/promise';
console.log(process.env.DBUSER);

import express, { Request, Response } from 'express';
const app = express();




app.get('/produtos', async (req: Request, res: Response) => {
    if (!process.env.DBUSER) { 
        res.status(500).send("Variável de ambiente DBUSER não está definida")
        return;
    }
    if (process.env.DBPASSWORD==undefined) {
        res.status(500).send("Variável de ambiente DBPASSWORD não está definida")
        return;
    }
    if (!process.env.DBHOST) {
        res.status(500).send("Variável de ambiente DBHOST não está definida")
        return;
    }
    if (!process.env.DBNAME) {
        res.status(500).send("Variável de ambiente DBNAME não está definida")
        return;
    }
    if (!process.env.DBPORT) {
        res.status(500).send("Variável de ambiente DBPORT não está definida")
        return;
    }
    console.log(process.env)
    try {
        const connection = await mysql.createConnection({
            host: process.env.DBHOST,
            user: process.env.DBUSER,
            password: process.env.DBPASSWORD,
            database: process.env.DBNAME,
            port: Number(process.env.DBPORT)
        });
      
        const [rows] = await connection.execute('SELECT * FROM produtos');

        // Retornar produtos em JSON
        res.json(rows);

        // Fechar conexão
        await connection.end();
    }
    catch (error) {
        res.status(500).send("Erro ao conectar ao banco de dados: " + error);
    }
});




app.listen(8000, () => {
    console.log('servidor rodando em 8000');
});
