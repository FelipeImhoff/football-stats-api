import { Request, Response } from 'express';

const getStatus = (req: Request, res: Response): void => {
  res.send('API está rodando normalmente');
};

export default { getStatus };
