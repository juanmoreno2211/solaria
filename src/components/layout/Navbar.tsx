"use client";

import { useEffect, useState } from "react";
import { Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

const LINKS = [
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
          ? "bg-cream-50/85 backdrop-blur-md border-b border-black/5"
          : "bg-transparent"
      )}
    >
      <Container className="flex h-20 items-center justify-between sm:h-24">
        <a href="#top" className="flex items-center gap-3 font-bold text-ink-950">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sun-gradient text-white sm:h-14 sm:w-14">
            <Sun className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.5} />
          </span>
          <span className="text-2xl tracking-tight sm:text-3xl">
            Solar<span className="text-sun-600">IA</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-base font-medium text-ink-800/80 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink-950"
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
