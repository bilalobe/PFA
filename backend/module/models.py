from django.db import models

class Module(models.Model):
    titre = models.CharField(max_length=255)
    contenu = models.TextField()
    cours = models.ForeignKey('cours.Cours', on_delete=models.CASCADE, related_name="modules")    
    ordre = models.IntegerField()
    type = models.CharField(max_length=50, choices=(('video', 'Vidéo'), ('texte', 'Texte'), ('quiz', 'Quiz'), ('exercice', 'Exercice')))
    duree_estimee = models.IntegerField(blank=True, null=True)  # En minutes

    def __str__(self):
        return self.titre
