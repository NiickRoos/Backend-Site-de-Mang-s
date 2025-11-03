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
  usuarioId: string; // sempre string
  itens: ItemCarrinho[];
  dataAtualizacao: Date;
  total: number;
}

interface RequestAuth extends Request {
  usuarioId?: string;
  role?: string;
}

class CarrinhoController {
  // Adicionar produto ao carrinho
  async adicionar(req: RequestAuth, res: Response) {
    const { produtoId, quantidade, precoUnitario, nome } = req.body;
    const usuarioId = req.usuarioId;
    if (!usuarioId) return res.status(400).json({ message: "usuarioId é obrigatório" });

    let carrinho = await db.collection("carrinhos").findOne({ usuarioId });

    const item: ItemCarrinho = { produtoId, quantidade, precoUnitario, nome };

    if (!carrinho) {
      const novoCarrinho: Carrinho = {
        usuarioId,
        itens: [item],
        dataAtualizacao: new Date(),
        total: item.precoUnitario * item.quantidade,
      };
      await db.collection("carrinhos").insertOne(novoCarrinho);
      return res.status(201).json(novoCarrinho);
    } else {
      carrinho.itens.push(item);
      carrinho.total += item.precoUnitario * item.quantidade;
      carrinho.dataAtualizacao = new Date();

      await db.collection("carrinhos").updateOne(
        { usuarioId },
        { $set: { itens: carrinho.itens, total: carrinho.total, dataAtualizacao: carrinho.dataAtualizacao } }
      );

      return res.status(200).json(carrinho);
    }
  }

  // Listar carrinho do usuário
  async listar(req: RequestAuth, res: Response) {
    const usuarioId = req.usuarioId;
    if (!usuarioId) return res.status(401).json({ message: "Não autenticado" });

    const carrinho = await db.collection("carrinhos").findOne({ usuarioId });
    return res.status(200).json(carrinho ?? null);
  }

  // Remover item do carrinho
  async removerItem(req: RequestAuth, res: Response) {
    const { id } = req.params;
    const { produtoId } = req.body;
    if (!id || !produtoId) return res.status(400).json({ message: "ID do carrinho e produto são obrigatórios" });

    const carrinho = await db.collection("carrinhos").findOne({ _id: new ObjectId(id) });
    if (!carrinho) return res.status(404).json({ message: "Carrinho não encontrado" });

    if (req.role !== "admin" && carrinho.usuarioId !== req.usuarioId)
      return res.status(403).json({ message: "Sem permissão para alterar este carrinho" });

    const novosItens = carrinho.itens.filter((i: ItemCarrinho) => i.produtoId !== produtoId);
    if (novosItens.length === carrinho.itens.length)
      return res.status(404).json({ message: "Produto não encontrado no carrinho" });

    const novoTotal = novosItens.reduce((soma: number, i: ItemCarrinho) => soma + i.precoUnitario * i.quantidade, 0);

    await db.collection("carrinhos").updateOne(
      { _id: new ObjectId(id) },
      { $set: { itens: novosItens, total: novoTotal, dataAtualizacao: new Date() } }
    );

    res.status(200).json({ message: "Produto removido com sucesso", carrinho: { ...carrinho, itens: novosItens, total: novoTotal } });
  }

  // Atualizar quantidade de um item
  async atualizarQuantidade(req: RequestAuth, res: Response) {
    const { id } = req.params;
    const { produtoId, quantidade } = req.body;
    if (!id || !produtoId || quantidade === undefined)
      return res.status(400).json({ message: "ID, produto e quantidade são obrigatórios" });

    const carrinho = await db.collection("carrinhos").findOne({ _id: new ObjectId(id) });
    if (!carrinho) return res.status(404).json({ message: "Carrinho não encontrado" });

    if (req.role !== "admin" && carrinho.usuarioId !== req.usuarioId)
      return res.status(403).json({ message: "Sem permissão para alterar este carrinho" });

    const item = carrinho.itens.find((i: ItemCarrinho) => i.produtoId === produtoId);
    if (!item) return res.status(404).json({ message: "Produto não encontrado no carrinho" });

    item.quantidade = quantidade;
    const total = carrinho.itens.reduce((soma: number, i: ItemCarrinho) => soma + i.precoUnitario * i.quantidade, 0);

    await db.collection("carrinhos").updateOne(
      { _id: new ObjectId(id) },
      { $set: { itens: carrinho.itens, total, dataAtualizacao: new Date() } }
    );

    res.status(200).json({ message: "Quantidade atualizada com sucesso", carrinho: { ...carrinho, total } });
  }

  // Remover carrinho completo
  async removerCarrinho(req: RequestAuth, res: Response) {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID é obrigatório" });

    const carrinho = await db.collection("carrinhos").findOne({ _id: new ObjectId(id) });
    if (!carrinho) return res.status(404).json({ message: "Carrinho não encontrado" });

    if (req.role !== "admin" && carrinho.usuarioId !== req.usuarioId)
      return res.status(403).json({ message: "Sem permissão para remover este carrinho" });

    await db.collection("carrinhos").deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: "Carrinho removido com sucesso" });
  }

  // Listar todos os carrinhos (admin)
  async listarTodos(req: RequestAuth, res: Response) {
    if (req.role !== "admin") return res.status(403).json({ message: "Sem permissão" });
    const carrinhos = await db.collection("carrinhos").find().toArray();
    res.status(200).json(carrinhos);
  }
}

export default new CarrinhoController();
