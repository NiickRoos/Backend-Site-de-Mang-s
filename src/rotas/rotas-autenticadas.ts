import carrinhoController from "../carrinho/carrinho.js";
import produtosController from "../produtos/produtos.js";
import { Auth } from "../middleware/auth.js";
import { verificaRole } from "../middleware/verificaRole.js";
import { Router } from "express";

const rotasAutenticadas = Router();

// Todas as rotas abaixo precisam de autenticação
rotasAutenticadas.use(Auth);

// CARRINHO
rotasAutenticadas.post("/carrinho", carrinhoController.adicionar);
rotasAutenticadas.get("/carrinho", carrinhoController.listar);
rotasAutenticadas.delete("/carrinho/:id", carrinhoController.removerCarrinho);
rotasAutenticadas.put("/carrinho/:id", carrinhoController.atualizarQuantidade);
rotasAutenticadas.delete("/carrinho/:id/item/:itemId", carrinhoController.removerItem);

// PRODUTOS
rotasAutenticadas.get("/produtos", produtosController.listar); // Qualquer usuário logado
rotasAutenticadas.post("/produtos", verificaRole("admin"), produtosController.adicionar); // Só admin

export default rotasAutenticadas;
