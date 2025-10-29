// src/produtos/produtos.ts
import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import { ObjectId } from "mongodb";
import { Auth } from "../middleware/auth.js";
import { verificaRole } from "../middleware/verificaRole.js";

class ProdutosController {
  async adicionar(req: Request, res: Response) {
    const { nome, preco, descricao, urlfoto } = req.body;
    const produto = { nome, preco, descricao, urlfoto };
    const resultado = await db.collection("produtos").insertOne(produto);
    res.status(201).json({ ...produto, _id: resultado.insertedId });
  }

  async listar(req: Request, res: Response) {
    const produtos = await db.collection("produtos").find().toArray();
    res.status(200).json(produtos);
  }

  async atualizar(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, preco, descricao, urlfoto } = req.body;

    if (!id) {
      return res.status(400).json({ mensagem: "ID é obrigatório" });
    }

    const camposAtualizar: any = {};
    if (nome !== undefined) camposAtualizar.nome = nome;
    if (preco !== undefined) camposAtualizar.preco = preco;
    if (descricao !== undefined) camposAtualizar.descricao = descricao;
    if (urlfoto !== undefined) camposAtualizar.urlfoto = urlfoto;

    if (Object.keys(camposAtualizar).length === 0) {
      return res.status(400).json({ mensagem: "Nenhum campo para atualizar" });
    }

    const possiveisIds: any[] = [];
    if (ObjectId.isValid(id)) possiveisIds.push(new ObjectId(id));
    possiveisIds.push(id);
    const filtro = { _id: { $in: possiveisIds } } as any;

    const update = await db
      .collection("produtos")
      .updateOne(filtro, { $set: camposAtualizar });

    if (!update.matchedCount) {
      return res.status(404).json({ mensagem: "Produto não encontrado" });
    }

    const atualizado = await db.collection("produtos").findOne(filtro);
    return res.status(200).json(atualizado);
  }

  async remover(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) return res.status(400).json({ mensagem: "ID é obrigatório" });

    const possiveisIds: any[] = [];
    if (ObjectId.isValid(id)) possiveisIds.push(new ObjectId(id));
    possiveisIds.push(id);
    const filtro = { _id: { $in: possiveisIds } } as any;

    const resultado = await db.collection("produtos").deleteOne(filtro);
    if (resultado.deletedCount === 0)
      return res.status(404).json({ mensagem: "Produto não encontrado" });
    return res.status(200).json({ mensagem: "Produto removido com sucesso" });
  }
}

export default new ProdutosController();
