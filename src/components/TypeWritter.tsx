"use client";

import Link from "next/link";

//import { TypewriterEffect } from "./typewriter-effect";
//import Typewriter from "typewriter-effect";
import { Button } from "./ui/button";
import { TypewriterEffect } from "./typewriter-effect";

export function TypewriterEffectDemo() {
  const words = [
    {
      text: "Create",
    },
    {
      text: "Learn",
    },
    {
      text: "Excel",
    },
    {
      text: "The Gen Z way",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <div className="flex h-[40rem] flex-col items-center justify-center">
      <img
        src="/new-learning.gif"
        alt="Gen Z Learning"
        className="h-50 border rounded-2xl hover:-translate-x-1.5 hover:-translate-y-1.5 animate-pulse"
      />
      <span className="text-xl font-bold text-amber-700">
        “Smart Learning for the Smartest Generation”
      </span>
      <TypewriterEffect words={words} />
      <div className="mt-10 flex flex-col space-x-0 space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <Button asChild>
          <Link href="/create"> Start Learning</Link>
        </Button>
      </div>
    </div>
  );
}
