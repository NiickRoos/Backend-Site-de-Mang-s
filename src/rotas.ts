import { Router } from "express";
import carrinhoController from "./carrinho/carrinho.js";
import usuarioController from "./usuarios/usuario.controller.js";
import produtoController from "./produtos/produtos.js";

const rotas = Router();

// Rotas de usuários
rotas.post("/usuarios", usuarioController.adicionar);
rotas.get("/usuarios", usuarioController.listar);

// Rotas de produtos
rotas.post("/produtos", produtoController.adicionar);
rotas.get("/produtos", produtoController.listar);

// Rotas do carrinho
rotas.post("/carrinho", carrinhoController.adicionar); // Adicionar item ao carrinho
rotas.get("/carrinho", carrinhoController.listar); // Listar todos os carrinhos
rotas.delete("/carrinho/:id", carrinhoController.removerItem); // Remover item do carrinho
rotas.put("/carrinho/:id", carrinhoController.atualizarQuantidade);// Atualizar quantidade do item no carrinho
rotas.delete("/carrinho/:id/item/:itemId", carrinhoController.removerItem); // Remover item específico do carrinho


rotas.get('/listar', carrinhoController.listar);
rotas.post('/adicionar', carrinhoController.adicionar);


//Ainda vamos ter que criar as rotas para carrinho e produtos
//tarefa para casa:)

export default rotas;