# Expense Tracker

A simple web application built with Express.js for users to track expenses.

This project is Live on: https://sleepy-cliffs-84117.herokuapp.com/
You can use the test account below or register an account to login.

```
email: user1@example.com/user2@example.com
password: 12345678
```

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

#### Add .env file and fill out the information

```
FACEBOOK_ID=<Your Facebook app ID>
FACEBOOK_SECRET=<Your Facebook app secret>
FACEBOOK_CALLBACK=http://localhost:3000/auth/facebook/callback
SESSION_SECRET=ThisIsMySecret
MONGODB_URI=mongodb://localhost/todo-list
PORT=3000
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
