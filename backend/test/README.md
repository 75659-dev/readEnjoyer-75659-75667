# Backend Tests

This directory contains comprehensive test suites for all the API controllers in the backend application.

## Test Files

- **auth.controller.spec.ts** - Tests for authentication endpoints (register, login, logout, verify-email, refresh tokens, Google OAuth)
- **authors.controller.spec.ts** - Tests for author CRUD operations
- **books.controller.spec.ts** - Tests for book CRUD operations
- **categories.controller.spec.ts** - Tests for category CRUD operations

## Test Coverage

Each controller test includes:

- ✅ Success cases (200, 201 responses)
- ❌ Error cases (400, 401, 403, 404 responses)
- ✓ Input validation
- ✓ Edge cases
- ✓ Missing required fields
- ✓ Invalid data formats
- ✓ Not found scenarios
- ✓ Authorization/authentication checks

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage

```bash
npm run test:cov
```

### Run specific test file

```bash
npm test auth.controller.spec.ts
```

### Debug tests

```bash
npm run test:debug
```

## Test Structure

Each test file follows this structure:

1. **Setup** - Module creation with mocked dependencies
2. **Test Suites** - Grouped by HTTP method (GET, POST, PUT, PATCH, DELETE)
3. **Test Cases** - Individual tests for specific scenarios
4. **Teardown** - Cleanup after tests

## Mocking

Tests use Jest mocks for:

- Services - Simulating database and business logic
- Guards - Bypassing authentication/authorization checks
- Database calls - Avoiding actual database queries

## Example Test

```typescript
describe('GET /authors', () => {
  it('should return all authors', () => {
    const authors = [mockAuthor];
    mockAuthorsService.findAll.mockResolvedValue(authors);

    return request(app.getHttpServer())
      .get('/authors')
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

## Important Notes

- Tests use **supertest** for HTTP requests
- Tests use **Jest** for assertions
- All service calls are mocked (no actual database queries)
- Tests are isolated - each test clears mocks after execution
- Tests validate both happy paths and error scenarios
