// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../db";
import xlsx, { WorkSheet } from "node-xlsx";
import { tests } from "../../../test";
import dayjs from "dayjs";
import { gender as genders } from "../../../../../app/login";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const psychotest = await prisma.psychotest.findUnique({
      where: { id: parseInt(req.query.id as string) },
    });
    const participants = await prisma.participant.findMany({
      where: { psychotestId: psychotest?.id, NOT: { currentTest: 0 } },
    });
    const sheets: WorkSheet<unknown>[] = [];
    await Promise.all(
      participants.map(async (participant) => {
        const dateOfBirth = dayjs(participant.dateOfBirth);
        const today = dayjs();

        const years = today.diff(dateOfBirth, "year");
        const months = today.diff(dateOfBirth, "month") - years * 12;
        const days = today.diff(
          dateOfBirth.add(years, "year").add(months, "month"),
          "day"
        );

        const identity = [
          ["NIP:", participant.nip],
          ["Nama:", participant.name],
        ];
        const age = ["Usia:", `${years} tahun ${months} bulan ${days} hari`];
        const gender = [
          "Jenis kelamin:",
          participant.gender ? genders[participant.gender] : "-",
        ];
        const header = [
          [
            "IST",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "EPPS",
            "PAPI",
          ],
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
        ];
        const istHead = { s: { c: 0, r: 5 }, e: { c: 8, r: 5 } };
        const eppsHead = { s: { c: 9, r: 5 }, e: { c: 9, r: 6 } };
        const papiHead = { s: { c: 10, r: 5 }, e: { c: 10, r: 6 } };
        const startTimes = new Array();
        const endTimes = new Array();
        const correct = new Array();
        const rows = [...Array(90)].map((_) => Array());
        const epps = [...Array(17)].map((_) => Array());
        const testAnswers = await prisma.answer.findMany({
          where: { participantId: participant.id },
          orderBy: { id: "asc" },
        });
        await Promise.all(
          testAnswers.map((testAnswer) => {
            startTimes[testAnswer.test - 1] =
              testAnswer.start.toLocaleTimeString();
            endTimes[testAnswer.test - 1] =
              testAnswer.end?.toLocaleTimeString();
            testAnswer.answers.forEach((answer, i) => {
              if (testAnswer.test !== 10) {
                rows[i][testAnswer.test - 1] = answer.toLowerCase();
                if (tests[testAnswer.test - 1].answers) {
                  if (i === 0) {
                    correct[testAnswer.test - 1] = 0;
                  }
                  if (answer === tests[testAnswer.test - 1].answers![i]) {
                    correct[testAnswer.test - 1]++;
                  }
                }
              } else {
                const section = Math.floor(i / 75);
                const row = section * 6 + (i % 5);
                const column = Math.floor(i / 5) - section * 15;
                epps[row][column] = answer.toUpperCase();
              }
            });
          })
        );
        sheets.push({
          name: participant.number.toString(),
          data: [
            ...identity,
            age,
            gender,
            [],
            ...header,
            startTimes,
            endTimes,
            correct,
            ...rows,
            [],
            ...epps,
          ],
          options: {
            "!merges": [istHead, eppsHead, papiHead],
          },
        });
      })
    );
    sheets.sort((a, b) => parseInt(a.name) - parseInt(b.name));
    const buffer = xlsx.build(sheets);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${psychotest?.name}.xlsx`
    );
    res.send(buffer);
  }
}
