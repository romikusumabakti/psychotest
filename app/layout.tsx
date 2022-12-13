import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <title>Psikotes - Ultimate Consulting</title>
        <meta name="description" content="Psikotes berbasis komputer" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="flex flex-col h-screen bg-surface">{children}</body>
    </html>
  );
}
