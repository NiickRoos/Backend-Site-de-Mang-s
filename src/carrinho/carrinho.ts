import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import { ObjectId } from "mongodb";

interface ItemCarrinho {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  nome: string;
}

interface Carrinho {
  usuarioId: string;
  itens: ItemCarrinho[];
  dataAtualizacao: Date;
  total: number;
}

class CarrinhoController {
  
  async adicionar(req: Request, res: Response) {
    try {
      const { usuarioId, produtoId, quantidade } = req.body;

      const usuarioObjId = new ObjectId(usuarioId);
      const produtoObjId = new ObjectId(produtoId);

      const item = {
        usuarioId: usuarioObjId,
        produtoId: produtoObjId,
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
      const usuarioId = req.query.usuarioId as string;
      const usuarioObjId = new ObjectId(usuarioId);

      const itens = await db.collection("carrinho").find({ usuarioId: usuarioObjId }).toArray();

      res.status(200).json(itens);
    } catch (erro) {
      console.error("Erro ao listar itens do carrinho:", erro);
      res.status(500).json({ erro: "Erro interno ao listar itens do carrinho." });
    }
  }

  async remover(req: Request, res: Response) {
    try {
      const { itemId } = req.params;

      const resultado = await db.collection("carrinho").deleteOne({ _id: new ObjectId(itemId) });

      res.status(200).json({ mensagem: "Item removido do carrinho." });
    } catch (erro) {
      console.error("Erro ao remover item do carrinho:", erro);
      res.status(500).json({ erro: "Erro interno ao remover item do carrinho." });
    }
  }

  async atualizarQuantidade(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { quantidade } = req.body;

      await db.collection("carrinho").updateOne(
        { _id: new ObjectId(itemId) },
        { $set: { quantidade } }
      );

      res.status(200).json({ mensagem: "Quantidade do item atualizada." });
    } catch (erro) {
      console.error("Erro ao atualizar quantidade do item no carrinho:", erro);
      res.status(500).json({ erro: "Erro interno ao atualizar quantidade do item no carrinho." });
    }
  }

  async removerCarrinho(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      const usuarioObjId = new ObjectId(usuarioId);

      const resultado = await db.collection("carrinho").deleteMany({ usuarioId: usuarioObjId });

      res.status(200).json({ mensagem: `Carrinho removido com ${resultado.deletedCount} itens.` });
    } catch (erro) {
      console.error("Erro ao remover carrinho do usuário:", erro);
      res.status(500).json({ erro: "Erro interno ao remover carrinho do usuário." });
    }
  }
}

const carrinhoController = new CarrinhoController();
export default carrinhoController;
