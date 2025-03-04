Fraud Detection with AI Algorithms

Overview

This project is a fraud detection system that leverages machine learning algorithms to analyze data and determine the likelihood of fraudulent activities. The system provides a dashboard that visualizes data insights and presents fraud detection results based on four different algorithms:

Random Forest

K-Nearest Neighbors (KNN)

XGBoost

Voting Classifier

Additionally, the dashboard displays the accuracy of each algorithm, allowing users to compare their performance.

Technology Stack

Backend: Laravel (PHP Framework)

Machine Learning Algorithms: Python (using Scikit-learn, XGBoost, and other relevant libraries)

Frontend: Next.js (React Framework)

Features

Fraud detection using multiple AI algorithms

Visualization of fraud likelihood and accuracy metrics

User-friendly dashboard for data analysis

Backend API to handle data processing and model predictions

Scalability for handling large datasets

Installation & Setup

Backend (Laravel)

Clone the repository:

git clone https://github.com/benyamin-mashkoorzadeh/fraud-detection.git
cd fraud-detection/backend

Install dependencies:

composer install

Configure the .env file and set up the database.

Run database migrations:

php artisan migrate

Start the Laravel server:

php artisan serve

Frontend (Next.js)

Navigate to the frontend directory:

cd fraud-detection/frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Usage

Open the frontend in the browser (http://localhost:3000).

Upload or input the dataset.

Run fraud detection analysis.

View the results and algorithm accuracy on the dashboard.

Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue for improvements.

License

This project is licensed under the MIT License. See the LICENSE file for details.
