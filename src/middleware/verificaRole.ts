import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  role?: string;
}

export function verificaRole(rolePermitido: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.role !== rolePermitido) {
      return res.status(403).json({
        mensagem: "Você não tem permissão para acessar esse recurso!"
      });
    }
    next();
  }
}

export default verificaRole;
