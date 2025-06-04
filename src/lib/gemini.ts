import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerationConfig,
  Content,
} from "@google/generative-ai";

// Ensure your GEMINI_API_KEY is set in your environment variables
// const apiKey = process.env.GEMINI_API_KEY as string;
// if (!apiKey) {
//   throw new Error(
//     "GEMINI_API_KEY is not set in the environment variables. Please set it to your Google AI Studio API key."
//   );
// }

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model_name: string = "gemini-1.5-flash-latest", // Default to a common Gemini model
  temperature: number = 0.5, // Gemini might need a lower temp for structured output
  num_tries: number = 3,
  verbose: boolean = false
) {
  // Return type can be array or single object
  const gemini_model = genAI.getGenerativeModel({ model: model_name });

  const list_input: boolean = Array.isArray(user_prompt);
  const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format));
  const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format));

  let error_msg: string = "";
  let last_raw_response_text: string = ""; // To store the raw text for error reporting

  for (let i = 0; i < num_tries; i++) {
    // Construct the detailed prompt for Gemini
    let output_format_prompt: string = `\nYou are an AI assistant that MUST produce a response in the exact JSON format specified.
Do NOT use any markdown formatting (e.g., \`\`\`json ... \`\`\`) in your response.
Output *ONLY* the raw JSON text.
Do not include any explanatory text, conversation, or commentary before or after the JSON.
The JSON ${list_output ? "array of objects" : "object"} must conform to this structure: ${JSON.stringify(output_format)}.
Do not put quotation marks around keys or escape characters like \\ in the output fields unless they are part of a string value.`;

    if (list_output) {
      output_format_prompt += `\nIf an output field within the JSON expects a list of choices, choose the best element from the provided list for that field.`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden.
Any output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: "a place for education"}`;
    }

    if (list_input) {
      output_format_prompt += `\nGenerate an array of JSON objects, one JSON object for each distinct input element/query provided by the user.`;
    }

    // Combine all parts into a single prompt string for Gemini
    const full_prompt = `${system_prompt}\n${output_format_prompt}\n${error_msg}\n\nUser Input(s):\n${user_prompt.toString()}`;

    if (verbose) {
      console.log(`\nAttempt #${i + 1} of ${num_tries}`);
      console.log("Full prompt to Gemini:", full_prompt);
    }

    try {
      const generationConfig: GenerationConfig = {
        temperature: temperature,
        // topK: 1, // Consider for more deterministic output if needed
        // topP: 0.95,
        // maxOutputTokens: 2048, // Adjust if needed
      };

      // Crucial for Gemini to allow potentially "complex" instruction-following without overly aggressive filtering
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ];

      const contents: Content[] = [
        { role: "user", parts: [{ text: full_prompt }] },
      ];

      const result = await gemini_model.generateContent({
        contents,
        generationConfig,
        safetySettings,
      });

      const response = result.response;

      if (!response || typeof response.text !== "function") {
        const candidate = response?.candidates?.[0];
        if (candidate?.finishReason && candidate.finishReason !== "STOP") {
          throw new Error(
            `Gemini API call failed or was blocked. Finish Reason: ${candidate.finishReason}. Safety Ratings: ${JSON.stringify(candidate.safetyRatings)}`
          );
        }
        throw new Error(
          "Gemini API did not return a valid response or text content. Response might have been blocked or empty."
        );
      }

      let res_text: string = response.text() ?? "";
      last_raw_response_text = res_text; // Store for error reporting

      if (verbose) {
        console.log("\nGemini raw response text:", res_text);
      }

      // Clean the response: Remove markdown, "json" prefix, etc.
      res_text = res_text.trim();
      if (res_text.startsWith("```json")) {
        res_text = res_text.substring(7);
        if (res_text.endsWith("```")) {
          res_text = res_text.substring(0, res_text.length - 3);
        }
        res_text = res_text.trim();
      } else if (res_text.startsWith("```")) {
        // More generic markdown block
        res_text = res_text.substring(3);
        if (res_text.endsWith("```")) {
          res_text = res_text.substring(0, res_text.length - 3);
        }
        res_text = res_text.trim();
      }

      // Sometimes Gemini might still output "json" or other prefixes explicitly
      if (res_text.toLowerCase().startsWith("json")) {
        const potentialJson = res_text.substring(4).trim();
        // Check if what remains is likely JSON (starts with { or [)
        if (potentialJson.startsWith("{") || potentialJson.startsWith("[")) {
          res_text = potentialJson;
        }
      }

      // The original script's apostrophe handling - keep it as it might still be useful
      // However, good JSON should use double quotes for strings.
      // This line might corrupt valid JSON if single quotes are part of string values.
      // Consider if this is truly necessary or if the prompt should enforce double quotes more strictly.
      // For now, keeping it as per original logic:
      res_text = res_text.replace(/'/g, '"'); // This is aggressive, ensure it's what you want.
      // This one is safer:
      res_text = res_text.replace(/(\w)"(\w)/g, "$1'$2"); // Restore apostrophes within words

      if (verbose) {
        console.log("\nCleaned text for JSON parsing:", res_text);
      }

      let output = JSON.parse(res_text);

      // Adjusting output handling based on list_input
      if (list_input) {
        if (!Array.isArray(output)) {
          // If user_prompt was an array of 1 and model returned a single object, wrap it
          if (
            typeof output === "object" &&
            output !== null &&
            Array.isArray(user_prompt) &&
            user_prompt.length === 1
          ) {
            output = [output];
          } else {
            throw new Error(
              `Output format error: Expected an array of JSON objects because list_input was true, but received: ${typeof output}`
            );
          }
        }
      } else {
        // If list_input is false, we expect a single JSON object.
        // If Gemini returns an array with one object (common if prompt is very list-like), extract it.
        if (Array.isArray(output) && output.length === 1) {
          output = output[0];
        } else if (Array.isArray(output) && output.length > 1) {
          throw new Error(
            `Output format error: Expected a single JSON object because list_input was false, but received an array with ${output.length} elements.`
          );
        }
        // Now, wrap the single object (or the already processed object) in an array for consistent validation logic below.
        // The final return will unwrap it if list_input was false.
        output = [output];
      }

      // Validation loop (mostly unchanged from original)
      for (let index = 0; index < output.length; index++) {
        const current_output_item = output[index];
        if (
          typeof current_output_item !== "object" ||
          current_output_item === null
        ) {
          throw new Error(
            `Validation Error: Expected a JSON object at index ${index}, but got ${typeof current_output_item}`
          );
        }
        for (const key in output_format) {
          if (/<.*?>/.test(key)) {
            // Skip dynamic keys for this specific check
            continue;
          }
          if (!(key in current_output_item)) {
            throw new Error(
              `Validation Error: Key "${key}" is missing in the JSON output item: ${JSON.stringify(current_output_item)}`
            );
          }

          if (Array.isArray(output_format[key])) {
            // Field with predefined choices
            const choices = output_format[key] as string[];
            let let_current_value = current_output_item[key];

            if (Array.isArray(let_current_value)) {
              // If model returned an array for a single choice field
              if (let_current_value.length > 0) {
                current_output_item[key] = let_current_value[0]; // Take the first element
              } else {
                // Handle empty array case, perhaps by setting to default or erroring
                if (default_category)
                  current_output_item[key] = default_category;
                else
                  throw new Error(
                    `Validation Error: Field "${key}" is an empty array, expected one of ${choices.join(", ")}.`
                  );
              }
            }
            let_current_value = current_output_item[key]; // re-assign after potential array handling

            if (!choices.includes(let_current_value) && default_category) {
              current_output_item[key] = default_category;
            }
            // Optional: If strict choice adherence is needed and no default, throw error
            // else if (!choices.includes(current_output_item[key])) {
            //   throw new Error(`Validation Error: Value "${current_output_item[key]}" for key "${key}" is not in the allowed choices: ${choices.join(', ')}`);
            // }

            if (
              typeof current_output_item[key] === "string" &&
              current_output_item[key].includes(":")
            ) {
              // Example: "label: description" -> "label"
              current_output_item[key] = current_output_item[key]
                .split(":")[0]
                .trim();
            }
          }
        }

        if (output_value_only) {
          output[index] = Object.values(current_output_item);
          if (output[index].length === 1) {
            output[index] = output[index][0];
          }
        }
      }

      return list_input ? output : output[0]; // Return array or single object based on input type
    } catch (e: unknown) {
      let errorMessage = "An unknown error occurred during processing.";
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === "string") {
        errorMessage = e;
      }
      error_msg = `\n\nPREVIOUS ATTEMPT FAILED (Attempt ${i + 1}).
The AI produced the following raw text:
---
${last_raw_response_text}
---
Error message: ${errorMessage}.
Please carefully review your previous output and the error.
Strictly adhere to the JSON format and all instructions.`;

      console.error(
        `Attempt ${i + 1} failed: An exception occurred:`,
        errorMessage
      );
      if (verbose) {
        console.error("Exception Details:", e);
        console.error(
          "Raw response text from Gemini that caused error:",
          last_raw_response_text
        );
      }

      if (i === num_tries - 1) {
        // Last attempt failed
        console.error(
          "Maximum retries reached. Returning empty or placeholder based on input type."
        );
        // Depending on desired behavior, you might want to throw the last error
        // throw new Error(`Failed after ${num_tries} attempts. Last error: ${e.message}`);
        return list_input ? [] : {}; // Or (output_value_only ? (list_input ? [] : undefined) : (list_input ? [] : {}))
      }
    }
  }

  // Should be unreachable if num_tries > 0 because either success or last error is thrown/returned
  console.error(
    "Fell through retry loop without returning. This should not happen."
  );
  return list_input ? [] : {};
}

// Example Usage (Remember to set GEMINI_API_KEY in your .env or environment)
/*
async function test() {
  try {
    const result = await strict_output(
      "You are a helpful AI that extracts information into JSON.",
      "The user John Doe (email: john.doe@example.com, age: 30) wants to book a flight to Paris from New York.",
      {
        name: "string",
        email: "string",
        age: "number", // Gemini might output numbers as strings in JSON, parsing handles this
        details: {
          action: "string",
          from: "<city name>",
          to: "<city name>"
        },
        sentiment: ["positive", "neutral", "negative"]
      },
      "neutral", // default_category for sentiment
      false, // output_value_only
      "gemini-pro", // model_name
      0.3, // temperature
      3, // num_tries
      true // verbose
    );
    console.log("\nFinal Validated JSON Output:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n--- Test with list input ---");
    const resultsList = await strict_output(
      "Extract entities from the following sentences.",
      [
        "Apple Inc. is a tech company.",
        "Google LLC is known for its search engine."
      ],
      {
        company_name: "<name of the company>",
        type: ["tech", "finance", "other"]
      },
      "other",
      false,
      "gemini-pro",
      0.3,
      3,
      true
    );
    console.log("\nFinal Validated JSON List Output:");
    console.log(JSON.stringify(resultsList, null, 2));


  } catch (error) {
    console.error("\nError in test function:", error);
  }
}

// test(); // Uncomment to run the test
*/
