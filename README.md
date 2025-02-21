# Trello-Style Project Management System

This repository houses the source code to a Flask Web-Based Kanban-Style Project Management System that strives to give maximize the user's productivity and efficiency while facilitating project management with their team. The tech stack of this application is presented below.

**Note:** This is an academic project for the <a href="https://reg.msu.edu/courses/Search.aspx?CourseID=362555#Results">CSE 477</a> undergraduate course offered at Michigan State University.

**Front-End:**
* HTML
* CSS
* JavaScript

**Back-End:**
* Flask (Python)
* MySQL
* WebSocket

**Deployment:**
* Docker
* Google Cloud

<br>

**Final Product** - Click <a href="https://exam-741345158506.us-central1.run.app/home" target="_blank">here</a> to view the latest version application.

## Debugging With Docker

<br>

**1.** Clone this repository into your local machine using the following command in your bash terminal:

```bash
git clone https://github.com/Shan-234/Project-Management-System.git
```

<br>

**2.** Navigate to the repository in your local machine and run the following command:

```bash
docker-compose -f docker-compose.yml -p final_exam-container_flask-app up
```

<br>

**3.** Start **Docker Desktop** on your machine and run the container named `chat-app-container`.

**4.** Select the hyperlink to navigate to the hosting port of the application. For example, if the hosting port is `PORT:8080`, navigate to the following URL in your browser: `http://localhost:8080/home`.

## Acknowledgements

* **Dr. Mohammad M. Ghassemi**: Assistant Professor at Michigan State University, Department of Computer Science and Engineering.