
// Google API Service (Gmail + Calendar + Drive)
// Note: This requires a Google Cloud Project with the Gmail, Calendar, and Drive APIs enabled.
// You must provide a valid CLIENT_ID.
// The API_KEY from process.env is used for the GAPI client initialization (discovery docs).

declare var gapi: any;
declare var google: any;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE'; 
const API_KEY = process.env.API_KEY || '';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
// Added drive.readonly for fetching context, drive.file for saving generated docs
const SCOPES = 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
    body?: { data?: string };
    parts?: any[];
  };
  internalDate: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  htmlLink: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
  iconLink: string;
}

export const initializeGapiClient = async () => {
  await new Promise<void>((resolve, reject) => {
    if (typeof gapi === 'undefined') {
       reject(new Error("Google API script not loaded"));
       return;
    }
    // Prevent multiple initializations
    if (gapiInited) {
        resolve();
        return;
    }

    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const initializeGisClient = async () => {
  return new Promise<void>((resolve, reject) => {
    if (typeof google === 'undefined') {
        reject(new Error("Google Identity Services script not loaded"));
        return;
    }
    if (gisInited) {
        resolve();
        return;
    }
    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined at request time
      });
      gisInited = true;
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export const handleAuthClick = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
        reject(new Error("Token client not initialized"));
        return;
    }
    
    tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        reject(resp);
      }
      resolve(true);
    };

    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const handleSignoutClick = () => {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token, () => {});
    gapi.client.setToken(null);
  }
};

// --- GMAIL ---

export const listMessages = async (maxResults = 10) => {
  try {
    const response = await gapi.client.gmail.users.messages.list({
      'userId': 'me',
      'maxResults': maxResults,
      'q': 'in:inbox'
    });
    return response.result.messages || [];
  } catch (err) {
    console.error("Error listing messages", err);
    throw err;
  }
};

export const getMessage = async (id: string): Promise<GmailMessage> => {
  try {
    const response = await gapi.client.gmail.users.messages.get({
      'userId': 'me',
      'id': id
    });
    return response.result as unknown as GmailMessage;
  } catch (err) {
    console.error("Error getting message", err);
    throw err;
  }
};

export const sendMessage = async (to: string, subject: string, body: string) => {
  const emailContent = 
    `To: ${to}\r\n` +
    `Subject: ${subject}\r\n` +
    `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
    `${body}`;

  const base64EncodedEmail = btoa(emailContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  try {
    const response = await gapi.client.gmail.users.messages.send({
      'userId': 'me',
      'resource': {
        'raw': base64EncodedEmail
      }
    });
    return response.result;
  } catch (err) {
    console.error("Error sending email", err);
    throw err;
  }
};

export const getHeader = (headers: {name:string, value:string}[], name: string) => {
  return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
};

export const getBody = (payload: any): string => {
  let body = '';
  if (payload.body && payload.body.data) {
    body = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
  } else if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        break;
      }
    }
    if (!body && payload.parts[0]?.body?.data) {
        body = atob(payload.parts[0].body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
  }
  return body;
};

// --- CALENDAR ---

export const listEvents = async (timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> => {
  try {
    const response = await gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': timeMin || (new Date()).toISOString(),
      'timeMax': timeMax,
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 50,
      'orderBy': 'startTime'
    });
    return response.result.items;
  } catch (err) {
    console.error("Error listing events", err);
    throw err;
  }
};

export const createEvent = async (event: any) => {
  try {
    const response = await gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    });
    return response.result;
  } catch (err) {
    console.error("Error creating event", err);
    throw err;
  }
};

// --- GOOGLE DRIVE ---

export const listDriveFiles = async (): Promise<DriveFile[]> => {
  try {
    // We filter for Google Docs and Text files for now as they are easiest to ingest
    const response = await gapi.client.drive.files.list({
      'pageSize': 20,
      'fields': "nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink, iconLink)",
      'q': "(mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType = 'application/pdf') and trashed = false"
    });
    return response.result.files;
  } catch (err) {
    console.error("Error listing drive files", err);
    throw err;
  }
};

export const getDriveFileContent = async (fileId: string, mimeType: string): Promise<string> => {
    try {
        let response;
        if (mimeType === 'application/vnd.google-apps.document') {
            // Must export Google Docs
            response = await gapi.client.drive.files.export({
                fileId: fileId,
                mimeType: 'text/plain'
            });
        } else {
            // Download other files directly
            response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });
        }
        return response.body;
    } catch (err) {
        console.error("Error reading file content", err);
        throw err;
    }
};

export const uploadToDrive = async (name: string, content: string) => {
    try {
        const fileMetadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.document'
        };
        
        // This is a simplified upload for demo. 
        // Real implementations typically use multipart/related for metadata + content.
        // For text to GDoc, we can often just create the file.
        // However, gapi.client.drive.files.create with 'media' is complex in JS client.
        // We will assume "creation" means creating a blank doc or basic text file for this MVP.
        
        const response = await gapi.client.drive.files.create({
            resource: {
                name: name,
                mimeType: 'text/plain' // Saving as text for simplicity in this demo
            },
            media: {
                mimeType: 'text/plain',
                body: content
            }
        });
        return response.result;
    } catch (err) {
        console.error("Error uploading to drive", err);
        throw err;
    }
};
