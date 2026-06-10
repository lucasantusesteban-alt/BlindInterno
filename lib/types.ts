export type UserRole = "admin" | "creative" | "content" | "operations" | "marketing";
export type UserStatus = "online" | "offline" | "busy";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  initials: string;
  color: string;
  area: string;
  status: UserStatus;
}

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskType =
  | "design" | "content" | "production" | "web" | "shopify"
  | "campaign" | "photo" | "video" | "paid_ads" | "influencers"
  | "operations" | "product" | "drop" | "finance" | "legal" | "other";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  type: TaskType;
  tags: string[];
  comments: Comment[];
  checklist: ChecklistItem[];
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentPlatform =
  | "tiktok" | "instagram_reels" | "instagram_stories" | "instagram_feed"
  | "youtube_shorts" | "web" | "email" | "whatsapp" | "paid_ads" | "other";

export type ContentFormat =
  | "reel" | "story" | "carousel" | "product_photo" | "teaser"
  | "drop_announcement" | "bts" | "meme" | "editorial"
  | "influencer" | "ugc" | "launch_reminder" | "scarcity" | "post_drop_recap";

export type ContentStatus =
  | "idea" | "script" | "in_production" | "ready"
  | "scheduled" | "published" | "needs_changes" | "cancelled";

export interface ContentItem {
  id: string;
  title: string;
  platform: ContentPlatform;
  format: ContentFormat;
  publishDate: string;
  publishTime?: string;
  assigneeId: string;
  status: ContentStatus;
  copy?: string;
  campaignId?: string;
  objective?: string;
  cta?: string;
  expectedMetric?: number;
  realMetric?: number;
  notes?: string;
  tags: string[];
}

export type CampaignStatus = "concept" | "preparing" | "teasing" | "live" | "sold_out" | "closed" | "archived";

export interface DropChecklist {
  productDefined: boolean;
  mockupsReady: boolean;
  photosReady: boolean;
  pageReady: boolean;
  stockValidated: boolean;
  priceValidated: boolean;
  copiesReady: boolean;
  calendarClosed: boolean;
  emailReady: boolean;
  storiesReady: boolean;
  reelsReady: boolean;
  influencersActivated: boolean;
  paymentTested: boolean;
  testPurchaseDone: boolean;
  finalPublicationValidated: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  launchDate: string;
  closeDate?: string;
  status: CampaignStatus;
  objective?: string;
  product?: string;
  price?: number;
  stock?: number;
  targetSales?: number;
  realSales?: number;
  leadId: string;
  teamIds: string[];
  checklist: DropChecklist;
  contentIds: string[];
  taskIds: string[];
  notes?: string;
  coverColor?: string;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  change: number;
  unit?: string;
  period: string;
}

export type AssetStatus = "draft" | "approved" | "archived";

export type AssetType =
  | "logo" | "mockup" | "product_photo" | "video" | "copy"
  | "template" | "reference" | "story_asset" | "reel_asset"
  | "document" | "brand_book" | "palette" | "typography" | "other";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  category: string;
  date: string;
  authorId: string;
  campaignId?: string;
  tags: string[];
  status: AssetStatus;
  preview?: string;
  url?: string;
  size?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "task" | "content" | "campaign" | "system" | "comment";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface WeeklyFocus {
  objective: string;
  priorities: string[];
  risks: string[];
  activeCampaigns: string[];
  criticalContent: string[];
}

export type InternalEventType =
  | "meeting" | "review" | "planning" | "shoot" | "deadline" | "1to1" | "offsite"
  | "post" | "recording" | "video_script" | "other";

export interface InternalEvent {
  id: string;
  title: string;
  type: InternalEventType;
  date: string;
  startTime?: string;
  endTime?: string;
  attendeeIds: string[];
  location?: string;
  description?: string;
  color?: string;
}
