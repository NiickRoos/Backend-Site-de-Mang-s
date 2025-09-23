// src/carrinho/carrinho.ts
import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import { ObjectId } from "mongodb";

class CarrinhoController {
  async adicionar(req: Request, res: Response) {
    try {
      const { usuarioId, produtoId, quantidade } = req.body;

      if (!usuarioId || !produtoId || !quantidade) {
        return res.status(400).json({ erro: "usuarioId, produtoId e quantidade são obrigatórios." });
      }

      const item = {
        usuarioId: new ObjectId(usuarioId),
        produtoId: new ObjectId(produtoId),
        quantidade,
        dataAdicao: new Date(),
      };

      const resultado = await db.collection("carrinho").insertOne(item);

      res.status(201).json({ mensagem: "Item adicionado ao carrinho.", _id: resultado.insertedId });
    } catch (erro) {
      console.error("Erro ao adicionar item ao carrinho:", erro);
      res.status(500).json({ erro: "Erro interno ao adicionar item ao carrinho." });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      // Lista todos os itens do carrinho, sem filtro
      const itens = await db.collection("carrinho").find().toArray();
      res.status(200).json(itens);
    } catch (erro) {
      console.error("Erro ao listar itens do carrinho:", erro);
      res.status(500).json({ erro: "Erro interno ao listar itens do carrinho." });
    }
  }
}

const carrinhoController = new CarrinhoController();
export default carrinhoController;
