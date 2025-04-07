export const queueModuleCompletion = (courseId: string, moduleId: string) => {
  const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
  pendingActions.push({
    type: 'MODULE_COMPLETION',
    data: { courseId, moduleId },
    timestamp: Date.now()
  });
  localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
};

// Process queue when connection returns
export const processPendingActions = async () => {
  const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
  if (!pendingActions.length) return;
  
  try {
    for (const action of pendingActions) {
      if (action.type === 'MODULE_COMPLETION') {
        await enrollmentApi.completeModule(action.data.courseId, action.data.moduleId);
      }
      // Handle other action types
    }
    localStorage.setItem('pendingActions', '[]');
  } catch (error) {
    console.error('Failed to process pending actions:', error);
  }
};