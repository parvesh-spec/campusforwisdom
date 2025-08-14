import { ZoomService, initializeZoomService } from './zoomService';

// Initialize Zoom service with environment variables
const zoomConfig = {
  accountId: process.env.ZOOM_ACCOUNT_ID!,
  clientId: process.env.ZOOM_CLIENT_ID!,
  clientSecret: process.env.ZOOM_CLIENT_SECRET!,
  secretToken: process.env.ZOOM_SECRET_TOKEN!,
  websocketEndpointUrl: process.env.ZOOM_WEBSOCKET_ENDPOINT_URL!,
};

// Validate required environment variables
const requiredVars = ['ZOOM_ACCOUNT_ID', 'ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET', 'ZOOM_SECRET_TOKEN', 'ZOOM_WEBSOCKET_ENDPOINT_URL'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

export const zoomService = initializeZoomService(zoomConfig);

// Initialize WebSocket connection on service startup
export async function startZoomService() {
  try {
    console.log('🚀 Starting Zoom service...');
    await zoomService.connectWebSocket();
    console.log('✅ Zoom service started successfully');
  } catch (error) {
    console.error('❌ Failed to start Zoom service:', error);
  }
}

// Graceful shutdown
export async function stopZoomService() {
  try {
    console.log('🛑 Stopping Zoom service...');
    await zoomService.disconnect();
    console.log('✅ Zoom service stopped successfully');
  } catch (error) {
    console.error('❌ Error stopping Zoom service:', error);
  }
}