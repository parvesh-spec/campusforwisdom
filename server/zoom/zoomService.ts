import WebSocket from 'ws';
import { db } from '../db';
import { liveSessions, sessionAttendees, participantEngagement, zoomEvents, sessionAnalytics } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

interface ZoomConfig {
  accountId: string;
  clientId: string;
  clientSecret: string;
  secretToken: string;
  websocketEndpointUrl: string;
}

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface ZoomEvent {
  event: string;
  payload: {
    object: {
      id: string;
      uuid: string;
      host_id: string;
      topic: string;
      type: number;
      start_time: string;
      duration: number;
      timezone: string;
      participant?: {
        user_id: string;
        user_name: string;
        id: string;
        join_time: string;
        leave_time?: string;
        participant_uuid: string;
      };
    };
    account_id: string;
  };
}

export class ZoomService {
  private config: ZoomConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private wsConnection: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: ZoomConfig) {
    this.config = config;
  }

  // OAuth Token Management
  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
      
      const response = await fetch('https://zoom.us/oauth/token?grant_type=client_credentials', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error(`OAuth request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as ZoomTokenResponse;
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early

      console.log('✅ Zoom access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to get Zoom access token:', error);
      throw error;
    }
  }

  // WebSocket Connection Management
  async connectWebSocket(): Promise<void> {
    try {
      const token = await this.getAccessToken();
      
      // Use the endpoint URL directly with access_token - subscriptionId is embedded in the endpoint URL
      const wsUrl = `${this.config.websocketEndpointUrl}&access_token=${token}`;
      console.log('🔗 Connecting to Zoom WebSocket...');

      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.on('open', () => {
        console.log('🔗 Zoom WebSocket connected successfully');
        this.reconnectAttempts = 0;
        
        // Authentication is handled by URL parameters, start heartbeat immediately
        this.startHeartbeat();
      });

      this.wsConnection.on('message', (data: WebSocket.Data) => {
        try {
          const rawData = data.toString();
          console.log('📨 Received Zoom event:', rawData);
          
          if (!rawData || rawData === 'undefined') {
            console.log('💓 Received heartbeat or empty message');
            return;
          }
          
          const event = JSON.parse(rawData);
          this.handleZoomEvent(event);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });

      this.wsConnection.on('close', (code: number, reason: Buffer) => {
        console.log(`🔌 Zoom WebSocket closed: ${code} - ${reason.toString()}`);
        this.stopHeartbeat();
        this.attemptReconnection();
      });

      this.wsConnection.on('error', (error: Error) => {
        console.error('❌ Zoom WebSocket error:', error);
        this.stopHeartbeat();
      });

    } catch (error) {
      console.error('❌ Failed to connect to Zoom WebSocket:', error);
      throw error;
    }
  }

  // Heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        const heartbeatMessage = JSON.stringify({ module: 'heartbeat' });
        this.wsConnection.send(heartbeatMessage);
        console.log('💓 Heartbeat sent to Zoom');
      }
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Reconnection logic
  private async attemptReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Manual intervention required.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff
    
    console.log(`🔄 Attempting to reconnect to Zoom WebSocket in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connectWebSocket().catch(console.error);
    }, delay);
  }

  // Event Handler
  private async handleZoomEvent(event: any): Promise<void> {
    try {
      console.log('📨 Processing Zoom event:', event);

      // Handle authentication responses
      if (event.module === 'auth') {
        if (event.success) {
          console.log('✅ Zoom WebSocket authenticated successfully');
        } else {
          console.log('❌ Zoom WebSocket authentication failed:', event.content);
        }
        return;
      }

      // Handle connection building responses
      if (event.module === 'build_connection') {
        if (event.success) {
          console.log('✅ Zoom WebSocket connection established');
        } else {
          console.log('❌ Zoom WebSocket connection failed:', event.content);
        }
        return;
      }

      // Validate event structure for webhook events
      if (!event || typeof event !== 'object') {
        console.log('💓 Received non-event data (likely heartbeat response)');
        return;
      }

      if (!event.event || !event.payload) {
        console.log('ℹ️ Received non-webhook event or invalid structure');
        return;
      }

      console.log('✅ Valid Zoom event:', event.event);

      // Store event in database for audit trail
      await db.insert(zoomEvents).values({
        eventType: event.event,
        zoomMeetingId: event.payload?.object?.id || null,
        eventData: event.payload,
        processed: false
      });

      switch (event.event) {
        case 'meeting.started':
          await this.handleMeetingStarted(event);
          break;
        case 'meeting.ended':
          await this.handleMeetingEnded(event);
          break;
        case 'meeting.participant_joined':
          await this.handleParticipantJoined(event);
          break;
        case 'meeting.participant_left':
          await this.handleParticipantLeft(event);
          break;
        default:
          console.log(`ℹ️ Unhandled event type: ${event.event}`);
      }

      // Mark event as processed
      if (event.payload?.object?.id) {
        await db.update(zoomEvents)
          .set({ processed: true })
          .where(and(
            eq(zoomEvents.eventType, event.event),
            eq(zoomEvents.zoomMeetingId, event.payload.object.id)
          ));
      }

    } catch (error) {
      console.error('❌ Error handling Zoom event:', error);
    }
  }

  // Event Handlers
  private async handleMeetingStarted(event: ZoomEvent): Promise<void> {
    try {
      const session = await db.select()
        .from(liveSessions)
        .where(eq(liveSessions.zoomMeetingId, event.payload.object.id))
        .limit(1);

      if (session.length > 0) {
        await db.update(liveSessions)
          .set({ status: 'live' })
          .where(eq(liveSessions.id, session[0].id));

        console.log(`✅ Session ${session[0].title} marked as live`);
      }
    } catch (error) {
      console.error('❌ Error handling meeting started:', error);
    }
  }

  private async handleMeetingEnded(event: ZoomEvent): Promise<void> {
    try {
      const session = await db.select()
        .from(liveSessions)
        .where(eq(liveSessions.zoomMeetingId, event.payload.object.id))
        .limit(1);

      if (session.length > 0) {
        await db.update(liveSessions)
          .set({ status: 'completed' })
          .where(eq(liveSessions.id, session[0].id));

        // Generate session analytics
        await this.generateSessionAnalytics(session[0].id);

        console.log(`✅ Session ${session[0].title} marked as completed`);
      }
    } catch (error) {
      console.error('❌ Error handling meeting ended:', error);
    }
  }

  private async handleParticipantJoined(event: ZoomEvent): Promise<void> {
    try {
      if (!event.payload.object.participant) return;

      const participant = event.payload.object.participant;
      const session = await db.select()
        .from(liveSessions)
        .where(eq(liveSessions.zoomMeetingId, event.payload.object.id))
        .limit(1);

      if (session.length > 0) {
        // Insert or update attendee record
        await db.insert(sessionAttendees).values({
          sessionId: session[0].id,
          userId: participant.user_id, // This might need mapping to your user system
          zoomParticipantId: participant.id,
          joinedAt: new Date(participant.join_time),
          attended: true
        }).onConflictDoUpdate({
          target: [sessionAttendees.sessionId, sessionAttendees.userId],
          set: {
            joinedAt: new Date(participant.join_time),
            attended: true
          }
        });

        // Update current participants count
        await db.update(liveSessions)
          .set({ 
            currentParticipants: (session[0].currentParticipants || 0) + 1 
          })
          .where(eq(liveSessions.id, session[0].id));

        console.log(`✅ Participant ${participant.user_name} joined session ${session[0].title}`);
      }
    } catch (error) {
      console.error('❌ Error handling participant joined:', error);
    }
  }

  private async handleParticipantLeft(event: ZoomEvent): Promise<void> {
    try {
      if (!event.payload.object.participant) return;

      const participant = event.payload.object.participant;
      const session = await db.select()
        .from(liveSessions)
        .where(eq(liveSessions.zoomMeetingId, event.payload.object.id))
        .limit(1);

      if (session.length > 0) {
        const joinTime = new Date(participant.join_time);
        const leaveTime = participant.leave_time ? new Date(participant.leave_time) : new Date();
        const duration = Math.floor((leaveTime.getTime() - joinTime.getTime()) / (1000 * 60)); // minutes

        // Update attendee record
        await db.update(sessionAttendees)
          .set({
            leftAt: leaveTime,
            totalDuration: duration
          })
          .where(and(
            eq(sessionAttendees.sessionId, session[0].id),
            eq(sessionAttendees.zoomParticipantId, participant.id)
          ));

        // Update current participants count
        await db.update(liveSessions)
          .set({ 
            currentParticipants: Math.max(0, (session[0].currentParticipants || 0) - 1)
          })
          .where(eq(liveSessions.id, session[0].id));

        console.log(`✅ Participant ${participant.user_name} left session ${session[0].title} (duration: ${duration} min)`);
      }
    } catch (error) {
      console.error('❌ Error handling participant left:', error);
    }
  }

  // Analytics Generation
  private async generateSessionAnalytics(sessionId: string): Promise<void> {
    try {
      const attendees = await db.select()
        .from(sessionAttendees)
        .where(eq(sessionAttendees.sessionId, sessionId));

      const totalParticipants = attendees.length;
      const avgAttendanceTime = attendees.reduce((sum, attendee) => sum + (attendee.totalDuration || 0), 0) / totalParticipants || 0;
      const peakAttendance = Math.max(...attendees.map(a => 1)); // This would need real-time tracking for accurate peak

      await db.insert(sessionAnalytics).values({
        sessionId,
        totalParticipants,
        avgAttendanceTime: Math.round(avgAttendanceTime),
        peakAttendance,
        engagementScore: "75.5", // This would be calculated based on various factors
        recordingDuration: 0, // Would be populated from Zoom API
        chatMessages: 0,
        questionsAsked: 0,
        pollResponses: 0
      });

      console.log(`✅ Analytics generated for session ${sessionId}`);
    } catch (error) {
      console.error('❌ Error generating session analytics:', error);
    }
  }

  // Check if WebSocket is connected
  isWebSocketConnected(): boolean {
    return this.wsConnection?.readyState === WebSocket.OPEN;
  }

  // Cleanup
  async disconnect(): Promise<void> {
    this.stopHeartbeat();
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    console.log('🔌 Zoom service disconnected');
  }

  // Public methods for integration
  async createZoomMeeting(sessionData: {
    title: string;
    startTime: Date;
    duration: number;
    timezone?: string;
  }) {
    try {
      const token = await this.getAccessToken();
      
      const meetingData = {
        topic: sessionData.title,
        type: 2, // Scheduled meeting
        start_time: sessionData.startTime.toISOString(),
        duration: sessionData.duration,
        timezone: sessionData.timezone || 'Asia/Kolkata',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
          audio: 'voip',
          auto_recording: 'cloud'
        }
      };

      const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create Zoom meeting: ${response.status} ${response.statusText}`);
      }

      const meeting = await response.json();
      console.log('✅ Zoom meeting created successfully:', meeting.id);
      
      return {
        zoomMeetingId: meeting.id.toString(),
        joinUrl: meeting.join_url,
        startUrl: meeting.start_url,
        password: meeting.password
      };
    } catch (error) {
      console.error('❌ Error creating Zoom meeting:', error);
      throw error;
    }
  }

  // Get meeting recording
  async getMeetingRecording(zoomMeetingId: string) {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`https://api.zoom.us/v2/meetings/${zoomMeetingId}/recordings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get recording: ${response.status} ${response.statusText}`);
      }

      const recording = await response.json();
      return recording;
    } catch (error) {
      console.error('❌ Error getting meeting recording:', error);
      throw error;
    }
  }
}

// Export singleton instance
export let zoomService: ZoomService | null = null;

export function initializeZoomService(config: ZoomConfig): ZoomService {
  zoomService = new ZoomService(config);
  return zoomService;
}