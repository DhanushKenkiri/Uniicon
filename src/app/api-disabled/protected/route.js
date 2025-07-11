import animate from "../../../utils/animate.js";
import generate from "../../../utils/generate.js";
import clean from "../../../utils/cleaner.js";
import extract from "../../../utils/extract.js";
import interpret from "../../../utils/interpret.js";
import planner from "../../../utils/planner.js";
import distributeUSDC from "@/utils/revenue-splitter-fallback.js";

export async function POST(request) {
  try {
    // Check if required environment variables are available
    if (!process.env.OPENAI_API_KEY && !process.env.OPEN_AI) {
      return new Response(JSON.stringify({ 
        error: "OpenAI API key not configured. Please set OPENAI_API_KEY or OPEN_AI environment variable." 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { input } = await request.json();

    console.log("Extracting client's required icon...");
    const extractedData = await extract(input);

    console.log("Generating icon illustration...");
    const base64Image = await generate(extractedData);
    const imageBuffer = Buffer.from(base64Image, "base64");

    console.log("Cleaning up icon background...");
    const cleanImageBuffer = await clean(imageBuffer);

    console.log("Intepreting icon design...");
    const interpretedText = await interpret(imageBuffer);

    console.log("Planning icon animation...");
    const planText = await planner(interpretedText);    console.log("Start animating icon...");
    const animationResult = await animate(cleanImageBuffer, planText);

    console.log("Distributing revenue...");
    try {
      await distributeUSDC();
    } catch (error) {
      console.warn("Revenue distribution failed (non-critical):", error.message);
      // Continue with the process even if revenue distribution fails
    }

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // const animationResult = "https://sfdylvwdndtsj1a0.public.blob.vercel-storage.com/animated-icon/4bad5604-741d-43ac-920c-9995bc21a340-N5HNkdCI2MNjaatwKBNgKcGrKSXTuJ.mp4";

    return Response.json({ result: animationResult });
  } catch (error) {
    console.error("Error in protected workflow:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}