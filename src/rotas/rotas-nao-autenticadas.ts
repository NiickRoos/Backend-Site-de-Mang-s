
//Rotas que não precisam de autenticação por consequência são as de usuários 

import { Router } from "express";
import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produtos.js";

const rotasNaoAutenticadas = Router();

rotasNaoAutenticadas.post("/login", usuarioController.login);
rotasNaoAutenticadas.post("/usuarios", usuarioController.adicionar);
rotasNaoAutenticadas.get("/produtos", produtoController.listar);

export default rotasNaoAutenticadas;
