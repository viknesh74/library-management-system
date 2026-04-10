# Smart Library

Smart Library is a modern, full-stack web application designed to digitize and streamline the operations of a college library. It provides a feature-rich platform for both students and librarians, simplifying book management, borrowing, and tracking.

## ✨ Key Features

### 👨‍💼 For Librarians (Admin Panel)

-   **Dashboard:** Get a quick overview of library statistics, including total books, issued books, overdue items, and registered students.
-   **Book Management:** Easily add, edit, delete, and manage copies of books in the library's collection.
-   **Request Management:** Approve or reject book borrowing requests from students.
-   **Transaction Tracking:** View all active, overdue, and returned book transactions.
-   **Student Management:** View a list of all registered students and their borrowing history.
-   **Reporting & Analytics:** Access insightful reports on book popularity, student activity, and category breakdowns with visual charts.
-   **Question Paper Hub:** Upload, manage, and delete university question papers for students to access.

### 🎓 For Students

-   **Personalized Dashboard:** See your currently issued books, overdue alerts, and recently added books at a glance.
-   **Book Search:** A powerful and intuitive search to browse the entire library collection with category filters.
-   **Borrowing System:** Request available books or join a waitlist for unavailable ones.
-   **My Books & History:** Keep track of your currently borrowed books, due dates, and view your complete borrowing history.
-   **Question Papers:** Access and view model question papers uploaded by the library, organized by semester.
-   **Profile Management:** View your personal details and borrowing statistics.
-   **Motivational Content:** A dedicated section with curated videos to inspire and motivate students.

## 🛠️ Tech Stack

-   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
-   **Backend:** Node.js, Express.js
-   **Database:** MySQL
-   **Authentication:** JWT (JSON Web Tokens), bcrypt.js for password hashing
-   **File Uploads:** Multer
-   **Charting:** Chart.js

## 🚀 Project Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd library-demo
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root directory (`d:\library(demo)\`) and add the following variables.

    ```env
    # JWT Secret Key
    JWT_SECRET=super_secret_smart_library_key

    # MySQL Database Connection
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_DATABASE=smart_library
    ```

4.  **Create the MySQL Database:**
    Make sure you have MySQL server running. Create a database named `smart_library`.

    ```sql
    CREATE DATABASE smart_library;
    ```

5.  **Start the server:**
    The server will automatically create the necessary tables and seed initial data on the first run.

    ```bash
    node server.js
    ```

6.  **Open the application:**
    Open your web browser and navigate to `http://localhost:8080`.

## 🔑 Demo Credentials

You can use these pre-seeded accounts to test the application:

-   **Librarian / Admin:**
    -   **Email:** `admin@library.edu`
    -   **Password:** `Admin@123`

-   **Student:**
    -   **Email:** `student@demo.edu`
    -   **Password:** `Student@123`