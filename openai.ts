export class OpenAIService {
  private getApiUrl() {
    // In production, use the Render backend URL
    const RENDER_URL = 'https://genie-ai-backend.onrender.com';
    return process.env.NODE_ENV === 'production'
      ? RENDER_URL
      : 'http://localhost:3001';
  }

  async processMessage(message: string): Promise<string> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/process-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server response error:', errorData);
        throw new Error(errorData.error || 'Failed to process message');
      }

      const data = await response.json();
      if (!data.response) {
        throw new Error('Invalid response format from server');
      }

      return data.response;
    } catch (error) {
      console.error('Error processing message:', error);
      throw new Error('Failed to get response from AI. Please try again.');
    }
  }
}