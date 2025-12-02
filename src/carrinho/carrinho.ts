import { Request, type Response } from "express";
import { db } from "../database/banco-mongo.js";
import { ObjectId } from "mongodb";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Função auxiliar para validar o ID
function isValidObjectId(id?: string) {
  if (!id) return false;
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

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

      // 🔹 Se o usuário ainda não tem carrinho, cria um novo
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

      // 🔹 Se já existe carrinho, verifica se o produto já está na lista
      const indiceExistente = carrinho.itens.findIndex(
        (i: ItemCarrinho) => i.produtoId === produtoId
      );

      if (indiceExistente >= 0) {
        // ✅ Produto já existe → apenas atualiza a quantidade
        carrinho.itens[indiceExistente].quantidade += quantidade;
      } else {
        // 🔹 Produto novo → adiciona ao carrinho
        carrinho.itens.push(item);
      }

      // 🔹 Atualiza total
      carrinho.total = carrinho.itens.reduce(
        (soma: number, i: ItemCarrinho) => soma + i.precoUnitario * i.quantidade,
        0
      );

      carrinho.dataAtualizacao = new Date();

      // 🔹 Salva as alterações
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

  //  Listar carrinho do usuário logado
 async listar(req: RequestAuth, res: Response) {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId)
      return res.status(401).json({ message: "Não autenticado" });

    const carrinho = await db.collection("carrinhos").findOne({ usuarioId });

    if (!carrinho) {
      return res.status(200).json({ _id: null, itens: [] });
    }

    return res.status(200).json({
      _id: carrinho._id.toString(), // 👈 RESOLVIDO
      itens: carrinho.itens || []
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar carrinho" });
  }
}


  //  Remover item do carrinho
  async removerItem(req: RequestAuth, res: Response) {
    try {
      const { id, itemId } = req.params; //  Corrigido
      const produtoId = itemId; //  nome compatível com frontend

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

  //  Atualizar quantidade de item
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

  // Remover carrinho completo
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

  //  Listar todos os carrinhos (somente admin)
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

  //  Filtrar itens do carrinho - Implementado por Amanda
  async filtrarItens(req: RequestAuth, res: Response) {
    try {
      const usuarioId = req.usuarioId;
      if (!usuarioId)
        return res.status(401).json({ message: "Não autenticado" });

      // Parâmetros de filtro - Amanda
      const { nome, precoMin, precoMax, quantidadeMin, quantidadeMax } = req.query;

      // Busca o carrinho do usuário - Amanda
      const carrinho = await db.collection("carrinhos").findOne({ usuarioId });
      
      if (!carrinho || !carrinho.itens) {
        return res.status(200).json({ itens: [], total: 0 });
      }

      // Aplica os filtros - Amanda
      let itensFiltrados = carrinho.itens.filter((item: ItemCarrinho) => {
        // Filtro por nome - Amanda
        if (nome && typeof nome === 'string') {
          const nomeLower = nome.toLowerCase();
          if (!item.nome.toLowerCase().includes(nomeLower)) {
            return false;
          }
        }

        // Filtro por preço mínimo - Amanda
        if (precoMin && typeof precoMin === 'string') {
          const min = parseFloat(precoMin);
          if (isNaN(min) || item.precoUnitario < min) {
            return false;
          }
        }

        // Filtro por preço máximo - Amanda
        if (precoMax && typeof precoMax === 'string') {
          const max = parseFloat(precoMax);
          if (isNaN(max) || item.precoUnitario > max) {
            return false;
          }
        }

        // Filtro por quantidade mínima - Amanda
        if (quantidadeMin && typeof quantidadeMin === 'string') {
          const min = parseInt(quantidadeMin);
          if (isNaN(min) || item.quantidade < min) {
            return false;
          }
        }

        // Filtro por quantidade máxima - Amanda
        if (quantidadeMax && typeof quantidadeMax === 'string') {
          const max = parseInt(quantidadeMax);
          if (isNaN(max) || item.quantidade > max) {
            return false;
          }
        }

        return true;
      });

      // Recalcula o total dos itens filtrados - Amanda
      const totalFiltrado = itensFiltrados.reduce(
        (soma: number, item: ItemCarrinho) => soma + (item.precoUnitario * item.quantidade),
        0
      );

      res.status(200).json({
        itens: itensFiltrados,
        total: totalFiltrado,
        filtrosAplicados: {
          nome: nome || null,
          precoMin: precoMin || null,
          precoMax: precoMax || null,
          quantidadeMin: quantidadeMin || null,
          quantidadeMax: quantidadeMax || null
        }
      });

    } catch (err) {
      console.error("Erro ao filtrar itens do carrinho - Amanda:", err);
      res.status(500).json({ message: "Erro ao filtrar itens do carrinho" });
    }
  }
  
  async criarPagamentoCartao(req: RequestAuth, res: Response) {
    try {
      const usuarioId = req.usuarioId;

      if (!usuarioId)
        return res.status(400).json({ message: "usuarioId é obrigatório" });

      // Buscar o carrinho do usuário
      const carrinho = await db.collection("carrinhos").findOne({ usuarioId });

      if (!carrinho || carrinho.itens.length === 0)
        return res.status(400).json({ message: "Carrinho vazio" });

      // Converter total para centavos (BRL)
      const amount = Math.round(carrinho.total * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "brl",
        payment_method_types: ["card"],
        metadata: {
          usuarioId,
          pedido_id: carrinho._id?.toString() || "",
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err) {
      if (err instanceof Error)
        return res.status(400).json({ mensagem: err.message });
      res.status(400).json({ mensagem: "Erro de pagamento desconhecido!" });
    }
  }

  // Finalizar compra
    // =====================================================
  // FINALIZAR COMPRA (CRIAR PEDIDO)
  // =====================================================
  async finalizarCompra(req: RequestAuth, res: Response) {
    try {
      const usuarioId = req.usuarioId;
      const { carrinhoId } = req.params;

      if (!isValidObjectId(carrinhoId))
        return res.status(400).json({ message: "ID inválido" });

      const carrinho = await db.collection("carrinhos").findOne({
        _id: new ObjectId(carrinhoId),
        usuarioId
      });

      if (!carrinho)
        return res.status(404).json({ message: "Carrinho não encontrado" });

      const pedido = {
        usuarioId,
        itens: carrinho.itens,
        total: carrinho.total,
        status: "pendente",
        dataPedido: new Date(),
        dataAtualizacao: new Date()
      };

      await db.collection("pedidos").insertOne(pedido);

      await db.collection("carrinhos").updateOne(
        { _id: new ObjectId(carrinhoId) },
        { $set: { itens: [], total: 0, dataAtualizacao: new Date() } }
      );

      return res.status(200).json({ message: "Compra finalizada", pedido });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao finalizar compra" });
    }
  }
}

export default new CarrinhoController();