import { initializeTestApp, loadFirestoreRules, apps } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

export async function setupFirestoreRulesTest() {
  // Clear any existing app instances
  await Promise.all(apps().map((app: { delete: () => any; }) => app.delete()));
  
  // Load the rules file
  const rules = readFileSync('firestore.rules', 'utf8');
  
  // Create test apps for different user contexts
  const studentApp = initializeTestApp({
    projectId: 'demo-pfa',
    auth: { uid: 'student-uid', email: 'student@example.com', role: 'student' }
  });
  
  const teacherApp = initializeTestApp({
    projectId: 'demo-pfa',
    auth: { uid: 'teacher-uid', email: 'teacher@example.com', role: 'teacher' }
  });
  
  // Load the rules
  await loadFirestoreRules({ projectId: 'demo-pfa', rules });
  
  // Return the test app databases
  return {
    studentDb: studentApp.firestore(),
    teacherDb: teacherApp.firestore()
  };
}