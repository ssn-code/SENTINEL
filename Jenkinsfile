pipeline {
    agent any

    environment {
        DEPLOY_PATH = '/home/cyberx-dev/SENTINEL'
        FRONTEND_WWW_PATH = '/var/www/sentinel'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Dependencies') {
            steps {
                echo 'Deploying backend source files and preparing virtual environment...'
                sh '''
                    rsync -av --no-owner --no-group --no-times --no-perms --delete \
                        --exclude='venv/' \
                        --exclude='.env' \
                        --exclude='__pycache__/' \
                        --exclude='frontend/' \
                        --exclude='.git/' \
                        --exclude='node_modules/' \
                        --exclude='dist/' \
                        ./ ${DEPLOY_PATH}/

                    if [ ! -d "${DEPLOY_PATH}/backend/venv" ]; then
                        python3 -m venv ${DEPLOY_PATH}/backend/venv
                    fi

                    ${DEPLOY_PATH}/backend/venv/bin/python3 -m pip install --upgrade pip
                    ${DEPLOY_PATH}/backend/venv/bin/python3 -m pip install -r ${DEPLOY_PATH}/backend/requirements.txt
                '''
            }
        }

        stage('Frontend Dependencies') {
            steps {
                echo 'Installing frontend dependencies using npm ci...'
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                echo 'Running TypeScript checking and linting...'
                dir('frontend') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Building frontend static assets...'
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                echo 'Deploying compiled frontend assets to web root...'
                sh '''
                    if [ -d "frontend/dist" ]; then
                        rsync -av --no-owner --no-group --delete \
                            frontend/dist/ ${FRONTEND_WWW_PATH}/
                    else
                        echo "Build output directory not found!"
                        exit 1
                    fi
                '''
            }
        }

        stage('Restart Backend') {
            steps {
                echo 'Restarting backend service...'
                sh 'sudo systemctl restart sentinel-backend.service'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
