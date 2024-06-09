# PFA - Your Personalized E-Learning Adventure 🚀

PFA is an open-source e-learning platform built with Django (backend) and React (frontend). It empowers both learners and educators to create, share, and engage in a dynamic learning experience.
  
## ✨ Features That Spark _Curiosity_  
  
- **Tailored Learning:** Discover courses that match your interests and skills.  
- **Interactive Modules:** Dive into content with engaging videos, quizzes, and resources.  
- **Expertly Crafted Courses:** Explore a growing library of courses crafted by passionate educators.  
- **Connect and Collaborate:** Join vibrant discussions in our forum and connect with fellow learners.  
- **Track Your Progress:** Monitor your learning journey and celebrate your achievements.  
- **AI-Powered Enhancements:** Experience a smarter learning experience with integrated AI features (under development).

## 🚀 Launch Your Learning Journey  
  
### Prerequisites  
  
- Python 3.9 or higher  
- Node.js and npm  
- PostgreSQL (highly recommended)  
- A virtual environment (recommended)  

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/bilalobe/PFA.git  
    cd PFA
    ```

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
    - Create a PostgreSQL database (e.g., use the `createdb` command or a GUI tool like pgAdmin):
        ```bash
        createdb eplatform
        ```
    - Update database settings in `backend/django/settings.py`:
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
    Open your web browser and visit [http://localhost:8000/](http://localhost:8000/) (or the port specified by your backend server).


  
## 🛠️ Technologies Powering PFA

### Backend:

- **Django:** A high-level Python web framework known for its speed, security, and scalability.
  - Features:
    - Object-Relational Mapper (ORM): Easy database interactions.
    - Admin Interface: Powerful data management.
    - Templating Engine: Dynamic HTML rendering.
    - Security: Protection against vulnerabilities.

- **Django REST Framework (DRF):** A powerful toolkit for building REST APIs with Django.
  - Features:
    - Serializers: Data conversion between Python and JSON.
    - ViewSets: Simplified API view creation.
    - Authentication & Permissions: Control API access.
    - API Documentation: Generate browsable API documentation (using drf_spectacular).

- **PostgreSQL:** A robust open-source relational database for data persistence.
  - Features:
    - ACID Compliant: Data validity and consistency.
    - Advanced Data Types: JSON, arrays, etc.
    - Scalability & Performance: Handles large datasets.

- **Celery:** A distributed task queue for running background tasks.
- **Waitress:** A pure-Python WSGI server suitable for production deployments, especially on Windows.
- **Redis:** An in-memory data store used as a cache and message broker for performance enhancement.
- **Sentry:** A real-time error tracking system.
- **TextBlob:** A Python library for natural language processing (NLP), used for sentiment analysis and other AI-powered features.

### Frontend:

- **Next.js:** A React framework for building server-rendered and static web applications.
  - Features:
    - Server-Side Rendering: Improved SEO and performance.
    - Static Site Generation: Faster load times and better scalability.
    - API Routes: Built-in API endpoint handling.
    - File-Based Routing: Easy and intuitive routing.

- **React:** A popular JavaScript library for building user interfaces.
  - Features:
    - Virtual DOM: Efficient updates for better performance.
    - JSX: Write HTML-like syntax in JavaScript.
    - Component-Based: Build reusable UI elements.

- **Material-UI:** A React UI component library based on Google's Material Design.
  - Features:
    - Ready-to-use and Customizable Components: Buttons, cards, dialogs, etc.
    - Accessibility: Components designed for accessibility.

- **Tailwind CSS:** A utility-first CSS framework for styling.
- **Redux Toolkit:** A state management library for JavaScript applications (simplifies Redux development).
  - Features:
    - createSlice: Simplifies reducer creation.
    - createAsyncThunk: Makes handling asynchronous actions easier.

- **Axios:** A JavaScript library for making HTTP requests to interact with the Django API.
- **Socket.IO:** A library for real-time, bidirectional communication (used for chat).

### Development Tools:

- **Postman:** A tool for testing and interacting with APIs.
- **VS Code:** A popular code editor.
- **Git:** A version control system.
- **Docker:** A containerization platform for consistent deployments.

## 🤝 Contribute to the Future of Learning

We welcome contributions from passionate developers, designers, and educators! Whether you're fixing bugs, adding new features, or improving documentation, your contributions are valuable.

Fork the repository, create a branch, make your changes, and submit a pull request. Let's make PFA an even better learning experience together!

## 📄 License

This project is licensed under the MIT License.

Made with ❤️
