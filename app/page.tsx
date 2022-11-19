"use client";

import { Participant } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MdNavigateNext,
  MdPlayArrow,
  MdTimer,
  MdTimerOff,
} from "react-icons/md";
import CircularProgressIndicator from "../components/circular-progress-indicator";
import QuestionCard from "../components/question-card";
import Footer from "./footer";
import Login from "./login";

export interface Question {
  question?: string;
  type?: string;
  answers?: Record<string, string>;
  correctAnswer?: string;
  explanation?: string;
}

export interface Test {
  title?: string;
  subtitle?: string;
  type?: string;
  pre?: string;
  instruction?: string;
  instructionDuration?: number;
  duration?: number;
  examples?: Question[];
  questions?: Question[];
  end?: string;
  answers?: string[];
}

// function shuffle(array: any[]) {
//   return array.sort(() => Math.random() - 0.5);
// }

function Test({ onFinished }: { onFinished: Function }) {
  const [test, setTest] = useState<Test>();
  const [time, setTime] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (time <= 0) {
      setTest(undefined);
      fetch("/api/test", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then(async (response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status === 401) {
            onFinished(await response.text());
          }
        })
        .then((t: Test) => {
          if (t) {
            setTest(t.instruction ? t : { ...test, ...t });
            if (t.answers) {
              setAnswers(t.answers);
            }
            if (t.end) {
              setTime(new Date(t.end).getTime() - Date.now());
            } else {
              setTime(Infinity);
            }
          }
        });
    }
    if (time > 0) {
      const interval = setInterval(() => {
        if (test && test.end) {
          setTime(new Date(test.end).getTime() - Date.now());
        }
      }, time % 1000 || 1000);
      return () => clearInterval(interval);
    }
  }, [test, time, onFinished]);

  const answered = answers.filter((answer) => answer).length || 0;
  let minutes = Math.floor(time / 1000 / 60);
  const seconds = Math.floor((time / 1000) % 60);

  const pre = test?.pre && minutes >= 10;
  pre && (minutes -= 10);

  return (
    <>
      {!test ? (
        <CircularProgressIndicator className="m-auto" />
      ) : (
        <>
          <header className="flex justify-between py-1">
            <h1>{test.title}</h1>
            {test.questions && (
              <span>
                {answered}/{test.questions.length} terjawab
              </span>
            )}
          </header>
          <div className="flex flex-col gap-4 pr-2 overflow-y-auto">
            {test.pre && minutes >= 10 ? (
              <div className="flex flex-col gap-2">
                <h2>Instruksi</h2>
                {test.pre.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            ) : test.instruction && !test.questions && test.examples ? (
              <>
                <div className="flex flex-col gap-2">
                  <h2>Instruksi</h2>
                  {test.instruction.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <h2>Contoh</h2>
                  {test.examples.map((question, i) => (
                    <QuestionCard
                      key={i}
                      question={{ ...question, type: test.type }}
                      answer={question.correctAnswer || ""}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {test.questions?.map((question, i) => (
                  <QuestionCard
                    key={i}
                    question={{ ...question, type: test.type }}
                    answer={answers[i]}
                    onValueChange={(value) => {
                      const newAnswers = answers.map((answer, j) =>
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
                        body: JSON.stringify(newAnswers),
                      });
                      setAnswers(newAnswers);
                    }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {!test.questions ? (
              time < Infinity &&
              (minutes > 0 || seconds > 0) && (
                <span className="flex items-center gap-2">
                  <MdTimer size={24} />
                  Tes akan dimulai dalam {minutes > 0 && `${minutes} menit`}
                  {minutes > 0 && seconds > 0 && ", "}
                  {seconds > 0 && `${seconds} detik`}
                </span>
              )
            ) : test.end ? (
              seconds % 2 === 0 && (
                <span className="flex items-center gap-2 text-error">
                  <MdTimer size={24} />
                  Batas waktu dirahasiakan
                </span>
              )
            ) : (
              <span className="flex items-center gap-2">
                <MdTimerOff size={24} />
                Tidak ada batas waktu
              </span>
            )}
            <button
              className={`ml-auto button ${
                (answers && answered < answers.length) || minutes >= 9
                  ? "button-tonal"
                  : "button-filled"
              }`}
              onClick={async () => {
                if (
                  !test.questions ||
                  answered === answers.length ||
                  confirm(
                    `${
                      answers.length - answered
                    } soal di tes ini belum terjawab. Setelah membuka tes berikutnya Anda tidak dapat kembali ke tes sebelumnya. Apakah Anda yakin?`
                  )
                ) {
                  setTest(undefined);
                  const response = await fetch("/api/test", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  });
                  if (response.ok) {
                    const t: Test = await response.json();
                    setTest(t.instruction ? t : { ...test, ...t });
                    if (t.answers) {
                      setAnswers(t.answers);
                    }
                  } else if (response.status === 401) {
                    onFinished(await response.text());
                  }
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

  function logout() {
    localStorage.removeItem("token");
    setParticipant(undefined);
  }

  return (
    <>
      <main className="flex flex-col overflow-y-auto grow">
        {isLoading ? (
          <CircularProgressIndicator className="m-auto" />
        ) : participant ? (
          <>
            <header className="flex items-center justify-between h-16 px-4 shrink-0 bg-primary/10">
              <Link href="/" className="flex items-center gap-4">
                <Image
                  src="/unpad.svg"
                  alt="Universitas Padjadjaran Logo"
                  width={128}
                  height={0}
                />
                <h3 className="text-on-surface-variant">
                  Psychological Assessment Center
                </h3>
              </Link>
              <div className="flex items-center gap-3">
                <span className="flex flex-col items-end">
                  <div>{participant.name}</div>
                  <div className="text-xs text-on-surface-variant">
                    {participant.nip}
                  </div>
                </span>
                <button className="button button-filled" onClick={logout}>
                  Logout
                </button>
              </div>
            </header>
            <main className="container flex flex-col max-w-4xl gap-2 px-4 py-2 mx-auto overflow-y-auto grow">
              {participant.currentTest === 0 ? (
                <>
                  <h1>Selamat datang, {participant.name}!</h1>
                  <table>
                    <tbody>
                      <tr>
                        <td>Nama</td>
                        <td>: {participant.name}</td>
                      </tr>
                      <tr>
                        <td>NIP</td>
                        <td>: {participant.nip}</td>
                      </tr>
                      <tr>
                        <td>Nomor tes</td>
                        <td>: {participant.number}</td>
                      </tr>
                    </tbody>
                  </table>
                  <button
                    className="self-end button button-filled"
                    onClick={() =>
                      setParticipant({ ...participant, currentTest: 1 })
                    }
                  >
                    Mulai Psikotes
                  </button>
                </>
              ) : participant.currentTest < 11 ? (
                <Test
                  onFinished={() =>
                    setParticipant({ ...participant, currentTest: 11 })
                  }
                />
              ) : (
                <div className="flex flex-col items-center gap-8 m-auto">
                  <Image
                    src="/uc.svg"
                    alt="Ultimate Consulting Logo"
                    width={128}
                    height={0}
                  />
                  <h1>Psikotes Anda telah selesai. Terima kasih.</h1>
                </div>
              )}
            </main>
          </>
        ) : (
          <Login onLoggedIn={getParticipant} />
        )}
      </main>
      <Footer />
    </>
  );
}
