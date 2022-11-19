// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Participant } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { Test } from "../../app/page";
import { prisma } from "../../db";
import jwt from "jsonwebtoken";

import ist1 from "../../tests/ist/1.json";
import ist2 from "../../tests/ist/2.json";
import ist3 from "../../tests/ist/3.json";
import ist4 from "../../tests/ist/4.json";
import ist5 from "../../tests/ist/5.json";
import ist6 from "../../tests/ist/6.json";
import ist7 from "../../tests/ist/7.json";
import ist8 from "../../tests/ist/8.json";
import ist9 from "../../tests/ist/9.json";
import epps from "../../tests/epps.json";
import papi from "../../tests/papi.json";

const tests: Test[] = [
  ist1,
  ist2,
  ist3,
  ist4,
  ist5,
  ist6,
  ist7,
  ist8,
  ist9,
  epps,
  papi,
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.headers.authorization) {
    res.status(401);
    return;
  }

  const participantId = (
    jwt.decode(req.headers.authorization.split(" ")[1]) as Participant
  ).id;
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  });

  if (!participant) {
    res.status(401);
    return;
  }

  async function nextTest() {
    const time = new Date();
    time.setMinutes(
      time.getMinutes() +
        ((participant && tests[participant.currentTest].instructionDuration) ||
          10)
    );
    const p = await prisma.participant.update({
      where: { id: participantId },
      data: {
        testStart: time,
        currentTest: { increment: 1 },
      },
    });
    const test = tests[p.currentTest - 1];
    return {
      title: test.title,
      type: test.type,
      pre: test.pre,
      instruction: test.instruction,
      examples: test.examples,
      end: p.testStart,
    };
  }

  async function startTest() {
    const participant = await prisma.participant.update({
      where: { id: participantId },
      data: {
        testStart: null,
      },
    });
    const test = tests[participant.currentTest - 1];
    const time = new Date();
    time.setMinutes(time.getMinutes() + (test.duration || 30));
    const answer = await prisma.answer.create({
      data: {
        participant: {
          connect: {
            id: participantId,
          },
        },
        test: participant.currentTest,
        end: time,
        answers: new Array(test.questions!.length).fill(""),
      },
    });
    return {
      questions: test.questions,
      end: answer.end,
      answers: answer.answers,
    };
  }

  if (req.method === "GET") {
    let test;
    if (participant.currentTest === 0) {
      // psikotes belum mulai
      res.status(200).json(await nextTest());
    } else {
      // psikotes sudah mulai
      if (participant.testStart) {
        // tes masih instruksi
        if (new Date() < participant.testStart) {
          // tes belum mulai
          test = tests[participant.currentTest - 1];
          res.status(200).json({
            title: test.title,
            type: test.type,
            pre: test.pre,
            instruction: test.instruction,
            examples: test.examples,
            end: participant.testStart,
          });
        } else {
          // tes sudah harus mulai
          res.status(200).json(await startTest());
        }
      } else {
        // tes sedang berjalan
        const answer = await prisma.answer.findFirst({
          where: {
            participantId: participant.id,
            test: participant.currentTest,
          },
        });
        if (answer) {
          if (!answer.end || new Date() < answer.end) {
            // tes sedang berjalan
            test = tests[participant.currentTest - 1];
            res.status(200).json({
              ...test,
              end: answer.end,
              answers: answer.answers,
            });
          } else {
            // tes sudah harus selesai
            if (participant.currentTest < tests.length) {
              res.status(200).json(await nextTest());
            } else {
              res
                .status(401)
                .send("Psikotes Anda telah selesai. Terima kasih.");
            }
          }
        }
      }
    }
  } else if (req.method === "POST") {
    if (participant.testStart) {
      // tes masih instruksi
      res.status(200).json(await startTest());
    } else {
      // tes sedang berjalan
      if (participant.currentTest < tests.length) {
        await prisma.answer.updateMany({
          where: {
            participantId: participant.id,
            test: participant.currentTest,
          },
          data: {
            end: new Date(),
          },
        });
        res.status(200).json(await nextTest());
      } else {
        res.status(401).send("Psikotes Anda telah selesai. Terima kasih.");
      }
    }
  } else if (req.method === "PUT") {
    if (participant) {
      await prisma.answer.updateMany({
        where: {
          participantId: participant.id,
          test: participant.currentTest,
        },
        data: {
          answers: req.body,
        },
      });
    }
    res.status(200).json(req.body);
  }
}
