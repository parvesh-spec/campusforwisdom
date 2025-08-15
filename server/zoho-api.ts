import fetch from 'node-fetch';

export interface ZohoWebinarRequest {
  topic: string;
  agenda: string;
  presenter: string; // Required ZUID of the presenter
  startTime: string; // Format: "Jun 19, 2023 04:00 PM"
  duration: number; // Duration in milliseconds
  timezone?: string;
  participants?: Array<{ email: string }>;
}

export interface ZohoWebinarResponse {
  session: {
    meetingKey: string;
    topic: string;
    agenda: string;
    presenter: string;
    startTime: string;
    endTime: string;
    duration: number;
    timezone: string;
    offset: number;
    creatorZuid: number;
    registrationLink: string;
    startLink: string;
    participants?: Array<{ email: string }>;
  };
}

export interface ZohoTokenResponse {
  access_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}

export class ZohoWebinarAPI {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private zsoid: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID || '';
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET || '';
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN || '';
    this.zsoid = process.env.ZOHO_ZSOID || '';

    if (!this.clientId || !this.clientSecret || !this.refreshToken || !this.zsoid) {
      throw new Error('Missing Zoho API credentials. Please set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, and ZOHO_ZSOID environment variables.');
    }
  }

  private async refreshAccessToken(): Promise<string> {
    try {
      const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to refresh access token: ${response.status} ${errorData}`);
      }

      const data = await response.json() as ZohoTokenResponse;
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute before expiry

      console.log('✅ Zoho access token refreshed successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error refreshing Zoho access token:', error);
      throw error;
    }
  }

  private async getValidAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      return await this.refreshAccessToken();
    }
    return this.accessToken;
  }

  private formatDateTime(date: Date): string {
    // Format date to "Jun 19, 2023 04:00 PM" format expected by Zoho
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Calcutta'
    };
    return date.toLocaleDateString('en-US', options);
  }

  async createWebinar(webinarData: {
    title: string;
    description: string;
    scheduledAt: Date;
    duration: number; // Duration in minutes
    timezone?: string;
    participants?: string[]; // Array of email addresses
  }): Promise<ZohoWebinarResponse> {
    try {
      const accessToken = await this.getValidAccessToken();

      const requestBody: ZohoWebinarRequest = {
        topic: webinarData.title,
        agenda: webinarData.description,
        presenter: this.zsoid, // Use the organization ID as presenter ZUID
        startTime: this.formatDateTime(webinarData.scheduledAt),
        duration: webinarData.duration * 60 * 1000, // Convert minutes to milliseconds
        timezone: webinarData.timezone || 'Asia/Calcutta',
      };

      // Add participants if provided
      if (webinarData.participants && webinarData.participants.length > 0) {
        requestBody.participants = webinarData.participants.map(email => ({ email }));
      }

      console.log('🚀 Creating Zoho webinar with data:', requestBody);

      const response = await fetch(`https://meeting.zoho.com/api/v2/${this.zsoid}/webinar.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
        },
        body: JSON.stringify({ session: requestBody }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Zoho API Error:', response.status, errorData);
        throw new Error(`Failed to create webinar: ${response.status} ${errorData}`);
      }

      const result = await response.json() as ZohoWebinarResponse;
      console.log('✅ Webinar created successfully:', result.session.meetingKey);
      
      return result;
    } catch (error) {
      console.error('❌ Error creating webinar:', error);
      throw error;
    }
  }

  async getWebinars(): Promise<any[]> {
    try {
      const accessToken = await this.getValidAccessToken();

      const response = await fetch(`https://meeting.zoho.com/api/v2/${this.zsoid}/webinar.json`, {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to get webinars: ${response.status} ${errorData}`);
      }

      const data = await response.json() as { sessions?: any[] };
      return data.sessions || [];
    } catch (error) {
      console.error('❌ Error fetching webinars:', error);
      throw error;
    }
  }

  async deleteWebinar(meetingKey: string): Promise<boolean> {
    try {
      const accessToken = await this.getValidAccessToken();

      const response = await fetch(`https://meeting.zoho.com/api/v2/${this.zsoid}/webinar/${meetingKey}.json`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete webinar: ${response.status} ${errorData}`);
      }

      console.log('✅ Webinar deleted successfully:', meetingKey);
      return true;
    } catch (error) {
      console.error('❌ Error deleting webinar:', error);
      throw error;
    }
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const accessToken = await this.getValidAccessToken();
      
      const response = await fetch(`https://meeting.zoho.com/api/v2/user.json`, {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json() as { users?: Array<{ emailId?: string }> };
        console.log('✅ Zoho API connection test successful:', data.users?.[0]?.emailId || 'Connected');
        return true;
      } else {
        console.error('❌ Zoho API connection test failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Zoho API connection test error:', error);
      return false;
    }
  }
}

// Export singleton instance - conditionally create if credentials are available
let zohoAPI: ZohoWebinarAPI | null = null;

try {
  zohoAPI = new ZohoWebinarAPI();
  console.log('✅ Zoho Webinar API initialized successfully');
} catch (error) {
  console.warn('⚠️ Zoho Webinar API not initialized - missing credentials');
  console.warn('Please set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, and ZOHO_ZSOID environment variables');
}

export { zohoAPI };