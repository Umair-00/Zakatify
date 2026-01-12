export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', route: '/dashboard', icon: '🏠' },
      { label: 'Calculate', route: '/calculate', icon: '🧮' },
      { label: 'History', route: '/history', icon: '📊' }
    ]
  },
  {
    title: 'ASSETS',
    items: [
      { label: 'Cash & Accounts', route: '/cash-accounts', icon: '💰' },
      { label: 'Jewelry', route: '/jewelry', icon: '💎' },
      { label: 'Investments', route: '/investments', icon: '📈' },
      { label: 'Business', route: '/business', icon: '🏢' }
    ]
  },
  {
    title: 'SUPPORT',
    items: [
      { label: 'Ask a Scholar', route: '/ask-scholar', icon: '💬' },
      { label: 'Settings', route: '/settings', icon: '⚙️' }
    ]
  }
];
