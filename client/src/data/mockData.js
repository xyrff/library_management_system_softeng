// ── Mock data used across all screens ──────────────────────────────────────

export const GENRES = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Technology', 'Mathematics', 'Literature', 'Philosophy', 'Art'];

export const mockBooks = [
  { id: '1', title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', isbn: '978-0061935466', copies: 3, availableCopies: 2, description: 'A gripping tale of racial injustice and childhood innocence set in the American South during the 1930s.', cover: null, status: 'available' },
  { id: '2', title: 'A Brief History of Time', author: 'Stephen Hawking', genre: 'Science', isbn: '978-0553380163', copies: 2, availableCopies: 0, description: 'Stephen Hawking explores the universe from the Big Bang to black holes in this landmark popular science book.', cover: null, status: 'borrowed', expectedReturn: '2026-09-10' },
  { id: '3', title: 'Sapiens: A Brief History', author: 'Yuval Noah Harari', genre: 'History', isbn: '978-0062316097', copies: 4, availableCopies: 3, description: 'A narrative history of humankind from the Stone Age to the present, examining what made Homo sapiens dominant.', cover: null, status: 'available' },
  { id: '4', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Literature', isbn: '978-0743273565', copies: 5, availableCopies: 4, description: 'A classic tale of the American Dream, decadence, and the pursuit of the unattainable set in the Jazz Age.', cover: null, status: 'available' },
  { id: '5', title: 'Clean Code', author: 'Robert C. Martin', genre: 'Technology', isbn: '978-0132350884', copies: 2, availableCopies: 1, description: 'A handbook of agile software craftsmanship, providing best practices and principles for writing clean, maintainable code.', cover: null, status: 'available' },
  { id: '6', title: '1984', author: 'George Orwell', genre: 'Fiction', isbn: '978-0451524935', copies: 3, availableCopies: 0, description: 'A dystopian novel set in a totalitarian future where Big Brother surveils every aspect of citizens\' lives.', cover: null, status: 'borrowed', expectedReturn: '2026-09-15' },
  { id: '7', title: 'The Selfish Gene', author: 'Richard Dawkins', genre: 'Science', isbn: '978-0199291144', copies: 2, availableCopies: 2, description: 'A groundbreaking work presenting the gene-centred view of evolution and introducing the concept of the meme.', cover: null, status: 'available' },
  { id: '8', title: 'Steve Jobs', author: 'Walter Isaacson', genre: 'Biography', isbn: '978-1451648539', copies: 3, availableCopies: 1, description: 'The exclusive biography of Apple co-founder Steve Jobs, based on over 40 interviews with Jobs himself.', cover: null, status: 'available' },
  { id: '9', title: 'Introduction to Algorithms', author: 'Cormen et al.', genre: 'Technology', isbn: '978-0262033848', copies: 2, availableCopies: 2, description: 'The definitive textbook on algorithms covering a broad range of algorithms in depth, yet makes their design accessible.', cover: null, status: 'available' },
  { id: '10', title: 'The Republic', author: 'Plato', genre: 'Philosophy', isbn: '978-0199535767', copies: 4, availableCopies: 3, description: 'Plato\'s masterwork on justice, the ideal state, and the nature of the human soul through Socratic dialogue.', cover: null, status: 'available' },
  { id: '11', title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Literature', isbn: '978-0141439518', copies: 3, availableCopies: 2, description: 'The beloved novel of manners following Elizabeth Bennet and her complicated relationship with the proud Mr. Darcy.', cover: null, status: 'available' },
  { id: '12', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', genre: 'Non-Fiction', isbn: '978-0374533557', copies: 2, availableCopies: 0, description: 'Nobel laureate Kahneman takes readers on a tour of the mind, revealing the two systems that drive the way we think.', cover: null, status: 'borrowed', expectedReturn: '2026-09-20' },
];

export const mockStudents = [
  { id: 's1', name: 'Alice Johnson', email: 'alice@school.edu', borrowCount: 12, lateReturns: 0, role: 'student' },
  { id: 's2', name: 'Bob Smith', email: 'bob@school.edu', borrowCount: 8, lateReturns: 2, role: 'student' },
  { id: 's3', name: 'Carol White', email: 'carol@school.edu', borrowCount: 3, lateReturns: 0, role: 'student' },
  { id: 's4', name: 'David Lee', email: 'david@school.edu', borrowCount: 1, lateReturns: 0, role: 'student' },
  { id: 's5', name: 'Eva Martinez', email: 'eva@school.edu', borrowCount: 20, lateReturns: 5, role: 'student' },
];

export const mockRequests = [
  { id: 'r1', student: mockStudents[0], book: mockBooks[1], requestDate: '2026-09-01', duration: 14, status: 'pending', riskScore: 0.12 },
  { id: 'r2', student: mockStudents[1], book: mockBooks[5], requestDate: '2026-09-02', duration: 7, status: 'pending', riskScore: 0.55 },
  { id: 'r3', student: mockStudents[3], book: mockBooks[0], requestDate: '2026-09-03', duration: 21, status: 'pending', riskScore: 0.08 },
  { id: 'r4', student: mockStudents[4], book: mockBooks[11], requestDate: '2026-09-03', duration: 30, status: 'pending', riskScore: 0.78 },
];

export const mockActiveBorrows = [
  { id: 'b1', student: mockStudents[0], book: mockBooks[2], borrowDate: '2026-08-20', dueDate: '2026-09-03', status: 'overdue' },
  { id: 'b2', student: mockStudents[1], book: mockBooks[4], borrowDate: '2026-08-25', dueDate: '2026-09-10', status: 'borrowed' },
  { id: 'b3', student: mockStudents[2], book: mockBooks[6], borrowDate: '2026-08-28', dueDate: '2026-09-11', status: 'borrowed' },
  { id: 'b4', student: mockStudents[4], book: mockBooks[8], borrowDate: '2026-09-01', dueDate: '2026-09-15', status: 'borrowed' },
];

export const mockHistory = [
  { id: 'h1', student: mockStudents[0], book: mockBooks[0], borrowDate: '2026-07-01', dueDate: '2026-07-15', returnDate: '2026-07-14', status: 'returned' },
  { id: 'h2', student: mockStudents[1], book: mockBooks[3], borrowDate: '2026-07-05', dueDate: '2026-07-19', returnDate: '2026-07-25', status: 'returned' },
  { id: 'h3', student: mockStudents[2], book: mockBooks[9], borrowDate: '2026-07-10', dueDate: '2026-07-24', returnDate: null, status: 'rejected' },
  { id: 'h4', student: mockStudents[3], book: mockBooks[7], borrowDate: '2026-07-15', dueDate: '2026-07-29', returnDate: '2026-07-29', status: 'returned' },
  { id: 'h5', student: mockStudents[4], book: mockBooks[10], borrowDate: '2026-08-01', dueDate: '2026-08-15', returnDate: '2026-08-20', status: 'returned' },
];

export const mockMyBorrows = [
  { id: 'm1', book: mockBooks[0], borrowDate: '2026-07-01', dueDate: '2026-07-15', returnDate: '2026-07-14', status: 'returned' },
  { id: 'm2', book: mockBooks[3], borrowDate: '2026-08-10', dueDate: '2026-08-24', returnDate: null, status: 'overdue' },
  { id: 'm3', book: mockBooks[6], borrowDate: '2026-08-28', dueDate: '2026-09-11', returnDate: null, status: 'borrowed' },
  { id: 'm4', book: mockBooks[9], borrowDate: '2026-09-01', dueDate: null, returnDate: null, status: 'pending' },
  { id: 'm5', book: mockBooks[5], borrowDate: '2026-06-01', dueDate: '2026-06-15', returnDate: null, status: 'rejected' },
];

export const reportData = {
  mostBorrowedBooks: [
    { name: 'To Kill a Mockingbird', borrows: 18 },
    { name: '1984', borrows: 15 },
    { name: 'Sapiens', borrows: 14 },
    { name: 'Clean Code', borrows: 12 },
    { name: 'The Great Gatsby', borrows: 10 },
  ],
  mostBorrowedGenres: [
    { name: 'Fiction', borrows: 42 },
    { name: 'Technology', borrows: 35 },
    { name: 'Science', borrows: 28 },
    { name: 'History', borrows: 22 },
    { name: 'Literature', borrows: 18 },
  ],
  lateReturnStudents: [
    { name: 'Eva Martinez', lateReturns: 5 },
    { name: 'Bob Smith', lateReturns: 2 },
    { name: 'David Lee', lateReturns: 1 },
  ],
};
