# Expense Tracker

A simple web application built with Express.js for users to track expenses.

This project is Live on: https://sleepy-cliffs-84117.herokuapp.com/

## Features

- Register, login and logout an account
- Facebook login
- View all expenses
- Show total amount of expenses
- Filter expenses by category and month
- Add an expense
- Edit an expense
- Delete an expense

![Home page](/public/photos/index.png)
![Login page](/public/photos/login.png)
![Register page](/public/photos/register.png)

## Prerequisites & Packages

- Node.js v14.15.1
- Express
- Express-handlebars
- mongoDB Community Server
- mongoose
- body-parser
- bcryptjs
- connect-flash
- dotenv
- express-session
- method-override
- passport
- passport-facebook
- passport-local

## Installation

#### Clone the source locally

```
$ git clone https://github.com/ivyhungtw/expense-tracker.git
$ cd expense-tracker
```

#### Install project dependencies

```
npm install
```

#### Import seed data

```
npm run seed
```

#### Start the app

```
npm run dev
```

The server will start running on

- http://localhost:3000/
