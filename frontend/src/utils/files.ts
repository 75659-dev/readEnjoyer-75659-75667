import { API_BASE_URL } from "../api/axios";

export function getFileUrl(fileIdOrUrl?: string | null) {
  if (!fileIdOrUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(fileIdOrUrl)) {
    return fileIdOrUrl;
  }

  return `${API_BASE_URL}/files/${encodeURIComponent(fileIdOrUrl)}`;
}
