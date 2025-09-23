// src/produtos/produtos.ts
import { Request, Response } from "express";
import { db } from "../database/banco-mongo";
import { ObjectId } from "mongodb";

const produtoController = {
  // Adicionar produto
  async adicionar(req: Request, res: Response) {
    try {
      const { nome, preco, urlfoto, descricao } = req.body;

      if (!nome || !preco || !urlfoto || !descricao) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
      }

      const novoProduto = { nome, preco, urlfoto, descricao };

      const resultado = await db.collection("produtos").insertOne(novoProduto);

      return res.status(201).json({
        mensagem: "Produto adicionado com sucesso.",
        produtoId: resultado.insertedId,
      });
    } catch (erro) {
      console.error("Erro ao adicionar produto:", erro);
      return res.status(500).json({ erro: "Erro interno ao adicionar produto." });
    }
  },

  // Listar produtos
  async listar(req: Request, res: Response) {
    try {
      const produtos = await db.collection("produtos").find().toArray();
      return res.status(200).json(produtos);
    } catch (erro) {
      console.error("Erro ao listar produtos:", erro);
      return res.status(500).json({ erro: "Erro interno ao listar produtos." });
    }
  },
};

export default produtoController;
