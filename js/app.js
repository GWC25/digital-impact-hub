// Digital Impact Hub v32.0 - Core Application
function app() {
    return {
        // State
        view: 'dashboard',
        fileHandle: null,
        showModal: false,
        addTaskModal: false,
        
        // Data
        projects: [],
        todos: [],
        meetingNotes: [],
        calendarEvents: [],
        dailyUpdates: [],
        pillars: [],
        
        // Filters
        hopperSearch: '',
        hopperFilter: '',
        reportFilter: {
            pillar: '',
            project: '',
            tlam: '',
            startDate: '',
            endDate: ''
        },
        
        // Calendar
        currentWeekStart: null,
        weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        timeSlots: [],
        draggedTask: null,
        
        // Settings
        settings: {
            kpis: [],
            qaSources: [],
            meetingCategories: []
        },
        
        // UI
        toasts: [],
        currentProject: {},
        currentMeeting: null,
        
        // Navigation
        navItems: [
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'strategy', label: 'Strategy' },
            { id: 'planner', label: 'Planner' },
            { id: 'projects', label: 'Projects' },
            { id: 'meetings', label: 'Meetings' },
            { id: 'daily-update', label: 'Daily Update' },
            { id: 'reports', label: 'Reports' },
            { id: 'timeline', label: 'Timeline' }
        ],

        // ===== INITIALIZATION =====
        async init() {
            // Initialize settings
            this.settings.kpis = [
                'Teaching Quality Indicators',
                'QIP Traction',
                'Staff Capability',
                'Staff Confidence',
                'Student Experience',
                'Retention Proxy',
                'Value for Money',
                'Digital Champions'
            ];
            
            this.settings.qaSources = [
                'Learning Walk Data',
                'TLA Profile',
                'QIP Review',
                'Coaching Record',
                'Staff Survey',
                'Learner Voice',
                'Exit Interview',
                'Teams Analytics',
                'Other'
            ];
            
            this.settings.meetingCategories = [
                '1:1 Line Manager',
                'Wider Leadership',
                'HoAs',
                'Digital Leads',
                'Champions',
                'TLAMs',
                'Quality Team',
                'External',
                'Other'
            ];
            
            // Initialize 4 pillars
            this.pillars = [
                {
                    id: 1,
                    title: 'Digital Ecosystem & Standards',
                    intent: 'Build reliable, accessible digital infrastructure',
                    color: '#0891b2'
                },
                {
                    id: 2,
                    title: 'Pedagogy, Assessment & Innovation',
                    intent: 'Transform teaching through digital tools',
                    color: '#7c3aed'
                },
                {
                    id: 3,
                    title: 'Inclusion & Accessibility',
                    intent: 'Ensure equitable digital access for all learners',
                    color: '#059669'
                },
                {
                    id: 4,
                    title: 'Capacity Building & QA',
                    intent: 'Develop staff capability and quality processes',
                    color: '#ea580c'
                }
            ];
            
            // Generate time slots (15-minute intervals from 08:00 to 18:00)
            this.generateTimeSlots();
            
            // Set current week
            this.currentWeekStart = this.getWeekStart(new Date());
        },
        
        generateTimeSlots() {
            this.timeSlots = [];
            for (let hour = 8; hour <= 18; hour++) {
                for (let min = 0; min < 60; min += 15) {
                    const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                    this.timeSlots.push(time);
                }
            }
        },

        // ===== FILE OPERATIONS =====
        async openFile() {
            try {
                const [handle] = await window.showOpenFilePicker({
                    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
                });
                
                this.fileHandle = handle;
                const file = await handle.getFile();
                const text = await file.text();
                
                if (text.trim()) {
                    const data = JSON.parse(text);
                    
                    // Load projects with migration support
                    this.projects = (data.projects || []).map(p => ({
                        ...p,
                        pillarId: p.priorityId || p.pillarId || '',
                        impactStatement: p.impactStatement || '',
                        milestones: (p.milestones || []).map(m => ({
                            ...m,
                            uuid: m.uuid || Date.now() + Math.random()
                        })),
                        updates: p.updates || []
                    }));
                    
                    // Load todos
                    this.todos = (data.todos || []).map(t => ({
                        ...t,
                        id: t.id || Date.now() + Math.random(),
                        type: t.type || 'activity',
                        duration: t.duration || 60 // default 1 hour
                    }));
                    
                    // Load meeting notes
                    this.meetingNotes = (data.meetingNotes || []).map(n => ({
                        ...n,
                        id: n.id || Date.now() + Math.random(),
                        links: n.links || []
                    }));
                    
                    // Load calendar events
                    this.calendarEvents = (data.calendarEvents || []).map(e => ({
                        ...e,
                        duration: e.duration || 60,
                        startTime: e.time || e.startTime || '09:00',
                        endTime: e.endTime || this.addMinutes(e.time || '09:00', e.duration || 60)
                    }));
                    
                    // Load daily updates
                    this.dailyUpdates = data.dailyUpdates || [];
                    
                    // Load pillars if saved
                    if (data.settings?.pillars) {
                        this.pillars = data.settings.pillars;
                    }
                    
                    this.showToast('Data loaded successfully');
                }
            } catch (err) {
                console.error(err);
                alert("Error loading file");
            }
        },
        
        async saveToFile() {
            if (!this.fileHandle) return;
            
            try {
                const writable = await this.fileHandle.createWritable();
                await writable.write(JSON.stringify({
                    projects: this.projects,
                    todos: this.todos,
                    meetingNotes: this.meetingNotes,
                    calendarEvents: this.calendarEvents,
                    dailyUpdates: this.dailyUpdates,
                    settings: {
                        pillars: this.pillars,
                        kpis: this.settings.kpis,
                        qaSources: this.settings.qaSources,
                        meetingCategories: this.settings.meetingCategories
                    }
                }, null, 2));
                await writable.close();
                this.showToast('Saved successfully');
            } catch (err) {
                console.error('Save failed', err);
            }
        },

        // ===== COMPUTED PROPERTIES =====
        get activeProjectsCount() {
            return this.projects.filter(p => p.status !== 'Completed').length;
        },
        
        get overallProgress() {
            if (this.projects.length === 0) return 0;
            const total = this.projects.reduce((sum, p) => sum + this.calculateProgress(p), 0);
            return total / this.projects.length;
        },
        
        get openTasksCount() {
            return this.todos.filter(t => !t.completed).length;
        },
        
        get weekEventsCount() {
            return this.calendarEvents.length;
        },
        
        get filteredHopperTasks() {
            let tasks = this.todos.filter(t => !t.completed);
            
            if (this.hopperSearch) {
                tasks = tasks.filter(t => 
                    (t.title || t.text || '').toLowerCase().includes(this.hopperSearch.toLowerCase())
                );
            }
            
            if (this.hopperFilter) {
                tasks = tasks.filter(t => t.type === this.hopperFilter);
            }
            
            return tasks.sort((a, b) => (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : -1);
        },
        
        get uniqueTLAMs() {
            const tlams = new Set();
            this.projects.forEach(p => {
                if (p.tlam) tlams.add(p.tlam);
            });
            return Array.from(tlams);
        },
        
        get filteredReportProjects() {
            return this.projects.filter(p => {
                if (this.reportFilter.pillar && p.pillarId != this.reportFilter.pillar) return false;
                if (this.reportFilter.project && p.id != this.reportFilter.project) return false;
                if (this.reportFilter.tlam && p.tlam !== this.reportFilter.tlam) return false;
                if (this.reportFilter.startDate && p.startDate < this.reportFilter.startDate) return false;
                if (this.reportFilter.endDate && p.endDate > this.reportFilter.endDate) return false;
                return true;
            });
        },

        // ===== PILLAR METHODS =====
        getProjectsForPillar(pillarId) {
            return this.projects.filter(p => p.pillarId == pillarId);
        },
        
        getPillarProgress(pillarId) {
            const projects = this.getProjectsForPillar(pillarId);
            if (projects.length === 0) return 0;
            const total = projects.reduce((sum, p) => sum + this.calculateProgress(p), 0);
            return Math.round(total / projects.length);
        },
        
        filterByPillar(pillarId) {
            this.reportFilter.pillar = pillarId;
            this.switchView('projects');
        },

        // ===== PROJECT METHODS =====
        calculateProgress(project) {
            if (!(project.milestones || []).length) return 0;
            const completed = (project.milestones || []).filter(m => m.completed).length;
            return Math.round((completed / project.milestones.length) * 100);
        },
        
        startNewProject() {
            this.currentProject = {
                id: Date.now(),
                title: '',
                pillarId: '',
                type: 'project',
                status: 'Active',
                milestones: [],
                updates: [],
                impactStatement: '',
                deptCode: '',
                staff: '',
                startDate: '',
                endDate: ''
            };
            this.showModal = true;
        },
        
        editProject(project) {
            this.currentProject = project;
            this.showModal = true;
        },
        
        saveProject() {
            const idx = this.projects.findIndex(p => p.id === this.currentProject.id);
            if (idx === -1) {
                this.projects.push(this.currentProject);
            } else {
                this.projects[idx] = this.currentProject;
            }
            this.saveToFile();
            this.showModal = false;
        },

        // ===== CALENDAR METHODS =====
        getWeekStart(date) {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
            return new Date(d.setDate(diff));
        },
        
        getWeekLabel() {
            if (!this.currentWeekStart) return '';
            const end = new Date(this.currentWeekStart);
            end.setDate(end.getDate() + 4);
            return `${this.formatDate(this.currentWeekStart)} - ${this.formatDate(end)}`;
        },
        
        previousWeek() {
            const d = new Date(this.currentWeekStart);
            d.setDate(d.getDate() - 7);
            this.currentWeekStart = d;
        },
        
        nextWeek() {
            const d = new Date(this.currentWeekStart);
            d.setDate(d.getDate() + 7);
            this.currentWeekStart = d;
        },
        
        getEventsForSlot(day, time) {
            return this.calendarEvents.filter(e => 
                e.day === day && e.startTime === time
            );
        },
        
        getEventColor(event) {
            if (event.type === 'meeting') return '#f59e0b';
            if (event.type === 'strategy') return '#0891b2';
            if (event.type === 'project') return '#7c3aed';
            return '#3b82f6';
        },
        
        getSlotClass(day, time) {
            const now = new Date();
            const currentDay = now.toLocaleLowerCase().substring(0, 3);
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(Math.floor(now.getMinutes() / 15) * 15).padStart(2, '0')}`;
            
            if (day.toLowerCase().startsWith(currentDay) && time === currentTime) {
                return 'current-time';
            }
            return '';
        },

        // ===== DRAG & DROP =====
        dragStart(event, task) {
            this.draggedTask = task;
            event.dataTransfer.effectAllowed = 'move';
        },
        
        drop(event, day, time) {
            event.preventDefault();
            if (!this.draggedTask) return;
            
            // Create calendar event from task
            const newEvent = {
                id: Date.now(),
                title: this.draggedTask.title || this.draggedTask.text,
                day: day,
                startTime: time,
                endTime: this.addMinutes(time, this.draggedTask.duration || 60),
                duration: this.draggedTask.duration || 60,
                type: this.draggedTask.type || 'activity',
                linkedTaskId: this.draggedTask.id,
                linkedProjectId: this.draggedTask.projectId
            };
            
            this.calendarEvents.push(newEvent);
            
            // Mark task as scheduled
            this.draggedTask.scheduled = true;
            this.draggedTask = null;
            
            this.saveToFile();
            this.showToast('Task scheduled');
        },
        
        addMinutes(time, minutes) {
            const [h, m] = time.split(':').map(Number);
            const totalMinutes = h * 60 + m + minutes;
            const newH = Math.floor(totalMinutes / 60) % 24;
            const newM = totalMinutes % 60;
            return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
        },

        // ===== DAILY UPDATE =====
        getDailyItems() {
            const today = new Date().toISOString().split('T')[0];
            const items = [];
            
            // Get today's calendar events
            this.calendarEvents.forEach(e => {
                items.push({
                    id: e.id,
                    title: e.title,
                    type: e.type || 'Event',
                    time: e.startTime,
                    comments: e.comments || '',
                    evidenceLink: e.evidenceLink || '',
                    impactStatement: e.impactStatement || '',
                    linkedProjectId: e.linkedProjectId
                });
            });
            
            // Get completed tasks
            this.todos.filter(t => t.completed && t.completedDate === today).forEach(t => {
                items.push({
                    id: t.id,
                    title: t.title || t.text,
                    type: 'Task',
                    time: '',
                    comments: t.comments || '',
                    evidenceLink: t.evidenceLink || '',
                    impactStatement: t.impactStatement || '',
                    linkedProjectId: t.projectId
                });
            });
            
            return items;
        },
        
        saveDailyUpdate() {
            const today = new Date().toISOString().split('T')[0];
            const items = this.getDailyItems();
            
            // Save back to events and tasks
            items.forEach(item => {
                if (item.type === 'Task') {
                    const task = this.todos.find(t => t.id === item.id);
                    if (task) {
                        task.comments = item.comments;
                        task.evidenceLink = item.evidenceLink;
                        task.impactStatement = item.impactStatement;
                    }
                } else {
                    const event = this.calendarEvents.find(e => e.id === item.id);
                    if (event) {
                        event.comments = item.comments;
                        event.evidenceLink = item.evidenceLink;
                        event.impactStatement = item.impactStatement;
                    }
                }
                
                // Add to project evidence if linked
                if (item.linkedProjectId && (item.comments || item.evidenceLink || item.impactStatement)) {
                    const project = this.projects.find(p => p.id === item.linkedProjectId);
                    if (project) {
                        if (!project.updates) project.updates = [];
                        project.updates.push({
                            date: today,
                            text: `${item.title}: ${item.comments}`,
                            link: item.evidenceLink,
                            impact: item.impactStatement,
                            source: 'Daily Update'
                        });
                    }
                }
            });
            
            this.saveToFile();
            this.showToast('Daily update saved');
        },
        
        linkToProject(item) {
            // Open modal to select project
            // This would open a project selector modal
            console.log('Link item to project:', item);
        },

        // ===== REPORTS =====
        getFilteredProgress() {
            if (this.filteredReportProjects.length === 0) return 0;
            const total = this.filteredReportProjects.reduce((sum, p) => sum + this.calculateProgress(p), 0);
            return total / this.filteredReportProjects.length;
        },
        
        getTotalImpactStatements() {
            let count = 0;
            this.filteredReportProjects.forEach(p => {
                if (p.impactStatement) count++;
                (p.updates || []).forEach(u => {
                    if (u.impact) count++;
                });
            });
            return count;
        },
        
        async exportToPDF() {
            const element = document.getElementById('report-content');
            const opt = {
                margin: 10,
                filename: `digital-hub-report-${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            html2pdf().set(opt).from(element).save();
            this.showToast('Exporting PDF...');
        },

        // ===== UTILITIES =====
        switchView(view) {
            this.view = view;
        },
        
        showToast(message) {
            const id = Date.now();
            this.toasts.push({ id, message });
            setTimeout(() => {
                this.toasts = this.toasts.filter(t => t.id !== id);
            }, 3000);
        },
        
        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        },
        
        formatDateShort(date) {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        },
        
        completeTask(task) {
            if (task.completed) {
                task.completedDate = new Date().toISOString().split('T')[0];
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            } else {
                task.completedDate = null;
            }
            this.saveToFile();
        },
        
        createNewMeeting() {
            const newNote = {
                id: Date.now(),
                title: '',
                date: new Date().toISOString().split('T')[0],
                category: this.settings.meetingCategories[0],
                content: '',
                attendees: '',
                linkedProjectId: '',
                links: []
            };
            this.meetingNotes.unshift(newNote);
            this.currentMeeting = newNote;
            this.saveToFile();
        },
        
        editEvent(event) {
            // Handle event editing
            console.log('Edit event:', event);
        }
    };
}
