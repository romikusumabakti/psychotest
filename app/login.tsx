"use client";

import Image from "next/image";
import { useState } from "react";
import TextField from "../components/text-field";

interface LoginData {
  psychotestToken: string;
  nik: string;
}

export default function Login({ onLoggedIn }: { onLoggedIn: Function }) {
  const [loginData, setLoginData] = useState<LoginData>({
    psychotestToken: "",
    nik: "",
  });

  return (
    <form
      className="flex flex-col w-full max-w-md gap-8 m-auto card"
      onSubmit={async (e) => {
        e.preventDefault();
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
      }}
    >
      <header className="flex flex-col items-center gap-4">
        <Image
          src="/unpad.svg"
          alt="Universitas Padjadjaran Logo"
          width={256}
          height={0}
        />
        <h2>Login sebagai peserta</h2>
      </header>
      <div className="flex flex-col gap-4">
        <TextField
          type="text"
          label="Token psikotes"
          value={loginData.psychotestToken}
          onChange={(e) =>
            setLoginData({ ...loginData, psychotestToken: e.target.value })
          }
          required
          autoFocus
        />
        <TextField
          type="text"
          label="NIK peserta"
          value={loginData.nik}
          onChange={(e) => setLoginData({ ...loginData, nik: e.target.value })}
          required
        />
      </div>
      <button className="self-end w-32 button">Login</button>
    </form>
  );
}
