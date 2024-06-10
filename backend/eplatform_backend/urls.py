from django.contrib import admin
from django.urls import path, include 
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter

# Import your ViewSets
from user.views import UserViewSet
from courses.views import CourseViewSet, ModuleViewSet, ReviewViewSet, QuizViewSet, QuizQuestionViewSet, QuizAnswerChoiceViewSet
from enrollments.views import EnrollmentViewSet
from resources.views import ResourceViewSet 
from forums.views import ForumViewSet, ThreadViewSet, PostViewSet, CommentViewSet, ModerationViewSet, moderation_dashboard, take_action, report_post 

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'forums', ForumViewSet, basename='forum')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

# Nested routers for courses 
courses_router = NestedSimpleRouter(router, r'courses', lookup='course')
courses_router.register(r'modules', ModuleViewSet, basename='course-module')
courses_router.register(r'reviews', ReviewViewSet, basename='course-review')
courses_router.register(r'quizzes', QuizViewSet, basename='course-quiz')

# Nested routers for quizzes
quizzes_router = NestedSimpleRouter(courses_router, r'quizzes', lookup='quiz')
quizzes_router.register(r'questions', QuizQuestionViewSet, basename='quiz-question')

questions_router = NestedSimpleRouter(quizzes_router, r'questions', lookup='question')
questions_router.register(r'choices', QuizAnswerChoiceViewSet, basename='question-choice')

# Nested routers for forums
forums_router = NestedSimpleRouter(router, r'forums', lookup='forum')
forums_router.register(r'threads', ThreadViewSet, basename='forum-thread')

threads_router = NestedSimpleRouter(forums_router, r'threads', lookup='thread')
threads_router.register(r'posts', PostViewSet, basename='thread-post')

posts_router = NestedSimpleRouter(threads_router, r'posts', lookup='post')
posts_router.register(r'comments', CommentViewSet, basename='post-comment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), 
    path('api/', include(courses_router.urls)),
    path('api/', include(quizzes_router.urls)),
    path('api/', include(questions_router.urls)),
    path('api/', include(forums_router.urls)),
    path('api/', include(threads_router.urls)),
    path('api/', include(posts_router.urls)),
    path('api/moderate/', moderation_dashboard, name='moderation-dashboard'), 
    path('api/moderate/post/<int:post_id>/', moderate_post, name='moderate-post'),
    path('api/moderation/<int:moderation_id>/take-action/', take_action, name='take-moderation-action'),
]