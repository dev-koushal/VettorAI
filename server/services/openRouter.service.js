import axios from "axios";

export const askAi = async (messages) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Invalid input: messages should be a non-empty array");
    }
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    const content = response?.data?.choices[0]?.message?.content;

    if (!content || !content.trim()) {
      throw new Error("Invalid response from OpenRouter API: missing content");
    }
    return content;
  } catch (error) {
    console.log("open router error: ", error?.response?.data || error?.message || error);
    const message =
      error?.response?.data?.message || error?.response?.data || error?.message ||
      "Failed to get response from OpenRouter API";
    throw new Error(message);
  }
};
