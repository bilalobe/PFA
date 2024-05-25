      
# PFA - Plateforme d'apprentissage en ligne

## Introduction

Ce projet est une plateforme d'apprentissage en ligne développée avec Django pour le backend et React pour le frontend. 

## Fonctionnalités

* **Gestion des utilisateurs:** Inscription, connexion, modification de profil.
* **Gestion des cours:** Création, modification, suppression de cours.
* **Gestion des modules:** Création, modification, suppression de modules.
* **API REST:** Une API REST permettant d'interagir avec les données du backend.
* **Interface utilisateur (frontend):** Une interface utilisateur React interactive pour accéder aux données et aux fonctionnalités de la plateforme.

## Installation et utilisation

### Prérequis

* Python 3.9 ou supérieur
* Node.js et npm
* Un environnement virtuel (recommandé)

### Installation

1. Cloner le dépôt :

   ```bash
   git clone https://github.com/bilalobe/PFA.git

    

Use code with caution.Markdown

    Créer un environnement virtuel (optionnel) :

          
    python -m venv env

        

Use code with caution.Bash

Activer l'environnement virtuel :

    Windows :

          
    env\Scripts\activate

        


Linux/macOS :

      
source env/bin/activate

    
Installer les dépendances :

      
pip install -r requirements.txt

    
Créer la base de données et les tables :

      
python manage.py makemigrations
python manage.py migrate

    
Créer un superutilisateur :

      
python manage.py createsuperuser

    

Démarrer le serveur de développement

    Backend:

          
    python manage.py runserver_modwsgi --settings=dj_ango.settings

        

Use code with caution.Bash

Frontend:

    Naviguer jusqu'au dossier backend/frontend/front:

          
    cd backend/frontend/front

        

Use code with caution.Bash

Lancer le serveur de développement React:

      
npm start

    

        Use code with caution.Bash

Déploiement

Pour déployer votre application en production, vous aurez besoin d'un serveur web. Vous pouvez utiliser des services d'hébergement comme Heroku, AWS Elastic Beanstalk ou Google App Engine.
Licence

Ce projet est sous licence [Nom de la licence] - Voir le fichier LICENSE pour plus de détails.
Contributeurs

    [Votre nom]

Remerciements

Merci à [Noms des personnes ou des organisations qui ont aidé] pour leur contribution à ce projet.

      
**N'oubliez pas de remplacer les éléments entre crochets (par exemple, "[Nom de la licence]") par les informations correctes pour votre projet.**

**Conseils:**

* **Ajoutez des captures d'écran ou des images** pour rendre votre `README` plus attractif.
* **Décrivez en détail les fonctionnalités** de votre plateforme.
* **Ajoutez des instructions pour les développeurs** sur la façon de contribuer au projet.
* **Indiquez les technologies utilisées** dans le projet.


    