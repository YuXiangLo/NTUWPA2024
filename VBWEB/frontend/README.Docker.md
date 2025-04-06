# Docker README for Frontend Application

This README provides step-by-step instructions to build and run the Docker container for the frontend application located in `VBWEB/frontend/`.

## Prerequisites

- [Docker](https://www.docker.com/) must be installed on your system.
- Basic knowledge of using the command-line interface.

## Directory Structure

Ensure your project repository includes the following structure:

```
VBWEB/
└── frontend/
    └── (Dockerfile and other necessary files)
```

*Note: The Dockerfile must be located in the `VBWEB/frontend/` directory.*

## Build Instructions

1. Open your terminal.
2. Navigate to the frontend directory:

   ```
   cd VBWEB/frontend/
   ```

3. Build the Docker image with the tag `frontend-app`:

   ```
   docker build -t frontend-app .
   ```

## Run Instructions

After building the image, run the container with the following command:

```
docker run -d -p 5173:5173 --name frontend-container frontend-app
```

- **-d**: Runs the container in detached mode.
- **-p 5173:5173**: Maps port 5173 of the container to port 5173 on the host machine.
- **--name frontend-container**: Names the container `frontend-container`.
- **frontend-app**: Specifies the Docker image to run.

## Managing the Container

- **View logs:**

  ```
  docker logs frontend-container
  ```

- **Stop the container:**

  ```
  docker stop frontend-container
  ```

- **Remove the container:**

  ```
  docker rm frontend-container
  ```

## Additional Information

For more details on Docker commands and options, refer to the [official Docker documentation](https://docs.docker.com/).

Happy Dockering!