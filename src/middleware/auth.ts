//Explicando o que é um middleware
import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
interface Authrequest extends Request{
    usuarioId?: number
}
function Auth(req:Authrequest ,res:Response,next:NextFunction){
    const authHeader = req.headers.authorization
    if(!authHeader)
        return res.status(401).json({mensagem:"Token não fornecido :("})
    const  token = authHeader.split(" ")[1]!
    jwt.verify(token,process.env.JWT_SECRET!, (err, decoded)=>{
        if(err){
            console.log(err)
            return res.status(401).json({mensagem:"Token inválido :("})
        }
        if(typeof decoded === 'string' || !decoded || !("usuarioId" in decoded))
            return res.status(401).json({mensagem:"Token inválido :("})
        req.usuarioId = decoded.usuarioId
        next()
    }) 
  

    
    
    //return res.status(401).json({mensagem:"Você não tem permissão para acessar esse recurso!"})
}

export default Auth