# UI Prompt — Library Management System

Use this as a prompt for an AI design/coding tool (Claude, v0, Lovable, Bolt, etc.) or as a UI spec for your team's frontend work.

---

## Project Context

Build the frontend for a **Library Management System** with two integrated machine learning features: a personalized book recommendation engine and a late-return risk indicator for librarians. Stack: **React** (frontend) talking to an **Express/Node.js** REST API, with **Tailwind CSS** for styling. Two user roles: **Member** and **Librarian/Admin**, each with a distinct dashboard.

## Design Direction

- Clean, modern, and calm — this is a productivity tool, not a marketing site. Avoid heavy gradients or decorative flourishes.
- Generous white space, clear visual hierarchy, easy-to-scan lists and cards.
- A neutral base palette (whites/grays) with **one accent color** for primary actions and links, and a small semantic set for status (green = available/good standing, amber = due soon/medium risk, red = overdue/high risk).
- Rounded corners (8–12px), soft 1px borders instead of heavy shadows.
- Fully responsive — must work well on both desktop (librarian back-office use) and mobile (member browsing).
- Accessible: sufficient color contrast, visible focus states, never rely on color alone to convey status (pair with icons/text labels too).

## Pages & Screens

### 1. Auth
- **Login** — email + password, role-aware redirect after login (member vs librarian dashboard)
- **Register** (member self-signup, if in scope) — name, email, password, member type

### 2. Member-facing

- **Member dashboard (home)**
  - "Recommended for you" section — horizontal scroll or grid of book cards, each with cover placeholder, title, author, and a short "why recommended" tag (e.g. "Because you read [Genre]")
  - "Currently borrowed" section — books with due dates, visually flagged if due soon or overdue
  - Quick search bar

- **Book catalog**
  - Searchable, filterable grid/list of books (filter by genre, availability, author)
  - Each book card: cover placeholder, title, author, genre tag, availability badge (available / all copies borrowed)

- **Book detail page**
  - Full book info, availability status, "Borrow" or "Reserve" button (reserve shown only if unavailable)
  - "Similar books you might like" section powered by the recommendation engine

- **My loans**
  - Table/list of past and current borrowed books, due dates, return status, any fines incurred

- **My reservations**
  - List of pending reservations with queue position if available

### 3. Librarian/Admin-facing

- **Librarian dashboard (home)**
  - Key stats at a glance: total books, active loans, overdue count, pending reservations
  - **"At-risk loans" widget** — list of current loans flagged by the late-return risk model, sorted by risk level (high → low), each row showing member name, book, due date, and a risk badge (color-coded)

- **Book management**
  - Table of all books with add/edit/delete, copy count management

- **Member management**
  - Table of all members, view individual borrowing/late-return history

- **Transactions**
  - Full log of borrow/return activity, with the risk score visible per transaction
  - Ability to mark a book as returned, which triggers fine calculation if late

- **Reservations queue**
  - View and manage pending reservations per book

## Key Components to Design

- **Book card** — reusable across catalog, recommendations, and similar-books sections
- **Risk badge** — small pill component, color-coded (green/amber/red) with the risk level as text, used in librarian views
- **Status badge** — for loan status (borrowed / returned / overdue) and reservation status (pending / fulfilled)
- **Data table** — for librarian views (books, members, transactions) with sorting and basic filtering
- **Empty states** — for "no current loans," "no recommendations yet" (new member), "no search results"

## Interaction Notes

- Borrowing a book should show a brief confirmation (toast or modal) with the due date, not just a silent state change
- The "at-risk loans" widget should make it obvious this is a *predictive* flag, not a rule violation — phrase it as "predicted risk," not "violation," so librarians understand it's a heads-up, not an accusation
- Recommendations should clearly be presented as suggestions, with an easy way to dismiss/ignore them

## Out of Scope for This Prompt

- Payment processing for fines (assume fines are tracked, not paid online, unless your group decides otherwise)
- Book cover image uploads — placeholder covers are fine for the MVP
