import { useState } from 'react';

// Predefined palette for ranges
const RANGE_COLORS = [
  { id: 'color-1', varName: '--range-color-1' }, // e.g. blue
  { id: 'color-2', varName: '--range-color-2' }, // e.g. green
  { id: 'color-3', varName: '--range-color-3' }, // e.g. purple
  { id: 'color-4', varName: '--range-color-4' }, // e.g. orange
  { id: 'color-5', varName: '--range-color-5' }, // e.g. pink
];

export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [activeSelection, setActiveSelection] = useState({ start: null, end: null, id: null, draftNote: '' });
  const [savedRanges, setSavedRanges] = useState([]);
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const generateMonthGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

    const grid = [];
    for (let i = 0; i < firstDay; i++) {
      grid.push({ date: new Date(currentYear, currentMonth - 1, prevMonthDays - firstDay + i + 1), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({ date: new Date(currentYear, currentMonth, i), isCurrentMonth: true });
    }
    const remainingDays = 42 - grid.length;
    for (let i = 1; i <= remainingDays; i++) {
      grid.push({ date: new Date(currentYear, currentMonth + 1, i), isCurrentMonth: false });
    }
    return grid;
  };

  // Check if a date falls inside a saved range
  const getRangeForDate = (date) => {
    return savedRanges.find(r => date >= r.start && date <= r.end) || null;
  };

  const handleDateClick = (date) => {
    // If clicking a date inside a saved range and we're not currently selecting
    const existingRange = getRangeForDate(date);
    if (existingRange && !activeSelection.start) {
       setActiveSelection({ 
         start: existingRange.start, 
         end: existingRange.end, 
         id: existingRange.id,
         draftNote: existingRange.note
       });
       return;
    }

    setActiveSelection((prev) => {
      // 1. Start brand new selection
      if (!prev.start || (prev.start && prev.end)) {
        return { start: date, end: null, id: null, draftNote: '' };
      }
      
      // 2. Complete the selection
      if (date >= prev.start) {
        const newEnd = date;
        const existing = savedRanges.find(r => r.start.getTime() === prev.start.getTime() && r.end.getTime() === newEnd.getTime());
        if (existing) {
           return { start: prev.start, end: newEnd, id: existing.id, draftNote: existing.note };
        } else {
           // We do NOT save it to savedRanges yet. They must press Enter.
           return { start: prev.start, end: newEnd, id: null, draftNote: '' };
        }
      }
      
      // 3. Clicked a date before the start date, reset start
      return { start: date, end: null, id: null, draftNote: '' };
    });
  };

  const setDraftNote = (text) => {
    setActiveSelection(prev => ({ ...prev, draftNote: text }));
  };

  const commitNote = () => {
    if (!activeSelection.start || !activeSelection.end) return;

    if (activeSelection.id) {
       // Update existing
       setSavedRanges(curr => curr.map(r => r.id === activeSelection.id ? { ...r, note: activeSelection.draftNote } : r));
    } else {
       // Create new
       const newId = Date.now().toString();
       const colorObj = RANGE_COLORS[savedRanges.length % RANGE_COLORS.length];
       const newRange = {
          id: newId,
          start: activeSelection.start,
          end: activeSelection.end,
          note: activeSelection.draftNote,
          colorClass: colorObj.id
       };
       setSavedRanges(curr => [...curr, newRange]);
       setActiveSelection(prev => ({ ...prev, id: newId }));
    }
  };

  // Display helpers
  const isDateInActiveSelection = (date) => {
    if (!activeSelection.start || !activeSelection.end) return false;
    return date > activeSelection.start && date < activeSelection.end;
  };
  const isActiveStart = (date) => activeSelection.start && date.getTime() === activeSelection.start.getTime();
  const isActiveEnd = (date) => activeSelection.end && date.getTime() === activeSelection.end.getTime();

  return {
    currentDate,
    nextMonth,
    prevMonth,
    grid: generateMonthGrid(),
    activeSelection,
    savedRanges,
    handleDateClick,
    getRangeForDate,
    isDateInActiveSelection,
    isActiveStart,
    isActiveEnd,
    setDraftNote,
    commitNote
  };
};
