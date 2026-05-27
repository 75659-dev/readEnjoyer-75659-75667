import { API_BASE_URL } from "../api/axios";

export function getFileUrl(fileIdOrUrl?: string | null) {
  if (!fileIdOrUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(fileIdOrUrl)) {
    const url = fileIdOrUrl;
    try {
      // eslint-disable-next-line no-console
      console.debug('[getFileUrl] ->', url);
    } catch {}

    return url;
  }

  const url = `${API_BASE_URL}/files/${encodeURIComponent(fileIdOrUrl)}`;
  try {
    // eslint-disable-next-line no-console
    console.debug('[getFileUrl] ->', url);
  } catch {}

  return url;
}
