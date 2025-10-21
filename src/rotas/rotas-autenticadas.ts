
import carrinhoController from "../carrinho/carrinho.js";
import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produtos.js";
import { Router } from "express";

const rotasAutenticadas = Router();


// Rotas de usuários
rotasAutenticadas.post("/usuarios", usuarioController.adicionar);
rotasAutenticadas.get("/usuarios", usuarioController.listar);

// rotasAutenticadas de produtos
rotasAutenticadas.post("/produtos", produtoController.adicionar);
rotasAutenticadas.get("/produtos", produtoController.listar);

// rotasAutenticadas do carrinho
rotasAutenticadas.post("/carrinho", carrinhoController.adicionar); // Adicionar item ao carrinho
rotasAutenticadas.get("/carrinho", carrinhoController.listar); // Listar todos os carrinhos
rotasAutenticadas.delete("/carrinho/:id", carrinhoController.removerCarrinho); // Remover carrinho completo
rotasAutenticadas.put("/carrinho/:id", carrinhoController.atualizarQuantidade);// Atualizar quantidade do item no carrinho
rotasAutenticadas.delete("/carrinho/:id/item/:itemId", carrinhoController.removerItem); // Remover item específico do carrinho


rotasAutenticadas.get('/listar', carrinhoController.listar);
rotasAutenticadas.post('/adicionar', carrinhoController.adicionar);


//Ainda vamos ter que criar as rotas para carrinho e produtos
//tarefa para casa:)

export default rotasAutenticadas;