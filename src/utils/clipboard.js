export const copyText = async (text) => {
  if (!text && text !== '') return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // fallback below
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch (e) {
    return false;
  }
};

export const sharePayload = async ({ title, text, url }) => {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return true;
    }
  } catch (e) {
    // likely user canceled; fall through to copy
  }
  const fallback = [text, url].filter(Boolean).join('\n');
  return copyText(fallback);
};
