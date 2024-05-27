# PFA - Plateforme d'apprentissage en ligne

## Introduction

PFA (Plateforme d'apprentissage en ligne) est une plateforme d'apprentissage en ligne développée avec Django pour le backend et React pour le frontend.

## Fonctionnalités

* **Gestion des utilisateurs:** Les utilisateurs peuvent s'inscrire, se connecter, modifier leur profil et récupérer leur mot de passe en cas de perte.
* **Gestion des cours:** Les administrateurs peuvent créer, modifier, supprimer des cours, et les utilisateurs peuvent les consulter et les suivre.
* **Gestion des modules:** Les cours sont divisés en modules qui peuvent également être créés, modifiés et supprimés par les administrateurs.
* **Système de quiz:** Chaque module peut inclure des quiz pour évaluer les connaissances des utilisateurs sur le sujet étudié.
* **Suivi des progrès:** Les utilisateurs peuvent suivre leurs progrès au travers des cours et des modules, et voir leurs scores de quiz.
* **API REST:** Une API REST permet d'interagir avec les données du backend, facilitant l'intégration avec d'autres systèmes ou applications.
* **Interface utilisateur:** L'interface utilisateur est construite avec React pour offrir une expérience utilisateur réactive et interactive.
* **Forum:** Les utilisateurs peuvent discuter des cours et des modules dans un forum intégré.

## Installation et utilisation

### Prérequis

* Python 3.9 ou supérieur
* Node.js et npm
* Un environnement virtuel (recommandé)

### Installation

1. **Cloner le dépôt :**

    ```bash
    git clone https://github.com/bilalobe/PFA.git
    ```

2. **Créer un environnement virtuel (optionnel) :**

    ```bash
    python -m venv env
    ```

3. **Activer l'environnement virtuel :**

    Windows :
    
    ```bash
    env\Scripts\activate
    ```

    Linux/macOS :
    
    ```bash
    source env/bin/activate
    ```

4. **Installer les dépendances :**

    ```bash
    pip install -r requirements.txt
    ```

5. **Créer la base de données et les tables :**

    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

6. **Créer un superutilisateur :**

    ```bash
    python manage.py createsuperuser
    ```

7. **Démarrer le serveur de développement Backend :**

    ```bash
    python run_waitress.py
    ```

8. **Démarrer le serveur de développement Frontend :**

    Naviguer jusqu'au dossier `frontend` :

    ```bash
    cd frontend
    ```

    Lancer le serveur de développement React :

    ```bash
    npm install  # Installer les dépendances npm
    npm start
    ```

### Déploiement

Pour déployer votre application en production, vous aurez besoin d'un serveur web. Vous pouvez utiliser des services d'hébergement comme Heroku, AWS Elastic Beanstalk ou Google App Engine. Ces services fournissent des documentations détaillées pour le déploiement de projets Django.

### Instructions pour les Développeurs

1. **Fork le dépôt** :
   - Cliquez sur "Fork" en haut à droite de la page pour créer votre propre copie du dépôt.

2. **Cloner votre fork** :
    ```bash
    git clone https://github.com/bilalobe/PFA.git
    ```

3. **Créer une branche pour vos modifications** :
    ```bash
    git checkout -b ma-branche-modifications
    ```

4. **Faire vos modifications et les committer** :
    ```bash
    git add .
    git commit -m "Description des modifications"
    ```

5. **Pousser vos modifications vers votre fork** :
    ```bash
    git push origin ma-branche-modifications
    ```

6. **Créer une Pull Request** :
   - Retournez sur le dépôt original et cliquez sur "New Pull Request" pour soumettre vos modifications.

### Technologies Utilisées

* **Backend**:
    - Django: Framework web pour le développement du backend.
    - Django REST framework: Création d'APIs RESTful.
    - PostgreSQL: Base de données relationnelle utilisée pour stocker les données de l'application.
    - Waitress: Serveur WSGI utilisé pour servir l'application.

* **Frontend**:
    - React: Bibliothèque JavaScript pour la construction des interfaces utilisateur.
    - Tailwind CSS: Framework de design CSS utility-first pour un stylisage rapide et modulable.
    - Sass: Préprocesseur CSS pour une gestion plus avancée des styles.

* **Outils de déploiement**:
    - Docker: Conteneurisation de l'application pour garantir un environnement de développement et de production cohérent.
    - Docker Compose: Outil pour définir et gérer des applications multi-conteneurs Docker.

### Licence

Ce projet est sous licence [Nom de la licence] - Voir le fichier LICENSE pour plus de détails.

## Contributeurs

Made with ❤ 


## Remerciements

Merci aux encadrants pour leur contribution à ce projet.

---

