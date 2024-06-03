import { Request, Response } from 'express';

const getStatus = (req: Request, res: Response) => {
  res.send('API está rodando normalmente');
};

export default { getStatus };
