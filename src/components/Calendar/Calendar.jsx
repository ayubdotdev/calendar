import React, { useState } from 'react';
import './Calendar.css';
import { useCalendar } from '../../hooks/useCalendar';
import { MONTH_IMAGES, MONTH_NAMES, WEEKDAYS } from '../../constants/calendar';

const Calendar = () => {
  const {
    currentDate,
    nextMonth,
    prevMonth,
    grid,
    activeSelection,
    savedRanges,
    handleDateClick,
    getRangeForDate,
    isDateInActiveSelection,
    isActiveStart,
    isActiveEnd,
    setDraftNote,
    commitNote
  } = useCalendar();

  const [animating, setAnimating] = useState(false);
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentImage = MONTH_IMAGES[currentMonth];

  const handleNext = () => {
    setAnimating(true);
    setTimeout(() => {
      nextMonth();
      setAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    setAnimating(true);
    setTimeout(() => {
      prevMonth();
      setAnimating(false);
    }, 300);
  };

  const currentSelectionDateString = () => {
    if (!activeSelection.start) return "Select a date range...";
    if (activeSelection.start && !activeSelection.end) return `Selecting from ${activeSelection.start.getDate()}...`;
    return `${activeSelection.start.getDate()} - ${activeSelection.end.getDate()} ${MONTH_NAMES[activeSelection.start.getMonth()]}`;
  };

  const activeColorTheme = activeSelection.id 
    ? (savedRanges.find(r => r.id === activeSelection.id)?.colorClass || "color-1")
    : `color-${(savedRanges.length % 5) + 1}`;

  const handleKeyDown = (e) => {
    // Commit on Enter, allow shift+enter for new lines if needed
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitNote();
    }
  };

  return (
    <div className={`wall-calendar ${animating ? 'flipping' : ''}`}>
      <div className="calendar-binding">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="binding-ring"></div>
        ))}
      </div>

      <div className="calendar-hero">
        <img key={currentImage} src={currentImage} alt="Calendar Hero" className="hero-img" />
        <div className="hero-shape-divider">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 L0,120 L1200,120 L1200,0 L600,120 Z" className="shape-fill"></path>
          </svg>
        </div>

        <div className="hero-overlay-content">
          <div className="month-year-display">
            <h2 className="year">{currentYear}</h2>
            <h1 className="month">{MONTH_NAMES[currentMonth]}</h1>
          </div>
          <div className="calendar-nav">
            <button onClick={handlePrev} className="nav-btn" aria-label="Previous Month">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button onClick={handleNext} className="nav-btn" aria-label="Next Month">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-body">
        <div className="calendar-notes">
          <h1 className="notes-title">Notes</h1>
          <div className="selection-badge" data-theme={activeColorTheme}>
            {currentSelectionDateString()}
          </div>
          <textarea 
            className={`notes-textarea theme-${activeColorTheme}`}
            placeholder="Jot down a note..."
            value={activeSelection.draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!activeSelection.end}
          />
          
          {savedRanges.length > 0 && (
            <div className="saved-notes-list">
              <h4 className="saved-notes-title">All Saved Notes</h4>
              <div className="saved-notes-scroll">
                {savedRanges.filter(r => r.note.trim() !== "").map(r => (
                  <div key={r.id} className="saved-note-item" data-theme={r.colorClass}>
                     <div className="saved-note-dates">
                        {r.start.getDate()} - {r.end.getDate()} {MONTH_NAMES[r.start.getMonth()].substring(0, 3)}
                     </div>
                     <div className="saved-note-text">{r.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="calendar-grid-section">
          <div className="weekdays">
            {WEEKDAYS.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="days-grid">
            {grid.map((dayObj, index) => {
              // Priority 1: Current active selection
              const isStart = isActiveStart(dayObj.date);
              const isEnd = isActiveEnd(dayObj.date);
              const inRange = isDateInActiveSelection(dayObj.date);
              
              // Priority 2: Saved ranges
              const savedRange = getRangeForDate(dayObj.date);
              const isSavedStart = savedRange && savedRange.start.getTime() === dayObj.date.getTime();
              const isSavedEnd = savedRange && savedRange.end.getTime() === dayObj.date.getTime();
              
              // We style differently if it's the active dragging one or a saved block
              const isActive = isStart || isEnd || inRange;

              let classNames = 'day-cell';
              if (!dayObj.isCurrentMonth) classNames += ' muted';
              
              if (isActive) {
                 classNames += ' active-selection theme-' + activeColorTheme;
                 if (isStart) classNames += ' sel-start';
                 if (isEnd) classNames += ' sel-end';
                 if (inRange) classNames += ' sel-in-range';
              } else if (savedRange) {
                 classNames += ` saved-selection theme-${savedRange.colorClass}`;
                 if (isSavedStart) classNames += ' sel-start';
                 if (isSavedEnd) classNames += ' sel-end';
                 if (!isSavedStart && !isSavedEnd) classNames += ' sel-in-range';
              } else {
                 const today = new Date();
                 if (dayObj.date.getDate() === today.getDate() && dayObj.date.getMonth() === today.getMonth() && dayObj.date.getFullYear() === today.getFullYear()) {
                     classNames += ' today';
                 }
              }

              return (
                <div 
                  key={index} 
                  className={classNames} 
                  onClick={() => handleDateClick(dayObj.date)}
                >
                  <span className="day-number">{dayObj.date.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
