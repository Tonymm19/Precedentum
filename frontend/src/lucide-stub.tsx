import React from 'react';

type IconProps = React.HTMLAttributes<HTMLSpanElement> & {
  label?: string;
};

const createIcon = (label: string) => {
  const Icon: React.FC<IconProps> = ({ className, label: customLabel, ...rest }) => (
    <span
      className={className}
      aria-hidden="true"
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.5em',
        height: '1.5em',
        borderRadius: '0.375em',
        backgroundColor: '#e5e7eb',
        color: '#1f2937',
        fontSize: '0.675em',
        fontWeight: 600,
        textTransform: 'uppercase',
        ...rest.style,
      }}
      title={customLabel ?? label}
    >
      {(customLabel ?? label).slice(0, 2)}
    </span>
  );

  Icon.displayName = `${label}IconStub`;

  return Icon;
};

export const Calendar = createIcon('Calendar');
export const Clock = createIcon('Clock');
export const Plus = createIcon('Plus');
export const Filter = createIcon('Filter');
export const AlertTriangle = createIcon('Alert');
export const CheckCircle = createIcon('Check');
export const FileText = createIcon('File');
export const Bell = createIcon('Bell');
export const Edit = createIcon('Edit');
export const Search = createIcon('Search');
export const Menu = createIcon('Menu');
export const User = createIcon('User');
export const Settings = createIcon('Settings');
export const LogOut = createIcon('Logout');
export const Moon = createIcon('Moon');
export const Sun = createIcon('Sun');
export const RefreshCcw = createIcon('Refresh');
export const X = createIcon('Close');
export const Loader2 = createIcon('Load');
export const Trash2 = createIcon('Trash');
export const RefreshCw = createIcon('Refresh');
export const CalendarCheck = createIcon('CalChk');
export const Clock3 = createIcon('Clk3');
export const AlertCircle = createIcon('Alert');
export const Book = createIcon('Book');
export const ExternalLink = createIcon('Link');
export const AlertTriangleIcon = AlertTriangle;
export const Mail = createIcon('Mail');
export const MessageSquare = createIcon('Msg');
export const TrendingUp = createIcon('Trend');
export const Scale = createIcon('Scale');
export const Phone = createIcon('Phone');
export const MapPin = createIcon('Map');
export const Star = createIcon('Star');
export const LogIn = createIcon('Login');
export const SidebarIcon = createIcon('Sidebar');
export const JudgeIcon = createIcon('Judge');
export const RulesIcon = createIcon('Rules');
export const DashboardIcon = createIcon('Dash');
export const ReminderIcon = createIcon('Rem');
export const AuditIcon = createIcon('Audit');
export const Home = createIcon('Home');
export const BookOpen = createIcon('Book');
export const Users = createIcon('Users');
export const Gavel = createIcon('Gavel');

export default {
  Calendar,
  Clock,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle,
  FileText,
  Bell,
  Edit,
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  RefreshCcw,
  X,
  Loader2,
  Trash2,
  RefreshCw,
  CalendarCheck,
  Clock3,
  AlertCircle,
  Book,
  ExternalLink,
  Mail,
  MessageSquare,
  TrendingUp,
  Scale,
  Phone,
  MapPin,
  Star,
  LogIn,
  Home,
  BookOpen,
  Users,
  Gavel,
};

