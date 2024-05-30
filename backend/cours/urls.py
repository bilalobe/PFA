from django.urls import include, path
from .views import CoursViewSet, QuizViewSet, CoursDetailViewSet


router = routers.DefaultRouter()
router.register(r'modules', ModuleViewSet)
modules_router = NestedSimpleRouter(router, r'modules', lookup='module')
modules_router.register(r'quizzes', QuizViewSet, basename='module-quizzes') 

urlpatterns = [
    path('', include(router.urls)),
    path('', include(modules_router.urls)),
    path("cours/", CoursViewSet.as_view({"get": "list", "post": "create"})),
    path(
        "cours/<int:pk>/",
        CoursDetailViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
    ),
]
