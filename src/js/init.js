// Initialize magic cursor
$(document).ready(function() {
    // Create cursor instance
    const cursor = new Cursor();

    // Add custom UATM states
    cursor.addState('-explore', '[data-uatm-explore]', 'Explore');
    cursor.addState('-analyze', '[data-uatm-analyze]', 'Analyze');

    // Initialize cursor
    cursor.init();

    // Add cursor to window for debugging
    window.cursor = cursor;
}); 