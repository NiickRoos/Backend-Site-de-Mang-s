import { Request, Response, NextFunction } from 'express';

// ========================================
// MIDDLEWARE DE VERIFICAÇÃO DE ROLE - IMPLEMENTADO POR NICOLE (A1)
// ========================================

interface AuthRequest extends Request {
  role?: string; // Role do usuário (injetada pelo middleware Auth)
}

// Função verificaRole - Controle de acesso baseado em roles
// Parâmetro: rolePermitido - a role necessária para acessar a rota
export function verificaRole(rolePermitido: string) {
  // Retorna uma middleware function que verifica a role do usuário
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Verifica se a role do usuário corresponde à role permitida
    if (req.role !== rolePermitido) {
      // 2. Se não tiver permissão, retorna erro 403 (Forbidden)
      return res.status(403).json({
        mensagem: "Você não tem permissão para acessar esse recurso!"
      });
    }
    
    // 3. Se tiver permissão, continua para a próxima middleware/rota
    next();
  }
}

export default verificaRole;
