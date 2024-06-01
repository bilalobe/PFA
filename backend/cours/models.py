from django.db import models
from user.models import User


class Cours(models.Model):
    titre = models.CharField(max_length=255)
    description = models.TextField()
    niveau_difficulte = models.CharField(
        max_length=50,
        choices=(
            ("debutant", "Débutant"),
            ("intermediaire", "Intermédiaire"),
            ("avance", "Avancé"),
        ),
    )
    formateur = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="cours_formateur",
        limit_choices_to={"role": "formateur"},
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to="cours_images/", blank=True, null=True)

    def __str__(self):

        return f"{self.titre} par {User.objects.get(pk=self.formateur_id)}"
