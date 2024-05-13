from django.contrib import admin
from cours.models import Cours

class CoursAdmin(admin.ModelAdmin):
    list_display = ('titre', 'formateur', 'niveau_difficulte', 'date_creation')
    list_filter = ('niveau_difficulte', 'formateur')
    search_fields = ('titre', 'description')
    list_per_page = 10

admin.site.register(Cours, CoursAdmin)