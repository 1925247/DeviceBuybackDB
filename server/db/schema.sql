-- SQLite Database Schema for Device Buyback System  

-- Table for Users  
CREATE TABLE Users (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    username TEXT NOT NULL UNIQUE,  
    password TEXT NOT NULL,  
    email TEXT NOT NULL UNIQUE,  
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP  
);  

-- Table for Categories  
CREATE TABLE Categories (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    name TEXT NOT NULL UNIQUE,  
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP  
);  

-- Table for Brands  
CREATE TABLE Brands (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    name TEXT NOT NULL UNIQUE,  
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP  
);  

-- Table for Models  
CREATE TABLE Models (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    name TEXT NOT NULL,  
    brand_id INTEGER,  
    category_id INTEGER,  
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  
    FOREIGN KEY (brand_id) REFERENCES Brands(id),  
    FOREIGN KEY (category_id) REFERENCES Categories(id)  
);  

-- Table for Questions  
CREATE TABLE Questions (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    content TEXT NOT NULL,  
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP  
);  

-- Table for Orders  
CREATE TABLE Orders (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    user_id INTEGER,  
    model_id INTEGER,  
    order_status TEXT NOT NULL,  
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  
    FOREIGN KEY (user_id) REFERENCES Users(id),  
    FOREIGN KEY (model_id) REFERENCES Models(id)  
);  

-- Table for Agents  
CREATE TABLE Agents (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    name TEXT NOT NULL,  
    email TEXT NOT NULL UNIQUE,  
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP  
);  

-- Example table for Answers to Questions (optional)  
CREATE TABLE Answers (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    question_id INTEGER,  
    user_id INTEGER,  
    answer TEXT NOT NULL,  
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  
    FOREIGN KEY (question_id) REFERENCES Questions(id),  
    FOREIGN KEY (user_id) REFERENCES Users(id)  
);  

-- Example table for Order History (optional)  
CREATE TABLE OrderHistory (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    order_id INTEGER,  
    status TEXT NOT NULL,  
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,  
    FOREIGN KEY (order_id) REFERENCES Orders(id)  
);  
