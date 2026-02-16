.PHONY: all ci install setup nuke dev dev-local \
	supabase-start supabase-stop supabase-status supabase-studio \
	db-reset db-migrate db-new db-push db-pull db-seed \
	build preview lint lint-fix typecheck knip format format-check check fix \
	test test-run test-e2e test-e2e-ui test-coverage test-all \
	ios-build ios-open clean help

# ─── Setup ────────────────────────────────────────────────────────────────────

install: ## Install dependencies
	npm ci

setup: install supabase-start db-reset ## Full local setup: install deps, start Supabase, reset DB

nuke: supabase-stop clean ## Tear down everything: stop Supabase, clean artifacts
	rm -rf node_modules

# ─── Dev ──────────────────────────────────────────────────────────────────────

dev: ## Start Next.js dev server
	npx next dev

dev-local: ## Start dev server with local Supabase
	NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 npx next dev

# ─── Supabase ─────────────────────────────────────────────────────────────────

supabase-start: ## Start local Supabase
	supabase start

supabase-stop: ## Stop local Supabase
	supabase stop

supabase-status: ## Show Supabase status
	supabase status

supabase-studio: ## Open Supabase Studio in browser
	open http://127.0.0.1:54323

# ─── Database ─────────────────────────────────────────────────────────────────

db-reset: ## Reset local database (run all migrations + seed)
	supabase db reset

db-migrate: ## Run pending migrations
	supabase migration up

db-new: ## Create a new migration file (usage: make db-new name=create_users)
	supabase migration new $(name)

db-push: ## Push migrations to local Supabase
	supabase db push

db-pull: ## Pull remote schema changes as a migration
	supabase db pull

db-seed: ## Run seed file
	supabase db seed

# ─── Build ────────────────────────────────────────────────────────────────────

build: ## Build the Next.js app for production
	npx next build

preview: build ## Build and start production preview
	npx next start

# ─── Quality ──────────────────────────────────────────────────────────────────

lint: ## Run ESLint
	npx eslint .

lint-fix: ## Run ESLint with auto-fix
	npx eslint --fix .

typecheck: ## Run TypeScript type checking
	npx tsc --noEmit

knip: ## Detect dead code and unused dependencies
	npx knip

format: ## Format code with Prettier
	npx prettier --write .

format-check: ## Check code formatting
	npx prettier --check .

check: lint typecheck format-check ## Run all quality checks (no fixes)

fix: lint-fix format ## Auto-fix lint issues and format code

# ─── Test ─────────────────────────────────────────────────────────────────────

test: ## Run unit tests in watch mode
	npx vitest

test-run: ## Run unit tests once
	npx vitest run

test-e2e: ## Run Playwright E2E tests
	npx playwright test

test-e2e-ui: ## Run Playwright E2E tests with UI
	npx playwright test --ui

test-coverage: ## Run unit tests with coverage report
	npx vitest run --coverage

test-all: test-run test-e2e ## Run all tests (unit + E2E)

# ─── iOS ──────────────────────────────────────────────────────────────────────

ios-build: ## Build the iOS app
	cd ios && xcodebuild -scheme App -sdk iphonesimulator -configuration Debug build

ios-open: ## Open iOS project in Xcode
	open ios/*.xcworkspace

# ─── Utilities ────────────────────────────────────────────────────────────────

clean: ## Remove build artifacts and caches
	rm -rf .next out coverage playwright-report test-results

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Aggregate ────────────────────────────────────────────────────────────────

all: check test-run build ## Run checks, tests, and build

ci: check test-run test-e2e build ## Full CI pipeline
