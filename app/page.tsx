"use client";

import { Participant } from "@prisma/client";
import { compiler } from "markdown-to-jsx";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MdChecklist,
  MdInfo,
  MdNavigateNext,
  MdPlayArrow,
  MdTimer,
} from "react-icons/md";
import Button from "../components/button";
import CircularProgressIndicator from "../components/circular-progress-indicator";
import QuestionCard from "../components/question-card";
import Footer from "./footer";
import Login, { gender } from "./login";

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

// const civilServantRanks = {
//   "1a": "Juru Muda",
//   "1b": "Juru Muda Tingkat I",
//   "1c": "Juru",
//   "1d": "Juru Tingkat I",
//   "2a": "Pengatur Muda",
//   "2b": "Pengatur Muda Tingkat I",
//   "2c": "Pengatur",
//   "2d": "Pengatur Tingkat I",
//   "3a": "Penata Muda",
//   "3b": "Penata Muda Tingkat 1",
//   "3c": "Penata",
//   "3d": "Penata Tingkat I",
//   "4a": "Pembina",
//   "4b": "Pembina Tingkat I ",
//   "4c": "Pembina Muda",
//   "4d": "Pembina Madya",
//   "4e": "Pembina Utama",
// };

function Test({ onFinished }: { onFinished: Function }) {
  const [test, setTest] = useState<Test>();
  const [time, setTime] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    if ((!test || test?.end) && time === 0) {
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
            onFinished();
          }
        })
        .then((t: Test) => {
          setTest(t.instruction ? t : { ...test, ...t });
          if (t.answers) {
            setAnswers(t.answers);
          }
          if (t.end) {
            setTime(new Date(t.end).getTime() - Date.now());
          }
        });
    }
  }, [time, test, onFinished]);

  useEffect(() => {
    const interval = setInterval(
      () => setTime((time) => time - (time % 1000 || 1000)),
      time % 1000 || 1000
    );
    return () => clearInterval(interval);
  }, [time]);

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
            {!test.questions
              ? time < Infinity &&
                (minutes > 0 || seconds > 0) && (
                  <span className="flex items-center gap-2">
                    {pre
                      ? "Waktu menghafal akan habis"
                      : "Tes akan dimulai otomatis"}{" "}
                    dalam {minutes > 0 && `${minutes} menit`}
                    {minutes > 0 && seconds > 0 && ", "}
                    {seconds > 0 && `${seconds} detik`}
                    <MdTimer size={24} />
                  </span>
                )
              : seconds % 2 === 0 && (
                  <span className="flex items-center gap-2 text-error">
                    Batas waktu dirahasiakan
                    <MdTimer size={24} />
                  </span>
                )}
          </header>
          <div className="flex flex-col gap-4 pr-2 overflow-y-auto grow">
            {pre ? (
              <div className="flex flex-col gap-2">
                <h2>Hafalan</h2>
                {test.pre!.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            ) : test.instruction && !test.questions && test.examples ? (
              <>
                <div className="flex flex-col gap-2">
                  <h2>Instruksi</h2>
                  {compiler(test.instruction, { wrapper: null })}
                </div>
                <div className="flex flex-col gap-2">
                  <h2>Contoh</h2>
                  {test.examples.map((question, i) => (
                    <QuestionCard
                      key={i}
                      number={i + 1}
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
                    number={i + 1}
                    question={{ ...question, type: test.type }}
                    answer={answers[i]}
                    onValueChange={(value) => {
                      const newAnswers = answers.map((answer, j) =>
                        j === i ? value : answer
                      );
                      setAnswers(newAnswers);
                      fetch("/api/test", {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(newAnswers),
                      }).catch(() => {
                        alert("Tidak ada jaringan.");
                        setAnswers(answers);
                      });
                    }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {!test.questions ? (
              <span className="flex gap-2">
                <MdInfo size={24} />
                {pre
                  ? "Instruksi akan segera diberitahukan"
                  : "Jika sudah mengerti silakan langsung klik Mulai"}
              </span>
            ) : (
              <span className="flex gap-2">
                <MdChecklist size={24} />
                {answered}/{test.questions.length} terjawab
              </span>
            )}
            {!pre && answered === answers.length && (
              <Button
                variant={
                  (answers && answered < answers.length) ||
                  (minutes >= 9 && time < Infinity)
                    ? "tonal"
                    : "filled"
                }
                className="ml-auto"
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
                        Authorization: `Bearer ${localStorage.getItem(
                          "token"
                        )}`,
                      },
                    });
                    if (response.ok) {
                      const t: Test = await response.json();
                      setTest(t.instruction ? t : { ...test, ...t });
                      if (t.answers) {
                        setAnswers(t.answers);
                      }
                      if (t.end) {
                        setTime(new Date(t.end).getTime() - Date.now());
                      }
                    } else if (response.status === 401) {
                      onFinished();
                    }
                  }
                }}
              >
                {!test.questions ? (
                  <>
                    <MdPlayArrow className="-ml-2 text-lg" />
                    Mulai
                  </>
                ) : (
                  <>
                    <MdNavigateNext className="-ml-2 text-lg" />
                    Tes berikutnya
                  </>
                )}
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [participant, setParticipant] = useState<Participant>();

  const [prolog, setProlog] = useState<boolean>(false);

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
                <Button onClick={logout}>Logout</Button>
              </div>
            </header>
            <main className="container flex flex-col max-w-4xl gap-2 px-4 py-2 mx-auto overflow-y-auto grow">
              {participant.currentTest === 0 ? (
                !prolog ? (
                  <>
                    <h1>Identitas peserta</h1>
                    <table>
                      <tbody>
                        <tr>
                          <td>Nomor tes</td>
                          <td>: {participant.number}</td>
                        </tr>
                        <tr>
                          <td>Nama</td>
                          <td>: {participant.name}</td>
                        </tr>
                        <tr>
                          <td>NIP</td>
                          <td>: {participant.nip}</td>
                        </tr>
                        <tr>
                          <td>Tanggal lahir</td>
                          <td>
                            :{" "}
                            {participant.dateOfBirth
                              ? new Date(
                                  participant.dateOfBirth
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td>Jenis kelamin</td>
                          <td>
                            :{" "}
                            {participant.gender
                              ? gender[participant.gender]
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td>Jabatan</td>
                          <td>: {participant.position || "-"}</td>
                        </tr>
                        <tr>
                          <td>Perangkat daerah</td>
                          <td>: {participant.workUnit || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                    <Button
                      className="self-end mt-auto"
                      onClick={() => setProlog(true)}
                    >
                      <MdNavigateNext className="-ml-2 text-lg" />
                      Berikutnya
                    </Button>
                  </>
                ) : (
                  <>
                    {/* prettier-ignore */}
                    <>
                    {compiler(
`# Petunjuk pengisian IST

Pada tes ini, saudara akan dihadapkan 9 subtes atau kelompok soal, masing-masing subtes berdiri sendiri, artinya saudara akan mengerjakan kelompok demi kelompok. Apabila saudara telah selesai mengerjakan kelompok soal yang pertama, saudara boleh lanjut mengerjakan kelompok soal berikutnya tanpa menunggu aba-aba, begitu pula untuk kelompok-kelompok soal selanjutnya.

Sebelum memulai mengerjakan persoalan, saudara akan dihadapkan pada petunjuk pengerjaan, **harap dibaca dengan teliti dan pahami dengan baik perintah dari setiap kelompok soal agar saudara dapat mengerjakannya dengan baik dan benar**. Saudara memiliki waktu 10 menit untuk membaca petunjuk soal, namun apabila saudara sudah mengerti petunjuk soal sebelum waktunya habis, silakan saudara melanjutkan mengisi persoalan dengan menekan tombol **“Mulai”**.

**Setiap kelompok soal memiliki batas waktu tertentu, namun batas waktu tersebut tidak akan diberitahukan, oleh sebab itu saudara dimohon untuk mengerjakan setiap kelompok soal dengan seefisien mungkin.** Apabila saudara telah menyelesaikan suatu kelompok persoalan, dan memiliki sisa waktu, saudara juga dapat lanjut kepada kelompok soal berikutnya. **Namun jika waktu telah habis dan saudara belum selesai mengerjakan suatu kelompok soal, maka saudara akan dialihkan kepada kelompok soal berikutnya secara otomatis, maka dari itu kerjakan seefisien mungkin.**`,
                      { wrapper: null }
                    )}
                    </>
                    <Button
                      className="self-end mt-auto"
                      onClick={() =>
                        setParticipant({ ...participant, currentTest: 1 })
                      }
                    >
                      <MdPlayArrow className="-ml-2 text-lg" />
                      Mulai
                    </Button>
                  </>
                )
              ) : participant.currentTest <= 11 ? (
                <Test
                  onFinished={() =>
                    setParticipant({ ...participant, currentTest: 12 })
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
                  <h1>Psikotes Anda telah selesai. Terima kasih. ❤️</h1>
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
