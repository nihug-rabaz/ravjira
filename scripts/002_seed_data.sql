-- Insert sample users
INSERT INTO users (id, name, email, avatar) VALUES
  ('user-1', 'Sarah Johnson', 'sarah@example.com', '/user-avatar-female.jpg'),
  ('user-2', 'Michael Chen', 'michael@example.com', '/user-avatar-male.jpg'),
  ('user-3', 'Emma Davis', 'emma@example.com', '/user-avatar.jpg'),
  ('user-4', 'James Wilson', 'james@example.com', '/user-avatar-male.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, name, key, description, icon) VALUES
  ('proj-1', 'Website Redesign', 'WEB', 'Redesigning the company website with modern UI/UX', '/project-icon.jpg'),
  ('proj-2', 'Mobile App Development', 'MOB', 'Building iOS and Android mobile applications', '/mobile-icon.jpg'),
  ('proj-3', 'API Integration', 'API', 'Integrating third-party APIs and services', '/project-icon.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert project members
INSERT INTO project_members (project_id, user_id, role) VALUES
  ('proj-1', 'user-1', 'admin'),
  ('proj-1', 'user-2', 'member'),
  ('proj-1', 'user-3', 'member'),
  ('proj-2', 'user-2', 'admin'),
  ('proj-2', 'user-4', 'member'),
  ('proj-3', 'user-1', 'admin'),
  ('proj-3', 'user-3', 'member'),
  ('proj-3', 'user-4', 'member')
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Insert sample issues for Website Redesign project
INSERT INTO issues (id, key, title, description, type, status, priority, project_id, assignee_id, reporter_id) VALUES
  ('issue-1', 'WEB-1', 'Design new homepage layout', 'Create mockups for the new homepage with hero section and feature highlights', 'task', 'in-progress', 'high', 'proj-1', 'user-1', 'user-1'),
  ('issue-2', 'WEB-2', 'Fix navigation menu on mobile', 'The hamburger menu is not working properly on iOS devices', 'bug', 'todo', 'highest', 'proj-1', 'user-2', 'user-3'),
  ('issue-3', 'WEB-3', 'Implement user authentication', 'Add login/signup functionality with OAuth support', 'story', 'in-review', 'medium', 'proj-1', 'user-3', 'user-1'),
  ('issue-4', 'WEB-4', 'Optimize page load time', 'Reduce initial page load time to under 2 seconds', 'task', 'backlog', 'low', 'proj-1', NULL, 'user-2'),
  ('issue-5', 'WEB-5', 'Add contact form', 'Create a contact form with validation and email notifications', 'task', 'done', 'medium', 'proj-1', 'user-1', 'user-1')
ON CONFLICT (id) DO NOTHING;

-- Insert sample issues for Mobile App project
INSERT INTO issues (id, key, title, description, type, status, priority, project_id, assignee_id, reporter_id) VALUES
  ('issue-6', 'MOB-1', 'Setup React Native project', 'Initialize React Native project with TypeScript', 'task', 'done', 'highest', 'proj-2', 'user-2', 'user-2'),
  ('issue-7', 'MOB-2', 'Design app navigation', 'Create navigation flow and screen hierarchy', 'story', 'in-progress', 'high', 'proj-2', 'user-4', 'user-2'),
  ('issue-8', 'MOB-3', 'Implement push notifications', 'Add Firebase push notification support', 'task', 'todo', 'medium', 'proj-2', NULL, 'user-4')
ON CONFLICT (id) DO NOTHING;

-- Insert sample issues for API Integration project
INSERT INTO issues (id, key, title, description, type, status, priority, project_id, assignee_id, reporter_id) VALUES
  ('issue-9', 'API-1', 'Integrate Stripe payments', 'Add Stripe payment gateway integration', 'story', 'in-progress', 'highest', 'proj-3', 'user-3', 'user-1'),
  ('issue-10', 'API-2', 'Connect to analytics service', 'Integrate Google Analytics and Mixpanel', 'task', 'todo', 'medium', 'proj-3', 'user-4', 'user-3')
ON CONFLICT (id) DO NOTHING;

-- Insert sample comments
INSERT INTO comments (id, content, issue_id, user_id) VALUES
  ('comment-1', 'Started working on the mockups. Will share first draft by EOD.', 'issue-1', 'user-1'),
  ('comment-2', 'Looks great! Can we add a testimonial section?', 'issue-1', 'user-2'),
  ('comment-3', 'Reproduced the bug on iPhone 13. Investigating the issue.', 'issue-2', 'user-2'),
  ('comment-4', 'Auth flow is complete. Ready for review.', 'issue-3', 'user-3')
ON CONFLICT (id) DO NOTHING;
