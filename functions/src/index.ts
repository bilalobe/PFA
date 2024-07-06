import {generate} from "@genkit-ai/ai";
import {configureGenkit} from "@genkit-ai/core";
import {firebaseAuth} from "@genkit-ai/firebase/auth";
import {onFlow} from "@genkit-ai/firebase/functions";
import {geminiPro} from "@genkit-ai/googleai";
import * as z from "zod";
import {firebase} from "@genkit-ai/firebase";
import {googleAI} from "@genkit-ai/googleai";

configureGenkit({
  plugins: [
    firebase(),
    googleAI(),
  ],
  logLevel: "debug",
  enableTracingAndMetrics: true,
});

import functions from "firebase-functions";
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendSmsNotification = functions.https.onCall(async (data, context) => {
    try {
        const phoneNumber = data.phoneNumber; // The phone number to send the message to
        const message = data.message;      // The message content

        const messageResponse = await client.messages.create({
            to: phoneNumber, 
            from: '+1XXXXXXXXXX', // Replace with your Twilio number 
            body: message, 
        });

        console.log('SMS notification sent successfully:', messageResponse.sid); 
        return { success: true }; // Return success response
    } catch (error) {
        console.error("Error sending SMS notification:", error); 
        // Consider throwing an error for error handling in your client
        throw new functions.https.HttpsError('internal', 'Failed to send SMS'); 
    }
});

export const menuSuggestionFlow = onFlow(
  {
    name: "menuSuggestionFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
    authPolicy: firebaseAuth((user) => {
      // Firebase Auth is required to call this flow using the Firebase Functions SDK.
      // TODO: Write additional logic tailored to the needs of your app.
      // For example:
      // if (!user.email_verified) {
      //   throw new Error("Verified email required to run flow");
      // }
    }),
  },
  async (subject) => {
    const prompt =
      `Suggest an item for the menu of a ${subject} themed restaurant`;

    const llmResponse = await generate({
      model: geminiPro,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    return llmResponse.text();
  }
);

