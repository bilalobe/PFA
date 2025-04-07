const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin with a service account or with the emulator config
admin.initializeApp({
  projectId: "demo-pfa"
});

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// Ensure local-data directory exists
const localDataDir = path.join(__dirname, "..", "local-data");
if (!fs.existsSync(localDataDir)) {
  fs.mkdirSync(localDataDir, { recursive: true });
}

async function seedUsers() {
  console.log("Seeding users...");
  
  const users = [
    { email: "teacher@example.com", password: "password123", role: "teacher", displayName: "Demo Teacher" },
    { email: "student@example.com", password: "password123", role: "student", displayName: "Demo Student" },
    { email: "supervisor@example.com", password: "password123", role: "supervisor", displayName: "Demo Supervisor" }
  ];
  
  const userIds = {};
  
  for (const user of users) {
    try {
      // Check if user already exists
      try {
        const userRecord = await auth.getUserByEmail(user.email);
        userIds[user.role] = userRecord.uid;
        console.log(`User ${user.email} already exists`);
        continue;
      } catch (e) {
        // User does not exist, continue with creation
      }
      
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName
      });
      
      userIds[user.role] = userRecord.uid;
      
      await db.collection("users").doc(userRecord.uid).set({
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Created user: ${user.email}`);
    } catch (e) {
      console.log(`Error creating user: ${e}`);
    }
  }
  
  return userIds;
}

async function seedCourses(userIds) {
  console.log("Seeding courses...");
  
  const courses = [
    {
      title: "Introduction to React",
      description: "Learn React fundamentals including components, state management, and hooks. This course covers everything from setup to advanced patterns.",
      teacherId: userIds.teacher,
      thumbnail: "https://firebasestorage.googleapis.com/react-course.jpg",
      difficulty: "Beginner",
      duration: "8 weeks",
      modules: [
        {
          title: "Getting Started",
          description: "Set up your development environment and create your first React app",
          order: 1,
          resources: [
            { title: "React Basics", type: "document", url: "https://firebasestorage.googleapis.com/react-basics.pdf" },
            { title: "Setup Video", type: "video", url: "https://firebasestorage.googleapis.com/react-setup.mp4" }
          ]
        },
        {
          title: "Components & Props",
          description: "Learn about React components and how to pass data with props",
          order: 2,
          resources: [
            { title: "Component Patterns", type: "document", url: "https://firebasestorage.googleapis.com/component-patterns.pdf" }
          ]
        }
      ],
      quizzes: [
        {
          title: "React Fundamentals Quiz",
          description: "Test your knowledge of React basics",
          moduleId: 1,
          questions: [
            {
              question: "What is a React component?",
              options: [
                "A reusable piece of UI",
                "A JavaScript function",
                "A data structure",
                "All of the above"
              ],
              correctAnswer: 3
            },
            {
              question: "What does JSX stand for?",
              options: [
                "JavaScript XML",
                "JavaScript Extension",
                "JavaScript Syntax",
                "Java Syntax Extension"
              ],
              correctAnswer: 0
            }
          ]
        }
      ]
    },
    {
      title: "Advanced JavaScript",
      description: "Master advanced JavaScript concepts including closures, prototypes, and asynchronous programming.",
      teacherId: userIds.teacher,
      thumbnail: "https://firebasestorage.googleapis.com/js-course.jpg",
      difficulty: "Intermediate",
      duration: "6 weeks",
      modules: [
        {
          title: "ES6 Features",
          description: "Learn modern JavaScript features",
          order: 1,
          resources: [
            { title: "ES6 Cheatsheet", type: "document", url: "https://firebasestorage.googleapis.com/es6-cheatsheet.pdf" }
          ]
        }
      ],
      quizzes: [
        {
          title: "ES6 Features Quiz",
          description: "Test your knowledge of modern JavaScript",
          moduleId: 1,
          questions: [
            {
              question: "Which is NOT an ES6 feature?",
              options: [
                "let and const",
                "Arrow functions",
                "Promises",
                "jQuery methods"
              ],
              correctAnswer: 3
            }
          ]
        }
      ]
    }
  ];
  
  const courseIds = [];
  
  for (const course of courses) {
    try {
      const courseRef = await db.collection("courses").add({
        title: course.title,
        description: course.description,
        teacherId: course.teacherId,
        thumbnail: course.thumbnail,
        difficulty: course.difficulty,
        duration: course.duration,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        enrollmentCount: 0
      });
      
      courseIds.push(courseRef.id);
      
      // Add modules
      for (const module of course.modules) {
        const moduleRef = await db.collection("modules").add({
          courseId: courseRef.id,
          title: module.title,
          description: module.description,
          order: module.order,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Add resources for this module
        for (const resource of module.resources) {
          await db.collection("resources").add({
            moduleId: moduleRef.id,
            title: resource.title,
            type: resource.type,
            url: resource.url,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      // Add quizzes
      for (const quiz of course.quizzes) {
        const quizRef = await db.collection("quizzes").add({
          courseId: courseRef.id,
          moduleId: quiz.moduleId,
          title: quiz.title,
          description: quiz.description,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Add questions for this quiz
        for (const [index, question] of quiz.questions.entries()) {
          await db.collection("questions").add({
            quizId: quizRef.id,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            order: index,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      console.log(`Created course: ${course.title}`);
    } catch (e) {
      console.log(`Error creating course: ${e}`);
    }
  }
  
  return courseIds;
}

async function seedEnrollments(userIds, courseIds) {
  console.log("Seeding enrollments...");
  
  try {
    // Enroll the student in the first course
    await db.collection("enrollments").add({
      userId: userIds.student,
      courseId: courseIds[0],
      status: "active",
      progress: 25,
      enrolledAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update the course enrollment count
    await db.collection("courses").doc(courseIds[0]).update({
      enrollmentCount: admin.firestore.FieldValue.increment(1)
    });
    
    console.log("Created enrollment for student");
  } catch (e) {
    console.log(`Error creating enrollment: ${e}`);
  }
}

async function seedForumPosts(userIds, courseIds) {
  console.log("Seeding forum posts...");
  
  const forumThreads = [
    {
      courseId: courseIds[0],
      title: "Help with React Hooks",
      content: "I'm having trouble understanding React hooks. Can someone explain useEffect?",
      userId: userIds.student,
      replies: [
        {
          content: "Hooks are a way to use state and lifecycle features in functional components. useEffect runs after render and can handle side effects.",
          userId: userIds.teacher
        }
      ]
    },
    {
      courseId: courseIds[0],
      title: "Project Ideas",
      content: "What are some good project ideas to practice React skills?",
      userId: userIds.student,
      replies: [
        {
          content: "Try building a todo app, then a simple e-commerce site, and finally a social media dashboard.",
          userId: userIds.teacher
        }
      ]
    }
  ];
  
  for (const thread of forumThreads) {
    try {
      const threadRef = await db.collection("forumThreads").add({
        courseId: thread.courseId,
        title: thread.title,
        content: thread.content,
        userId: thread.userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        replyCount: thread.replies.length
      });
      
      // Add replies
      for (const reply of thread.replies) {
        await db.collection("forumPosts").add({
          threadId: threadRef.id,
          content: reply.content,
          userId: reply.userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      console.log(`Created forum thread: ${thread.title}`);
    } catch (e) {
      console.log(`Error creating forum thread: ${e}`);
    }
  }
}

async function seedChatRooms(userIds) {
  console.log("Seeding chat rooms...");
  
  try {
    // Create a private chat between student and teacher
    const chatRoomRef = await db.collection("chatRooms").add({
      participants: [userIds.student, userIds.teacher],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessage: "Do you have any questions about the React course?",
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessageBy: userIds.teacher
    });
    
    // Add messages to the chat
    await db.collection("chatMessages").add({
      roomId: chatRoomRef.id,
      content: "Hi, I'm your instructor for the React course. Feel free to ask any questions!",
      senderId: userIds.teacher,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });
    
    await db.collection("chatMessages").add({
      roomId: chatRoomRef.id,
      content: "Do you have any questions about the React course?",
      senderId: userIds.teacher,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });
    
    console.log("Created chat room between student and teacher");
  } catch (e) {
    console.log(`Error creating chat room: ${e}`);
  }
}

async function seedCoursesWithEmbeddings() {
  const courseIds = [/* existing course IDs */];
  
  // Call the reindexAllCourses function directly
  for (const courseId of courseIds) {
    const course = await db.collection('courses').doc(courseId).get();
    const courseData = course.data();
    
    // Create simple mock embeddings for testing (in real usage, these would come from the embedding model)
    const mockEmbedding = Array(512).fill(0).map(() => Math.random() - 0.5);
    
    await db.collection('courses').doc(courseId).update({
      embedding: mockEmbedding,
      embeddingUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  console.log('Courses seeded with embeddings for vector search testing');
}

async function seedAll() {
  try {
    const userIds = await seedUsers();
    const courseIds = await seedCourses(userIds);
    await seedEnrollments(userIds, courseIds);
    await seedForumPosts(userIds, courseIds);
    await seedChatRooms(userIds);
    await seedCoursesWithEmbeddings();
    
    console.log("Seeding complete!");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

// Run the seeding
seedAll().catch(console.error);