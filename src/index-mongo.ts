import 'dotenv/config';
import express from 'express';
import rotasNaoAutenticadas from "./rotas/rotas-nao-autenticadas.js";
import rotasAutenticadas from './rotas/rotas-autenticadas.js';
import rotasAdm from './rotas/rotas-adm.js';
import cors from 'cors';
import fs from 'fs';
import { connectMongo } from './database/banco-mongo.js';

const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Conectar ao MongoDB antes de iniciar o servidor
connectMongo().catch(err => {
  console.error('Erro ao conectar ao MongoDB:', err);
  process.exit(1);
});



// Garante que a pasta de uploads exista
try { fs.mkdirSync('uploads', { recursive: true }); } catch {}

// Rota pública raiz para evitar 401 ao acessar /
app.get('/', (_req, res) => {
    res.status(200).send('API online');
});

// Evita 401 no console ao acessar / por causa do /favicon.ico automático do navegador
app.get('/favicon.ico', (_req, res) => res.status(204).end());

app.use(rotasNaoAutenticadas)
app.use(rotasAutenticadas);
app.use(rotasAdm);

app.listen(8000, () => {
    console.log('servidor rodando em 8000');
});