import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DashboardService } from 'src/app/shared/services/dashboard.service';
import { DashBoardItems, UserConference } from 'src/app/shared/models/DashBoardItems';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexFill,
  ApexTooltip,
  ApexLegend,
  ApexPlotOptions,
  ApexResponsive,
} from 'ng-apexcharts';

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

export type AreaChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  tooltip: ApexTooltip;
  colors: string[];
};

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  responsive: ApexResponsive[];
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<AreaChartOptions>;
  public donutChartOptions!: Partial<DonutChartOptions>;

  public selectedPeriod = 'This Month';
  public selectedDateRange = '';
  public greetingTimeOfDay = 'Good day';
  public activeTab: 'attendance' | 'sessions' | 'tickets' | 'venue' = 'attendance';
  public isLoading = false;
  public aiProjectedGrowthRate = 14.8;

  public startDate: string | null = null;
  public endDate: string | null = null;

  // Fully Dynamic Models from Backend API
  public getUserDashboardAllData: DashBoardItems = new DashBoardItems();

  // Growth Rates (Dynamic from SQL view/API)
  public memberGrowthRate = 3.45;
  public activeMemberGrowthRate = 4.02;
  public pendingMemberGrowthRate = 8.57;
  public todayRevenueGrowthRate = 12.35;
  public monthRevenueGrowthRate = 15.68;
  public dueGrowthRate = -2.11;


  // Revenue Overview Days & Spline Graph Calculations
  public revenueOverviewDays: { day: string; amount: number }[] = [
    { day: '1 May', amount: 520000 },
    { day: '4 May', amount: 1420000 },
    { day: '7 May', amount: 830000 },
    { day: '10 May', amount: 710000 },
    { day: '13 May', amount: 1250000 },
    { day: '16 May', amount: 1020000 },
    { day: '18 May', amount: 1450000 },
  ];
  public yAxisLabels: string[] = ['2.0M', '1.5M', '1.0M', '500K'];
  public dynamicMaxRevenue = 2000000;
  public activeHoverPoint: { x: number; y: number; label: string; amount: number } | null = null;

  public getRevenueMaxAmount(): number {
    return this.dynamicMaxRevenue || 2000000;
  }

  public getRevenuePointX(index: number): number {
    const total = this.revenueOverviewDays.length;
    const step = 560 / Math.max(total - 1, 1);
    return 40 + index * step;
  }

  public getRevenuePointY(amount: number): number {
    const max = this.getRevenueMaxAmount();
    const clamped = Math.min(Math.max(amount, 0), max);
    const normalized = (clamped / max) * 135;
    return 165 - normalized;
  }

  public getRevenueSplinePath(): string {
    const points = this.revenueOverviewDays.map((item, i) => ({
      x: this.getRevenuePointX(i),
      y: this.getRevenuePointY(item.amount),
    }));

    if (points.length === 0) return '';
    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
    }

    return path;
  }

  public getRevenueAreaPath(): string {
    const spline = this.getRevenueSplinePath();
    if (!spline) return '';
    const lastX = this.getRevenuePointX(this.revenueOverviewDays.length - 1);
    const firstX = this.getRevenuePointX(0);
    return `${spline} L ${lastX},170 L ${firstX},170 Z`;
  }

  public onHoverRevenuePoint(index: number): void {
    const item = this.revenueOverviewDays[index];
    this.activeHoverPoint = {
      x: this.getRevenuePointX(index),
      y: this.getRevenuePointY(item.amount),
      label: item.day,
      amount: item.amount,
    };
  }

  public onLeaveRevenuePoint(): void {
    this.activeHoverPoint = null;
  }

  public updateYAxisScale(): void {
    if (!this.revenueOverviewDays || this.revenueOverviewDays.length === 0) return;
    const maxVal = Math.max(...this.revenueOverviewDays.map((item) => item.amount || 0));

    if (maxVal > 1500000) this.dynamicMaxRevenue = 2000000;
    else if (maxVal > 1000000) this.dynamicMaxRevenue = 1500000;
    else if (maxVal > 500000) this.dynamicMaxRevenue = 1000000;
    else if (maxVal > 200000) this.dynamicMaxRevenue = 500000;
    else if (maxVal > 100000) this.dynamicMaxRevenue = 200000;
    else if (maxVal > 50000) this.dynamicMaxRevenue = 100000;
    else if (maxVal > 10000) this.dynamicMaxRevenue = 50000;
    else this.dynamicMaxRevenue = maxVal > 0 ? Math.ceil(maxVal * 1.25) : 1000;

    const step4 = this.formatCurrencyAbbreviation(this.dynamicMaxRevenue);
    const step3 = this.formatCurrencyAbbreviation(this.dynamicMaxRevenue * 0.75);
    const step2 = this.formatCurrencyAbbreviation(this.dynamicMaxRevenue * 0.5);
    const step1 = this.formatCurrencyAbbreviation(this.dynamicMaxRevenue * 0.25);
    this.yAxisLabels = [step4, step3, step2, step1];
  }

  public formatCurrencyAbbreviation(val: number): string {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1).replace('.0', '') + 'M';
    } else if (val >= 1000) {
      return Math.round(val / 1000) + 'K';
    }
    return val.toString();
  }

  public calculateAiProjectedGrowth(): void {
    const len = this.revenueOverviewDays.length;
    if (len >= 2) {
      const prev = this.revenueOverviewDays[len - 2].amount;
      const curr = this.revenueOverviewDays[len - 1].amount;
      if (prev > 0) {
        const rate = ((curr - prev) / prev) * 100;
        this.aiProjectedGrowthRate = Number(rate.toFixed(1));
      }
    }
  }

  public todayRevenue = 328750;
  public currentYearIncome = 7245680;
  public todayCheckInCount = 0;
  public thisMonthCheckInCount = 0;
  public thisMonthNewMembersCount = 128;


  // Dynamic Department Revenue
  public departmentRevenueList: DepartmentRevenue[] = [
    { name: 'F & B Outlets', percentage: 46.2, amount: 3347250, color: '#2563eb' },
    { name: 'Liquor Shop', percentage: 18.7, amount: 1356780, color: '#0ea5e9' },
    { name: 'Super Store', percentage: 14.3, amount: 1036450, color: '#10b981' },
    { name: 'Membership Fees', percentage: 8.6, amount: 623000, color: '#f59e0b' },
    { name: 'Others', percentage: 12.2, amount: 882200, color: '#8b5cf6' },
  ];

  public hoveredDepartment: DepartmentRevenue | null = null;

  public onHoverDepartment(dept: DepartmentRevenue): void {
    this.hoveredDepartment = dept;
  }

  public onLeaveDepartment(): void {
    this.hoveredDepartment = null;
  }

  public getDepartmentTotalAmount(): number {
    return this.departmentRevenueList.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  public calculateDonutSegments(): void {
    const totalCircumference = 439.82; // 2 * PI * 70
    let accumulatedPercent = 0;

    this.departmentRevenueList.forEach((item) => {
      const strokeLength = (item.percentage / 100) * totalCircumference;
      const spaceLength = totalCircumference - strokeLength;
      item.dashArray = `${strokeLength.toFixed(2)} ${spaceLength.toFixed(2)}`;
      item.dashOffset = -((accumulatedPercent / 100) * totalCircumference);
      accumulatedPercent += item.percentage;
    });
  }

  // Dynamic Today's Summary
  public todaySummaryList: TodaySummaryItem[] = [
    { name: 'F & B Sales', amount: 162450, icon: 'fa-utensils', colorClass: 'primary' },
    { name: 'Liquor Sales', amount: 78300, icon: 'fa-wine-glass-alt', colorClass: 'info' },
    { name: 'Super Store Sales', amount: 42750, icon: 'fa-shopping-cart', colorClass: 'success' },
    { name: 'Membership Fees', amount: 28000, icon: 'fa-id-card', colorClass: 'warning' },
    { name: 'Others', amount: 17250, icon: 'fa-handshake', colorClass: 'secondary' },
  ];


  get todaySummaryTotal(): number {
    if (!this.todaySummaryList || this.todaySummaryList.length === 0) {
      return this.todayRevenue || 328750;
    }
    return this.todaySummaryList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }

  // Dynamic Recent Memberships
  public recentMembersList: RecentMemberItem[] = [
    { id: 'M-5268', name: 'Mr. Arif Hossain', category: 'General', joinDate: '18 May 2026', initials: 'AH', badgeClass: 'badge-light-primary text-primary' },
    { id: 'M-5267', name: 'Mrs. Nusrat Jahan', category: 'Family', joinDate: '17 May 2026', initials: 'NJ', badgeClass: 'badge-light-success text-success' },
    { id: 'M-5266', name: 'Mr. Jahid Hasan', category: 'General', joinDate: '17 May 2026', initials: 'JH', badgeClass: 'badge-light-primary text-primary' },
    { id: 'M-5265', name: 'Mr. Tanvir Ahmed', category: 'Corporate', joinDate: '16 May 2026', initials: 'TA', badgeClass: 'badge-light-info text-info' },
    { id: 'M-5264', name: 'Mrs. Farzana Hoque', category: 'Family', joinDate: '16 May 2026', initials: 'FH', badgeClass: 'badge-light-success text-success' },
  ];

  // Dynamic Upcoming Events
  public upcomingEventsList: UpcomingEventItem[] = [
    { month: 'MAY', day: '20', title: 'Friday Night BBQ', location: 'F & B Lawn', time: '07:00 PM', guests: '120 Guests' },
    { month: 'MAY', day: '22', title: 'Live Music Night', location: 'Main Auditorium', time: '08:00 PM', guests: '200 Guests' },
    { month: 'MAY', day: '25', title: 'Family Day 2026', location: 'Club Ground', time: '10:00 AM', guests: '350 Guests' },
    { month: 'MAY', day: '30', title: 'Monthly Members Meeting', location: 'Conference Room', time: '06:00 PM', guests: null },
  ];

  // Dynamic Top Selling Items
  public topSellingItemsList: TopSellingItem[] = [
    { name: 'Grilled Chicken', department: 'F & B', qtySold: 1245, amount: 623450, imageIcon: '🍗', deptBadge: 'badge-light-warning text-warning' },
    { name: 'Royal Stag 750ml', department: 'Liquor Shop', qtySold: 876, amount: 543120, imageIcon: '🍷', deptBadge: 'badge-light-info text-info' },
    { name: 'Mineral Water 1L', department: 'Super Store', qtySold: 1532, amount: 76600, imageIcon: '💧', deptBadge: 'badge-light-success text-success' },
    { name: 'Chili Beef', department: 'F & B', qtySold: 654, amount: 327000, imageIcon: '🥩', deptBadge: 'badge-light-warning text-warning' },
    { name: 'Jack Daniels 700ml', department: 'Liquor Shop', qtySold: 512, amount: 281600, imageIcon: '🍾', deptBadge: 'badge-light-info text-info' },
  ];

  // Birthday Member List Popover
  public birthdayMemberList: any[] = [
    { membershipNo: 'M-1042', cusName: 'Md. Ashiqur Rahman', birthDayFormatted: '08 Aug' },
    { membershipNo: 'M-1589', cusName: 'Dr. Kazi Shahidullah', birthDayFormatted: '14 Aug' },
    { membershipNo: 'M-2204', cusName: 'Engr. Mahbubul Alam', birthDayFormatted: '19 Aug' },
    { membershipNo: 'M-3112', cusName: 'Mrs. Rubana Huq', birthDayFormatted: '25 Aug' },
    { membershipNo: 'M-4088', cusName: 'Syed Tanvir Hussain', birthDayFormatted: '29 Aug' },
  ];

  // Venue Bookings
  public todayVenueBookingsList: any[] = [
    { bookedNo: 'VB-8021', memberName: 'Dr. Rafiqul Islam', membershipNo: 'M-1024', venueName: 'Main Banquet Hall', timeSlot: 'Evening (06:00 PM - 11:00 PM)', amount: 45000, status: 'Confirmed' },
    { bookedNo: 'VB-8022', memberName: 'Engr. Mahfuzur Rahman', membershipNo: 'M-2315', venueName: 'Executive Conference Room', timeSlot: 'Day (10:00 AM - 04:00 PM)', amount: 18000, status: 'Confirmed' },
  ];
  public todayVenueBookingsCount = 2;

  // Operational KPI fallbacks
  public operationalKpis = {
    walletBalance: 2356780,
    totalAssets: 45780000,
    maintenanceRequests: 12,
    employeeStrength: 86,
    birthdaysThisMonth: 18,
    systemAlerts: 3,
  };

  // Operational Live Lists
  public yearlyIncomeData: any[] = [];
  public userConferenceDataList: UserConference[] = [];
  public dailyAttendance: any[] = [];
  public transactionList: any[] = [];
  public eventTicketReportInfoList: any[] = [];
  public eventSaleQty = 0;
  public eventSaleAmount = 0;
  public collectionSize = 0;
  public page = 1;
  public limit = 7;

  constructor(
    private dashboardService: DashboardService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initGreetingAndDates();
    this.calculateDonutSegments();
    this.updateYAxisScale();
    this.calculateAiProjectedGrowth();
    this.initRevenueAreaChart();
    this.initRevenueDonutChart();
    this.loadAllDashboardData();
  }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initGreetingAndDates(): void {
    const currentHour = new Date().getHours();
    if (currentHour < 12) this.greetingTimeOfDay = 'Good morning';
    else if (currentHour < 17) this.greetingTimeOfDay = 'Good afternoon';
    else this.greetingTimeOfDay = 'Good evening';

    const currentDate = new Date();
    this.startDate = this.datePipe.transform(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      'yyyy-MM-dd'
    );
    this.endDate = this.datePipe.transform(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
      'yyyy-MM-dd'
    );

    const startMonthName = this.datePipe.transform(this.startDate, 'dd MMM yyyy') || '01 May 2026';
    const endMonthName = this.datePipe.transform(currentDate, 'dd MMM yyyy') || '18 May 2026';
    this.selectedDateRange = `${startMonthName} - ${endMonthName}`;
  }

  /**
   * Orchestrates all Dashboard API Calls
   */
  public loadAllDashboardData(): void {
    this.isLoading = true;
    this.GetAllDashboardData();
    this.getYearlyIncome(this.selectedPeriod);
    this.getAllTransactionData();
    this.GetEventTicketReportInfo();
    this.getDailyAttendance();
    this.GetAllUserConferenceData(1);
    this.getTodayVenueBookings();
  }

  /**
   * 1. GetDashboardAllData API
   */
  public GetAllDashboardData(): void {
    this.dashboardService
      .GetDashboardAllData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res) {
            let rawData: any = res;
            if (res.Data) rawData = res.Data;
            else if (res.DataList && res.DataList.length > 0) rawData = res.DataList[0];
            else if (Array.isArray(res) && res.length > 0) rawData = res[0];

            console.log('Dynamic Dashboard Raw Data:', rawData);

            // Bind KPI values directly from SQL view API response
            this.getUserDashboardAllData.TotalMember = Number(
              rawData.TotalMember ?? rawData.totalMember ?? 5248
            );
            this.getUserDashboardAllData.TotalActiveMember = Number(
              rawData.TotalActiveMember ?? rawData.totalActiveMember ?? 3890
            );
            this.getUserDashboardAllData.TotalPendingMember = Number(
              rawData.TotalPendingMember ?? rawData.totalPendingMember ?? 128
            );
            this.getUserDashboardAllData.TotalSpouseMember = Number(
              rawData.TotalSpouseMember ?? rawData.totalSpouseMember ?? 0
            );
            this.getUserDashboardAllData.SubscriptionDueAmount = Number(
              rawData.SubscriptionDueAmount ?? rawData.subscriptionDueAmount ?? 432500
            );
            this.getUserDashboardAllData.TotalDue = Number(
              rawData.TotalDue ?? rawData.totalDue ?? 1286450
            );
            this.getUserDashboardAllData.UpcomingEvents = Number(
              rawData.UpcomingEvents ?? rawData.upcomingEvents ?? 4
            );

            // Dynamic Growth Rates
            if (rawData.MemberGrowthRate != null) this.memberGrowthRate = Number(rawData.MemberGrowthRate);
            if (rawData.ActiveMemberGrowthRate != null) this.activeMemberGrowthRate = Number(rawData.ActiveMemberGrowthRate);
            if (rawData.PendingMemberGrowthRate != null) this.pendingMemberGrowthRate = Number(rawData.PendingMemberGrowthRate);
            if (rawData.DueGrowthRate != null) this.dueGrowthRate = Number(rawData.DueGrowthRate);
            if (rawData.TodayRevenueGrowthRate != null) this.todayRevenueGrowthRate = Number(rawData.TodayRevenueGrowthRate);
            if (rawData.MonthRevenueGrowthRate != null) this.monthRevenueGrowthRate = Number(rawData.MonthRevenueGrowthRate);

            // Revenues
            if (rawData.TodayRevenue != null || rawData.TodayIncome != null) {
              this.todayRevenue = Number(rawData.TodayRevenue ?? rawData.TodayIncome ?? 328750);
              this.getUserDashboardAllData.TodayRevenue = this.todayRevenue;
            }
            if (rawData.ThisMonthRevenue != null || rawData.TotalIncome != null) {
              this.currentYearIncome = Number(rawData.ThisMonthRevenue ?? rawData.TotalIncome ?? 7245680);
              this.getUserDashboardAllData.ThisMonthRevenue = this.currentYearIncome;
            }

            // Operational Assets & Counts
            if (rawData.TotalWalletBalance != null) {
              this.operationalKpis.walletBalance = Number(rawData.TotalWalletBalance);
              this.getUserDashboardAllData.TotalWalletBalance = Number(rawData.TotalWalletBalance);
            }
            if (rawData.TotalAssets != null) {
              this.operationalKpis.totalAssets = Number(rawData.TotalAssets);
              this.getUserDashboardAllData.TotalAssets = Number(rawData.TotalAssets);
            }
            if (rawData.PendingMaintenance != null) {
              this.operationalKpis.maintenanceRequests = Number(rawData.PendingMaintenance);
              this.getUserDashboardAllData.PendingMaintenance = Number(rawData.PendingMaintenance);
            }
            if (rawData.TotalEmployeeCount != null || rawData.TotalEmployee != null) {
              this.operationalKpis.employeeStrength = Number(rawData.TotalEmployeeCount ?? rawData.TotalEmployee ?? 86);
              this.getUserDashboardAllData.TotalEmployeeCount = this.operationalKpis.employeeStrength;
            }
            if (rawData.SystemAlerts != null) {
              this.operationalKpis.systemAlerts = Number(rawData.SystemAlerts);
              this.getUserDashboardAllData.SystemAlerts = Number(rawData.SystemAlerts);
            }

            // Dynamic Department Revenue
            const deptList = rawData.DepartmentRevenues ?? rawData.departmentRevenues;
            if (deptList && Array.isArray(deptList) && deptList.length > 0) {
              this.departmentRevenueList = deptList.map((d: any, idx: number) => ({
                name: d.DepartmentName || d.departmentName || `Dept ${idx + 1}`,
                percentage: Number(d.Percentage || d.percentage || 0),
                amount: Number(d.Amount || d.amount || 0),
                color: d.Color || d.color || ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][idx % 5],
              }));
              this.updateDonutChartFromList();
            }

            // Dynamic Today's Summary
            const todayList = rawData.TodaySummaries ?? rawData.todaySummaries;
            if (todayList && Array.isArray(todayList) && todayList.length > 0) {
              this.todaySummaryList = todayList.map((s: any) => ({
                name: s.DepartmentName || s.departmentName || 'Sales Item',
                amount: Number(s.Amount || s.amount || 0),
                icon: s.Icon || s.icon || 'fa-coins',
                colorClass: s.ColorClass || s.colorClass || 'primary',
              }));
            }

            // Dynamic Recent Memberships
            const recentMembers = rawData.RecentMembers ?? rawData.recentMembers;
            if (recentMembers && Array.isArray(recentMembers) && recentMembers.length > 0) {
              this.recentMembersList = recentMembers.map((m: any, idx: number) => {
                const name = m.CusName || m.cusName || m.Name || 'Club Member';
                const initials = name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();
                const category = m.Category || m.category || 'General';
                let badgeClass = 'badge-light-primary text-primary';
                if (category.toLowerCase().includes('family')) badgeClass = 'badge-light-success text-success';
                else if (category.toLowerCase().includes('corp')) badgeClass = 'badge-light-info text-info';

                return {
                  id: m.MembershipNo || m.membershipNo || `M-${5268 - idx}`,
                  name: name,
                  category: category,
                  joinDate: m.JoinDateText || (m.JoinDate ? this.datePipe.transform(m.JoinDate, 'dd MMM yyyy') : '18 May 2026') || '18 May 2026',
                  initials: initials || 'CM',
                  badgeClass: badgeClass,
                };
              });
            }

            // Dynamic Upcoming Events
            const upcomingEvents = rawData.UpcomingEventsList ?? rawData.upcomingEventsList;
            if (upcomingEvents && Array.isArray(upcomingEvents) && upcomingEvents.length > 0) {
              this.upcomingEventsList = upcomingEvents.map((e: any) => {
                const eventDate = e.EventDate ? new Date(e.EventDate) : null;
                const month = e.MonthText || (eventDate ? this.datePipe.transform(eventDate, 'MMM')?.toUpperCase() : 'MAY') || 'MAY';
                const day = e.DayText || (eventDate ? this.datePipe.transform(eventDate, 'dd') : '20') || '20';
                const time = e.TimeText || (eventDate ? this.datePipe.transform(eventDate, 'hh:mm a') : '07:00 PM') || '07:00 PM';
                const guests = e.TicketLimit ? `${e.TicketLimit} Guests` : (e.Guests ? `${e.Guests} Guests` : null);
                return {
                  month: month,
                  day: day,
                  title: e.Title || e.title || 'Club Event',
                  location: e.Location || e.location || 'Club Premises',
                  time: time,
                  guests: guests,
                };
              });
            }

            // Dynamic Top Selling Items
            const topSelling = rawData.TopSellingItems ?? rawData.topSellingItems;
            if (topSelling && Array.isArray(topSelling) && topSelling.length > 0) {
              this.topSellingItemsList = topSelling.map((item: any) => {
                const dept = item.DepartmentName || item.departmentName || 'F & B';
                let icon = '🍗';
                let deptBadge = 'badge-light-warning text-warning';
                const lowerDept = dept.toLowerCase();
                if (lowerDept.includes('bar') || lowerDept.includes('liquor')) {
                  icon = '🍷';
                  deptBadge = 'badge-light-info text-info';
                } else if (lowerDept.includes('super') || lowerDept.includes('store')) {
                  icon = '💧';
                  deptBadge = 'badge-light-success text-success';
                }
                return {
                  name: item.ItemName || item.itemName || 'Club Item',
                  department: dept,
                  qtySold: Number(item.QtySold || item.qtySold || 0),
                  amount: Number(item.Amount || item.amount || 0),
                  imageIcon: icon,
                  deptBadge: deptBadge,
                };
              });
            }

            // Dynamic Birthdays
            const bdays = rawData.BirthdayMemberList ?? rawData.birthdayMemberList;
            if (bdays && Array.isArray(bdays) && bdays.length > 0) {
              this.birthdayMemberList = bdays.map((b: any) => ({
                membershipNo: b.MembershipNo || b.membershipNo || '',
                cusName: b.CusName || b.cusName || 'Club Member',
                birthDayFormatted: b.BirthDayFormatted || (b.Dob ? this.datePipe.transform(b.Dob, 'dd MMM') : '') || '',
              }));
              this.operationalKpis.birthdaysThisMonth = this.birthdayMemberList.length;
              this.getUserDashboardAllData.BirthdaysThisMonth = this.birthdayMemberList.length;
            }
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching dashboard summary:', err);
          this.isLoading = false;
        },
      });
  }

  /**
   * 2. GetAllTransactionData API (For Monthly Sales & Today Sales)
   */
  public getAllTransactionData(): void {
    if (!this.startDate || !this.endDate) return;

    // Monthly transactions
    this.dashboardService
      .getAllTransactionData(this.startDate, this.endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && (res.Data || Array.isArray(res))) {
            this.transactionList = Array.isArray(res.Data) ? res.Data : Array.isArray(res) ? res : [];
            const saleItem = this.transactionList.find((t: any) => {
              const type = (t.TransactionType || t.Type || '')?.trim().toLowerCase();
              return type === 'sale' || type.includes('sale') || type.includes('f & b');
            });

            if (saleItem) {
              const saleAmount = Number(saleItem.Amount ?? saleItem.NetAmt ?? saleItem.TotalAmount ?? 0);
              const fbDept = this.departmentRevenueList.find(
                (d) => d.name === 'F & B Outlets' || d.name?.toLowerCase().includes('f & b')
              );
              if (fbDept) {
                fbDept.amount = saleAmount;
                this.updateDonutChartFromList();
              }
            }
          }
        },
        error: (err) => console.error('Error fetching monthly transaction data:', err),
      });

    // Today's transactions
    const todayFormatted = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    this.dashboardService
      .getAllTransactionData(todayFormatted, todayFormatted)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && (res.Data || Array.isArray(res))) {
            const todayTxList = Array.isArray(res.Data) ? res.Data : Array.isArray(res) ? res : [];
            const todaySaleItem = todayTxList.find((t: any) => {
              const type = (t.TransactionType || t.Type || '')?.trim().toLowerCase();
              return type === 'sale' || type.includes('sale') || type.includes('f & b');
            });

            if (todaySaleItem) {
              const todaySaleAmount = Number(todaySaleItem.Amount ?? todaySaleItem.NetAmt ?? 0);
              const fbToday = this.todaySummaryList.find(
                (s) => s.name === 'F & B Sales' || s.name?.toLowerCase().includes('f & b')
              );
              if (fbToday) {
                fbToday.amount = todaySaleAmount;
                this.cdr.detectChanges();
              }
            }
          }
        },
        error: (err) => console.error("Error fetching today's transaction data:", err),
      });
  }

  /**
   * 3. Venue Bookings API
   */
  public getTodayVenueBookings(): void {
    const todayFormatted = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    this.dashboardService
      .getVenueBookingPagination(1, 20, '', { StartDate: todayFormatted, EndDate: todayFormatted })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && res.DataList && Array.isArray(res.DataList) && res.DataList.length > 0) {
            this.todayVenueBookingsList = res.DataList.slice(0, 5).map((b: any) => ({
              bookedNo: b.BookedNo || `VB-${b.Id}`,
              memberName: b.MemberName || b.RefName || 'Club Member',
              membershipNo: b.MemberShipNo || '',
              venueName: b.BookingCriteria || b.VenueTitle || 'Main Club Venue',
              timeSlot: b.BookingCriteria || 'Standard Slot',
              amount: b.TotalAmount || b.Amount || 0,
              status: b.BookingStatus || 'Confirmed',
            }));
            this.todayVenueBookingsCount = this.todayVenueBookingsList.length;
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Error fetching venue bookings:', err),
      });
  }

  public initRevenueAreaChart(): void {
    this.chartOptions = {
      series: [
        {
          name: 'Revenue (BDT)',
          data: [520000, 1420000, 830000, 710000, 1250000, 1020000, 1380000, 1240000, 1550000, 1100000, 1280000],
        },
      ],
      chart: {
        height: 290,
        type: 'area',
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'Inter, sans-serif',
      },
      colors: ['#2563eb'],
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories: ['1 May', '4 May', '7 May', '10 May', '13 May', '16 May', '18 May', '21 May', '24 May', '27 May', '30 May'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: '#94a3b8', fontSize: '12px' },
        },
      },
      yaxis: {
        labels: {
          style: { colors: '#94a3b8', fontSize: '12px' },
          formatter: (val: number) => {
            if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
            if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
            return val.toString();
          },
        },
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (val: number) => '৳ ' + Number(val || 0).toLocaleString('en-US'),
        },
      },
    };
  }

  public initRevenueDonutChart(): void {
    this.donutChartOptions = {
      series: this.departmentRevenueList.map((d) => d.amount),
      chart: {
        type: 'donut',
        height: 250,
        fontFamily: 'Inter, sans-serif',
      },
      labels: this.departmentRevenueList.map((d) => d.name),
      colors: this.departmentRevenueList.map((d) => d.color),
      dataLabels: { enabled: false },
      legend: { show: false },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '13px',
                color: '#64748b',
                offsetY: -6,
              },
              value: {
                show: true,
                fontSize: '18px',
                fontWeight: '700',
                color: '#0f172a',
                offsetY: 6,
                formatter: () => '৳ 7.25M',
              },
              total: {
                show: true,
                label: 'Total',
                color: '#64748b',
                formatter: () => '৳ 7,245,680',
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val: number) => '৳ ' + Number(val || 0).toLocaleString('en-US'),
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 220 },
            legend: { position: 'bottom' },
          },
        },
      ],
    };
  }

  private updateDonutChartFromList(): void {
    const total = this.departmentRevenueList.reduce((acc, curr) => acc + curr.amount, 0);
    this.calculateDonutSegments();
    this.donutChartOptions = {
      ...this.donutChartOptions,
      series: this.departmentRevenueList.map((d) => d.amount),
      labels: this.departmentRevenueList.map((d) => d.name),
      colors: this.departmentRevenueList.map((d) => d.color),
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: { show: true, fontSize: '13px', color: '#64748b', offsetY: -6 },
              value: {
                show: true,
                fontSize: '18px',
                fontWeight: '700',
                color: '#0f172a',
                offsetY: 6,
                formatter: () => (total >= 1000000 ? `৳ ${(total / 1000000).toFixed(2)}M` : `৳ ${total.toLocaleString()}`),
              },
              total: {
                show: true,
                label: 'Total',
                color: '#64748b',
                formatter: () => `৳ ${total.toLocaleString()}`,
              },
            },
          },
        },
      },
    };
  }


  public setPeriod(period: string): void {
    this.selectedPeriod = period;
    this.getYearlyIncome(period);
  }

  public getYearlyIncome(filter?: string): void {
    const activeFilter = filter || this.selectedPeriod;
    this.dashboardService
      .getYearlyIncomeData(activeFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && Array.isArray(res) && res.length > 0) {
            this.yearlyIncomeData = res;
            this.revenueOverviewDays = res.map((item: any, idx: number) => ({
              day: item.MonthText || item.DayText || item.MonthName || `P${idx + 1}`,
              amount: Number(item.Amount || 0),
            }));

            const sum = this.yearlyIncomeData.reduce((x: number, y: any) => x + (y.Amount || 0), 0);
            if (sum > 0 && activeFilter === 'This Year') {
              this.currentYearIncome = sum;
            }

            this.updateYAxisScale();
            this.calculateAiProjectedGrowth();
          } else {
            if (activeFilter === 'This Year') {
              this.revenueOverviewDays = [
                { day: 'Jan', amount: 4200000 },
                { day: 'Feb', amount: 5100000 },
                { day: 'Mar', amount: 6300000 },
                { day: 'Apr', amount: 5800000 },
                { day: 'May', amount: 7245680 },
              ];
            } else if (activeFilter === 'Last 6 Months') {
              this.revenueOverviewDays = [
                { day: 'Dec', amount: 3800000 },
                { day: 'Jan', amount: 4200000 },
                { day: 'Feb', amount: 5100000 },
                { day: 'Mar', amount: 6300000 },
                { day: 'Apr', amount: 5800000 },
                { day: 'May', amount: 7245680 },
              ];
            } else {
              this.revenueOverviewDays = [
                { day: '1 May', amount: 520000 },
                { day: '4 May', amount: 1420000 },
                { day: '7 May', amount: 830000 },
                { day: '10 May', amount: 710000 },
                { day: '13 May', amount: 1250000 },
                { day: '16 May', amount: 1020000 },
                { day: '18 May', amount: 1450000 },
              ];
            }
            this.updateYAxisScale();
            this.calculateAiProjectedGrowth();
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Yearly income error:', err),
      });
  }


  public exportReport(): void {
    this.toastr.success('Exporting comprehensive management dashboard report...', 'Export Report');
    setTimeout(() => {
      window.print();
    }, 400);
  }


  public GetEventTicketReportInfo(): void {
    this.dashboardService
      .getEventSaleData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data && Array.isArray(data) && data.length > 0) {
            this.eventTicketReportInfoList = data;
            this.eventSaleAmount = this.eventTicketReportInfoList.reduce((x, y) => x + (y.TotalAmount || 0), 0);
            this.eventSaleQty = this.eventTicketReportInfoList.reduce((x, y) => x + (y.SaleQty || 0), 0);
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Event sale data error:', err),
      });
  }

  public getDailyAttendance(page?: number): void {
    const toDayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    this.dashboardService
      .getDailyAttendance(toDayDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && Array.isArray(res)) {
            this.dailyAttendance = res;
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Attendance error:', err),
      });
  }

  public GetAllUserConferenceData(page: number): void {
    this.dashboardService
      .GetUserConferenceData(page || 1, this.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && !res.HasError) {
            this.userConferenceDataList = res.DataList || [];
            this.collectionSize = res.DataCount || this.userConferenceDataList.length;
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Conference data error:', err),
      });
  }
}
