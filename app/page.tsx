"use client";

import { Participant } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdNavigateNext, MdPlayArrow } from "react-icons/md";
import CircularProgressIndicator from "../components/circular-progress-indicator";
import QuestionCard from "../components/question";
import Login from "./login";

export interface Question {
  question?: string;
  answers?: Record<string, string>;
  correctAnswer?: string;
  explanation?: string;
}

export interface Test {
  title?: string;
  instruction?: string;
  duration?: number;
  examples?: Question[];
  questions?: Question[];
  end?: string;
  answers?: string[];
}

// function shuffle(array: any[]) {
//   return array.sort(() => Math.random() - 0.5);
// }

function Test() {
  const [test, setTest] = useState<Test>();
  const [time, setTime] = useState<number>(Infinity);

  useEffect(() => {
    const interval = setInterval(() => {
      if (test && test.end && time > 0) {
        setTime(new Date(test.end).getTime() - Date.now());
      } else {
        fetch("/api/test", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
          .then((response) => response.json())
          .then((t: Test) => setTest(t.instruction ? t : { ...test, ...t }));
      }
    }, time % 1000 || 1000);
    return () => clearInterval(interval);
  }, [test, time]);

  const answered = test?.answers?.filter((answer) => answer).length || 0;
  const minutes = Math.floor(time / 1000 / 60);
  const seconds = Math.floor((time / 1000) % 60);

  return (
    <>
      {!(test && time > 0) ? (
        <CircularProgressIndicator className="m-auto" />
      ) : (
        <>
          <header className="flex justify-between py-1">
            <h1>{test.title}</h1>
            {test.answers && (
              <span>
                {answered}/{test.answers.length} terjawab
              </span>
            )}
          </header>
          <div className="flex flex-col gap-4 pr-2 overflow-y-auto">
            {!test.questions && test.examples ? (
              <>
                <div className="flex flex-col gap-2">
                  <h2>Instruksi</h2>
                  <p>{test.instruction}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <h2>Contoh</h2>
                  {test.examples.map((question, i) => (
                    <QuestionCard
                      key={i}
                      question={question}
                      answer={question.correctAnswer}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {test.questions!.map((question, i) => (
                  <QuestionCard
                    key={i}
                    question={question}
                    answer={test.answers![i]}
                    onChange={(value: string) => {
                      const answers = test.answers!.map((answer, j) =>
                        j === i ? value : answer
                      );
                      fetch("/api/test", {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(answers),
                      });
                      setTest({
                        ...test,
                        answers,
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {!test.questions
              ? time < Infinity &&
                (minutes > 0 || seconds > 0) && (
                  <span>
                    Tes akan dimulai dalam {minutes > 0 && `${minutes} menit`}
                    {minutes > 0 && seconds > 0 && ", "}
                    {seconds > 0 && `${seconds} detik`}
                  </span>
                )
              : seconds % 2 === 0 && (
                  <span className="text-error">Batas waktu dirahasiakan</span>
                )}
            <button
              className={`ml-auto button ${
                test.answers &&
                answered < test.answers!.length &&
                "!bg-secondary-container !text-on-secondary-container"
              }`}
              onClick={async () => {
                if (
                  !test.answers ||
                  answered === test.answers.length ||
                  confirm(
                    `${
                      test.answers.length - answered
                    } soal di tes ini belum terjawab. Setelah membuka tes berikutnya Anda tidak dapat kembali ke tes sebelumnya. Apakah Anda yakin?`
                  )
                ) {
                  const response = await fetch("/api/test", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  });
                  const t: Test = await response.json();
                  setTest(t.instruction ? t : { ...test, ...t });
                }
              }}
            >
              {!test.questions ? (
                <>
                  <MdPlayArrow className="-ml-2 text-lg" />
                  Mulai sekarang
                </>
              ) : (
                <>
                  <MdNavigateNext className="-ml-2 text-lg" />
                  Tes berikutnya
                </>
              )}
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [participant, setParticipant] = useState<Participant>();

  useEffect(() => {
    getParticipant();
  }, []);

  async function getParticipant() {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
      const response = await fetch("/api/auth", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const participant = await response.json();
      setParticipant(participant);
    }
    setIsLoading(false);
  }

  return (
    <>
      <main className="flex flex-col overflow-y-auto grow">
        {isLoading ? (
          <CircularProgressIndicator className="m-auto" />
        ) : participant ? (
          <>
            <header className="flex items-center justify-between h-16 px-4 shrink-0 bg-primary/10">
              <Link href="/">
                <Image
                  src="/unpad.svg"
                  alt="Universitas Padjadjaran Logo"
                  width={128}
                  height={0}
                />
              </Link>
              <div className="flex items-center gap-3">
                <span className="flex flex-col items-end">
                  <div>{participant.name}</div>
                  <div className="text-xs text-on-surface-variant">
                    {participant.nik}
                  </div>
                </span>
                <button
                  className="button"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setParticipant(undefined);
                  }}
                >
                  Logout
                </button>
              </div>
            </header>
            <main className="container flex flex-col max-w-4xl gap-2 px-4 py-2 mx-auto overflow-y-auto grow">
              <Test />
            </main>
          </>
        ) : (
          <Login onLoggedIn={getParticipant} />
        )}
      </main>
      <footer className="flex justify-center p-1 text-sm bg-primary/10">
        <span>
          Didukung oleh{" "}
          <Link className="font-medium display" href="/">
            Ultimate Consulting
          </Link>
        </span>
      </footer>
    </>
  );
}
