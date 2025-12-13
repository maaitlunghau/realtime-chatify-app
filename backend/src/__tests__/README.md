# Backend Unit Tests

Comprehensive unit tests for the backend application, focusing on recent changes.

## Test Structure

__tests__/
├── controllers/
│   └── auth.controller.test.js    # Auth controller tests (80+ tests)
├── lib/
│   ├── db.test.js                 # Database connection tests (45+ tests)
│   └── utils.test.js              # Utility functions tests (50+ tests)
├── middlewares/
│   └── parser.middleware.test.js  # Body parser tests (20+ tests)
├── integration/
│   └── server.test.js             # Server initialization tests (40+ tests)
├── setup.js                       # Global test configuration
└── README.md                      # This file

## Running Tests

Install dependencies: