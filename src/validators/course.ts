import { z } from "zod";
export const createChapterSchema = z.object({
  title: z
    .string()
    .min(3, { message: "tilte should be minimum of 3 characters long!" })
    .max(100, {
      message: "title should be more than the 100 characters long!",
    }),
    units: z.array(z.string())
});


