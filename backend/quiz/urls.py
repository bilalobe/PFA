# Create a router and register our viewsets with it.
from os import path
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter
from .views import CourseViewSet, ModuleViewSet, ReviewViewSet, QuizViewSet, QuizQuestionViewSet, QuizAnswerChoiceViewSet, moderate_post, moderate_comment


router = DefaultRouter()
router.register(r'courses', CourseViewSet)

courses_router = NestedSimpleRouter(router, r'courses', lookup='course')
courses_router.register(r'modules', ModuleViewSet, basename='course-modules')
courses_router.register(r'reviews', ReviewViewSet, basename='course-reviews')
courses_router.register(r'quizzes', QuizViewSet, basename='course-quizzes')

quizzes_router = NestedSimpleRouter(router, r'quizzes', lookup='quiz')
quizzes_router.register(r'questions', QuizQuestionViewSet, basename='quiz-questions')

questions_router = NestedSimpleRouter(router, r'questions', lookup='question')
questions_router.register(r'choices', QuizAnswerChoiceViewSet, basename='question-choices')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(courses_router.urls)),
    path('', include(quizzes_router.urls)),
    path('', include(questions_router.urls)),
    path('moderate/post/ <int:post_id>/', moderate_post, name='moderate_post'),
    path('moderate/comment/ <int:comment_id>/', moderate_comment, name='moderate_comment'),
]