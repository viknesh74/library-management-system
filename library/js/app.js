// ════════════════════════════════════════
// Smart Library – App Entry Point
// ════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Register all routes
  Router.register('splash', renderSplash);
  Router.register('login', renderLogin);
  Router.register('signup', renderSignup);

  Router.register('student-dashboard', renderStudentDashboard);
  Router.register('book-search', renderBookSearch);
  Router.register('book-details', renderBookDetails);
  Router.register('my-books', renderMyBooks);
  Router.register('borrow-history', renderBorrowHistory);
  Router.register('notifications', renderNotifications);
  Router.register('student-profile', renderStudentProfile);
  Router.register('motivation-videos', renderMotivationVideos);
  Router.register('student-question-papers', renderQuestionPapers);
  Router.register('view-paper', renderPaperView);
  Router.register('student-ebooks', renderEbooks);

  Router.register('admin-dashboard', renderAdminDashboard);
  Router.register('admin-books', renderAdminBooks);
  Router.register('admin-requests', renderAdminRequests);
  Router.register('admin-transactions', renderAdminTransactions);
  Router.register('admin-reports', renderAdminReports);
  Router.register('admin-students', renderAdminStudents);
  Router.register('admin-papers', renderAdminQuestionPapers);

  // Apply dark mode on startup
  document.body.classList.toggle('dark', DB.getDarkMode());

  // Start app
  Router.navigate('splash');
});
