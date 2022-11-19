"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import CircularProgressIndicator from "../components/circular-progress-indicator";
import TextField from "../components/text-field";
import Footer from "./footer";

interface LoginData {
  psychotestToken: string;
  nip: string;
}

export default function Login({ onLoggedIn }: { onLoggedIn: Function }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginData, setLoginData] = useState<LoginData>({
    psychotestToken: "",
    nip: "",
  });

  return (
    <form
      className="flex flex-col gap-8 justify-between w-full h-full max-w-md m-auto max-h-[448px] card"
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
            width={256}
            height={0}
          />
          <h3 className="text-on-surface-variant">
            Psychological Assessment Center
          </h3>
        </div>
        <h2>Login Peserta Psikotes</h2>
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
              label="NIP peserta"
              value={loginData.nip}
              onChange={(e) =>
                setLoginData({ ...loginData, nip: e.target.value })
              }
              required
            />
          </div>
          <button className="self-end w-32 button button-filled">Login</button>
        </>
      )}
    </form>
  );
}
