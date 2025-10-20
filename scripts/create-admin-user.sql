-- This is a MongoDB script to create an admin user
-- Run this in MongoDB Compass or MongoDB shell

-- First, connect to your MongoDB database
-- Then run this script to create an admin user

-- Note: Replace the email and password with your desired admin credentials
-- The password will be hashed automatically by the application

-- Example admin user creation (this would be done through the API or directly in MongoDB)
-- You can create an admin user by:
-- 1. Registering a normal user through the signup form
-- 2. Then manually updating their role in MongoDB to 'admin'

-- MongoDB command to update a user's role to admin:
-- db.users.updateOne(
--   { email: "admin@setmediastudio.com" },
--   { $set: { role: "admin" } }
-- )

-- Or you can insert an admin user directly:
-- db.users.insertOne({
--   name: "Admin User",
--   email: "admin@setmediastudio.com",
--   password: "$2a$12$hashedPasswordHere", // Use bcrypt to hash the password
--   role: "admin",
--   provider: "credentials",
--   createdAt: new Date(),
--   updatedAt: new Date()
-- })
