# Clean Restaurant Api

A full-stack web application for managing restaurant operations - built with .NET (backend) and Angular (frontend). The project demonstrates clean architecture principles, JWT-based authentication, role-based access control, unit and integration tests, and a deployable API + SPA structure.

---

## Table of contents

* Introduction
* Key features
* Tech stack
* Prerequisites
* Backend - setup & run
* Frontend - setup & run
* Running tests
* Test accounts
* License
* Contact

---

## Introduction

Clean Restaurant Api is a learning-focused sample application that models typical restaurant management needs - categories, menu items, user accounts, roles, and related CRUD operations.

## Key features

* RESTful API implemented in .NET
* Angular single-page application for UI
* JWT authentication and role-based authorization
* Clean/organized architecture for maintainability
* Unit and integration tests for backend and frontend
* Ready-to-run solution with separate `backend` and `frontend` folders

## Tech stack

* Backend - .NET (C#)
* Frontend - Angular (TypeScript)
* Auth - JWT (JSON Web Tokens)
* Tests - xUnit and integration tests for backend, Jasmine/Karma for frontend

## Prerequisites

* .NET SDK 8.0
* Node.js 16.x or later and npm
* Angular CLI (optional, for development)

## Backend - setup & run

```bash
* cd ~
* git clone https://github.com/Daniel-Szmelter/Clean-Restaurant-Api
* cd clean-restaurant-api/backend
* dotnet restore
* dotnet run --project CleanRestaurantApi/CleanRestaurantApi.csproj
```

## Frontend - setup & run

```bash
* cd ~/clean-restaurant-api/frontend
* npm install
* npx ng serve
* go to http://localhost:4200/
```

## Running tests

* Backend tests (xUnit):

```bash
cd ~/clean-restaurant-api/backend/cleanrestaurantapi.tests
dotnet test
```

* Frontend tests (Jasmine/Karma):

```bash
cd ~/clean-restaurant-api/frontend
ng test
```

## Test Accounts

- **Admin** (full access)
  - Email: admin@restaurant.com
  - Password: Admin123!
- **Manager** (full access excluding managing users)
  - Email: manager@restaurant.com
  - Password: Manager123!
- **User** (browse restaurants only)
  - Email: user@restaurant.com
  - Password: User123!

## License

MIT License.

## Contact

* Author - Daniel Szmelter (https://github.com/Daniel-Szmelter)

---

Thanks for checking out Clean Restaurant Api - hope this README helps you run and test the project!
