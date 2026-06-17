export function getCSRFToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);

  return match?.[1] ?? "";
}
