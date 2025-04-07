import { defineFlow } from "@genkit-ai/flow";
import { Registry } from "@genkit-ai/core/registry";
import { studyTopicFlowDefinition } from './studyTopics';
import { courseRecommendationFlowDefinition } from './courseRecommendations';

export function registerFlows(registry: Registry) {
  // Course recommendation flow
  const courseRecommendationFlow = defineFlow(
    courseRecommendationFlowDefinition.config,
    courseRecommendationFlowDefinition.steps
  );
  
  // Study topic suggestion flow
  const studyTopicFlow = defineFlow(
    studyTopicFlowDefinition.config,
    studyTopicFlowDefinition.steps
  );
  
  return {
    courseRecommendationFlow,
    studyTopicFlow
  };
}

// Helper function to initialize flows easily
export function initializeFlows(registry: Registry) {
  const flows = registerFlows(registry);
  
  // Export each flow as an HTTPS callable function
  return flows;
}