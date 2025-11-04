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

interface RequestAuth extends Request {
  usuarioId?: string;
  role?: string;
}

// 🧩 Função auxiliar para validar o ID
function isValidObjectId(id: string) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

class CarrinhoController {
  // ✅ Adicionar produto ao carrinho
  async adicionar(req: RequestAuth, res: Response) {
    try {
      const { produtoId, quantidade, precoUnitario, nome } = req.body;
      const usuarioId = req.usuarioId;

      if (!usuarioId)
        return res.status(400).json({ message: "usuarioId é obrigatório" });

      if (!produtoId || !quantidade || !precoUnitario || !nome)
        return res
          .status(400)
          .json({ message: "produtoId, quantidade, precoUnitario e nome são obrigatórios" });

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
      }

      // Se já existe, atualiza
      carrinho.itens.push(item);
      carrinho.total += item.precoUnitario * item.quantidade;
      carrinho.dataAtualizacao = new Date();

      await db.collection("carrinhos").updateOne(
        { usuarioId },
        {
          $set: {
            itens: carrinho.itens,
            total: carrinho.total,
            dataAtualizacao: carrinho.dataAtualizacao,
          },
        }
      );

      return res.status(200).json(carrinho);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro interno ao adicionar ao carrinho" });
    }
  }

  // ✅ Listar carrinho do usuário logado
  async listar(req: RequestAuth, res: Response) {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId)
      return res.status(401).json({ message: "Não autenticado" });

    const carrinho = await db.collection("carrinhos").findOne({ usuarioId });

    if (!carrinho) {
      return res.status(200).json({ _id: null, itens: [] });
    }

    // Retorna o carrinho completo com ID e itens
    return res.status(200).json({
      _id: carrinho._id,
      itens: carrinho.itens || []
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar carrinho" });
  }
}
  // ✅ Remover item do carrinho
 async removerItem(req: RequestAuth, res: Response) {
  try {
    const { id, itemId } = req.params; // ✅ Corrigido
    const produtoId = itemId; // ✅ nome compatível com frontend

    console.log("Removendo item do carrinho:", id, produtoId);

    if (!id || !produtoId)
      return res
        .status(400)
        .json({ message: "ID do carrinho e produto são obrigatórios" });

    if (!isValidObjectId(id))
      return res.status(400).json({ message: "ID do carrinho inválido" });

    const carrinho = await db
      .collection("carrinhos")
      .findOne({ _id: new ObjectId(id) });

    if (!carrinho)
      return res.status(404).json({ message: "Carrinho não encontrado" });

    // Verifica permissão
    if (req.role !== "admin" && carrinho.usuarioId !== req.usuarioId)
      return res.status(403).json({ message: "Sem permissão" });

    const novosItens = carrinho.itens.filter(
      (i: ItemCarrinho) => i.produtoId !== produtoId
    );

    if (novosItens.length === carrinho.itens.length)
      return res
        .status(404)
        .json({ message: "Produto não encontrado no carrinho" });

    const novoTotal = novosItens.reduce(
      (soma: number, i: ItemCarrinho) => soma + i.precoUnitario * i.quantidade,
      0
    );

    await db.collection("carrinhos").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          itens: novosItens,
          total: novoTotal,
          dataAtualizacao: new Date(),
        },
      }
    );

    res.status(200).json({
      message: "Produto removido com sucesso",
      carrinho: { ...carrinho, itens: novosItens, total: novoTotal },
    });
  } catch (err) {
    console.error("Erro ao remover item:", err);
    res.status(500).json({ message: "Erro ao remover item" });
  }
}


  // ✅ Atualizar quantidade de item
  async atualizarQuantidade(req: RequestAuth, res: Response) {
    try {
      const { id } = req.params;
      const { produtoId, quantidade } = req.body;

      if (!id || !produtoId || quantidade === undefined)
        return res
          .status(400)
          .json({ message: "ID, produto e quantidade são obrigatórios" });

      if (!isValidObjectId(id))
        return res.status(400).json({ message: "ID inválido" });

      const carrinho = await db.collection("carrinhos").findOne({ _id: new ObjectId(id) });
      if (!carrinho)
        return res.status(404).json({ message: "Carrinho não encontrado" });

      if (req.role !== "admin" && carrinho.usuarioId !== req.usuarioId)
        return res.status(403).json({ message: "Sem permissão" });

      const item = carrinho.itens.find(
        (i: ItemCarrinho) => i.produtoId === produtoId
      );
      if (!item)
        return res
          .status(404)
          .json({ message: "Produto não encontrado no carrinho" });

      item.quantidade = quantidade;
      const total = carrinho.itens.reduce(
        (soma: number, i: ItemCarrinho) =>
          soma + i.precoUnitario * i.quantidade,
        0
      );

      await db.collection("carrinhos").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            itens: carrinho.itens,
            total,
            dataAtualizacao: new Date(),
          },
        }
      );

      res.status(200).json({
        message: "Quantidade atualizada com sucesso",
        carrinho: { ...carrinho, total },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao atualizar quantidade" });
    }
  }

  // ✅ Remover carrinho completo
  async removerCarrinho(req: RequestAuth, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: "ID é obrigatório" });

      if (!isValidObjectId(id))
        return res.status(400).json({ message: "ID inválido" });

      const carrinho = await db.collection("carrinhos").findOne({ _id: new ObjectId(id) });
      if (!carrinho)
        return res.status(404).json({ message: "Carrinho não encontrado" });

      if (req.role !== "admin" && carrinho.usuarioId !== req.usuarioId)
        return res.status(403).json({ message: "Sem permissão" });

      await db.collection("carrinhos").deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ message: "Carrinho removido com sucesso" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao remover carrinho" });
    }
  }

  // ✅ Listar todos os carrinhos (somente admin)
  async listarTodos(req: RequestAuth, res: Response) {
    try {
      if (req.role !== "admin")
        return res.status(403).json({ message: "Sem permissão" });

      const carrinhos = await db.collection("carrinhos").find().toArray();
      res.status(200).json(carrinhos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao listar carrinhos" });
    }
  }
}

export default new CarrinhoController();
