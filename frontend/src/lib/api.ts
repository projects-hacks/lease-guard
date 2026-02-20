const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadLease(file: File, state: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("state", state);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
    }

    return response.json();
}
