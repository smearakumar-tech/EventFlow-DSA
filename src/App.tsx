import React, { useState, useEffect, useMemo } from 'react';
import { EventItem, VenueConflictPair, ActivityLogItem } from './types/event';
import {
  loadEventsFromStorage,
  saveEventsToStorage,
  resetEventsStorage,
  exportEventsToCSV,
  exportEventsToJSON,
  loadActivityHistory,
  recordActivity,
  clearActivityHistory
} from './utils/storage';
import { ensureDemoConflict } from './utils/sampleData';
import { detectAllConflicts } from './utils/conflictDetector';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EventsView } from './components/EventsView';
import { VenuesView } from './components/VenuesView';
import { ConflictsView } from './components/ConflictsView';
import { CO3SearchSortView } from './components/CO3SearchSortView';
import { CO4BSTView } from './components/CO4BSTView';
import { CO5GraphView } from './components/CO5GraphView';
import { AcademicManualView } from './components/AcademicManualView';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { UserProfile } from './types/auth';
import { loadUserSession, saveUserSession, clearUserSession } from './utils/authStorage';
import { EventModal } from './components/EventModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast, ToastMessage } from './components/Toast';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ActivityHistoryModal } from './components/ActivityHistoryModal';
import { PrintReportModal } from './components/PrintReportModal';

export default function App() {
  // ---------------- State ----------------
  const [events, setEvents] = useState<EventItem[]>(() => loadEventsFromStorage());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => loadUserSession());
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => loadActivityHistory());
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const session = loadUserSession();
    return session ? 'dashboard' : 'login';
  });

  // Modals & Dialogs
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);
  const [modalDefaultVenue, setModalDefaultVenue] = useState<string | undefined>(undefined);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDemoConflictConfirmOpen, setIsDemoConflictConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // SaaS Production Feature Modals
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleOpenNewEvent = (prefillDate?: string, prefillVenue?: string) => {
    setEventToEdit(null);
    setModalDefaultDate(prefillDate);
    setModalDefaultVenue(prefillVenue);
    setIsEventModalOpen(true);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    saveUserSession(user);
    recordActivity('UPDATE', `Organizer signed in: ${user.name} (${user.email})`);
    setActivityLogs(loadActivityHistory());
    addToast('success', `Welcome back, ${user.name}!`);
    setActiveTab('dashboard');
  };

  const handleSignUpSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    saveUserSession(user);
    recordActivity('CREATE', `New account created: ${user.name} (${user.email})`);
    setActivityLogs(loadActivityHistory());
    addToast('success', `Account created successfully. Welcome, ${user.name}!`);
    setActiveTab('dashboard');
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    if (currentUser) {
      recordActivity('UPDATE', `Organizer signed out: ${currentUser.name}`);
      setActivityLogs(loadActivityHistory());
    }
    setTimeout(() => {
      clearUserSession();
      setCurrentUser(null);
      setIsLoggingOut(false);
      addToast('success', 'You have been signed out successfully.');
      setActiveTab('login');
    }, 450);
  };



  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], text: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to localStorage whenever events change
  useEffect(() => {
    saveEventsToStorage(events);
  }, [events]);

  // Derived venue conflicts
  const conflicts: VenueConflictPair[] = useMemo(() => {
    return detectAllConflicts(events);
  }, [events]);

  // ---------------- Handlers ----------------
  const handleSaveEvent = (savedEvent: EventItem) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === savedEvent.id);
      let updated: EventItem[];
      if (exists) {
        updated = prev.map(e => (e.id === savedEvent.id ? savedEvent : e));
        recordActivity('UPDATE', `Updated event #${savedEvent.id}: "${savedEvent.title}"`, savedEvent.id);
        addToast('success', `Event #${savedEvent.id} updated successfully.`);
      } else {
        updated = [...prev, savedEvent];
        recordActivity('CREATE', `Created new event #${savedEvent.id}: "${savedEvent.title}" in ${savedEvent.venue}`, savedEvent.id);
        addToast('success', `Event #${savedEvent.id} created successfully.`);
      }

      // Check if newly introduced or resolved conflict
      const newConflicts = detectAllConflicts(updated);
      if (newConflicts.length > conflicts.length) {
        addToast('warning', `Notice: Schedule changes introduced a venue conflict!`);
      } else if (conflicts.length > 0 && newConflicts.length < conflicts.length) {
        recordActivity('CONFLICT_RESOLVED', `Resolved venue collision for event #${savedEvent.id} (${savedEvent.venue})`, savedEvent.id);
      }
      setActivityLogs(loadActivityHistory());

      return updated;
    });
  };

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    const deletedId = eventToDelete.id;
    const deletedTitle = eventToDelete.title;
    recordActivity('DELETE', `Deleted event #${deletedId}: "${deletedTitle}"`, deletedId);
    setEvents(prev => prev.filter(e => e.id !== deletedId));
    setActivityLogs(loadActivityHistory());
    setEventToDelete(null);
    addToast('info', `Event #${deletedId} has been deleted.`);
  };

  const handleResetData = () => {
    const fresh = resetEventsStorage();
    recordActivity('RESET', 'Reset all schedule records to original 12-event symposium dataset');
    setEvents(fresh);
    setActivityLogs(loadActivityHistory());
    setIsResetConfirmOpen(false);
    addToast('success', 'Reset complete: Original symposium schedule restored.');
  };

  const handleConfirmLoadDemoConflict = () => {
    const { updated, message } = ensureDemoConflict(events);
    setEvents(updated);
    recordActivity('UPDATE', message, 104);
    setActivityLogs(loadActivityHistory());
    setIsDemoConflictConfirmOpen(false);
    addToast('warning', message);
  };

  const handleClearActivityHistory = () => {
    clearActivityHistory();
    setActivityLogs([]);
    addToast('info', 'Local activity history has been cleared.');
  };

  const handleExportCSV = () => {
    exportEventsToCSV(events);
    addToast('info', 'Schedule exported as CSV.');
  };

  const handleExportJSON = () => {
    exportEventsToJSON(events);
    addToast('info', 'Schedule exported as JSON.');
  };

  // Ensure unauthenticated visitors default to login
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col justify-center items-center">
        {activeTab === 'signup' ? (
          <SignUpPage
            onSignUpSuccess={handleSignUpSuccess}
            onNavigateToLogin={() => setActiveTab('login')}
            onNavigateToDashboard={() => setActiveTab('login')}
          />
        ) : (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateToSignUp={() => setActiveTab('signup')}
            onNavigateToDashboard={() => setActiveTab('login')}
          />
        )}
        <Toast toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Deep Navy Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          conflictCount={conflicts.length}
          totalEvents={events.length}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
          onLoadDemoConflict={() => setIsDemoConflictConfirmOpen(true)}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 md:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="w-64 h-full bg-slate-950"
            onClick={e => e.stopPropagation()}
          >
            <Sidebar
              activeTab={activeTab}
              setActiveTab={tab => {
                setActiveTab(tab);
                setMobileSidebarOpen(false);
              }}
              conflictCount={conflicts.length}
              totalEvents={events.length}
              currentUser={currentUser}
              onSignOut={handleSignOut}
              onOpenResetConfirm={() => {
                setIsResetConfirmOpen(true);
                setMobileSidebarOpen(false);
              }}
              onLoadDemoConflict={() => {
                setIsDemoConflictConfirmOpen(true);
                setMobileSidebarOpen(false);
              }}
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          conflictCount={conflicts.length}
          currentUser={currentUser}
          onNavigateLogin={() => setActiveTab('login')}
          onNavigateSignUp={() => setActiveTab('signup')}
          onSignOut={handleSignOut}
          onOpenNewEvent={() => handleOpenNewEvent()}
          onNavigateConflicts={() => setActiveTab('conflicts')}
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenPrintReport={() => setIsPrintModalOpen(true)}
          onOpenActivityHistory={() => setIsActivityModalOpen(true)}
        />

        {/* Scrollable Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100/60">
          {activeTab === 'dashboard' && (
            <DashboardView
              events={events}
              conflicts={conflicts}
              onNavigateTab={setActiveTab}
              onOpenNewEvent={handleOpenNewEvent}
              onOpenSearch={() => setIsSearchModalOpen(true)}
              onSelectEvent={ev => {
                setEventToEdit(ev);
                setIsEventModalOpen(true);
              }}
            />
          )}

          {activeTab === 'events' && (
            <EventsView
              events={events}
              conflicts={conflicts}
              initialViewMode="table"
              onNavigateTab={setActiveTab}
              onOpenNewEvent={(date, venue) => handleOpenNewEvent(date, venue)}
              onEditEvent={ev => {
                setEventToEdit(ev);
                setIsEventModalOpen(true);
              }}
              onDeleteEvent={ev => setEventToDelete(ev)}
            />
          )}

          {activeTab === 'calendar' && (
            <EventsView
              events={events}
              conflicts={conflicts}
              initialViewMode="calendar"
              onNavigateTab={setActiveTab}
              onOpenNewEvent={(date, venue) => handleOpenNewEvent(date, venue)}
              onEditEvent={ev => {
                setEventToEdit(ev);
                setIsEventModalOpen(true);
              }}
              onDeleteEvent={ev => setEventToDelete(ev)}
            />
          )}

          {activeTab === 'venues' && (
            <VenuesView
              events={events}
              conflicts={conflicts}
              onOpenNewEvent={(date, venue) => handleOpenNewEvent(date, venue)}
              onSelectEvent={ev => {
                setEventToEdit(ev);
                setIsEventModalOpen(true);
              }}
              onNavigateConflicts={() => setActiveTab('conflicts')}
            />
          )}

          {activeTab === 'conflicts' && (
            <ConflictsView
              conflicts={conflicts}
              allEvents={events}
              onUpdateEvent={handleSaveEvent}
              onEditEvent={ev => {
                setEventToEdit(ev);
                setIsEventModalOpen(true);
              }}
              onLoadDemoConflict={() => setIsDemoConflictConfirmOpen(true)}
            />
          )}

          {activeTab === 'co3' && <CO3SearchSortView events={events} />}

          {activeTab === 'co4' && <CO4BSTView events={events} />}

          {activeTab === 'co5' && <CO5GraphView events={events} />}

          {activeTab === 'manual' && <AcademicManualView />}



          {activeTab === 'login' && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigateToSignUp={() => setActiveTab('signup')}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'signup' && (
            <SignUpPage
              onSignUpSuccess={handleSignUpSuccess}
              onNavigateToLogin={() => setActiveTab('login')}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Create / Edit Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        eventToEdit={eventToEdit}
        allEvents={events}
        defaultDate={modalDefaultDate}
        defaultVenue={modalDefaultVenue}
        onSave={handleSaveEvent}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(null);
          setModalDefaultDate(undefined);
          setModalDefaultVenue(undefined);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!eventToDelete}
        title="Delete Event Record?"
        message={`Are you sure you want to permanently delete "${eventToDelete?.title}" (ID #${eventToDelete?.id})? This will remove it from the schedule, BST, and Graph structures.`}
        confirmLabel="Delete Event"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEventToDelete(null)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset All Schedule Data?"
        message="This will wipe custom event records and restore the default 12-event symposium dataset (including the intentional Auditorium A demo conflict). Continue?"
        confirmLabel="Reset Data"
        isDestructive={true}
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Demo Conflict Confirmation Modal */}
      <ConfirmModal
        isOpen={isDemoConflictConfirmOpen}
        title="Load Demonstration Venue Conflict?"
        message="This will restore the intentional schedule collision in Auditorium A (Event #102 vs #104 with 60-minute overlap) so you can demonstrate interval collision detection and verified automated resolution. Your other scheduled records are safely preserved."
        confirmLabel="Load Demo Conflict"
        isDestructive={false}
        onConfirm={handleConfirmLoadDemoConflict}
        onCancel={() => setIsDemoConflictConfirmOpen(false)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        events={events}
        conflicts={conflicts}
        onSelectEvent={ev => {
          setIsSearchModalOpen(false);
          setEventToEdit(ev);
          setIsEventModalOpen(true);
        }}
        onNavigateConflicts={() => {
          setIsSearchModalOpen(false);
          setActiveTab('conflicts');
        }}
      />

      {/* Activity History Modal */}
      <ActivityHistoryModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        logs={activityLogs}
        onClearHistory={handleClearActivityHistory}
      />

      {/* Print-Friendly Schedule Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        events={events}
        conflicts={conflicts}
      />

      {/* Floating Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
