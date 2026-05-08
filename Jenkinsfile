pipeline {
    agent any

    environment {
        EC2_IP = "3.104.2.196"
        FRONTEND_IMAGE = "frontend"
        BACKEND_IMAGE = "backend"
        COMPOSE_FILE = "docker-compose.yml"
        GIT_REPO = "https://github.com/askmuhammadtayyab786-max/user-logs-monitor.git"
    }

    stages {

        stage('Clone Repository') {
            steps {
                echo '📥 Cloning repository...'
                git branch: 'main',
                    url: "${GIT_REPO}"
            }
        }

        stage('Stop & Remove Running Containers') {
            steps {
                echo '🛑 Stopping existing containers...'
                sh '''
                    docker-compose down --remove-orphans || true
                    docker rm -f frontend backend mongo || true
                '''
            }
        }

        stage('Remove Old Images') {
            steps {
                echo '🗑️ Removing old images...'
                sh '''
                    docker rmi -f frontend backend || true
                '''
            }
        }

        stage('Update Backend API URL in Frontend') {
            steps {
                echo '🔧 Injecting EC2 IP into frontend...'
                sh '''
                    sed -i 's|http://[0-9.]*:4000/api|http://${EC2_IP}:4000/api|g' frontend/src/App.jsx
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                echo '🔨 Building backend Docker image...'
                sh '''
                    docker build -t backend ./backend
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo '🔨 Building frontend Docker image...'
                sh '''
                    docker build -t frontend ./frontend
                '''
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                echo '🚀 Deploying all containers...'
                sh '''
                    docker-compose up -d
                '''
            }
        }

        stage('Verify Running Containers') {
            steps {
                echo '✅ Verifying containers are running...'
                sh '''
                    sleep 5
                    docker ps
                '''
            }
        }
    }

    post {
        success {
            echo '''
            ✅ DEPLOYMENT SUCCESSFUL!
            Frontend : http://3.104.2.196:3000
            Backend  : http://3.104.2.196:4000
            '''
        }
        failure {
            echo '❌ DEPLOYMENT FAILED — check logs above'
            sh 'docker-compose logs --tail=50 || true'
        }
        always {
            echo '🧹 Pipeline finished.'
        }
    }
}
