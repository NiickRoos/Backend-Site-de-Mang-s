import { Request, Response } from "express"

import { db } from "../database/banco-mongo.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

class UsuarioController {
  async adicionar(req:Request, res:Response) {


    const {nome,idade,email,senha, role} = req.body
    if(!nome || !idade || !email || !senha){
        return res.status(400).json({mensagem:"Dados incompletos (nome, idade, email, senha)"})
    }
    const senhaCriptografada = await bcrypt.hash(senha,10)
    //adicionei a possibilidade de ser ususarioou admin por padrão voce é usuario ao menos que clique e seja admin
    const usuario = {
      nome, 
      idade,
      email,
      senha: senhaCriptografada,
      role: role === "admin" ? "admin" : "user"
    };
   
    const resultado = await db.collection('usuarios').insertOne(usuario)
    res.status(201).json({...usuario, _id: resultado.insertedId})

    }
    async listar(req:Request, res:Response) {
         const usuarios = await db.collection('usuarios').find().toArray();
    res.status(200).json(usuarios);
    }
    async login(req:Request, res:Response) {
        //recebe email e senha
        const {email, senha} = req.body
        if(!email || !senha) return res.status(400).json({mensagem:"Email e senha são obrigatórios"})
        //verifica se o usuario e senha estao corretos no banco
      const usuario = await db.collection('usuarios').findOne({email})
      if(!usuario) return res.status(401).json({mensagem:"Usuário ou senha inválidos"})
      const senhaValida = await bcrypt.compare(senha, usuario.senha)
      if((!senhaValida))
      return res.status(400).json({mensagem:"Usuário ou senha inválidos"})  
   
      // Parte do token
      const token = jwt.sign(
        {
          usuarioId: usuario._id,
          role : usuario.role

      },
       process.env.JWT_SECRET!,
        {expiresIn: '1h'}
      );

      res.status(200).json({ token, role: usuario.role });
    }
    async remover(req:Request, res:Response){
      const {id} = req.params
      if(!id) return res.status(400).json({mensagem:"ID é obrigatório"})
      const resultado = await db.collection('usuarios').deleteOne({ _id: id as any })
      if(resultado.deletedCount===0) return res.status(404).json({mensagem:"Usuário não encontrado"})
      res.status(200).json({mensagem:"Usuário removido com sucesso"})
    }
    
     
  }
   export default new UsuarioController();