import { Request, Response } from "express";
import { Transaction } from "../models/Transaction";

export const getTransactions = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const txs = await Transaction.findAll({ where: { userId: user.id } });
  res.json(txs);
};

export const createTransaction = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { amount, description, type } = req.body;
  const tx = await Transaction.create({ amount, description, type, userId: user.id });
  res.json(tx);
};
