import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

// ========================================
// MIDDLEWARE DE AUTENTICAÇÃO JWT - IMPLEMENTADO POR NICOLE (A1)
// ========================================

interface Authrequest extends Request{
    usuarioId?: string  // ID do usuário extraído do token
    role?: string       // Role do usuário (admin ou comum) extraída do token
}

// Middleware Auth - Validação do token JWT
// Função: Verifica se o token é válido e extrai informações do usuário
export function Auth(req:Authrequest ,res:Response,next:NextFunction){
    // 1. Verifica se o header Authorization foi fornecido
    const authHeader = req.headers.authorization
    if(!authHeader)
    return res.status(401).json({mensagem:"Token não fornecido :("})
    
    // 2. Extrai o token do header (formato: "Bearer <token>")
    const  token = authHeader.split(" ")[1]!
    
     try{
        // 3. Verifica e decodifica o token usando a chave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        
        // 4. Extrai informações do usuário do token decodificado
        req.usuarioId = (decoded as any).usuarioId  // ID do usuário
        req.role = (decoded as any).role           // Role (admin/comum)
        
        // 5. Continua para a próxima middleware/rota
        next()
     }catch(err){
        // 6. Token inválido ou expirado
        return res.status(401).json({mensagem:"Token inválido :("})
     }
}

export default Auth