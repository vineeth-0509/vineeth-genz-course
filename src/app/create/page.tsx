import CreateCourseForm from "@/components/CreateCourseForm";
import { getAuthSession } from "@/lib/auth";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

const createPage = async () => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/gallery");
  }
  return (
    <div className="flex flex-col items-start max-w-xl px-8 mx-auto my-16sm:px-8">
      <h1 className="self-center text-3xl font-bold text-center sm:text-6xl">
        Genz Course
      </h1>
      <div className="flex p-4 mt-5 border-none bg-secondary">
        <InfoIcon className="w-12 h-12 mr-3 text-blue-400" />
        <div>
          Enter in a course title, or what you want to learn about. Then enter a
          list of units, which are the specifics you want to learn. And our AI
          will generate a course for you!
        </div>
      </div>

      <CreateCourseForm />
    </div>
  );
};

export default createPage;
