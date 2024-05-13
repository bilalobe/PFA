from django.test import TestCase
from module.models import Module
from module.views import ModuleDetailViewSet
from module.serializers import ModuleDetailSerializer

class ModuleDetailViewTestCase(TestCase):

    def setUp(self):
        self.module = Module.objects.create(
            titre="Module de test",
            contenu="Contenu du module de test",
            cours_id=1,
            ordre=1,
            type="video",
            duree_estimee=60
        )

    def test_get_module_detail(self):
        request = self.client.get(f'/api/modules/{self.module.id}/')
        response = request.content
        serializer = ModuleDetailSerializer(self.module)
        self.assertEqual(response, serializer.data)