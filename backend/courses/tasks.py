from celery import shared_task
from courses.models import Course
from enrollments.models import Enrollment

@shared_task
def update_course_statistics():
    """
    Task to update course statistics.
    """
    for course in Course.objects.all():
        enrollment_count = Enrollment.objects.filter(course=course).count()
        completed_enrollments = Enrollment.objects.filter(course=course, completed=True).count()

        if enrollment_count > 0:
            completion_rate = (completed_enrollments / enrollment_count) * 100
        else:
            completion_rate = 0

        # Calculate average rating (if you have a rating system)
        # Example:
        # average_rating = course.reviews.aggregate(Avg('rating'))['rating__avg'] or 0 

        course.enrollment_count = enrollment_count
        course.completion_rate = completion_rate
        # course.average_rating = average_rating
        course.save()