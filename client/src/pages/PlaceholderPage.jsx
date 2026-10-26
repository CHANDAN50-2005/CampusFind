import { Bell, FileCheck2, Shield, Sparkles } from 'lucide-react';
import { EmptyState, PageHeader } from '../components/UI.jsx';

const pages = {
  matches: { title: 'Potential matches', eyebrow: 'Suggestions', description: 'Review lost and found reports that may describe the same item.', empty: 'No match suggestions are available yet.', detail: 'Matching will run on real open reports after item storage and the matching service are implemented.', icon: Sparkles },
  claims: { title: 'Claims', eyebrow: 'Ownership workflow', description: 'Track ownership claims and their review status.', empty: 'No claims to display.', detail: 'Claim submission and review are not available until reports and authentication are connected.', icon: FileCheck2 },
  notifications: { title: 'Notifications', eyebrow: 'Updates', description: 'Keep up with claim, report, and recovery updates.', empty: 'You are all caught up.', detail: 'Database-backed notifications will appear here once notification events are implemented.', icon: Bell },
  admin: { title: 'Admin dashboard', eyebrow: 'Administration', description: 'Review campus reports and manage moderation workflows.', empty: 'Admin tools are not available yet.', detail: 'Administrative actions will require server-side role checks when authentication and moderation APIs are implemented.', icon: Shield },
};

export function PlaceholderPage({ page }) {
  const config = pages[page];
  return <><PageHeader eyebrow={config.eyebrow} title={config.title} description={config.description} /><EmptyState icon={config.icon} title={config.empty} description={config.detail} /></>;
}
