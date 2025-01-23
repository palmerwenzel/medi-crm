import {
  Users,
  FileText,
  Calendar,
  Plus,
  MessageSquare,
  BarChart,
  Settings,
  LogOut,
  Home,
  UserCircle,
  PlusCircle,
  AlertCircle,
  Clock,
  User,
  type LucideIcon
} from 'lucide-react'

export type IconKey = keyof typeof Icons

export const Icons = {
  users: Users,
  fileText: FileText,
  calendar: Calendar,
  plus: Plus,
  messageSquare: MessageSquare,
  barChart: BarChart,
  settings: Settings,
  logOut: LogOut,
  home: Home,
  userCircle: UserCircle,
  plusCircle: PlusCircle,
  alertCircle: AlertCircle,
  clock: Clock,
  user: User,
  cases: FileText // Using FileText as a temporary icon for cases
} as const 