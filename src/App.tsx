import React, { useState, useEffect, useMemo } from 'react';
import { EventItem, VenueConflictPair } from './types/event';
import {
  loadEventsFromStorage,
  saveEventsToStorage,
  resetEventsStorage,
  exportEventsToCSV,
  exportEventsToJSON
} from './utils/storage';
import { detectAllConflicts } from './utils/conflictDetector';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EventsView } from './components/EventsView';
import { ConflictsView } from './components/ConflictsView';
import { CO3SearchSortView } from './components/CO3SearchSortView';
import { CO4BSTView } from './components/CO4BSTView';
import { CO5GraphView } from './components/CO5GraphView';
import { AcademicManualView } from './components/AcademicManualView';
import { SelfTestView } from './components/SelfTestView';
import { EventModal } from './components/EventModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  // ---------------- State ----------------
  const [events, setEvents] = useState<EventItem[]>(() => loadEventsFromStorage());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals & Dialogs
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleOpenNewEvent = (prefillDate?: string) => {
    setEventToEdit(null);
    setModalDefaultDate(prefillDate);
    setIsEventModalOpen(true);
  };

  // Test suite stats
  const [testStats, setTestStats] = useState({ passed: 6, total: 6 });

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
        addToast('success', `Event #${savedEvent.id} updated successfully.`);
      } else {
        updated = [...prev, savedEvent];
        addToast('success', `Event #${savedEvent.id} created successfully.`);
      }

      // Check if newly introduced conflict
      const newConflicts = detectAllConflicts(updated);
      if (newConflicts.length > conflicts.length) {
        addToast('warning', `Notice: Schedule changes introduced a venue conflict!`);
      }

      return updated;
    });
  };

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    const deletedId = eventToDelete.id;
    setEvents(prev => prev.filter(e => e.id !== deletedId));
    setEventToDelete(null);
    addToast('info', `Event #${deletedId} has been deleted.`);
  };

  const handleResetData = () => {
    const fresh = resetEventsStorage();
    setEvents(fresh);
    setIsResetConfirmOpen(false);
    addToast('success', 'Reset complete: Original symposium schedule restored.');
  };

  const handleExportCSV = () => {
    exportEventsToCSV(events);
    addToast('info', 'Schedule exported as CSV.');
  };

  const handleExportJSON = () => {
    exportEventsToJSON(events);
    addToast('info', 'Schedule exported as JSON.');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Deep Navy Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          conflictCount={conflicts.length}
          totalEvents={events.length}
          onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          testPassRatio={`${testStats.passed}/${testStats.total}`}
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
              onOpenResetConfirm={() => {
                setIsResetConfirmOpen(true);
                setMobileSidebarOpen(false);
              }}
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              testPassRatio={`${testStats.passed}/${testStats.total}`}
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
          onOpenNewEvent={() => handleOpenNewEvent()}
          onOpenSelfTest={() => setActiveTab('tests')}
          onNavigateConflicts={() => setActiveTab('conflicts')}
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
          testPassCount={testStats.passed}
          totalTestsCount={testStats.total}
        />

        {/* Scrollable Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100/60">
          {activeTab === 'dashboard' && (
            <DashboardView
              events={events}
              conflicts={conflicts}
              onNavigateTab={setActiveTab}
              onOpenNewEvent={handleOpenNewEvent}
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
              onOpenNewEvent={() => handleOpenNewEvent()}
              onEditEvent={ev => {
                setEventToEdit(ev);
                setIsEventModalOpen(true);
              }}
              onDeleteEvent={ev => setEventToDelete(ev)}
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
            />
          )}

          {activeTab === 'co3' && <CO3SearchSortView events={events} />}

          {activeTab === 'co4' && <CO4BSTView events={events} />}

          {activeTab === 'co5' && <CO5GraphView events={events} />}

          {activeTab === 'manual' && <AcademicManualView />}

          {activeTab === 'tests' && (
            <SelfTestView
              onTestsCompleted={(passed, total) => setTestStats({ passed, total })}
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
        onSave={handleSaveEvent}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(null);
          setModalDefaultDate(undefined);
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

      {/* Floating Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
