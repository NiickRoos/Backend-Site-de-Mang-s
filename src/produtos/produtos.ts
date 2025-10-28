// src/produtos/produtos.ts
import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import { Auth } from  "../middleware/auth.js";
import { verificaRole } from "../middleware/verificaRole.js";




class ProdutosController {
  async adicionar(req: Request, res: Response) {
    const {nome,preco,descricao,urlfoto} = req.body;
    const produto = {nome,preco,descricao,urlfoto};
    const resultado = await db.collection('produtos').insertOne(produto);
    res.status(201).json({ ...produto, _id: resultado.insertedId });
  }

  async listar(req: Request, res: Response) {
    const produtos = await db.collection('produtos').find().toArray();
    res.status(200).json(produtos);
  }
}

export default new ProdutosController();
