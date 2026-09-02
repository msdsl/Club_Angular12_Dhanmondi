export class DashBoardItems {
  public TotalProduct?: number;
  public TotalSupplier?: number;
  public TotalItem?: number;
  public TotalEmployee?: number;
  public TotalShop?: number;
  public TotalReturn?: number;
  public TotalDamage?: number;
  public PendingProduct?: number;

  TotalMember: number = 0;
  TotalActiveMember: number = 0;
  TotalPendingMember: number = 0;
  TotalSpouseMember: number = 0;
  UpcomingEvents: number = 0;
  SubscriptionDueAmount: number = 0;
  TotalDue: any = 0;
  TodayRevenue: number = 0;
  ThisMonthRevenue: number = 0;
  TotalWalletBalance: number = 0;
  TotalAssets: number = 0;
  PendingMaintenance: number = 0;
  TotalEmployeeCount: number = 0;
  TodayCheckInCount: number = 0;
  ThisMonthCheckInCount: number = 0;
  ThisMonthNewMembersCount: number = 0;
  BirthdaysThisMonth: number = 0;
  SystemAlerts: number = 0;

  // Month-over-Month Growth Rates
  MemberGrowthRate: number = 0;
  ActiveMemberGrowthRate: number = 0;
  PendingMemberGrowthRate: number = 0;
  TodayRevenueGrowthRate: number = 0;
  MonthRevenueGrowthRate: number = 0;
  DueGrowthRate: number = 0;

  // Dynamic Lists from Backend
  DepartmentRevenues: DepartmentRevenue[] = [];
  TodaySummaries: TodaySummaryItem[] = [];
  RecentMembers: RecentMemberItem[] = [];
  UpcomingEventsList: UpcomingEventItem[] = [];
  TopSellingItems: TopSellingItem[] = [];
  BirthdayMemberList: BirthdayMemberItem[] = [];
  TodayTotalRevenue: number = 0;
}

export class UserConference {
  Id: number = 0;
  UserName: string = '';
  UserId: string = '';
  LogInDate: string = '';
  LogOutDate: any = null;
  LogOutStatus: boolean = false;
  AppId: string = '';
  IpAddress: string = '';
}

export interface DepartmentRevenue {
  name: string;
  percentage: number;
  amount: number;
  color: string;
  dashArray?: string;
  dashOffset?: number;
}

export interface TodaySummaryItem {
  name: string;
  amount: number;
  icon: string;
  colorClass: string;
}

export interface TopSellingItem {
  name: string;
  department: string;
  qtySold: number;
  amount: number;
  imageIcon: string;
  deptBadge: string;
}

export interface UpcomingEventItem {
  month: string;
  day: string;
  title: string;
  location: string;
  time: string;
  guests: string | null;
}

export interface RecentMemberItem {
  id: string;
  name: string;
  category: string;
  joinDate: string;
  avatar?: string;
  initials: string;
  badgeClass: string;
}

export interface BirthdayMemberItem {
  membershipNo: string;
  cusName: string;
  birthDayFormatted: string;
}

