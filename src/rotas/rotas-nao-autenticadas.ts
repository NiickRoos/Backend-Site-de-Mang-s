
//Rotas que não precisam de autenticação por consequência são as de usuários 

import { Router } from "express";
import usuarioController from "../usuarios/usuario.controller.js";

const rotasNaoAutenticadas = Router();

rotasNaoAutenticadas.post("/login", usuarioController.login);

export default rotasNaoAutenticadas;
