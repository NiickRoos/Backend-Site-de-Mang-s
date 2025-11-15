import carrinhoController from "../carrinho/carrinho.js";
import produtosController from "../produtos/produtos.js";
import { Auth } from "../middleware/auth.js";
import { verificaRole } from "../middleware/verificaRole.js";
import { Router } from "express";

const rotasAutenticadas = Router();

// ========================================
// SISTEMA DE AUTENTICAÇÃO JWT - IMPLEMENTADO POR NICOLE (A1)
// ========================================

// Todas as rotas abaixo precisam de autenticação JWT
// Middleware Auth valida o token e extrai usuarioId e role
rotasAutenticadas.use(Auth);

// ========================================
// ROTAS DE CARRINHO
// ========================================
rotasAutenticadas.post("/carrinho", carrinhoController.adicionar);
rotasAutenticadas.get("/carrinho", carrinhoController.listar);
rotasAutenticadas.get("/carrinho/filtrar", carrinhoController.filtrarItens); // Implementado por Amanda
rotasAutenticadas.delete("/carrinho/:id", carrinhoController.removerCarrinho);
rotasAutenticadas.put("/carrinho/:id", carrinhoController.atualizarQuantidade);
rotasAutenticadas.delete("/carrinho/:id/item/:itemId", carrinhoController.removerItem);

// ========================================
// ROTAS DE PRODUTOS - CONTROLE DE ACESSO POR ROLE (NICOLE A1)
// ========================================

// GET /produtos - Qualquer usuário logado (admin ou comum) pode visualizar produtos
// Não usa verificaRole, apenas Auth para garantir que está autenticado
rotasAutenticadas.get("/produtos", produtosController.listar); // Qualquer usuário logado

// POST /produtos - Apenas ADMIN pode criar novos produtos
// Middleware verificaRole("admin") bloqueia usuários comuns
rotasAutenticadas.post("/produtos", verificaRole("admin"), produtosController.adicionar); // Só admin

// PUT /produtos/:id - Apenas ADMIN pode editar produtos existentes
// Middleware verificaRole("admin") bloqueia usuários comuns
rotasAutenticadas.put("/produtos/:id", verificaRole("admin"), produtosController.atualizar); // Só admin

// DELETE /produtos/:id - Apenas ADMIN pode excluir produtos
// Middleware verificaRole("admin") bloqueia usuários comuns
rotasAutenticadas.delete("/produtos/:id", verificaRole("admin"), produtosController.remover); // Só admin

export default rotasAutenticadas;
