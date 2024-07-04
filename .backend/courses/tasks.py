from celery import shared_task
from backend.quizzes.models import UserQuizAttempt
from courses.models import Course, CourseAnalytics, Review, UserCourseInteraction
from enrollments.models import Enrollment, ModuleCompletion
from django.db.models import Avg
from backend.quizzes.utils import auto_grade_quiz_attempt


@shared_task
def update_course_statistics():
    """
    Task to update course statistics with detailed analytics.
    """
    for course in Course.objects.all():
        enrollment_count = Enrollment.objects.filter(course=course).count()
        completed_enrollments = Enrollment.objects.filter(course=course, completed=True).count()
        module_completions = ModuleCompletion.objects.filter(enrollment__course=course)
        quiz_attempts = UserQuizAttempt.objects.filter(enrollment__course=course)

        # Calculate completion rate
        if enrollment_count > 0:
            completion_rate = (completed_enrollments / enrollment_count) * 100
        else:
            completion_rate = 0

        # Calculate average rating
        average_rating = Review.objects.filter(course=course).aggregate(Avg('rating'))['rating__avg'] or 0

        # Calculate average time spent per module
        average_time_spent_per_module = module_completions.aggregate(Avg('time_spent'))['time_spent__avg'] or 0

        # Calculate quiz performance statistics
        average_quiz_score = quiz_attempts.aggregate(Avg('score'))['score__avg'] or 0
        quiz_pass_rate = quiz_attempts.filter(passed=True).count() / quiz_attempts.count() * 100 if quiz_attempts.exists() else 0

        # Calculate engagement metrics (example: average number of interactions per user)
        # This is a placeholder for how you might calculate engagement if you have a UserCourseInteraction model or similar
        average_engagement = UserCourseInteraction.objects.filter(course=course).aggregate(Avg('interactions'))['interactions__avg'] or 0

        # Update CourseAnalytics model
        course.enrollment_count = enrollment_count
        course.completion_rate = completion_rate
        course.average_rating = average_rating
        course.save()

        # Assuming CourseAnalytics model has fields for these new statistics
        course_analytics, created = CourseAnalytics.objects.get_or_create(course=course)
        course_analytics.average_time_spent = average_time_spent_per_module
        course_analytics.average_score = average_quiz_score
        course_analytics.quiz_pass_rate = quiz_pass_rate
        course_analytics.average_engagement = average_engagement
        course_analytics.save()


@shared_task
def auto_grade_quiz_attempt_async(quiz_attempt_id):
    """
    Task to auto-grade a quiz attempt asynchronously.
    """
    auto_grade_quiz_attempt(quiz_attempt_id)
