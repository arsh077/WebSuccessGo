import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini SDK with server secret and telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback if API key is not configured yet
      return NextResponse.json({
        fallback: true,
        recommendedCategory: 'Startup Website Templates',
        recommendedTemplate: 'SaaSify Launchpad',
        recommendedPackage: 'Business',
        businessDescription: `A high-quality website tailored for: "${prompt}".`,
        pages: ['Home', 'About Us', 'Features', 'Pricing', 'Contact'],
        suggestedFeatures: [
          'Modern responsive design optimized for mobile devices',
          'Search Engine Optimization (SEO) setup for Google ranking',
          'High-speed page loads and lightweight interactive assets',
          'WhatsApp instant chat button & contact capture funnel'
        ],
        message: 'This is a premium fallback recommendation. Please configure your GEMINI_API_KEY in Settings > Secrets to enable the live AI planner!'
      });
    }

    const systemInstruction = `You are the lead Website Architecture Consultant for WebSuccessGo.
Analyze the user's business idea and generate a customized website blueprint in structured JSON.
Choose the MOST appropriate template category from:
- Restaurant Website Templates
- Clinic Website Templates
- Law Firm Website Templates
- Salon Website Templates
- E-commerce Website Templates
- Startup Website Templates

Choose the RECOMMENDED pricing package from:
- Starter (Best for simple local sites, ₹4999)
- Business (Best for growting businesses with SEO/Maps, ₹9999)
- Premium (Best for custom platforms, custom database, ₹19999)

Generate list of standard required website pages, a professional marketing-focused business description, and key features.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Business Idea: ${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedCategory: {
              type: Type.STRING,
              description: 'The exact matching website category from the allowed list.',
            },
            recommendedTemplate: {
              type: Type.STRING,
              description: 'A catchy name for a recommended template matching their business.'
            },
            recommendedPackage: {
              type: Type.STRING,
              description: "The recommended package: 'Starter', 'Business', or 'Premium'."
            },
            businessDescription: {
              type: Type.STRING,
              description: 'A professional marketing-focused description summarizing their business and website goal.'
            },
            pages: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 4-6 necessary pages for their website.'
            },
            suggestedFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 3-4 specialized features that will help them succeed.'
            }
          },
          required: ['recommendedCategory', 'recommendedTemplate', 'recommendedPackage', 'businessDescription', 'pages', 'suggestedFeatures']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const data = JSON.parse(text.trim());
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({
      error: true,
      message: error.message || 'Gemini API failed',
      fallback: true,
      recommendedCategory: 'Startup Website Templates',
      recommendedTemplate: 'SaaSify Launchpad',
      recommendedPackage: 'Business',
      businessDescription: `Professional custom website setup for your business idea.`,
      pages: ['Home', 'About Us', 'Features', 'Pricing', 'Contact'],
      suggestedFeatures: [
        'Modern responsive design optimized for mobile devices',
        'Search Engine Optimization (SEO) setup for Google ranking',
        'High-speed page loads and lightweight interactive assets',
        'WhatsApp instant chat button & contact capture funnel'
      ]
    });
  }
}
