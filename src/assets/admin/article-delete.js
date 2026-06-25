(() => {
  const ADMIN_HOST = "admin.dkapptools.com";

  const modal = document.querySelector("[data-article-delete-modal]");
  const notice = document.querySelector("[data-article-delete-notice]");
  const titleTarget = document.querySelector("[data-article-delete-title]");
  const pathTarget = document.querySelector("[data-article-delete-path]");
  const confirmButton = document.querySelector("[data-article-delete-confirm]");
  const editor = document.querySelector("[data-article-editor]");
  const aliasField = document.querySelector("[data-article-field='alias']");
  const blockList = document.querySelector("[data-article-block-list]");

  let pending = null;
  let noticeTimer = null;

  function isLiveAdminHost() {
    return window.location.hostname === ADMIN_HOST;
  }

  function showNotice(message, mode = "info") {
    if (!notice) {
      return;
    }

    notice.hidden = false;
    notice.textContent = message;
    notice.dataset.mode = mode;

    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => {
      notice.hidden = true;
    }, 7000);
  }

  function closeModal() {
    if (modal) {
      modal.hidden = true;
    }

    pending = null;

    if (confirmButton) {
      confirmButton.disabled = false;
      confirmButton.textContent = "Изтрий";
    }
  }

  function openModal(button) {
    pending = {
      key: button.getAttribute("data-article-key") || "",
      path: button.getAttribute("data-article-path") || "",
      title: button.getAttribute("data-article-title") || "Без заглавие",
      row: button.closest("[data-article-row]")
    };

    if (titleTarget) {
      titleTarget.textContent = pending.title;
    }

    if (pathTarget) {
      pathTarget.textContent = pending.path;
    }

    if (modal) {
      modal.hidden = false;
    }
  }

  function clearOpenEditorIfNeeded(key) {
    if (!editor || !aliasField || aliasField.value !== key) {
      return;
    }

    editor.hidden = true;
    document.querySelectorAll("[data-article-field]").forEach((field) => {
      field.value = "";
    });

    if (blockList) {
      blockList.innerHTML = "";
    }
  }

  function removeArticleRow() {
    if (!pending) {
      return;
    }

    if (pending.row) {
      pending.row.remove();
    }

    clearOpenEditorIfNeeded(pending.key);
  }

  async function deleteOnAdminDomain() {
    const response = await fetch("/api/admin/delete-article", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        articlePath: pending.path,
        commitMessage: `Delete article: ${pending.title || pending.key}`
      })
    });

    let result = {};

    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Статията не беше изтрита.");
    }

    return result;
  }

  async function confirmDelete() {
    if (!pending || !pending.path) {
      showNotice("Не е избрана статия за изтриване.", "error");
      closeModal();
      return;
    }

    if (confirmButton) {
      confirmButton.disabled = true;
      confirmButton.textContent = "Изтриване...";
    }

    if (!isLiveAdminHost()) {
      removeArticleRow();
      showNotice("Локален режим: редът е премахнат само от текущия екран. Реално изтриване работи само през admin.dkapptools.com.", "warning");
      closeModal();
      return;
    }

    try {
      await deleteOnAdminDomain();
      removeArticleRow();
      showNotice("Статията е изтрита от GitHub.", "success");
      closeModal();
    } catch (error) {
      const message = error && error.message ? error.message : "Статията не беше изтрита.";
      showNotice(message, "error");

      if (confirmButton) {
        confirmButton.disabled = false;
        confirmButton.textContent = "Изтрий";
      }
    }
  }

  document.querySelectorAll("[data-article-delete]").forEach((button) => {
    button.addEventListener("click", () => openModal(button));
  });

  document.querySelectorAll("[data-article-delete-cancel]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  if (confirmButton) {
    confirmButton.addEventListener("click", confirmDelete);
  }
})();
