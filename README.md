      
# PFA - Your Personalized E-Learning Adventure 🚀

**PFA** is an open-source e-learning platform built with **Django** (backend) and **React** (frontend). It empowers both learners and educators to create, share, and engage in a dynamic learning experience.

## ✨ Features That Spark Curiosity

* **Tailored Learning:** Discover courses that match your interests and skills.
* **Interactive Modules:** Dive into content with engaging videos, quizzes, and resources.
* **Expertly Crafted Courses:** Explore a growing library of courses crafted by passionate educators.
* **Connect and Collaborate:** Join vibrant discussions in our forum and connect with fellow learners.
* **Track Your Progress:**  Monitor your learning journey and celebrate your achievements. 

## 🚀 Launch Your Learning Journey

### Prerequisites

* Python 3.9 or higher
* Node.js and npm
* PostgreSQL (highly recommended)
* A virtual environment (recommended)

Installation

 

    Clone the repository:

    git clone https://github.com/bilalobe/PFA.git  
    cd PFA  

 
2. Create and activate a virtual environment:

- **Windows:**  
    ```bash  
    python -m venv env  
    env\Scripts\activate  
    ```  

- **Linux/macOS:**  
    ```bash  
    python3 -m venv env  
    source env/bin/activate  
    ```  

 
3. Install dependencies:

```bash  
pip install -r requirements.txt  
cd frontend  
npm install  
cd ..  
```  

 
4. Set up your database:

- Create a PostgreSQL database (e.g., use the `createdb` command or a GUI tool like pgAdmin)  

    ```bash  
    createdb eplatform  
    ```  

- Update database settings in `backend/dj_ango/settings.py`:  

    ```python  
    DATABASES = {  
        'default': {  
            'ENGINE': 'django.db.backends.postgresql',  
            'NAME': 'eplatform',  
            'USER': 'your_database_user',  
            'PASSWORD': 'your_database_password',  
            'HOST': 'localhost',  
            'PORT': '5432',  
        }  
    }  
    ```  

 
5. Apply migrations:

```bash  
python manage.py makemigrations  
python manage.py migrate  
```  

 
6. Create a superuser account:

```bash  
python manage.py createsuperuser  
```  

 
7. Start the development servers:

- **Backend:**  

    ```bash  
    python manage.py runserver  
    ```  

- **Frontend:**  
    Open a new terminal window and run:  

    ```bash  
    cd frontend  
    npm start  
    ```  

 
8. Access your platform:
Open your web browser and visit http://localhost:8000/ (or the port specified by your backend server).

 
🛠️ Technologies Powering PFA

 

    Backend: Django, Django REST Framework, PostgreSQL
    Frontend: React, Material-UI, Redux
    Deployment: Docker, Heroku, AWS, or other cloud platforms


🤝 Contribute to the Future of Learning

We welcome contributions from passionate developers, designers, and educators! Whether you're fixing bugs, adding new features, or improving documentation, your contributions are valuable.

Fork the repository, create a branch, make your changes, and submit a pull request. Let's make PFA an even better learning experience together!
📄 'LICENSE'

This project is licensed under the MIT License.

Made with ❤️
