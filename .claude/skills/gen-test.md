# Skill: gen-test

## Description

Generate Vitest unit tests for a given source file. Uses @testing-library/react for component tests and mocks Supabase. Follows the AAA (Arrange/Act/Assert) pattern.

## Instructions

1. Place the test file next to the source file:
   - `src/lib/utils.ts` -> `src/lib/utils.test.ts`
   - `src/components/Button.tsx` -> `src/components/Button.test.tsx`

2. For utility/library tests:

```typescript
import { describe, it, expect, vi } from "vitest";
import { myFunction } from "./my-module";

describe("myFunction", () => {
  it("should handle the expected case", () => {
    // Arrange
    const input = "test-input";

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe("expected-output");
  });

  it("should handle edge cases", () => {
    // Arrange
    const input = "";

    // Act & Assert
    expect(() => myFunction(input)).toThrow("Invalid input");
  });
});
```

3. For React component tests:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [{ id: "1", name: "Test" }],
          error: null,
        })),
      })),
    })),
  })),
}));

describe("MyComponent", () => {
  it("should render correctly", () => {
    // Arrange & Act
    render(<MyComponent />);

    // Assert
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("should handle user interaction", async () => {
    // Arrange
    render(<MyComponent />);

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    // Assert
    expect(screen.getByText("Submitted")).toBeInTheDocument();
  });
});
```

4. Test coverage priorities:
   - Happy path for each function/component
   - Error states and edge cases
   - Auth-dependent behavior (logged in vs. logged out)
   - Zod validation (valid and invalid inputs)
   - Loading and error states for async operations

5. Mock conventions:
   - Always mock `@/lib/supabase/client` and `@/lib/supabase/server`
   - Mock `@/lib/auth` for auth-dependent tests
   - Use `vi.fn()` for function mocks, `vi.mock()` for module mocks
   - Reset mocks in `beforeEach` when tests share mock state
