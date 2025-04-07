import * as functions from "firebase-functions";
import { generate } from "@genkit-ai/ai";
import { gemini15Pro } from "@genkit-ai/googleai";
import { Registry } from "@genkit-ai/core/registry";
import * as z from "zod";
import * as functions from '
import * as admin from '
import { z } from '
import { vertexai } from '

// Create a shared registry for better performance
const globalRegistry = new Registry();
globalRegistry.apiStability = "stable";

// Input validation schema
const CourseContentInputSchema = z.object({
    title: z.string().min(1).describe("Course title"),
    subject: z.string().min(1).describe("Subject area"),
    level: z.enum(["beginner", "intermediate", "advanced"])
        .describe("Target audience level"),
    duration: z.number().min(1).describe("Expected course duration in hours"),
    topics: z.array(z.string()).optional()
        .describe("Optional list of topics to cover"),
});

// Output validation schema
const CourseContentOutputSchema = z.object({
    description: z.string().describe("Course description"),
    learningObjectives: z.array(z.string())
        .describe("List of learning objectives"),
    outline: z.array(z.object({
        title: z.string(),
        description: z.string(),
        duration: z.number(),
        topics: z.array(z.string())
    })).describe("Course modules outline"),
    prerequisites: z.array(z.string())
        .describe("Required prerequisites"),
    targetAudience: z.string()
        .describe("Description of ideal students"),
    assessment: z.object({
        methods: z.array(z.string()),
        criteria: z.array(z.string())
    }).describe("Assessment strategy"),
});

// Generate course content using AI
export const generateCourseContent = functions
    .runWith({
        timeoutSeconds: 180,
        memory: '1GB'
    })
    .https.onCall(async (data, context) => {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'Must be authenticated to generate course content'
            );
        }

        try {
            // Validate input
            const validatedInput = CourseContentInputSchema.parse(data);

            // Generate structured prompt
            const prompt = `Generate a detailed course structure for a ${validatedInput.level}-level course titled "${validatedInput.title}" in ${validatedInput.subject}.
The course should be designed for ${validatedInput.duration} hours of learning.

Please provide the following information in a structured format:

DESCRIPTION:
[Write an engaging course description]

LEARNING_OBJECTIVES:
[List 4-6 specific, measurable learning objectives]

PREREQUISITES:
[List essential prerequisites]

TARGET_AUDIENCE:
[Describe the ideal student profile]

COURSE_OUTLINE:
[Create a module-by-module outline with:
- Module title
- Brief description
- Estimated duration
- Key topics covered]

ASSESSMENT:
[Specify:
- Assessment methods
- Success criteria]

${validatedInput.topics ? `The course should cover these topics: ${validatedInput.topics.join(', ')}` : ''}
Make sure the content is appropriate for ${validatedInput.level} level students and fits within ${validatedInput.duration} hours.`;

            // Generate content using AI
            const response = await generate(
                globalRegistry,
                {
                    model: gemini15Pro,
                    prompt,
                    config: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                        topP: 0.8,
                    }
                }
            );

            // Parse and structure the response
            const parsedContent = parseAIResponse(response.text);
            
            // Validate output
            const validatedOutput = CourseContentOutputSchema.parse(parsedContent);

            return {
                success: true,
                content: validatedOutput
            };

        } catch (error) {
            functions.logger.error('Error generating course content:', error);
            
            if (error instanceof z.ZodError) {
                throw new functions.https.HttpsError(
                    'invalid-argument',
                    'Invalid input format',
                    { details: error.errors }
                );
            }

            throw new functions.https.HttpsError(
                'internal',
                'Error generating course content',
                { originalError: error instanceof Error ? error.message : 'Unknown error' }
            );
        }
    });

// Helper function to parse AI response into structured format
function parseAIResponse(text: string) {
    const sections = {
        description: text.match(/DESCRIPTION:\s*([\s\S]*?)(?=\n\s*[A-Z_]+:|\s*$)/i)?.[1]?.trim(),
        learningObjectives: extractList(text, 'LEARNING_OBJECTIVES'),
        prerequisites: extractList(text, 'PREREQUISITES'),
        targetAudience: text.match(/TARGET_AUDIENCE:\s*([\s\S]*?)(?=\n\s*[A-Z_]+:|\s*$)/i)?.[1]?.trim(),
        outline: extractOutline(text),
        assessment: extractAssessment(text)
    };

    return sections;
}

// Helper function to extract lists from text
function extractList(text: string, section: string): string[] {
    const regex = new RegExp(`${section}:\\s*([\\s\\S]*?)(?=\\n\\s*[A-Z_]+:|\\s*$)`, 'i');
    const match = text.match(regex);
    if (!match) return [];
    
    return match[1]
        .split('\n')
        .map(item => item.replace(/^[-*•]\s*/, '').trim())
        .filter(item => item.length > 0);
}

// Helper function to extract course outline
function extractOutline(text: string) {
    const outlineMatch = text.match(/COURSE_OUTLINE:\s*([\s\S]*?)(?=\n\s*[A-Z_]+:|\s*$)/i);
    if (!outlineMatch) return [];

    const outlineText = outlineMatch[1];
    const moduleRegex = /Module\s*\d+[:.]\s*([^\n]+)\n([\s\S]*?)(?=\n\s*Module\s*\d+[:.]\s*|$)/gi;
    const modules = [];
    let match;

    while ((match = moduleRegex.exec(outlineText)) !== null) {
        const moduleTitle = match[1].trim();
        const moduleContent = match[2].trim();
        
        const durationMatch = moduleContent.match(/Duration:\s*(\d+)\s*hours?/i);
        const duration = durationMatch ? parseInt(durationMatch[1]) : 0;
        
        const descriptionMatch = moduleContent.match(/Description:\s*([^\n]+)/i);
        const description = descriptionMatch ? descriptionMatch[1].trim() : '';
        
        const topics = moduleContent
            .split('\n')
            .map(line => line.replace(/^[-*•]\s*/, '').trim())
            .filter(line => line && !line.startsWith('Duration:') && !line.startsWith('Description:'));

        modules.push({
            title: moduleTitle,
            description,
            duration,
            topics
        });
    }

    return modules;
}

// Helper function to extract assessment information
function extractAssessment(text: string) {
    const assessmentMatch = text.match(/ASSESSMENT:\s*([\s\S]*?)(?=\n\s*[A-Z_]+:|\s*$)/i);
    if (!assessmentMatch) return { methods: [], criteria: [] };

    const assessmentText = assessmentMatch[1];
    
    const methods = (assessmentText.match(/Methods?:\s*([\s\S]*?)(?=\nCriteria:|\s*$)/i)?.[1] || '')
        .split('\n')
        .map(item => item.replace(/^[-*•]\s*/, '').trim())
        .filter(item => item.length > 0);
        
    const criteria = (assessmentText.match(/Criteria:\s*([\s\S]*?)(?=\n\s*[A-Z_]+:|\s*$)/i)?.[1] || '')
        .split('\n')
        .map(item => item.replace(/^[-*•]\s*/, '').trim())
        .filter(item => item.length > 0);

    return {
        methods,
        criteria
    };
}
