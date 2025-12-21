# HEARTH Project Mind Map

## Current Architecture (Updated Nov 2025)

```mermaid
mindmap
  root((HEARTH))
    Frontend UI
      Web Interface
        Interactive Search
        Hunt Browsing
        Category Filtering
        PEAK Framework Display
        Chat Widget AI Assistant
      Technologies
        HTML5 CSS3
        Vanilla JavaScript
        GitHub Pages
        Marked.js Markdown
        DOMPurify XSS Protection
      Features
        Search & Filter
        Sort by Multiple Fields
        Modal Hunt Details
        Responsive Design
        Statistics Dashboard
        Tag Cloud
        Contributor Leaderboard
    Hunt Database
      Content 70+ Hunts
        Flames Hypothesis
          52 Hunt Files
          H001-H052
        Embers Baseline
          11 Hunt Files
          B001-B011
        Alchemy Model-Assisted
          7 Hunt Files
          M001-M007
      Data Storage
        Markdown Source of Truth
        SQLite Database Index
        JSON Data Export
        MITRE ATT&CK Mapping
      Performance
        2.7x Faster Queries
        30-60x Faster Deduplication
        99% I/O Reduction
    AI Automation
      AI Providers
        Claude Sonnet 4.5
        OpenAI GPT-4
        Configurable Provider
      AI Capabilities
        CTI Analysis
        Hunt Generation
        TTP Extraction
        Duplicate Detection
        Similarity Analysis
        Hypothesis Creation
      Quality Control
        TTP Diversity Checking
        MITRE Validation
        Content Quality
        Format Standardization
    GitHub Automation
      11 Workflows
        CTI Processing
        Manual Submission
        Hunt Regeneration
        Database Updates
        Leaderboard Updates
        PR Automation
        Auto-merge Approved
        Notebook Generation
        GitHub Pages Deploy
      Submission Types
        CTI URL Submission
        Manual Hunt Form
        Regenerate with Feedback
      Automation Features
        Auto-branch Creation
        Draft PR Generation
        Duplicate Flagging
        Review Comments
    MITRE ATT&CK Integration
      Coverage
        691 Techniques Indexed
        Official Enterprise Data
        Real-time Validation
        99% Tactic Accuracy
      Validation Pipeline
        Exact Match Primary
        Table Lookup Secondary
        Keyword Fallback Tertiary
        Confidence Scoring
      Data Sources
        Official MITRE JSON
        Tactic Mappings
        Technique Descriptions
    Content Processing
      Web Scraping
        Brotli Decompression
        Zstandard Support
        JavaScript Rendering
        PDF Parsing
        DOCX Parsing
        Readability Extraction
      Hunt Parsing
        Markdown Tables
        Metadata Extraction
        Reference Links
        Tag Assignment
      Validation
        Schema Validation
        Duplicate Prevention
        TTP Diversity
        Format Checks
    Database System
      SQLite Index
        72KB Database
        Incremental Updates
        File Change Detection
        Metadata Cache
      Performance
        Fast Queries 0.14ms
        Reduced I/O 99%
        GitHub Actions 75% Faster
      Maintenance
        Auto-rebuild on Changes
        Manual Rebuild Option
        Version Controlled
    Community Features
      Contributor System
        Automated Leaderboard
        Hunt Attribution
        Recognition System
        GitHub Integration
      Collaboration
        Issue-based Submission
        Review Process
        Feedback Loop
        Regeneration Requests
      Quality
        Peer Review
        Maintainer Approval
        Duplicate Detection
        TTP Coverage
    Development
      Code Quality
        Python Flake8 Config
        JavaScript ESLint
        90% Linting Improvement
        1155 Issues Fixed
      Testing
        Unit Tests
        Integration Tests
        Performance Tests
        Similarity Tests
        Database Tests
      Documentation
        README.md
        Testing Guide
        Optimization Guide
        Contributing Guide
        API Documentation
```

## System Architecture Flow

```mermaid
graph TB
    %% User Entry Points
    USER[👤 User]
    WEB[🌐 Web Interface<br/>GitHub Pages]
    ISSUE[📝 GitHub Issue<br/>Submission]

    %% Data Storage
    HUNTS[(🔥 Hunt Database<br/>70+ Hunts)]
    SQLITE[(⚡ SQLite Index<br/>72KB Fast Queries)]
    MARKDOWN[📄 Markdown Files<br/>Source of Truth]

    %% Processing Layer
    ACTIONS[⚙️ GitHub Actions<br/>11 Workflows]
    CTI[🤖 CTI Processor<br/>AI Analysis]
    PARSE[📋 Hunt Parser<br/>Metadata Extract]
    DEDUP[🔍 Duplicate Detection<br/>30-60x Faster]
    VALIDATE[✅ Validators<br/>Quality Control]

    %% AI Services
    CLAUDE[🧠 Claude API<br/>Sonnet 4.5]
    GPT[🤖 OpenAI API<br/>GPT-4]

    %% MITRE Integration
    MITRE[🎯 MITRE ATT&CK<br/>691 Techniques]

    %% Frontend Assets
    APPJS[📱 app.js<br/>UI Logic]
    CHATJS[💬 chat-widget.js<br/>AI Assistant]
    DATAJS[📊 hunts-data.js<br/>Static Data]

    %% Community
    LEADER[🏆 Leaderboard<br/>Contributors]

    %% User Flow
    USER -->|Browse Hunts| WEB
    USER -->|Submit CTI/Hunt| ISSUE

    %% Submission Pipeline
    ISSUE --> ACTIONS
    ACTIONS --> CTI
    CTI --> CLAUDE
    CTI --> GPT
    CTI --> MITRE
    MITRE --> VALIDATE
    CTI --> PARSE
    PARSE --> DEDUP
    DEDUP --> SQLITE
    DEDUP --> VALIDATE
    VALIDATE --> MARKDOWN

    %% Database System
    MARKDOWN --> HUNTS
    HUNTS --> SQLITE
    SQLITE --> DATAJS

    %% Frontend
    DATAJS --> APPJS
    DATAJS --> CHATJS
    APPJS --> WEB
    CHATJS --> WEB

    %% Community Features
    MARKDOWN --> LEADER
    LEADER --> WEB

    %% Database Maintenance
    HUNTS -.->|File Changes| ACTIONS
    ACTIONS -.->|Rebuild| SQLITE

    style HUNTS fill:#ff9999,stroke:#333,stroke-width:4px
    style SQLITE fill:#99ff99,stroke:#333,stroke-width:3px
    style CLAUDE fill:#9999ff,stroke:#333,stroke-width:2px
    style GPT fill:#9999ff,stroke:#333,stroke-width:2px
    style MITRE fill:#ffff99,stroke:#333,stroke-width:2px
    style ACTIONS fill:#99ffff,stroke:#333,stroke-width:2px
```

## CTI Submission Workflow

```mermaid
sequenceDiagram
    participant User
    participant GitHub Issues
    participant GitHub Actions
    participant Web Scraper
    participant AI
    participant MITRE Validator
    participant Duplicate Detector
    participant SQLite DB
    participant PR System

    User->>GitHub Issues: Submit CTI URL
    GitHub Issues->>GitHub Actions: Trigger workflow
    GitHub Actions->>Web Scraper: Fetch content
    Web Scraper->>Web Scraper: Decompress
    Web Scraper->>Web Scraper: Parse content
    Web Scraper->>GitHub Actions: Return clean text
    GitHub Actions->>AI: Analyze CTI
    AI->>AI: Extract TTPs
    AI->>AI: Generate hypothesis
    AI->>GitHub Actions: Return hunt draft
    GitHub Actions->>MITRE Validator: Validate techniques
    MITRE Validator->>GitHub Actions: Return tactic mapping
    GitHub Actions->>Duplicate Detector: Check similarity
    Duplicate Detector->>SQLite DB: Query existing hunts
    SQLite DB->>Duplicate Detector: Return matches
    Duplicate Detector->>GitHub Actions: Similarity report
    GitHub Actions->>PR System: Create branch & PR
    PR System->>GitHub Issues: Comment with results
    GitHub Issues->>User: Notification
```

## Database Performance Architecture

```mermaid
graph LR
    subgraph "Source of Truth"
        F[📄 Flames/*.md]
        E[📄 Embers/*.md]
        A[📄 Alchemy/*.md]
    end

    subgraph "Build Process"
        BUILDER[🔨 build_hunt_database.py]
        DETECT[🔍 File Change Detection]
        EXTRACT[📋 Metadata Extraction]
    end

    subgraph "SQLite Index"
        DB[(⚡ hunts.db<br/>72KB)]
        IDX[📊 Indexes]
        CACHE[💾 Metadata Cache]
    end

    subgraph "Query Layer"
        FAST[⚡ Fast Queries<br/>0.14ms]
        DEDUP[🔍 Duplicate Detection<br/>30-60x Faster]
    end

    F --> BUILDER
    E --> BUILDER
    A --> BUILDER
    BUILDER --> DETECT
    DETECT --> EXTRACT
    EXTRACT --> DB
    DB --> IDX
    DB --> CACHE
    IDX --> FAST
    CACHE --> DEDUP

    style DB fill:#99ff99,stroke:#333,stroke-width:3px
```

## Technology Stack Distribution

```mermaid
pie title HEARTH Technology Components
    "Python Scripts" : 40
    "Markdown Hunts" : 70
    "JavaScript Files" : 3
    "GitHub Actions" : 11
    "Documentation" : 15
    "Config Files" : 5
```

## Performance Improvements Timeline

```mermaid
gantt
    title HEARTH Performance Evolution
    dateFormat YYYY-MM
    section Database
    File-based queries           :2024-01, 2024-10
    SQLite index implementation  :2024-10, 2024-11
    section AI
    Basic AI generation          :2024-01, 2024-08
    MITRE integration            :2024-08, 2024-11
    TTP diversity checking       :2024-09, 2024-11
    section Quality
    Manual duplicate detection   :2024-01, 2024-09
    AI-powered deduplication     :2024-09, 2024-11
    section Code
    Initial codebase             :2024-01, 2024-11
    Linting cleanup 90%          :milestone, 2024-11, 0d
```

## Key Metrics & Achievements

| Metric | Value | Achievement |
|--------|-------|-------------|
| **Total Hunts** | 70+ | Growing database |
| **MITRE Techniques** | 691 indexed | Complete coverage |
| **Query Speed** | 0.14ms | 35-70x faster |
| **Deduplication** | 0.5s | 30-60x faster |
| **Code Quality** | 90% improved | 1,155 issues fixed |
| **Tactic Accuracy** | 99% | MITRE integration |
| **I/O Reduction** | 99% | SQLite optimization |
| **GitHub Actions** | 75% faster | Database indexing |
| **Hunt Types** | 3 (PEAK) | Standardized framework |
| **Workflows** | 11 automated | Full CI/CD |

## Core Strengths

1. **🎯 AI-Powered Automation** - Claude/GPT integration
2. **⚡ High Performance** - SQLite index, 30-60x faster
3. **🎯 MITRE Integration** - 691 techniques, 99% accuracy
4. **🔍 Quality Control** - Multi-tier duplicate detection
5. **👥 Community-Driven** - GitHub-based collaboration
6. **📊 PEAK Framework** - Standardized categorization
7. **🔄 Full Automation** - 11 GitHub Actions workflows
8. **✅ Code Quality** - 90% linting improvement
9. **📱 Responsive UI** - Mobile-friendly interface
10. **🏆 Recognition** - Automated contributor leaderboard
