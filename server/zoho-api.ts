import fetch from 'node-fetch';

export interface ZohoWebinarRequest {
  topic: string;
  agenda: string;
  presenter?: string; // Optional ZUID of the presenter - if not provided, uses authenticated user
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
  private apiDomain: string = 'meeting.zoho.in'; // Default to India datacenter

  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID || '';
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET || '';
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN || '';
    this.zsoid = process.env.ZOHO_ZSOID || '';

    if (!this.clientId || !this.clientSecret || !this.refreshToken || !this.zsoid) {
      throw new Error('Missing Zoho API credentials. Please set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, and ZOHO_ZSOID environment variables.');
    }

    // Log credential validation (masked for security)
    console.log('🔐 Zoho credentials loaded:', {
      clientId: this.clientId.length > 0 ? `${this.clientId.substring(0, 8)}...` : 'EMPTY',
      clientSecret: this.clientSecret.length > 0 ? `${this.clientSecret.substring(0, 8)}...` : 'EMPTY',
      refreshToken: this.refreshToken.length > 0 ? `${this.refreshToken.substring(0, 12)}...` : 'EMPTY',
      zsoid: this.zsoid.length > 0 ? `${this.zsoid}` : 'EMPTY'
    });
  }

  private async refreshAccessToken(): Promise<string> {
    try {
      console.log('🔄 Attempting to refresh Zoho access token...');
      
      // Log credentials for debugging (mask sensitive data)
      console.log('Debug info:', {
        clientId: this.clientId ? this.clientId.substring(0, 8) + '...' : 'MISSING',
        hasClientSecret: !!this.clientSecret,
        hasRefreshToken: !!this.refreshToken,
        zsoid: this.zsoid ? this.zsoid.substring(0, 8) + '...' : 'MISSING'
      });

      const params = new URLSearchParams({
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      });

      // Try different Zoho datacenters
      // For India users, try .in first, then fallback to others if needed
    const datacenters = ['accounts.zoho.in', 'accounts.zoho.com', 'accounts.zoho.eu', 'accounts.zoho.com.au'];
      
      for (const datacenter of datacenters) {
        try {
          console.log(`🌍 Trying datacenter: ${datacenter}`);
          
          const response = await fetch(`https://${datacenter}/oauth/v2/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'CampusForWisdom/1.0',
            },
            body: params,
          });

          console.log(`📡 Response status: ${response.status} ${response.statusText}`);

          if (response.ok) {
            const responseText = await response.text();
            console.log('📄 Response body:', responseText.substring(0, 200) + '...');

            try {
              const data = JSON.parse(responseText) as ZohoTokenResponse;
              
              if (data.access_token) {
                this.accessToken = data.access_token;
                this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
                
                // Set API domain based on successful datacenter
                if (datacenter.includes('.in')) {
                  this.apiDomain = 'meeting.zoho.in';
                } else if (datacenter.includes('.eu')) {
                  this.apiDomain = 'meeting.zoho.eu';
                } else if (datacenter.includes('.com.au')) {
                  this.apiDomain = 'meeting.zoho.com.au';
                } else {
                  this.apiDomain = 'meeting.zoho.com';
                }
                
                console.log('✅ Zoho access token refreshed successfully');
                console.log(`🕒 Token expires in ${data.expires_in} seconds`);
                console.log(`🌐 Using API domain: ${this.apiDomain}`);
                return this.accessToken;
              }
            } catch (parseError) {
              console.log(`❌ JSON parse error for ${datacenter}:`, parseError);
              continue;
            }
          } else {
            const errorData = await response.text();
            console.log(`❌ ${datacenter} failed:`, response.status, errorData.substring(0, 100));
            continue;
          }
        } catch (fetchError) {
          console.log(`❌ Network error for ${datacenter}:`, fetchError);
          continue;
        }
      }
      
      // If we get here, all datacenters failed
      throw new Error('All Zoho datacenters failed. Please check your refresh token and client credentials.');
      
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

  async getUserDetails(): Promise<{ zuid: string }> {
    try {
      const accessToken = await this.getValidAccessToken();
      
      console.log('📡 Calling organization users API:', `https://${this.apiDomain}/api/v2/${this.zsoid}/user`);
      
      const response = await fetch(`https://${this.apiDomain}/api/v2/${this.zsoid}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
        },
      });

      console.log('📡 User API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ User API Error Response:', errorText);
        throw new Error(`Failed to get user details: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as any;
      console.log('👤 Organization users full response:', JSON.stringify(data, null, 2));
      
      // Extract ZUID from first user in representation array
      const firstUser = data.representation?.[0];
      const zuid = firstUser?.zuid?.toString() || firstUser?.userId?.toString() || this.zsoid;
      console.log('🎯 Extracted ZUID:', zuid);
      
      return { zuid };
    } catch (error) {
      console.error('❌ Error getting user details:', error);
      console.warn('⚠️ Could not get user ZUID, using organization ID as fallback');
      return { zuid: this.zsoid };
    }
  }

  private formatDateTime(date: Date): string {
    // Format date to "Jun 19, 2020 07:00 PM" format expected by Zoho API
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Calcutta'
    };
    
    const datePart = date.toLocaleDateString('en-US', dateOptions);
    const timePart = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${datePart} ${timePart}`;
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

      // Get user details to get valid ZUID for presenter
      const userDetails = await this.getUserDetails();
      
      const requestBody: ZohoWebinarRequest = {
        topic: webinarData.title,
        agenda: webinarData.description,
        presenter: userDetails.zuid, // Use actual user ZUID as presenter
        startTime: this.formatDateTime(webinarData.scheduledAt),
        duration: webinarData.duration * 60 * 1000, // Convert minutes to milliseconds
        timezone: webinarData.timezone || 'Asia/Calcutta',
      };

      // Add participants if provided
      if (webinarData.participants && webinarData.participants.length > 0) {
        requestBody.participants = webinarData.participants.map(email => ({ email }));
      }

      console.log('🚀 Creating Zoho webinar with data:', requestBody);

      const response = await fetch(`https://${this.apiDomain}/api/v2/${this.zsoid}/webinar.json`, {
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

      const response = await fetch(`https://${this.apiDomain}/api/v2/${this.zsoid}/webinar.json`, {
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

      const response = await fetch(`https://${this.apiDomain}/api/v2/${this.zsoid}/webinar/${meetingKey}.json`, {
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
      
      console.log(`🧪 Testing connection with URL: https://${this.apiDomain}/api/v2/user.json`);
      console.log(`🔐 Using access token: ${accessToken?.substring(0, 20)}...`);
      
      const response = await fetch(`https://${this.apiDomain}/api/v2/user.json`, {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 Test connection response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json() as { users?: Array<{ emailId?: string }> };
        console.log('✅ Zoho API connection test successful:', data.users?.[0]?.emailId || 'Connected');
        return true;
      } else {
        const errorData = await response.text();
        console.error('❌ Zoho API connection test failed:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorData?.substring(0, 300)
        });
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