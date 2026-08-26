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
                    # Synchronize the backend directory from workspace to target deployment path, 
                    # ensuring that venv, .env, and cache files are NOT overwritten or deleted.
                    rsync -av --delete \
                        --exclude='venv/' \
                        --exclude='.env' \
                        --exclude='__pycache__/' \
                        --exclude='frontend/' \
                        --exclude='.git/' \
                        --exclude='node_modules/' \
                        --exclude='dist/' \
                        ./ ${DEPLOY_PATH}/

                    # Ensure target virtualenv exists
                    if [ ! -d "${DEPLOY_PATH}/backend/venv" ]; then
                        python3 -m venv ${DEPLOY_PATH}/backend/venv
                    fi

                    # Update pip and dependencies
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
                // Build has succeeded in the workspace. Deploy the build output.
                sh '''
                    if [ -d "frontend/dist" ]; then
                        rsync -av --delete frontend/dist/ ${FRONTEND_WWW_PATH}/
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
