# Manual Article Publishing

The custom static admin CMS is paused for now. Until revenue or backend hosting justifies a maintained CMS, articles are managed manually through the repository.

## Workflow

1. Create or edit an article Markdown file in `src/articles/`.
2. Use the existing public article block layout when needed:
   `layout: article-blocks.njk`.
3. Keep front matter complete, including title, description, category, image fields, publish status, permalink, and `blocks`.
4. Add any article images under `src/assets/img/` or another existing public image folder used by the site.
5. Run the local build:

   ```powershell
   npm.cmd run build
   ```

6. Review the generated public article page locally.
7. Commit and push the article changes.
8. Let Cloudflare deploy the public site from the repository.

The protected `/_admin/` route now shows a paused notice only. It is not used for article creation, editing, preview, upload, save, or delete actions.
