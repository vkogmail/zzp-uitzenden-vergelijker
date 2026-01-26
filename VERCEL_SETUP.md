# Vercel Setup Instructions

## GitHub Token Configuration

This project uses a private GitHub repository (`@createnew/tokens`) which requires authentication during build.

### Required: Set GITHUB_TOKEN in Vercel

1. Go to your Vercel project: https://vercel.com/vincent-koopmans-projects/zzp-uitzenden-vergelijker
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: [Your GitHub Personal Access Token with `repo` scope]
   - **Environment**: Select all (Production, Preview, Development)
4. Save and redeploy

### How it works

The `preinstall` script (`scripts/setup-git-auth.sh`) automatically configures git to use the `GITHUB_TOKEN` environment variable when accessing GitHub repositories. This allows npm to install the `@createnew/tokens` package from the private GitHub repo during Vercel builds.

### Security Note

The token is stored securely in Vercel environment variables and is never committed to git. The `preinstall` script reads it from the environment at build time.
