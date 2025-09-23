import usuarioController from  "./usuarios/usuario.controller";
import carrinhoController from "./carrinho/carrinho";
import produtoController from "./produtos/produtos";
import { Router } from "express";
const  rotas = Router();
 
//criando rotas de usuarios
rotas.post('/usuarios', usuarioController.adicionar);
rotas.get('/usuarios', usuarioController.listar);
//rotas de produtos

rotas.post('/produtos', produtoController.adicionar);
rotas.get('/produtos', produtoController.listar);

//rota de carrinho
rotas.post('/carrinho', carrinhoController.adicionar);
rotas.get('/carrinho', carrinhoController.listar);


//Ainda vamos ter que criar as rotas para carrinho e produtos
//tarefa para casa:)

export default rotas;