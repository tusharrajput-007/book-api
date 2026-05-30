-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(45) NOT NULL,
    `middleName` VARCHAR(45) NULL,
    `lastName` VARCHAR(45) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `username` VARCHAR(45) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `googleId` VARCHAR(64) NULL,
    `resetToken` VARCHAR(64) NULL,
    `resetExpires` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_googleId_key`(`googleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Book` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookName` VARCHAR(100) NOT NULL,
    `authorName` VARCHAR(100) NOT NULL,
    `isbn` VARCHAR(13) NOT NULL,
    `coverFile` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Book_isbn_key`(`isbn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `rollNo` VARCHAR(20) NOT NULL,
    `phoneNo` VARCHAR(15) NOT NULL,
    `photoFile` VARCHAR(255) NULL,
    `country` VARCHAR(60) NOT NULL,
    `state` VARCHAR(60) NOT NULL,
    `city` VARCHAR(60) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Student_rollNo_key`(`rollNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Issue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `issueDate` DATETIME(3) NOT NULL,
    `returnDate` DATETIME(3) NULL,
    `status` ENUM('ISSUED', 'RETURNED') NOT NULL DEFAULT 'ISSUED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Issue_bookId_idx`(`bookId`),
    INDEX `Issue_studentId_idx`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Issue` ADD CONSTRAINT `Issue_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Issue` ADD CONSTRAINT `Issue_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
