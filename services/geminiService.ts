
import { GoogleGenAI, Type } from "@google/genai";
import { LoanApplication, EligibilityAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeEligibility(data: LoanApplication): Promise<EligibilityAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: `Analyze this loan application for eligibility. 
    Focus on educating the user about BANK CRITERIA to reduce the 40% rejection rate.
    
    Application Details:
    - Name: ${data.fullName}
    - Loan Type: ${data.loanType}
    - Amount Requested: $${data.loanAmount}
    - Monthly Income: $${data.income}
    - Monthly Debt: $${data.existingDebt}
    - Property Ownership (Collateral): ${data.hasProperty ? 'YES' : 'NO'}
    - Documents User Has: ${data.hasDocuments.join(', ') || 'None'}
    
    CRITICAL INSTRUCTION:
    1. Property/Land ownership is a massive boost to eligibility. Highlight this as a "Success Factor".
    2. Explain the "WHY" behind every rejection risk. Why do banks care about Debt-to-Income? Why is a missing document a hard rejection?
    3. Provide a clear "Submission Checklist" that guides the user on how to perfectly fill the form.
    4. If the user is missing documents, explain why those specific documents are required for a ${data.loanType} loan.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, description: "Approved, Review Required, or Likely Rejected" },
          score: { type: Type.NUMBER, description: "0-100 probability score" },
          feedback: { type: Type.STRING, description: "Summary of the profile" },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ways to increase eligibility (co-signers, higher income, etc)" },
          missingInfo: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific missing documents" },
          rejectionRisks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                reason: { type: Type.STRING, description: "The specific criteria failure" },
                severity: { type: Type.STRING, description: "High, Medium, Low" },
                howToFix: { type: Type.STRING, description: "Actionable improvement step" },
                description: { type: Type.STRING, description: "The bank logic: WHY this leads to rejection" }
              },
              required: ["reason", "severity", "howToFix", "description"]
            }
          },
          debtToIncomeRatio: { type: Type.NUMBER },
          futureScenarios: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                impact: { type: Type.STRING },
                probability: { type: Type.NUMBER }
              },
              required: ["label", "impact", "probability"]
            }
          },
          formFillingSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["status", "score", "feedback", "recommendations", "missingInfo", "rejectionRisks", "debtToIncomeRatio", "futureScenarios", "formFillingSteps"]
      }
    }
  });

  return JSON.parse(response.text.trim());
}

export async function getAdvisorAdvice(message: string, context: LoanApplication): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ text: `User Question: "${message}". Context: User wants a ${context.loanType} loan. Property: ${context.hasProperty ? 'YES' : 'NO'}.` }],
    config: {
      systemInstruction: "You are the PayNow Expert. Your job is to maximize the user's loan approval chances. Explain bank eligibility criteria in simple, encouraging language. Always suggest using property or a co-signer as a way to increase chances."
    }
  });
  return response.text;
}

export async function generateGuidelineImage(concept: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: `Masterpiece 3D isometric financial illustration of ${concept}. Cinematic lighting, frosted glass and holographic textures, neon cyan and deep charcoal color palette, 8k resolution, professional fintech aesthetic, ultra-detailed.` }],
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (e) { console.error(e); }
  return null;
}
