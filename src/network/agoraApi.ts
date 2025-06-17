import axios from "axios";

export async function fetchAgoraTokens(channelName: string, uid: number, userId: string) {
  try {
    const response = await axios.post("/api/agora/generate-token", {
      channelName,
      uid,
      userId,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to fetch Agora tokens");
    }
    throw new Error(error.message || "Failed to fetch Agora tokens");
  }
}
