# Fastify MongoDB API

This is a Fastify-based API project with MongoDB as the database, featuring user authentication and version management capabilities.

## Limited Feature When Using /versions/v2/detail
- when you store the splitted apk , you must store on the folder name same as appName you stored on versions mongodb data
for Example:
i use myApp store on versions mongodb data
and then i store the entire abi on https://yourServer/downloads/myApp/

https://yourServer/downloads is location i store my public assets

## Features
- **User Management**
  - Register, login, and manage users.
  - Support for admin and user roles.
  - Role-based access control.
- **Version Management**
  - CRUD operations for app versions.
  - Maintain changelogs and download links for versions.
- **Enroll Management**
  - CRUD operations for app versions.
  - Analityc Feature.
- **Authentication**
  - JSON Web Token (JWT)-based authentication.
- **Security**
  - Optional SSL support.

## Project Structure
```
├── src
│   ├── models
│   │   ├── UserModel.js       # User schema and pre-save password hashing
│   │   └── VersionModel.js    # Version schema
|   |   └── EnrollModel.js     # Enroll schema for store and analityc purpose
│   ├── routes
│   │   ├── authRoutes.js      # User-related routes
│   │   └── versionRoutes.js   # Version-related routes
|   |   └── enrollRoutes.js    # Enroll schema for store and analityc purpose
│   └── utils
│       └── createAdmin.js     # Utility to create admin users
└── app.js                   # Main entry point
```

## Setup Instructions

### Prerequisites
- Node.js (v20 or above)
- MongoDB instance
- Environment file (.env)

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
MONGO_URI=<Your MongoDB URI>
JWT_SECRET=<Your JWT Secret>
PORT=<Port Number>
USE_SSL=<true/false>
BASE_FILE_SERVER_URL=<Your File Server Stored>
```

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Optional: Enable SSL
- Place your SSL certificates in the specified paths:
  - `/home/nodeapp/cert/private.key`
  - `/home/nodeapp/cert/certificate.crt`
  - `/home/nodeapp/cert/ca_bundle.crt`

- Set `USE_SSL=true` in `.env`.

## Endpoints

### Authentication Routes
| Method | Endpoint          | Description                        | Authentication |
|--------|-------------------|------------------------------------|----------------|
| POST   | `/register`       | Register a new user               | No             |
| POST   | `/login`          | Login and retrieve a JWT token    | No             |
| POST   | `/create-admin`   | Create an admin user              | No             |
| PUT    | `/users/:id/role` | Update user role                  | Admin          |
| DELETE | `/users/:id`      | Delete a user                     | Admin          |

### Enroll Routes
| Method | Endpoint                    | Description                       | Authentication |
|--------|-----------------------------|-----------------------------------|----------------|
| POST   | `/enroll`                   | Register a new user               | No             |
| GET    | `/enroll/analityc`          | Login and retrieve a JWT token    | No             |

### Version Routes
| Method | Endpoint             | Description                         | Authentication |
|--------|-------------------   |------------------------------------ |----------------|
| GET    | `/versions`          | Retrieve all versions               | No             |
| GET    | `/versions/detail`   | Retrieve version by app name        | No             |
| GET    | `/versions/v2/detail`| Retrieve version by app name v2     | No             |
| POST   | `/versions`          | Add a new version                   | Admin          |
| PUT    | `/versions/:id`      | Update version details              | Admin          |
| DELETE | `/versions/:id`      | Delete a version                    | Admin          |

## Running Tests
- Add test cases using a testing framework like Mocha or Jest.
- Run tests:
  ```bash
  npm test
  ```

## License
This project is licensed under the MIT License.

