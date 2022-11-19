import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex items-center justify-between gap-4 px-4 py-2 text-sm bg-primary/10">
      <span className="flex items-center shrink-0">
        {/* Didukung oleh{" "} */}
        Supported by{" "}
        <Link className="flex items-center font-medium display" href="/">
          <Image
            src="/uc.svg"
            alt="Ultimate Consulting Logo"
            width={24}
            height={0}
          />{" "}
          Ultimate Consulting
        </Link>
      </span>
      <span className="text-xs">
        Kantor: Perum. Bukit Jagabaya Blok G5 No. 3, Kec. Cimaung, Kab. Bandung,
        Jawa Barat. Telepon: 0821-2605-7190. Email:
        ultimate.consulting.psi@gmail.com
      </span>
    </footer>
  );
}
