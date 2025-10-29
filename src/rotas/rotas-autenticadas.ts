//rotas Autenticadas para o usuario logado


import carrinhoController from "../carrinho/carrinho.js";
import { Auth } from "../middleware/auth.js";
import { Router } from "express";

const rotasAutenticadas = Router();

// Todas as rotas abaixo precisam de autenticação
rotasAutenticadas.use(Auth);

// rotasAutenticadas do carrinho
rotasAutenticadas.post("/carrinho", carrinhoController.adicionar); // Adicionar item ao carrinho
rotasAutenticadas.get("/carrinho", carrinhoController.listar); // Listar carrinho do usuário logado
rotasAutenticadas.delete("/carrinho/:id", carrinhoController.removerCarrinho); // Remover carrinho completo
rotasAutenticadas.put("/carrinho/:id", carrinhoController.atualizarQuantidade);// Atualizar quantidade do item no carrinho
rotasAutenticadas.delete("/carrinho/:id/item/:itemId", carrinhoController.removerItem); // Remover item específico do carrinho


rotasAutenticadas.get('/listar', carrinhoController.listar);
rotasAutenticadas.post('/adicionar', carrinhoController.adicionar);


//Ainda vamos ter que criar as rotas para carrinho e produtos
//tarefa para casa:)

export default rotasAutenticadas;