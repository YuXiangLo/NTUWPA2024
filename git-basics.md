# Basic Git Instructions

## 0. FYI
- This is a simple recap of git command, no need to read if you already know.

## 1. Setup
- Install Git from [git-scm.com](https://git-scm.com/)
- Configure your user details:
  ```sh
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

## 2. Cloning a Repository
- Clone a project from GitHub:
  ```
  git clone https://github.com/your-repo.git
  cd your-repo
  ```
## 3. Working with Branches
- Check the current branch:
  ```
  git branch
  ```
- Create a new branch:
  ```
  git switch -c feat/YourFeatures
  ```
- Switch to an existing branch:
  ```
  git switch feat/YourFeatures
  ```
## 4. Making Changes and Committing
- Add new or modified files:
  ```
  git add .
  ```
- Commit changes with a message:
  ```
  git commit -m "feat: Add new feature"
  ```
- Push changes to a remote branch:
  ```
  git push origin feature/new-feature
  ```

## 5. Creating a Pull Request (PR)
- Push your branch to GitHub.
- Go to the repository on GitHub.
- Click Compare & pull request.
- Add a title and description.
- Assign a reviewer and submit.

## 6. Updating Your Local Branch
- Pull the latest changes:
  ```
  git pull origin main
  ```
- If working on a branch, rebase:
  ```
  git checkout feature/new-feature
  git rebase main
  ```
## 7. Resolving Merge Conflicts
- This happens when you call `git rebase`. You should manually solve this problem:
- By using `git status`, you should be able to compare the difference between main branch and your current one

## 8. Merging Changes
- Merge a fix branch into `feat/YourFeatures`
  ```
  git checkout feat/YourFeatures
  git merge fix/YourFixes
  ```

## 9. Pushing Your Changes
- Push the updated branch:
  ```
  git push origin feat/YourFeatures
  ```

## 10. Undoing Changes
- Undo the last commit (without deleting changes):
  ```
  git reset --soft HEAD~1
  ```

