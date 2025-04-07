import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Update course statistics when a new enrollment is created
export const onEnrollmentCreate = functions.firestore
    .document('enrollments/{enrollmentId}')
    .onCreate(async (snapshot, context) => {
        try {
            const enrollmentData = snapshot.data();
            const courseId = enrollmentData.courseId;
            const courseRef = admin.firestore().collection('courses').doc(courseId);

            await courseRef.update({
                enrollmentCount: admin.firestore.FieldValue.increment(1),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Update course analytics
            const analyticsRef = courseRef.collection('analytics').doc('enrollment');
            await analyticsRef.set({
                lastEnrollment: admin.firestore.FieldValue.serverTimestamp(),
                dailyEnrollments: admin.firestore.FieldValue.increment(1),
                totalEnrollments: admin.firestore.FieldValue.increment(1)
            }, { merge: true });

            return null;
        } catch (error) {
            functions.logger.error('Error updating course statistics:', error);
            return null;
        }
    });

// Update course rating when a new review is added
export const onReviewCreate = functions.firestore
    .document('courses/{courseId}/reviews/{reviewId}')
    .onCreate(async (snapshot, context) => {
        try {
            const reviewData = snapshot.data();
            const { courseId } = context.params;
            const courseRef = admin.firestore().collection('courses').doc(courseId);

            // Get all reviews for the course
            const reviewsSnapshot = await courseRef
                .collection('reviews')
                .get();

            let totalRating = 0;
            let numberOfReviews = 0;

            reviewsSnapshot.forEach(doc => {
                const review = doc.data();
                if (typeof review.rating === 'number') {
                    totalRating += review.rating;
                    numberOfReviews++;
                }
            });

            const averageRating = numberOfReviews > 0 ? totalRating / numberOfReviews : 0;

            // Update course with new rating information
            await courseRef.update({
                averageRating,
                numberOfReviews,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Update course analytics
            const analyticsRef = courseRef.collection('analytics').doc('reviews');
            await analyticsRef.set({
                lastReview: admin.firestore.FieldValue.serverTimestamp(),
                dailyReviews: admin.firestore.FieldValue.increment(1),
                totalReviews: numberOfReviews,
                averageRating
            }, { merge: true });

            return null;
        } catch (error) {
            functions.logger.error('Error updating course rating:', error);
            return null;
        }
    });

// Track course completion progress
export const onModuleComplete = functions.firestore
    .document('enrollments/{enrollmentId}/progress/{moduleId}')
    .onWrite(async (change, context) => {
        try {
            const { enrollmentId } = context.params;
            const enrollmentRef = admin.firestore().collection('enrollments').doc(enrollmentId);
            
            // Get enrollment data
            const enrollmentDoc = await enrollmentRef.get();
            if (!enrollmentDoc.exists) return null;
            
            const enrollmentData = enrollmentDoc.data()!;
            const courseId = enrollmentData.courseId;
            
            // Get all module progress for this enrollment
            const progressSnapshot = await enrollmentRef
                .collection('progress')
                .where('completed', '==', true)
                .get();
            
            // Get course data to check total number of modules
            const courseDoc = await admin.firestore()
                .collection('courses')
                .doc(courseId)
                .get();
            
            if (!courseDoc.exists) return null;
            
            const courseData = courseDoc.data()!;
            const totalModules = courseData.modules?.length || 0;
            const completedModules = progressSnapshot.size;
            
            // Calculate completion percentage
            const completionPercentage = totalModules > 0 
                ? (completedModules / totalModules) * 100 
                : 0;
            
            // Update enrollment with progress
            await enrollmentRef.update({
                completedModules: completedModules,
                completionPercentage: completionPercentage,
                lastActivity: admin.firestore.FieldValue.serverTimestamp()
            });

            // If course is completed, update analytics and create certificate
            if (completionPercentage === 100 && 
                (!enrollmentData.completionPercentage || 
                enrollmentData.completionPercentage < 100)) {
                
                // Update course completion analytics
                const analyticsRef = admin.firestore()
                    .collection('courses')
                    .doc(courseId)
                    .collection('analytics')
                    .doc('completion');
                
                await analyticsRef.set({
                    lastCompletion: admin.firestore.FieldValue.serverTimestamp(),
                    totalCompletions: admin.firestore.FieldValue.increment(1)
                }, { merge: true });

                // Create completion certificate
                await admin.firestore()
                    .collection('certificates')
                    .add({
                        userId: enrollmentData.userId,
                        courseId: courseId,
                        enrollmentId: enrollmentId,
                        courseName: courseData.title,
                        userName: enrollmentData.userName,
                        issueDate: admin.firestore.FieldValue.serverTimestamp(),
                        certificateNumber: generateCertificateNumber(),
                        status: 'issued'
                    });
            }

            return null;
        } catch (error) {
            functions.logger.error('Error tracking course completion:', error);
            return null;
        }
    });

// Helper function to generate certificate number
function generateCertificateNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CERT-${timestamp}-${random}`.toUpperCase();
}

// Update course search index when course is modified
export const onCourseUpdate = functions.firestore
    .document('courses/{courseId}')
    .onWrite(async (change, context) => {
        try {
            const courseData = change.after.exists ? change.after.data() : null;
            const courseId = context.params.courseId;

            if (!courseData) {
                // Course was deleted, remove from search index
                await admin.firestore()
                    .collection('searchIndex')
                    .doc(courseId)
                    .delete();
                return null;
            }

            // Create or update search index document
            const searchData = {
                objectID: courseId,
                title: courseData.title,
                description: courseData.description,
                tags: courseData.tags || [],
                category: courseData.category,
                level: courseData.level,
                instructor: courseData.instructor,
                rating: courseData.averageRating || 0,
                enrollmentCount: courseData.enrollmentCount || 0,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                searchableText: `${courseData.title} ${courseData.description} ${courseData.tags?.join(' ')}`.toLowerCase()
            };

            await admin.firestore()
                .collection('searchIndex')
                .doc(courseId)
                .set(searchData, { merge: true });

            return null;
        } catch (error) {
            functions.logger.error('Error updating course search index:', error);
            return null;
        }
    });