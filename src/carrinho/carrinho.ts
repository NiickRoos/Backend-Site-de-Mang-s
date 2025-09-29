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

class Carrinho {
  async adicionar(req: Request, res: Response) {
    const { usuarioId, produtoId, quantidade, precoUnitario, nome } = req.body;

     let carrinho = await db.collection('carrinhos').findOne({ usuarioId });

    const item: ItemCarrinho = {
      produtoId,
      quantidade,
      precoUnitario,
      nome
    };  

    if (!carrinho) {
    
      const carrinho = {
        usuarioId,
        itens: [item],
        dataAtualizacao: new Date(),
        total: item.precoUnitario * item.quantidade
      };
      await db.collection('carrinhos').insertOne(carrinho);
    } else {
      // Se o carrinho existir, adiciona o item
      carrinho.itens.push(item);
      carrinho.total += item.precoUnitario * item.quantidade;
      carrinho.dataAtualizacao = new Date();
      await db.collection('carrinhos').updateOne({ usuarioId }, { $set: carrinho });
    }

    res.status(200).json(carrinho);
  }

  async listar(req: Request, res: Response) {
    const carrinhos = await db.collection('carrinhos').find().toArray();
    res.status(200).json(carrinhos);
  }

  async removerItem(req: Request, res: Response) {
    const { id } = req.params;
    await db.collection('carrinhos').updateOne(
      { _id: new ObjectId(id) },
      { $set: { itens: [] } }
    );
    res.status(200).json({ message: 'Itens removidos com sucesso' });
  }

  async atualizarQuantidade(req: Request, res: Response) {
    const { id } = req.params;
    const { quantidade } = req.body;
    await db.collection('carrinhos').updateOne(
      { _id: new ObjectId(id) },
      { $set: { quantidade } }
    );
    res.status(200).json({ message: 'Quantidade atualizada com sucesso' });
  }

  async removerCarrinho(req: Request, res: Response) {
    const { id } = req.params;
    await db.collection('carrinhos').deleteOne({ _id: new ObjectId(id) });
    res.status(204).send();
  }
}


export default new Carrinho();