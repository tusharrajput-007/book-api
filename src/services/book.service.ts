import { Book, BookBody } from "../schemas/book.schema";

// In-memory database
const bookMap = new Map<number, Book>();
let nextId = 1;

export const bookService = {
  findAll(): Book[] {
    return Array.from(bookMap.values());
  },

  findById(id: number): Book | undefined {
    return bookMap.get(id);
  },

  create(data: BookBody): Book {
    const book: Book = { id: nextId++, ...data };
    bookMap.set(book.id, book);
    return book;
  },

  update(id: number, data: BookBody): Book | undefined {
    const existing = bookMap.get(id);
    if (!existing) return undefined;
    const updated: Book = { ...existing, ...data };
    bookMap.set(id, updated);
    return updated;
  },

  delete(id: number): boolean {
    return bookMap.delete(id);
  },
};
