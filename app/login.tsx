"use client";

import { Gender } from "@prisma/client";
import * as RadioGroup from "@radix-ui/react-radio-group";
import Image from "next/image";
import { useState } from "react";
import Button from "../components/button";
import CircularProgressIndicator from "../components/circular-progress-indicator";
import TextField from "../components/text-field";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import id from "date-fns/locale/id";

registerLocale("id", id);
setDefaultLocale("id");

interface LoginData {
  psychotestToken: string;
  nip: string;
  dateOfBirth: Date;
  gender: string;
}

export const gender: Record<Gender, string> = {
  MALE: "Laki-laki",
  FEMALE: "Perempuan",
};

export default function Login({ onLoggedIn }: { onLoggedIn: Function }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginData, setLoginData] = useState<LoginData>({
    psychotestToken: "",
    nip: "",
    dateOfBirth: new Date(2000, 0, 1),
    gender: "",
  });

  return (
    <form
      className="flex flex-col justify-between w-full h-full max-w-md gap-6 max-h-[480px] m-auto card"
      onSubmit={async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        });
        if (response.ok) {
          const token = await response.text();
          localStorage.setItem("token", token);
          onLoggedIn();
        } else {
          alert(await response.text());
        }
        setIsLoading(false);
      }}
    >
      <header className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <Image
            src="/unpad.svg"
            alt="Universitas Padjadjaran Logo"
            // width={256}
            width={192}
            height={0}
          />
          <h3 className="text-on-surface-variant">
            Psychological Assessment Center
          </h3>
        </div>
        {/* <h2>Login Peserta Psikotes</h2> */}
      </header>
      {isLoading ? (
        <CircularProgressIndicator className="m-auto" />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <TextField
              type="text"
              label="Token psikotes"
              value={loginData.psychotestToken}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  psychotestToken: e.target.value,
                })
              }
              required
              autoFocus
            />
            <TextField
              type="text"
              label="NIP"
              value={loginData.nip}
              onChange={(e) =>
                setLoginData({ ...loginData, nip: e.target.value })
              }
              required
            />
            <div className="relative flex flex-col gap-1">
              <DatePicker
                className="w-full peer"
                selected={loginData.dateOfBirth}
                onChange={(date: Date) =>
                  setLoginData({ ...loginData, dateOfBirth: date })
                }
                dateFormat="dd/MM/yyyy"
                required
              />
              <label className="absolute pointer-events-none duration-300 transform -translate-y-7 scale-75 top-4 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7 bg-surface bg-gradient-to-r from-primary/5 to-primary/5 px-1 text-on-surface-variant peer-focus:text-primary">
                Tanggal lahir
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm">Jenis kelamin</span>
              <RadioGroup.Root
                className="flex justify-between gap-4 grow"
                value={loginData.gender}
                onValueChange={(value) =>
                  setLoginData({ ...loginData, gender: value })
                }
                required
              >
                {Object.keys(Gender).map((key) => (
                  <label key={key} className="flex flex-1 gap-4">
                    <RadioGroup.Item
                      value={key}
                      className="flex items-center justify-center shrink-0 text-sm w-6 h-6 rounded-full bg-secondary-container from-on-secondary-container/[.08] to-on-secondary-container/[.08] radix-state-checked:bg-primary radix-state-checked:from-on-primary/[.08] radix-state-checked:to-on-primary/[.08] hover:bg-gradient-to-r"
                    >
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    {gender[key as Gender]}
                  </label>
                ))}
              </RadioGroup.Root>
            </div>
          </div>
          <Button className="self-end w-32">Login</Button>
        </>
      )}
    </form>
  );
}
