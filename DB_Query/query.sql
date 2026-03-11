CREATE DATABASE road_monitor;
USE road_monitor;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    image_url TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    damage_percentage FLOAT,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
select * from users;
insert into users values(3,'admins','Admin2004@gmail.com',123,'admin','2026-03-11 10:02:34');
insert into users values(4,'ad','ad@gmail.com',12,'admin','2026-03-11 10:02:34');
insert into users values(5,'us','us@gmail.com',12,'public','2026-03-11 10:02:34');