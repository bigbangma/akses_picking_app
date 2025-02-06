# Picking App Dockerization

## Overview

The Picking App is a dashboard application built with Next.js 15. It connects to Odoo via API to handle POS internal transfers in a simpler manner. This application is designed for employees working as storekeepers, allowing them to manage POS internal transfers and ship available quantities efficiently.

## Features

- Dashboard interface for managing POS internal transfers
- Integration with Odoo via API
- Simplified workflow for storekeepers
- Real-time updates and notifications

## Prerequisites

- Docker
- Docker Compose

## Clone the repository:

```
git clone https://github.com/bigbangma/akses-picking-app.git ./picking-app
cd picking-app
```

Project Structure

```
/home/whybe/BigBang/dev/AKSES/
├── picking-app/
│   ├── .dockerignore
│   ├── .env
│   ├── compose.example.yml
│   ├── dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── public/
│   ├── next.config.ts
│   └── ...
├── compose.yml
└── ...
```

## Environment Variables

The application relies on the following environment variables, which should be defined in a `.env` file:

```properties
NEXT_PUBLIC_BACKEND_API=""
NEXT_PUBLIC_BACKEND_AUTH=""
```

## Docker Production Setup

### [Dockerfile](dockerfile)

The Dockerfile is set up to use multi-stage builds to create a smaller final image. It first installs dependencies and builds the Next.js application in the `builder` stage, then copies the necessary files to the `runner` stage, installing only production dependencies and starting the application.

### [.dockerignore](.dockerignore)

The `dockerignore`  file is configured to exclude unnecessary files and directories from the Docker build context, reducing the build context size and keeping the Docker image clean.

### [docker-compose.yml](compose.example.yml)

The `compose.example.yml` file provides an example configuration alongside the application's required services, including the `picking-app` service. It also ensures that the necessary environment variables and volumes are set up correctly.

## Summary

- Dockerfile: Uses multi-stage builds to create a smaller final image, ensuring that only production dependencies are installed in the final image.
- **.dockerignore**: Excludes unnecessary files and directories from the Docker build context.
- **.env: Contains environment variables required by the Next.js application.
- **docker-compose.yml**: Defines the services required for the application, including the service, and ensures that the necessary environment variables and volumes are set up correctly.
- **compose.example.yml**: Provides an example configuration for the service.

## Conclusion

This setup ensures that the Picking App is correctly built and run in a production environment using Docker and Docker Compose. The application is designed to simplify the workflow for storekeepers, allowing them to manage POS internal transfers efficiently.

> [!TIP]
> You can name your docker file any name as far as you explicitly define it in the context build of the `docker-cmpose.yml` file


> [!WARNING]  
> Watch for the docker files extensions, sometimes the <kbd>yml</kbd> and <kbd>yaml</kbd> confuses, but both work well , EXCEPT THEY CONFUSE