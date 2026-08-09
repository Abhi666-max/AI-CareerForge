import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Node.js polyfills required by pdf-parse / pdf.js canvas layer ─────────────
// These DOM APIs don't exist in the Node.js runtime; pdf-parse tries to use
// them when rendering font glyphs. Stubbing them prevents the crash.
if (typeof (globalThis as any).DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a=1;b=0;c=0;d=1;e=0;f=0;
    m11=1;m12=0;m13=0;m14=0;m21=0;m22=1;m23=0;m24=0;
    m31=0;m32=0;m33=1;m34=0;m41=0;m42=0;m43=0;m44=1;
    is2D=true;isIdentity=true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_init?: any) {}
    multiply(_o: any) { return this; }
    translate(_x: number, _y: number) { return this; }
    scale(_s: number) { return this; }
    rotate(_a: number) { return this; }
    inverse() { return this; }
    transformPoint(p: any) { return p ?? { x: 0, y: 0 }; }
  };
}
if (typeof (globalThis as any).Path2D === "undefined") {
  (globalThis as any).Path2D = class Path2D {
    moveTo() {} lineTo() {} closePath() {} arc() {} rect() {}
  };
}
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    width: number; height: number; data: Uint8ClampedArray;
    constructor(w: number, h: number) {
      this.width = w; this.height = h;
      this.data = new Uint8ClampedArray(w * h * 4);
    }
  };
}

export const dynamic = "force-dynamic";

const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/** Strip markdown code fences and return raw JSON string */
function extractJson(raw: string): string {
  return raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const formData       = await req.formData();
    const resumeFile     = formData.get("resume") as File | null;
    const transcribedText = (formData.get("transcription") as string) || "";

    // ── 1. Parse PDF ────────────────────────────────────────────────────────
    let resumeText = "";
    if (resumeFile) {
      const arrayBuffer = await resumeFile.arrayBuffer();
      const buffer      = Buffer.from(arrayBuffer);
      // Dynamic import properly handles ESM/CJS interop and ensures polyfills
      // are applied before the module is evaluated.
      // We import the inner library directly to bypass index.js.
      // index.js has a bug where !module.parent evaluates to true in Turbopack,
      // causing it to try and read './test/data/05-versions-space.pdf' which fails.
      // @ts-ignore: Bypassing type checking for inner library import
      const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
      
      const pdfParse: (buf: Buffer) => Promise<{ text: string }> =
        typeof pdfParseModule === "function"
          ? (pdfParseModule as any)
          : typeof pdfParseModule.default === "function"
          ? pdfParseModule.default
          : (pdfParseModule as any);

      const pdfData = await pdfParse(buffer);
      resumeText    = pdfData.text || "";
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { success: false, error: "Could not extract text from the PDF. Please try a different file." },
        { status: 422 }
      );
    }

    // ── 2. Gemini – resume analysis ─────────────────────────────────────────
    const geminiModel  = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const geminiPrompt = `
You are a senior tech recruiter and career coach. Analyse this resume and return ONLY a valid JSON object — no markdown, no explanations.

JSON schema (all scores 0–100):
{
  "technicalScore": <number>,
  "technicalInsight": "<1 sentence about technical skills>",
  "portfolioScore": <number>,
  "portfolioInsight": "<1 sentence about portfolio/projects>",
  "resumeStrengthScore": <number>,
  "resumeInsight": "<1 sentence about resume quality>",
  "feedback": [
    {
      "id": "<unique string>",
      "priority": "high" | "medium" | "low",
      "category": "Resume" | "Portfolio" | "Technical" | "Communication",
      "title": "<short actionable title>",
      "description": "<2-3 sentence personalised explanation referencing the actual resume>",
      "action": "<specific next step>"
    }
  ]
}

Rules:
- Return 4–6 feedback items based ONLY on what you actually read in the resume.
- Scores must reflect real quality — do not always give high scores.
- Personalise every description using actual content from the resume (names, projects, technologies).

Resume text (first 4000 chars):
${resumeText.substring(0, 4000)}
    `;

    const geminiResult      = await geminiModel.generateContent(geminiPrompt);
    const geminiRaw         = geminiResult.response.text();
    const geminiJsonStr     = extractJson(geminiRaw);

    let geminiData: any;
    try {
      geminiData = JSON.parse(geminiJsonStr);
    } catch {
      console.error("Gemini JSON parse failed:", geminiJsonStr.slice(0, 300));
      return NextResponse.json(
        { success: false, error: "AI returned malformed data. Please try again." },
        { status: 502 }
      );
    }

    // ── 3. Groq – communication analysis (optional) ─────────────────────────
    let communicationScore     = 70;
    let communicationInsight   = "No audio response provided. Score is estimated.";
    const commsFeedback: any[] = [];

    if (transcribedText.trim().length > 20) {
      try {
        const groqCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are an expert interview coach. Analyse the candidate's spoken response. Return ONLY a JSON object with: communicationScore (0-100), insight (1 sentence), feedback (array with one object: {id, priority, category:'Communication', title, description, action}).",
            },
            {
              role: "user",
              content: `Analyse this interview response:\n${transcribedText}`,
            },
          ],
          model: "llama3-8b-8192",
          response_format: { type: "json_object" },
        });

        const groqData        = JSON.parse(groqCompletion.choices[0]?.message?.content || "{}");
        communicationScore    = typeof groqData.communicationScore === "number" ? groqData.communicationScore : 70;
        communicationInsight  = groqData.insight || communicationInsight;
        if (Array.isArray(groqData.feedback)) {
          commsFeedback.push(...groqData.feedback);
        } else if (groqData.feedback) {
          commsFeedback.push({ id: "comms-1", priority: "medium", category: "Communication", ...groqData.feedback });
        }
      } catch (groqErr) {
        console.warn("Groq analysis skipped:", groqErr);
      }
    }

    // ── 4. Assemble final payload ───────────────────────────────────────────
    const technicalScore    = geminiData.technicalScore    ?? 70;
    const portfolioScore    = geminiData.portfolioScore    ?? 70;
    const resumeStrength    = geminiData.resumeStrengthScore ?? 70;
    const overallScore      = Math.round(
      (technicalScore + portfolioScore + communicationScore + resumeStrength) / 4
    );

    const payload = {
      overallScore,
      pillars: {
        technical:           technicalScore,
        technicalInsight:    geminiData.technicalInsight    || "",
        portfolio:           portfolioScore,
        portfolioInsight:    geminiData.portfolioInsight    || "",
        communication:       communicationScore,
        communicationInsight,
        resume:              resumeStrength,
        resumeInsight:       geminiData.resumeInsight       || "",
      },
      feedback: [
        ...(Array.isArray(geminiData.feedback) ? geminiData.feedback : []),
        ...commsFeedback,
      ],
    };

    return NextResponse.json({ success: true, data: payload });

  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
