# Digital Impact Hub v32.0

A professional, local-first digital pedagogy coaching system with strategic pillar management, time-based planning, and comprehensive reporting.

## 🚀 Features

### ✨ Core Functionality
- **4 Strategic Pillars**: Consolidated framework for organizing all work
- **Time-Based Planner**: 15-minute time slots with drag-and-drop scheduling
- **Daily Update Dashboard**: Reflect on your day and log impact statements
- **Advanced Reporting**: Filter by pillar, project, TLAM, and export to PDF
- **Deep Linking**: Meetings → Projects → Strategies with full cross-referencing
- **Impact Statements**: Track and report on outcomes throughout the system

### 📊 Views

1. **Dashboard** - Overview of active projects, progress, and quick actions
2. **Strategy** - Manage your 4 strategic pillars and milestones
3. **Planner** - Time-based weekly calendar with action hopper
4. **Projects** - Deep project management with tasks and evidence
5. **Meetings** - Notebook system linked to projects and strategies
6. **Daily Update** - End-of-day reflection and impact logging
7. **Reports** - Comprehensive analytics with PDF export
8. **Timeline** - Gantt-style view of all projects

## 🎯 The 4 Strategic Pillars

1. **Digital Ecosystem & Standards** (Cyan)
   - Teams Health Checks, Infrastructure, Equipment Audits

2. **Pedagogy, Assessment & Innovation** (Purple)
   - AI for Assessment, Digital Modelling, Autonomous Learning

3. **Inclusion & Accessibility** (Green)
   - Assistive Tech, Accessibility Toolkit, SEND Support

4. **Capacity Building & QA** (Orange)
   - Digital Champions, TLA Upskilling, Quality Processes

## 📁 File Structure
```
digital-hub-repo/
├── index.html          # Main application
├── css/
│   └── styles.css      # All styles (no Tailwind CDN)
├── js/
│   └── app.js          # Core application logic
├── data/
│   └── digital-coach-data.json  # Your data file
└── README.md           # This file
```

## 🔧 Setup

### GitHub Pages Deployment

1. **Push to GitHub**:
```bash
   git init
   git add .
   git commit -m "Initial commit: Digital Impact Hub v32"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/digital-impact-hub.git
   git push -u origin main
```

2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Save

3. **Access your app**:
   - URL: `https://YOUR-USERNAME.github.io/digital-impact-hub/`

### Local Development

1. Clone the repository
2. Open `index.html` in your browser
3. Click "Connect Data" and select your `digital-coach-data.json` file

## 💾 Data Management

### Connecting Your Data
1. Click "Connect Data" button in the header
2. Select your `digital-coach-data.json` file
3. Your data loads automatically with all features

### Saving Changes
- Click "Save" button in the header
- Auto-saves after major operations
- Your data stays local on your device

### Backup Strategy
- Keep multiple versions in your file system
- Commit to Git regularly
- Export reports as PDFs for archives

## 📋 Workflow Examples

### Daily Workflow:
1. **Morning**: Check "Planner" - see your day
2. **During Day**: Complete tasks, attend meetings
3. **Evening**: Go to "Daily Update"
   - Review what happened
   - Add comments
   - Log evidence links
   - Write impact statements
   - Click "Save Updates"
4. **Result**: All evidence automatically logs to linked projects

## 🆘 Troubleshooting

### "My data didn't load"
- Make sure you're selecting the right JSON file
- Check browser console for errors (F12)
- Try a different browser (Chrome/Edge recommended)

### "Changes aren't saving"
- Click the "Save" button in header
- Check file permissions
- Make sure file isn't read-only

## 📄 License

Personal use only. Created for Weston College digital pedagogy coaching.

---

**Version**: 32.0  
**Last Updated**: February 2026  
**Status**: Production Ready ✅
