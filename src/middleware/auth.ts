
import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

interface Authrequest extends Request{
    usuarioId?: string
    role?: string
}
 export function Auth(req:Authrequest ,res:Response,next:NextFunction){
    const authHeader = req.headers.authorization
    if(!authHeader)
    return res.status(401).json({mensagem:"Token não fornecido :("})
    const  token = authHeader.split(" ")[1]!
     try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        req.usuarioId = (decoded as any).usuarioId
        req.role = (decoded as any).role    
        next()
     }catch(err){
        return res.status(401).json({mensagem:"Token inválido :("})
     }
    
  

}

export default Auth