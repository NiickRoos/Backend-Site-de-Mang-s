import 'dotenv/config';
import express from 'express';
import rotasNaoAutenticadas from "./rotas/rotas-nao-autenticadas.js";
import rotasAutenticadas from './rotas/rotas-autenticadas.js';
import rotasAdm from './rotas/rotas-adm.js';
import cors from 'cors';
const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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