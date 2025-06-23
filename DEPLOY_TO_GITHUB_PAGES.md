# Step-by-Step Guide: Deploying X-ray Earth to GitHub Pages

This guide will walk you through deploying your X-ray Earth app to GitHub Pages, making it accessible online for free.

## Prerequisites
- Git installed on your computer ([Download Git](https://git-scm.com/downloads))
- A GitHub account ([Sign up for GitHub](https://github.com/signup))
- Your X-ray Earth project files ready

## Step 1: Initialize Git in Your Project

Open your terminal/command prompt and navigate to your project folder:

```bash
cd /Users/wrede/repos/xray-earth
```

Initialize Git in your project:

```bash
git init
```

Add all your files to Git:

```bash
git add .
```

Create your first commit:

```bash
git commit -m "Initial commit - X-ray Earth app"
```

## Step 2: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the repository details:
   - **Repository name**: `xray-earth` (or any name you prefer)
   - **Description**: "Interactive X-ray Earth visualization using device orientation"
   - **Public/Private**: Choose **Public** (required for free GitHub Pages)
   - **DO NOT** initialize with README, .gitignore, or license (since you already have files)
5. Click **"Create repository"**

## Step 3: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these exact commands:

First, add the GitHub repository as a remote:

```bash
git remote add origin https://github.com/YOUR_USERNAME/xray-earth.git
```

**Important**: Replace `YOUR_USERNAME` with your actual GitHub username!

Then push your code:

```bash
git branch -M main
git push -u origin main
```

You'll be prompted to enter your GitHub credentials. For security, use a Personal Access Token instead of your password:
- Go to GitHub Settings → Developer settings → Personal access tokens
- Generate a new token with "repo" permissions
- Use this token as your password when prompted

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/xray-earth`
2. Click on **"Settings"** (in the repository navigation bar)
3. Scroll down to the **"Pages"** section in the left sidebar
4. Under **"Source"**, select:
   - **Deploy from a branch**
   - **Branch**: `main` (or `master` if that's your default)
   - **Folder**: `/ (root)`
5. Click **"Save"**

## Step 5: Access Your Deployed App

After a few minutes (usually 2-10 minutes), your app will be live at:

```
https://YOUR_USERNAME.github.io/xray-earth/
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

### Example URLs:
- If your username is `johnsmith`: `https://johnsmith.github.io/xray-earth/`
- If your username is `jane-doe`: `https://jane-doe.github.io/xray-earth/`

## Troubleshooting

### App not showing up?
- Wait 10 minutes - initial deployment can take time
- Check Settings → Pages to see if there are any error messages
- Ensure your repository is public
- Make sure you have an `index.html` file in the root directory

### Permission errors when pushing?
- Make sure you're using a Personal Access Token, not your password
- Verify your token has "repo" permissions
- Check that you typed your username correctly in the remote URL

### HTTPS requirement for device orientation?
GitHub Pages serves your site over HTTPS by default, which is required for the device orientation API to work properly.

## Updating Your App

Whenever you make changes to your app:

1. Stage your changes:
   ```bash
   git add .
   ```

2. Commit your changes:
   ```bash
   git commit -m "Describe what you changed"
   ```

3. Push to GitHub:
   ```bash
   git push
   ```

GitHub Pages will automatically update your live site within a few minutes!

## Next Steps

- Share your app URL with others to test on their devices
- Consider adding a custom domain (optional)
- Add Google Analytics to track usage (optional)
- Create a nice README.md for your repository

Congratulations! Your X-ray Earth app is now live on the internet! 🌍