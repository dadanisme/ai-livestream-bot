export interface LivestreamInfo {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'live' | 'ended';
  scheduledStartTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  viewerCount?: number;
  concurrentViewers?: number;
  url: string;
  liveChatId?: string;
}

export interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}

export interface LiveChatMessage {
  id: string;
  authorName: string;
  authorChannelId?: string;
  message: string;
  timestamp: string;
  type: 'textMessageEvent' | 'superChatEvent' | 'newSponsorEvent' | 'memberMilestoneEvent';
  displayMessage?: string;
  superChatDetails?: {
    amount: string;
    currency: string;
    displayString: string;
  };
}

export interface YouTubeApiResponse<T> {
  data: {
    items: T[];
    nextPageToken?: string;
    pageInfo: {
      totalResults: number;
      resultsPerPage: number;
    };
  };
} 