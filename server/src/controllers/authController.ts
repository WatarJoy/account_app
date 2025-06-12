import dns from "dns/promises";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export const isEmailDomainValid = async (email: string): Promise<boolean> => {
  const domain = email.split("@")[1];

  try {
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (err) {
    return false; // домен не існує або немає MX-записів
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const domainValid = await isEmailDomainValid(email);
  if (!domainValid) {
    return res.status(400).json({ message: "Email domain does not exist" });
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ email, password: hash });
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    res.status(400).json({ message: "Email already in use" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });
};
