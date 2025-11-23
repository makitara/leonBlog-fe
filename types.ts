// Backend API Contracts

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  bio: string;
  email: string;
}

export interface ArticleSummary {
  id: string;
  title: string;
  publishDate: string;
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
}

