/// <reference types="node" />
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const books = [
  { bookName: "Book1", authorName: "Author1", isbn: "9780132350881" },
  { bookName: "Book2", authorName: "Author2", isbn: "9780132350882" },
  { bookName: "Book3", authorName: "Author3", isbn: "9780132350883" },
  { bookName: "Book4", authorName: "Author4", isbn: "9780132350884" },
  { bookName: "Book5", authorName: "Author5", isbn: "9780132350885" },
  { bookName: "Book6", authorName: "Author6", isbn: "9780132350886" },
  { bookName: "Book7", authorName: "Author7", isbn: "9780132350887" },
  { bookName: "Book8", authorName: "Author8", isbn: "9780132350888" },
  { bookName: "Book9", authorName: "Author9", isbn: "9780132350889" },
  { bookName: "Book10", authorName: "Author10", isbn: "9780132350890" },
];

const seed = async () => {
  console.log("Seeding started...");

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: book,
    });
  }

  console.log("Seeding complete!");
};

seed()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
