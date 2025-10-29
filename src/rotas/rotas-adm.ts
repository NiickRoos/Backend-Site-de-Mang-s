// rotas de adm 
import { Router } from "express";
import Auth from "../middleware/auth.js";
import verificaRole from "../middleware/verificaRole.js";
import carrinhoController from "../carrinho/carrinho.js";
import usuarioController from "../usuarios/usuario.controller.js";

const rotasAdm = Router();

// Todas as rotas abaixo exigem autenticação e role admin
rotasAdm.use(Auth, verificaRole("admin"));

// Carrinhos: admin pode visualizar todos e manipular qualquer um
rotasAdm.get("/admin/carrinhos", carrinhoController.listarTodos);
rotasAdm.delete("/admin/carrinho/:id", carrinhoController.removerCarrinho);
rotasAdm.put("/admin/carrinho/:id", carrinhoController.atualizarQuantidade);
rotasAdm.delete("/admin/carrinho/:id/item", carrinhoController.removerItem);

// Usuários: admin pode listar e excluir clientes
rotasAdm.get("/admin/usuarios", usuarioController.listar);
rotasAdm.delete("/admin/usuarios/:id", usuarioController.remover);

export default rotasAdm;