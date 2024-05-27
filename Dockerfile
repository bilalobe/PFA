# Use the official Python image as the base image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the project files
COPY . /app/

# Add a non-root user
RUN adduser --disabled-password --no-create-home djangouser
USER djangouser

# Expose the application on port 8000
EXPOSE 8000

# Start the application with Waitress
CMD ["waitress-serve", "--port=8000", "dj_ango.wsgi:application"]
