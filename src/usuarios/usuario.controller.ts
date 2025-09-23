

import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";

class UsuarioController {
  async adicionar(req: Request, res: Response) {
    try {
      const usuario = req.body;
      const resultado = await db.collection("usuarios").insertOne(usuario);
      res.status(201).json({ ...usuario, _id: resultado.insertedId });
    } catch (erro) {
      console.error("Erro ao adicionar usuário:", erro);
      res.status(500).json({ erro: "Erro interno ao adicionar usuário." });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const usuarios = await db.collection("usuarios").find().toArray();
      res.status(200).json(usuarios);
    } catch (erro) {
      console.error("Erro ao listar usuários:", erro);
      res.status(500).json({ erro: "Erro interno ao listar usuários." });
    }
  }
}

const usuarioController = new UsuarioController();
export default usuarioController;
