import 'dotenv/config';
import mysql from 'mysql2/promise';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Stripe from 'stripe';

console.log(process.env.DBUSER);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sitedemangsfrontend.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Isso garante que o Render responda o preflight (OPTIONS)
app.options("*", cors());
app.use(cookieParser());

// ----------------------
// 1) CONFIGURAR STRIPE
// ----------------------
if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Faltando STRIPE_SECRET_KEY no .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// ----------------------
// 2) ROTA DO STRIPE
// ----------------------
app.post("/criar-pagamento-cartao", async (req: Request, res: Response) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 5000, // 50 reais (em centavos)
            currency: "brl",
            payment_method_types: ["card"],
            metadata: {
                pedido_id: "123",
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (err: any) {
        console.error("Erro Stripe:", err);
        return res.status(400).json({ mensagem: err.message });
    }
});

// ----------------------
// 3) SUA ROTA DE PRODUTOS
// ----------------------
app.get('/produtos', async (req: Request, res: Response) => {
    if (!process.env.DBUSER) { 
        res.status(500).send("Variável de ambiente DBUSER não está definido");
        return;
    }
    if (!process.env.DBPASSWORD) {
        res.status(500).send("Variável de ambiente DBPASSWORD não está definida");
        return;
    }
    if (!process.env.DBHOST) {
        res.status(500).send("Variável de ambiente DBHOST não está definida");
        return;
    }
    if (!process.env.DBNAME) {
        res.status(500).send("Variável de ambiente DBNAME não está definida");
        return;
    }
    if (!process.env.DBPORT) {
        res.status(500).send("Variável de ambiente DBPORT não está definida");
        return;
    }

    try {
        const connection = await mysql.createConnection({
            host: process.env.DBHOST,
            user: process.env.DBUSER,
            password: process.env.DBPASSWORD,
            database: process.env.DBNAME,
            port: Number(process.env.DBPORT),
        });

        const [rows] = await connection.execute('SELECT * FROM produtos');
        res.json(rows);
        await connection.end();

    } catch (error) {
        res.status(500).send("Erro ao conectar ao banco de dados: " + error);
    }
});

// ----------------------
// 4) PORTA DO SERVIDOR
// ----------------------
app.listen(8000, () => {
    console.log('Servidor rodando na porta 8000');
});
