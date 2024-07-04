import logging
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from google.cloud.firestore import ArrayUnion, ArrayRemove
from google.cloud.exceptions import NotFound as FirestoreNotFoundError, Unauthorized as FirestorePermissionDeniedError
from backend.courses.permissions import IsTeacherOrReadOnly
from .serializers import ModuleSerializer, ModuleDetailSerializer
from backend.common.firebase_admin_init import db

logger = logging.getLogger(__name__)
User = get_user_model()

class ModuleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows modules to be viewed or edited.

    Methods:
    - get_serializer_class: Returns the serializer class based on the action.
    - get_course_module_ref: Returns the reference to the course module in the Firestore database.
    - list: Retrieves a list of modules for a specific course.
    - retrieve: Retrieves a specific module for a course.
    - create: Creates a new module for a course.
    - update: Updates an existing module for a course.
    - destroy: Deletes a module from a course.
    """

    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'list':
            return ModuleDetailSerializer
        return super().get_serializer_class()

    def get_course_module_ref(self, course_id, module_id=None):
        ref = db.collection('courses').document(course_id).collection('modules')
        return ref.document(module_id) if module_id else ref

    def list(self, request, *args, **kwargs):
        course_id = self.kwargs.get('course_pk')
        if not course_id:
            return Response({'error': 'course_id is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            modules_ref = db.collection('courses').document(course_id).collection('modules')
            modules_docs = modules_ref.get()
            modules = [{'id': doc.id, **doc.to_dict()} for doc in modules_docs]
            return Response(modules, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching modules for course {course_id}: {e}")
            return Response({'error': 'Internal server error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        course_id = self.kwargs.get('course_pk')
        module_id = self.kwargs.get('pk')
        if not course_id or not module_id:
            return Response({'error': 'Both course_id and module_id are required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            module_doc = self.get_course_module_ref(course_id, module_id).get()
            if module_doc.exists:
                module_data = module_doc.to_dict()
                module_data['id'] = module_doc.id
                return Response(module_data, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Module not found.'}, status=status.HTTP_404_NOT_FOUND)
        except FirestoreNotFoundError:
            logger.warning(f"Module {module_id} not found for course {course_id}.")
            return Response({'detail': 'Module not found.'}, status=status.HTTP_404_NOT_FOUND)
        except FirestorePermissionDeniedError:
            logger.error(f"Permission denied for accessing module {module_id} in course {course_id}.")
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Error fetching module {module_id} for course {course_id}: {e}")
            return Response({'error': 'Internal server error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        course_id = self.kwargs.get('course_pk')
        if not course_id:
            return Response({'error': 'course_id is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                module_data = serializer.validated_data
                module_data['created_by'] = request.user.id
                module_ref = self.get_course_module_ref(course_id).add(module_data)
                module_data['id'] = module_ref[1].id

                course_ref = db.collection('courses').document(course_id)
                course_ref.update({'modules': ArrayUnion([module_ref[1].id])})

                return Response(module_data, status=status.HTTP_201_CREATED)
            except FirestorePermissionDeniedError:
                logger.error(f"Permission denied while creating module for course {course_id}.")
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
            except Exception as e:
                logger.error(f"Error creating module for course {course_id}: {e}")
                return Response({'error': 'Internal server error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        course_id = self.kwargs.get('course_pk')
        module_id = self.kwargs.get('pk')
        if not course_id or not module_id:
            return Response({'error': 'Both course_id and module_id are required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                module_ref = self.get_course_module_ref(course_id, module_id)
                module_ref.update(serializer.validated_data)
                return Response(serializer.validated_data, status=status.HTTP_200_OK)
            except FirestoreNotFoundError:
                logger.warning(f"Module {module_id} not found for course {course_id} while updating.")
                return Response({'detail': 'Module not found.'}, status=status.HTTP_404_NOT_FOUND)
            except FirestorePermissionDeniedError:
                logger.error(f"Permission denied while updating module {module_id} for course {course_id}.")
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
            except Exception as e:
                logger.error(f"Error updating module {module_id} for course {course_id}: {e}")
                return Response({'error': 'Internal server error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        course_id = self.kwargs.get('course_pk')
        module_id = self.kwargs.get('pk')
        if not course_id or not module_id:
            return Response({'error': 'Both course_id and module_id are required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            self.get_course_module_ref(course_id, module_id).delete()
            course_ref = db.collection('courses').document(course_id)
            course_ref.update({'modules': ArrayRemove([module_id])})

            return Response(status=status.HTTP_204_NO_CONTENT)
        except FirestoreNotFoundError:
            logger.warning(f"Module {module_id} not found for course {course_id} while deleting.")
            return Response({'detail': 'Module not found.'}, status=status.HTTP_404_NOT_FOUND)
        except FirestorePermissionDeniedError:
            logger.error(f"Permission denied while deleting module {module_id} for course {course_id}.")
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Error deleting module {module_id} for course {course_id}: {e}")
            return Response({'error': 'Internal server error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
