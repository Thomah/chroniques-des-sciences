
function createTimeline() {
  // Dates for markers
  const markers = [
    { date: -3000, found: false },
    { date: 800, found: false },
    { date: 1836, found: false },
    { date: 1971, found: false }
  ];

  // Start and end dates for timeline
  const startDate = -4000;
  const endDate = 2200;

  // Calculate position based on date
  const minDate = Math.min(startDate, ...markers.map(item => item.date));
  const maxDate = Math.max(endDate, ...markers.map(item => item.date));
  const scale = 100 / (maxDate - minDate);

  // Create markers and dates
  const timeline = document.querySelector('.timeline');
  markers.forEach(marker => {
    const position = (marker.date - minDate) * scale;
    
    const event = document.createElement('div');
    event.className = 'event';
    if (marker.found) {
      event.classList.add('green'); // Add green class if found
    }
    event.style.left = `${position}%`; // Set left position for marker
    timeline.appendChild(event);

    const dateElement = document.createElement('div');
    dateElement.className = 'date';
    dateElement.style.left = `${position}%`; // Set left position for date
    if (marker.found) {
      dateElement.textContent = marker.date; // Display date if found
    } else {
      dateElement.textContent = "⚠️"; // Display warning symbol if not found
    }
    timeline.appendChild(dateElement);
  });
}