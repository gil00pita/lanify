# ======================================================================
# CGI AI Exchange CODEOWNERS
# ----------------------------------------------------------------------
# This file assigns review ownership for this repository.
#
# Format:
#   Each line: <file pattern> <one or more owners>
#   Owners must be GitHub usernames with '@' prefix.
#   The last matching pattern takes precedence.
# ======================================================================

# Default ownership for the entire repository
*                         @gil00pita

# Documentation
/docs/                    @gil00pita
*.md                      @gil00pita

# Application source
/src/                     @gil00pita
/src/app/                 @gil00pita
/src/components/          @gil00pita
/src/icons/               @gil00pita
/src/illustrations/       @gil00pita
/src/lib/                 @gil00pita
/src/store/               @gil00pita
/src/theme/               @gil00pita
/src/types/               @gil00pita

# Static assets
/public/                  @gil00pita

# Background-removal service
/rembg-service/           @gil00pita

# Build, lint, TypeScript, and container configuration
Dockerfile                @gil00pita
docker-compose.yml        @gil00pita
eslint.config.mjs         @gil00pita
next.config.mjs           @gil00pita
package.json              @gil00pita
tsconfig.json             @gil00pita
*.yaml                    @gil00pita
*.yml                     @gil00pita

# GitHub workflows and automation, if added later
/.github/                 @gil00pita

# ======================================================================
# Notes:
# - Ensure all listed usernames exist in this organization.
# - The file must be committed to the 'main' branch.
# - Pull requests affecting any path here require review from the listed
#   owners before merging, subject to repository branch protection rules.
# ======================================================================
