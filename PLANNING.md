# Liberty Lens - Planning Document

## Project Overview

Liberty Lens is a web application that enables users to create personalized news feeds analyzed through a libertarian perspective. The platform leverages AI agents to analyze news articles, providing users with curated content that aligns with libertarian principles while maintaining transparency about bias and perspective.

## Core Goals

### Primary Objectives

1. **Personalized News Aggregation**: Allow users to create custom news feeds based on their interests and preferred sources
2. **Libertarian Analysis**: Provide AI-powered analysis of news articles through a libertarian lens
3. **Transparency**: Clearly indicate bias, perspective, and analysis methodology
4. **User Control**: Give users full control over their feed preferences and analysis parameters

### Secondary Objectives

1. **Educational Component**: Help users understand libertarian perspectives on current events
2. **Source Diversity**: Encourage exposure to multiple viewpoints while maintaining analytical consistency
3. **Community Features**: Enable users to share and discuss analyses

## User Stories

### Account Management

- As a user, I want to sign up for an account to save my preferences
- As a user, I want to log in securely to access my personalized feed
- As a user, I want to manage my profile and notification settings

### Feed Customization

- As a user, I want to select news sources to include in my feed
- As a user, I want to filter content by topics (economics, foreign policy, civil liberties, etc.)
- As a user, I want to adjust the intensity of libertarian analysis (light, moderate, deep)
- As a user, I want to save and manage multiple feed configurations

### Content Consumption

- As a user, I want to see a chronological feed of analyzed articles
- As a user, I want to read AI-generated libertarian analysis for each article
- As a user, I want to see the original article alongside the analysis
- As a user, I want to understand why specific libertarian principles apply

### Interaction Features

- As a user, I want to rate the quality of analyses
- As a user, I want to save articles for later reading
- As a user, I want to share analyzed articles with others
- As a user, I want to see trending topics within the libertarian community

## Technical Architecture

### Frontend (React Router v7 + TypeScript)

```
app/
├── routes/
│   ├── _auth/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── logout.tsx
│   ├── dashboard/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── feeds/
│   │   │   ├── index.tsx
│   │   │   ├── $feedId.tsx
│   │   │   └── new.tsx
│   │   ├── articles/
│   │   │   ├── index.tsx
│   │   │   └── $articleId.tsx
│   │   └── settings/
│   │       ├── index.tsx
│   │       ├── profile.tsx
│   │       └── preferences.tsx
│   └── home.tsx
├── components/
│   ├── auth/
│   ├── feed/
│   ├── article/
│   └── common/
├── hooks/
├── utils/
└── services/
```

### Backend Architecture (AWS via SST)

#### API Layer

- **Lambda Functions**: Serverless compute for API handlers

#### Data Layer

- **DynamoDB**: User profiles, feed configurations, saved articles
- **S3**: Static asset storage, article cache

#### AI Analysis Pipeline

- **SQS**: Queue for article processing
- **Lambda**: Article fetching and preprocessing
- **Bedrock/OpenAI**: LLM integration for libertarian analysis
- **DynamoDB**: Store analysis results

#### News Aggregation

- **EventBridge**: Scheduled news source polling
- **Lambda**: RSS/API fetchers for various news sources
- **SQS**: Article processing queue

### Data Models

#### User

```typescript
interface User {
  userId: string;
  email: string;
  username: string;
  createdAt: string;
  preferences: UserPreferences;
  subscription: SubscriptionTier;
}

interface UserPreferences {
  analysisIntensity: "light" | "moderate" | "deep";
  topics: string[];
  emailNotifications: boolean;
  timezone: string;
}
```

#### Feed Configuration

```typescript
interface FeedConfig {
  feedId: string;
  userId: string;
  name: string;
  sources: NewsSource[];
  topics: string[];
  keywords: string[];
  analysisSettings: AnalysisSettings;
  createdAt: string;
  updatedAt: string;
}

interface NewsSource {
  sourceId: string;
  name: string;
  url: string;
  type: "rss" | "api";
  enabled: boolean;
}
```

#### Article & Analysis

```typescript
interface Article {
  articleId: string;
  sourceId: string;
  originalUrl: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  fetchedAt: string;
  tags: string[];
}

interface Analysis {
  analysisId: string;
  articleId: string;
  feedId: string;
  libertarianScore: number; // 0-100
  keyPoints: string[];
  principles: LibertarianPrinciple[];
  summary: string;
  fullAnalysis: string;
  sentiment: "positive" | "neutral" | "critical";
  createdAt: string;
}

interface LibertarianPrinciple {
  name: string;
  relevance: "high" | "medium" | "low";
  explanation: string;
}
```

## Feature Roadmap

### Phase 1: MVP (Months 1-2)

- [ ] User authentication (signup, login, logout)
- [ ] Basic feed creation with RSS sources
- [ ] Simple AI analysis using GPT-4
- [ ] Article display with analysis
- [ ] Basic user preferences

### Phase 2: Enhanced Features (Months 3-4)

- [ ] Multiple feed management
- [ ] Advanced filtering and search
- [ ] Saved articles and reading lists
- [ ] Email digest notifications
- [ ] Analysis feedback system

### Phase 3: Community Features (Months 5-6)

- [ ] User comments on analyses
- [ ] Share analyzed articles
- [ ] Trending topics dashboard
- [ ] User-submitted sources
- [ ] API for third-party integrations

### Phase 4: Advanced AI (Months 7-8)

- [ ] Custom AI model fine-tuning
- [ ] Comparative analysis across sources
- [ ] Fact-checking integration
- [ ] Bias detection and reporting
- [ ] Multi-perspective analysis options

## AI Analysis Framework

### Libertarian Principles to Analyze

1. **Individual Liberty**: Personal freedom and autonomy
2. **Limited Government**: Minimal state intervention
3. **Free Markets**: Economic freedom and voluntary exchange
4. **Property Rights**: Private property protection
5. **Non-Aggression Principle**: Opposition to coercion
6. **Constitutional Rights**: Adherence to constitutional limits
7. **Fiscal Responsibility**: Government spending and taxation
8. **Civil Liberties**: Privacy, speech, and personal rights

### Analysis Process

1. **Content Extraction**: Fetch and parse article content
2. **Topic Classification**: Identify relevant libertarian topics
3. **Principle Mapping**: Match content to libertarian principles
4. **Analysis Generation**: Create comprehensive libertarian perspective
5. **Bias Acknowledgment**: Clearly state the libertarian lens
6. **Alternative Views**: Briefly acknowledge other perspectives

### Prompting Strategy

```
System: You are a libertarian policy analyst providing perspective on news articles.
Your analysis should:
- Clearly identify relevant libertarian principles
- Explain how the article relates to these principles
- Provide thoughtful critique without being dismissive
- Acknowledge the libertarian perspective as one of many valid viewpoints
- Focus on facts and logical arguments
- Avoid partisan rhetoric

Article: [Article content]

Provide analysis covering:
1. Summary of key points
2. Relevant libertarian principles
3. Analysis through libertarian lens
4. Potential concerns from libertarian perspective
5. Alternative policy suggestions aligned with libertarian values
```

## Security & Privacy Considerations

### Data Protection

- Encrypt user data at rest and in transit
- Implement proper authentication and authorization
- Regular security audits and penetration testing
- GDPR/CCPA compliance for user data

### Content Moderation

- Filter inappropriate or harmful content
- Implement reporting mechanisms
- Regular review of AI-generated content
- Clear content policies

### Transparency

- Open about AI usage and limitations
- Clear labeling of AI-generated content
- Accessible privacy policy
- User data export functionality

## Success Metrics

### User Engagement

- Daily/Monthly Active Users
- Average session duration
- Articles read per session
- Analysis engagement rate

### Content Quality

- User ratings of analyses
- Feedback sentiment analysis
- Principle identification accuracy
- Source diversity index

### Technical Performance

- API response times
- Analysis generation speed
- System uptime
- Error rates

## Monetization Strategy

### Subscription Tiers

1. **Free Tier**
   - 50 articles/month
   - Basic analysis
   - Single feed
2. **Premium ($9.99/month)**
   - Unlimited articles
   - Deep analysis
   - Multiple feeds
   - Email digests
3. **Professional ($19.99/month)**
   - API access
   - Bulk exports
   - Custom analysis parameters
   - Priority processing

## Development Principles

### Extreme Programming Practices

- Test-driven development
- Simple, working code first
- Continuous refactoring
- Pair programming for complex features
- Regular releases

### Code Quality

- TypeScript for type safety
- Comprehensive test coverage
- ESLint/Prettier for consistency
- Code reviews for all changes
- Documentation for all APIs

### Infrastructure as Code

- All AWS resources defined in SST
- Environment-specific configurations
- Automated deployments
- Resource monitoring and alerting

## Next Steps

1. **Technical Setup**
   - [ ] Configure AWS account and SST
   - [ ] Set up CI/CD pipeline
   - [ ] Initialize database schemas
   - [ ] Create API boilerplate

2. **MVP Development**
   - [ ] Implement authentication flow
   - [ ] Build basic feed creation UI
   - [ ] Integrate first news source (RSS)
   - [ ] Implement basic AI analysis
   - [ ] Deploy alpha version

3. **User Research**
   - [ ] Interview potential users
   - [ ] Validate feature priorities
   - [ ] Test AI analysis quality
   - [ ] Gather feedback on UI/UX

4. **Partnerships**
   - [ ] Reach out to libertarian organizations
   - [ ] Identify preferred news sources
   - [ ] Explore API partnerships
   - [ ] Build community relationships

---

_This document is a living guide and will be updated as the project evolves._
