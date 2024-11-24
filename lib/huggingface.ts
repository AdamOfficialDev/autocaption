import axios from 'axios';

const API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large";

export async function generateCaption(imageUrl: string): Promise<string> {
  try {
    const response = await axios.post(
      API_URL,
      { inputs: imageUrl },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data[0].generated_text;
  } catch (error) {
    console.error('Error generating caption:', error);
    throw new Error('Failed to generate caption');
  }
}