import api from "../api/axios";

class FilesService {
  async upload(image: File): Promise<{ fileId: string }> {
    const formData = new FormData();
    formData.append("image", image);

    const response = await api.post<{ fileId: string }>(
      "/files/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  }
}

export const filesService = new FilesService();
