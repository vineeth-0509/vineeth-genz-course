import { Chapter, Course, Unit } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Separator } from "./ui/separator";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
  currentChapterId: string;
};

const CourseSideBar = async ({ course, currentChapterId }: Props) => {
  return (
    <div className="w-[400px] absolute top-1/2 -translate-y-1/2 rounded-r-3xl bg-secondary">
      <h1 className="text-4xl font-bold">{course.name}</h1>
      {course.units.map((unit, unitIndex) => {
        return (
          <div className="mt-4" key={unit.id}>
            <h2 className="text-sm uppercase text-secondary-foreground/60">
              Unit {unitIndex + 1}
            </h2>
            <h2 className="text-2xl font-bold">{unit.name}</h2>
            {unit.chapters.map((chapter, chapterIndex) => {
              return (
                <div key={chapter.id}>
                  <Link
                    href={`/course/${course.id}/${unitIndex}/${chapterIndex}`}
                    className={cn("text-secondary-foreground/60", {
                      'text-green-500 font-bold': chapter.id === currentChapterId
                    })}
                  >
                    {chapter.name}
                  </Link>
                  <Separator className="mt-2 text-gray-500 bg-gray-500" />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default CourseSideBar;
