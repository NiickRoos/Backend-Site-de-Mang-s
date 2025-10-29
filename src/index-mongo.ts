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

app.use(rotasNaoAutenticadas)
app.use(rotasAutenticadas);
app.use(rotasAdm);

app.listen(8000, () => {
    console.log('servidor rodando em 8000');
});