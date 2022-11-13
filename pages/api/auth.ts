// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../db";
import jwt from "jsonwebtoken";
import { Participant } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET" && req.headers.authorization) {
    const participant = await prisma.participant.findUnique({
      where: {
        id: (jwt.decode(req.headers.authorization.split(" ")[1]) as Participant)
          .id,
      },
    });
    res.status(200).json(participant);
  } else if (req.method === "POST") {
    const psychotest = await prisma.psychotest.findFirst({
      where: { token: req.body.psychotestToken },
    });
    if (psychotest) {
      const participant = await prisma.participant.findFirst({
        where: {
          psychotestId: psychotest.id,
          nik: req.body.nik,
        },
      });
      if (participant) {
        res.status(200).send(jwt.sign(participant, "puc", { expiresIn: "1d" }));
      } else {
        res.status(400).send("NIK salah.");
      }
    } else {
      res.status(400).send("Token salah.");
    }
  }
}
