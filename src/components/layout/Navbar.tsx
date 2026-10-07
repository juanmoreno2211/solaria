"use client";

import { useEffect, useState } from "react";
import { Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

const LINKS = [
  { href: "#mision", label: "Nuestra misión" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#alternativas", label: "Alternativas" },
  { href: "#calculadora", label: "Calculadora" },
  { href: "#preguntas", label: "Preguntas frecuentes" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cream-50/90 backdrop-blur-md border-b border-ink-950/8"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between sm:h-[4.5rem]">
        <a href="#top" className="flex items-center gap-2.5 text-ink-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sun-500 text-white">
            <Sun className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Solar<span className="text-sun-600">IA</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-[0.9rem] text-ink-950/70 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative py-1 transition-colors hover:text-ink-950 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-sun-500 after:transition-all after:duration-200 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#calculadora">
          <Button size="md">Calcula tu ahorro</Button>
        </a>
      </Container>
    </header>
  );
}
