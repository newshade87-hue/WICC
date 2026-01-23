import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" }); // Using a faster/lighter model for reports

export const generateMatchReport = async (match: any) => {
    const prompt = `Generate a short, professional, and celebratory cricket match summary for the WICC Cricket Group.
  Match Details:
  - Match Number: ${match.matchnumber}
  - Date: ${match.date}
  - Format: ${match.innings}
  - Team Blue Score: ${match.teamonescore} (${match.teamonepoints} pts)
  - Team Orange Score: ${match.teamtwoscore} (${match.teamtwopoints} pts)
  - Result: ${match.winmargin}
  - Man of the Match: ${match.mom}
  - Points of Interest: ${match.moi1}, ${match.moi2}

  The tone should be futuristic (Cyber-Cricket) and high-energy. Keep it under 150 words.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Failed to generate AI report. Please check your API key.";
    }
};

export const generateSeriesReport = async (series: any) => {
    const prompt = `Generate a professional and legendary series summary for the WICC Cricket Group.
  Series Summary:
  - Team Blue Points: ${series.ptsA}
  - Team Orange Points: ${series.ptsB}
  - Champion: ${series.champion}
  - Man of Series: ${series.awards.mos}
  - MVP: ${series.awards.mvp}
  
  Format:
  A celebratory announcement of the winners and acknowledgment of the competition.
  The tone should be "Premium Sports Dashboard 2099". Keep it concise.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Failed to generate series summary.";
    }
};
