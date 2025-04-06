# Docker README for Backend Application

This README provides step-by-step instructions to build and run the Docker container for the backend application located in `VBWEB/backend/`.

## Prerequisites

- [Docker](https://www.docker.com/) must be installed on your system.
- Ensure that the `.env` file is present in the `VBWEB/backend/` directory before building the image.
- Basic knowledge of using the command-line interface.

## Directory Structure

Ensure your project repository includes the following structure:

```
VBWEB/
└── backend/
    ├── .env        # Environment configuration file (must exist before building)
    ├── Dockerfile  # Dockerfile for building the image
    └── (other necessary files)
```

## Build Instructions

1. Open your terminal.
2. Navigate to the backend directory:

   ```
   cd VBWEB/backend/
   ```

3. Verify that the `.env` file exists in the current directory.
4. Build the Docker image with the tag `backend-app`:

   ```
   docker build -t backend-app .
   ```

## Run Instructions

After successfully building the image, run the container with the following command:

```
docker run -d -p 3000:3000 --name backend-container backend-app
```

- **-d**: Runs the container in detached mode.
- **-p 3000:3000**: Maps port 3000 of the container to port 3000 on the host machine.
- **--name backend-container**: Names the container `backend-container`.
- **backend-app**: Specifies the Docker image to run.

## Managing the Container

- **View logs:**

  ```
  docker logs backend-container
  ```

- **Stop the container:**

  ```
  docker stop backend-container
  ```

- **Remove the container:**

  ```
  docker rm backend-container
  ```

## Additional Information

For more details on Docker commands and options, refer to the [official Docker documentation](https://docs.docker.com/).

Happy Dockering!