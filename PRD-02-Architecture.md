# BOOKSTORE PRD — PART 2: SYSTEM ARCHITECTURE & TECH STACK

**Document Version:** 1.0  
**Date:** April 8, 2026  
**Section:** Technical Foundation

---

## 1. HIGH-LEVEL ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (User-Facing)                      │
├─────────────────────────────────────────────────────────────────────┤
│  Web App (Next.js)    │    Mobile (React Native)    │  Voice (Alexa) │
│  (Desktop + Tablet)   │    (iOS + Android)          │  Integration   │
└──────────────┬────────────────────────┬────────────────────────┬─────┘
               │                        │                        │
        ┌──────▼─────────────────────────▼────────────────────────▼──────┐
        │              API GATEWAY & AUTH LAYER                           │
        │  (Rate limiting, JWT/OAuth, Request validation)                │
        └──────┬──────────────────────┬────────┬─────────────────┬───────┘
               │                      │        │                 │
   ┌───────────▼──┐    ┌──────────────▼───┐ ┌─▼──────────┐  ┌──▼────────┐
   │  Core API    │    │  Search Service  │ │ Voice API  │  │Blockchain │
   │  (Django/    │    │  (Elasticsearch) │ │ (Twilio)   │  │ Service   │
   │   FastAPI)   │    │                  │ │            │  │ (Web3)    │
   └────┬─────────┘    └──────────────────┘ └────────────┘  └──────────┘
        │
   ┌────▼────────────────────────────────────────────────────────────┐
   │              APPLICATION SERVICES LAYER                         │
   ├────────────────────────────────────────────────────────────────┤
   │                                                                 │
   │  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐ │
   │  │ User &   │  │ Catalog & │  │ Order &   │  │ Community    │ │
   │  │ Auth Svc │  │ Inventory │  │ Payment   │  │ & Gamif Svc  │ │
   │  └──────────┘  └───────────┘  └───────────┘  └──────────────┘ │
   │                                                                 │
   │  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐ │
   │  │ AI/ML    │  │ Reading   │  │ Blockchain│  │ Notification │ │
   │  │ Recomm.  │  │ Progress  │  │ & NFT     │  │ Service      │ │
   │  └──────────┘  └───────────┘  └───────────┘  └──────────────┘ │
   │                                                                 │
   └────────────────────────────────────────────────────────────────┘
        │
   ┌────▼────────────────────────────────────────────────────────────┐
   │                    DATA LAYER                                   │
   ├────────────────────────────────────────────────────────────────┤
   │                                                                 │
   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
   │  │ PostgreSQL   │  │ Redis Cache  │  │ MongoDB (events)     │ │
   │  │ (Primary DB) │  │ (Session,    │  │ (Reading history)    │ │
   │  │              │  │  rate limit) │  │                      │ │
   │  └──────────────┘  └──────────────┘  └──────────────────────┘ │
   │                                                                 │
   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
   │  │ S3/CDN       │  │ Sprig/        │  │ Ethereum L2 (Polygon│ │
   │  │ (Book covers,│  │ Telemetry    │  │ or Arbitrum)         │ │
   │  │  PDFs)       │  │              │  │                      │ │
   │  └──────────────┘  └──────────────┘  └──────────────────────┘ │
   │                                                                 │
   └────────────────────────────────────────────────────────────────┘
        │
   ┌────▼────────────────────────────────────────────────────────────┐
   │              EXTERNAL INTEGRATIONS & SERVICES                   │
   ├────────────────────────────────────────────────────────────────┤
   │                                                                 │
   │  Stripe/PayPal    │ Audible API    │  SendGrid    │ Sentry    │
   │  (Payments)       │  (Audiobooks)  │  (Email)     │ (Errors)  │
   │                                                                 │
   │  Twilio/Voiceflow │ Hugging Face   │  Pinecone    │ Vercel    │
   │  (Voice ASR)      │  (AI/ML)       │  (Vector DB) │ (Hosting) │
   │                                                                 │
   └────────────────────────────────────────────────────────────────┘
```

---

## 2. TECHNOLOGY STACK

### Frontend (Client)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14 (React 18) | SSR, ISR, excellent DX, production-ready |
| **Styling** | Tailwind CSS + ShadCN/UI | Composable, design-system ready, low-config |
| **State Mgmt** | TanStack Query (Server) + Zustand (Client) | Modern, minimal boilerplate |
| **Forms** | React Hook Form + Zod | Performant, type-safe validation |
| **Mobile** | React Native (Expo) | Code sharing, faster iteration than Flutter |
| **Animation** | Framer Motion + React Spring | Smooth, performant animations |
| **Charts/Viz** | Recharts + D3.js | Data viz, analytics dashboards |
| **Icons** | Lucide React | Consistent, well-maintained icon set |

### Backend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Language** | Python 3.11 | Excellent ML/AI ecosystem, rapid dev |
| **Framework** | FastAPI | Modern, async, auto OpenAPI docs, production-ready |
| **Alternative** | Django + DRF (if team preference) | Mature, batteries-included, security-focused |
| **ORM** | SQLAlchemy 2.0 | Type-safe, flexible, works with FastAPI |
| **Authentication** | OAuth 2.0 + JWT | Industry standard, integrates with Stripe |
| **Task Queue** | Celery + Redis | Async jobs (email, recommendations, blockchain) |
| **API Gateway** | Kong or AWS API Gateway | Rate limiting, auth, request routing |

### Databases

| Database | Purpose | Schema |
|----------|---------|--------|
| **PostgreSQL 15** | Primary data store | Users, Books, Orders, Reviews, Wallets |
| **Redis 7** | Cache + Session store | Session tokens, feed cache, rate limits |
| **MongoDB** | Event log + reading history | Immutable reading events, user activity |
| **Pinecone** | Vector embeddings | Book embeddings for ML recommendations |
| **Elasticsearch** | Full-text search | Book search, review indexing |

### Blockchain & Web3

| Service | Purpose | Chain |
|---------|---------|-------|
| **Web3.py** | Blockchain interaction | Ethereum L2 (Polygon/Arbitrum) |
| **thirdweb** | NFT/Smart contracts | Pre-built contracts for book ownership |
| **MetaMask** | Wallet integration | User custody, easy onboarding |

### AI/ML

| Service | Purpose | Model |
|---------|---------|-------|
| **Hugging Face** | Text embeddings, recommendations | sentence-transformers (all-MiniLM-L6-v2) |
| **OpenAI GPT-4** | Content generation, moderation | Summarization, review cleanup |
| **Twilio + Voiceflow** | Voice ASR, NLU | Voice ordering, command parsing |

### Infrastructure & DevOps

| Service | Purpose | Config |
|---------|---------|--------|
| **Vercel** | Frontend hosting | Auto-deployments, CDN, serverless functions |
| **AWS ECS / Railway** | Backend hosting | Container orchestration, auto-scaling |
| **PostgreSQL (RDS)** | Database hosting | Multi-AZ, automated backups, monitoring |
| **CloudFlare** | CDN for assets | Image optimization, DDoS protection |
| **Sentry** | Error tracking | Real-time alerts, issue aggregation |
| **Datadog** | Monitoring & observability | APM, logs, metrics, dashboards |

### Payment & Billing

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Stripe** | Primary payment processor | Connect for author payouts, subscriptions |
| **Stripe Billing** | Subscription management | Audiobook plans, book club licensing |
| **Tax Jar** | Tax calculation | Multi-jurisdiction sales tax |

### Communication & Notifications

| Service | Purpose | Usage |
|---------|---------|-------|
| **SendGrid** | Transactional email | Welcome, verification, order confirmation |
| **Twilio** | SMS notifications | Order status, reading reminders |
| **Firebase Cloud Messaging** | Mobile push | Reading updates, book club alerts |
| **Kafka** | Event streaming | Real-time activity feed, notifications |

---

## 3. DEPLOYMENT ARCHITECTURE

### Multi-Environment Setup

```
┌──────────────────────────────────────────────────────────────┐
│                     PRODUCTION (US-EAST-1)                   │
├──────────────────────────────────────────────────────────────┤
│  Frontend (Vercel): 99.95% SLA                               │
│  Backend (AWS ECS): Multi-AZ, auto-scaling                   │
│  Database: RDS PostgreSQL with standby replica               │
│  Cache: ElastiCache Redis (Multi-AZ)                         │
│  CDN: CloudFlare (99.99% availability)                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              STAGING (Runs production config)                │
├──────────────────────────────────────────────────────────────┤
│  For QA, performance testing, production rehearsal           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 DEVELOPMENT/LOCAL                            │
├──────────────────────────────────────────────────────────────┤
│  Docker Compose: Postgres, Redis, Elasticsearch locally      │
│  Hot reload enabled for rapid iteration                      │
└──────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
1. Developer pushes to feature branch
   ↓
2. GitHub Actions: Lint, test, build
   ↓
3. If main branch: Auto-deploy to staging
   ↓
4. Manual approval for production deployment
   ↓
5. Blue-green deployment (zero downtime)
   ↓
6. Health checks + monitoring alerts
```

---

## 4. DATA FLOW DIAGRAMS

### Book Discovery Flow
```
User Search
    ↓
API Gateway (Rate limit, Auth)
    ↓
Search Service (Elasticsearch)
    ↓
PostgreSQL (Full book metadata)
    ↓
Redis Cache (Populate hot results)
    ↓
Ranking Engine (Hybrid: Search + ML score)
    ↓
Response (Books + Metadata + User Reviews)
```

### Purchase Flow
```
User Clicks "Buy"
    ↓
Order Service (Inventory check, pricing)
    ↓
Stripe API (Payment authorization)
    ↓
Order stored in PostgreSQL
    ↓
Event published to Kafka
    ↓
Reading Access Service (Grant key)
    ↓
Email confirmation (SendGrid)
    ↓
Update user dashboard (Real-time via WebSocket)
```

### Blockchain Ownership Flow
```
User Claims Digital Ownership (Post-purchase)
    ↓
Blockchain Service (ThirdWeb)
    ↓
Smart Contract: Mint NFT (Book title + user wallet)
    ↓
Verify ownership in MetaMask
    ↓
Update PostgreSQL (Wallet address linked)
    ↓
User can: Hold, resell, lend via marketplace
```

### AI Recommendation Flow
```
User View/Purchase/Rate Book
    ↓
Event stored in MongoDB
    ↓
Batch Job (Nightly): Sync events to feature store
    ↓
Embedding Job: Convert user activity → vector (Pinecone)
    ↓
ML Model: Collaborative + content filtering
    ↓
Generate personalized feed
    ↓
Cache in Redis (TTL: 6 hours)
    ↓
Serve in Homepage recommendation carousel
```

---

## 5. INTEGRATION POINTS

### External APIs & Services

| API | Purpose | Rate Limit | Fallback |
|-----|---------|-----------|----------|
| **Audible API** | Audiobook catalog sync | 1000 req/hour | Cached catalog |
| **Google Books API** | Book metadata enrichment | 40K req/day | Manual editing |
| **Goodreads API (if avail)** | Reviews/ratings import | 100 req/day | User-generated only |
| **Stripe Payments** | Payments + Subscriptions | N/A (Stripe handles) | Queue & retry |
| **MetaMask Wallet** | Web3 wallet connection | N/A (Client-side) | Manual entry |
| **Twilio Voice** | Phone ordering ASR | 10K concurrent connections | Web fallback |

### Third-Party Webhooks

| Webhook | Trigger | Handler |
|---------|---------|---------|
| **Stripe** | Payment.succeeded, Invoice.created | Update order, send email |
| **Audible** | Content.updated | Re-sync catalog, notify users |
| **MetaMask** | Wallet.changed | Update user profile, balance |

---

## 6. SCALABILITY & PERFORMANCE

### Expected Load

| Metric | MVP | Year 1 | Year 3 |
|--------|-----|--------|--------|
| **DAU** | 3,000 | 150,000 | 2M+ |
| **API Requests/sec** | 50 | 2,500 | 30,000+ |
| **Database Reads/sec** | 200 | 5,000 | 50,000+ |
| **Storage (Books)** | 50GB | 500GB | 2TB |
| **CDN Traffic/day** | 20GB | 500GB | 5TB |

### Optimization Strategies

1. **Frontend**
   - Lazy load book covers
   - Code splitting per route
   - Service worker for offline reading
   - Image optimization (WebP, srcset)

2. **Backend**
   - Database indexing on: user_id, book_id, created_at
   - Query result caching (Redis, 1-24hr TTL)
   - Read replicas for analytics queries
   - Connection pooling (PgBouncer)

3. **Search**
   - Elasticsearch sharding (2 primary, 2 replica)
   - Keyword autocomplete caching
   - Search result pagination (25 items/page)

4. **API**
   - Rate limiting (100 req/min per user)
   - GraphQL batching for multiple queries
   - ETag caching for book metadata

---

## 7. SECURITY ARCHITECTURE

### Authentication & Authorization
- **OAuth 2.0** with JWT tokens (15min expiry, refresh: 7 days)
- **Scopes:** `read:books`, `write:reviews`, `manage:wallet`
- **MFA:** TOTP via Google Authenticator (optional → required for high-value actions)

### Data Protection
- **Encryption at rest:** AES-256 for PostgreSQL
- **Encryption in transit:** TLS 1.3 for all APIs
- **PCI DSS:** Stripe handles all card data
- **User data:** PII encrypted, separate from analytics

### API Security
- **Rate limiting:** 100 req/min general, 1000 req/min authenticated
- **CORS:** Whitelist frontend domains only
- **CSRF:** Token-based protection for state-changing ops
- **Input validation:** Zod + SQLAlchemy ORM prevent injection

### Monitoring
- **Sentry:** Real-time error alerts
- **Datadog:** APM + anomaly detection
- **AlertManager:** PagerDuty integration for critical incidents

---

## 8. DISASTER RECOVERY & BACKUP

| Component | Backup Freq | Retention | RTO | RPO |
|-----------|------------|-----------|-----|-----|
| **PostgreSQL** | Hourly | 30 days | 15 min | 1 hour |
| **Redis Cache** | Auto-rebuild | N/A | 5 min | N/A |
| **S3 (Books)** | Auto-replicate | 90 days | 10 min | 15 min |
| **Code** | Every commit (Git) | Unlimited | 10 min | 0 |

**Failover:** Multi-region standby in US-WEST-1 (12hr prep, automated failover available)

---

**NEXT:** See PRD-03-Features.md for detailed feature breakdown
