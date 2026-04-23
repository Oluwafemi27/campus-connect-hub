import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, CreditCard, Activity } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

// Sample data for charts
const transactionData = [
  { date: "Mon", amount: 45000, transactions: 12 },
  { date: "Tue", amount: 52000, transactions: 18 },
  { date: "Wed", amount: 48000, transactions: 15 },
  { date: "Thu", amount: 61000, transactions: 22 },
  { date: "Fri", amount: 55000, transactions: 19 },
  { date: "Sat", amount: 67000, transactions: 25 },
  { date: "Sun", amount: 72000, transactions: 28 },
];

const userGrowthData = [
  { week: "Week 1", newUsers: 120, activeUsers: 450 },
  { week: "Week 2", newUsers: 150, activeUsers: 580 },
  { week: "Week 3", newUsers: 180, activeUsers: 720 },
  { week: "Week 4", newUsers: 210, activeUsers: 890 },
];

const serviceUsageData = [
  { name: "Airtime", value: 2400, color: "#6366f1" },
  { name: "Data", value: 3200, color: "#8b5cf6" },
  { name: "TV", value: 1800, color: "#ec4899" },
  { name: "Router", value: 1600, color: "#f59e0b" },
];

const topupMethodData = [
  { method: "Card", value: 4500, percentage: 45 },
  { method: "Bank Transfer", value: 3200, percentage: 32 },
  { method: "USSD", value: 2300, percentage: 23 },
];

function AdminAnalytics() {
  const metrics = [
    {
      label: "Total Revenue",
      value: "₦847,200",
      change: "+12.5%",
      icon: CreditCard,
      color: "text-emerald-500",
    },
    {
      label: "Total Users",
      value: "2,450",
      change: "+8.2%",
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Transactions",
      value: "1,847",
      change: "+15.3%",
      icon: Activity,
      color: "text-purple-500",
    },
    {
      label: "Avg Order Value",
      value: "₦459",
      change: "+3.1%",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-bold">Analytics & Insights</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="glass rounded-2xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted/30`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <span className="text-xs font-semibold text-emerald-500">{metric.change}</span>
              </div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="text-lg font-bold">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Transaction Trends */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-sm font-bold tracking-widest text-muted-foreground">WEEKLY TRANSACTION TRENDS</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={transactionData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#6366f1" name="Transaction Volume (₦)" strokeWidth={2} dot={{ fill: "#6366f1" }} />
            <Line type="monotone" dataKey="transactions" stroke="#8b5cf6" name="Count" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* User Growth & Top-up Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* User Growth */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <p className="text-sm font-bold tracking-widest text-muted-foreground">USER GROWTH</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userGrowthData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="newUsers" fill="#6366f1" name="New Users" radius={[4, 4, 0, 0]} />
              <Bar dataKey="activeUsers" fill="#8b5cf6" name="Active Users" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top-up Methods */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <p className="text-sm font-bold tracking-widest text-muted-foreground">TOP-UP METHODS</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={topupMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.method} ${entry.percentage}%`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {topupMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#6366f1", "#8b5cf6", "#ec4899"][index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Usage */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-sm font-bold tracking-widest text-muted-foreground">SERVICE USAGE DISTRIBUTION</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={serviceUsageData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
            <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top-up Method Details */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-sm font-bold tracking-widest text-muted-foreground">TOP-UP METHOD BREAKDOWN</p>
        <div className="space-y-2">
          {topupMethodData.map((method) => (
            <div key={method.method} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-semibold">{method.method}</p>
                <p className="text-xs text-muted-foreground">₦{method.value.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className="w-24 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{method.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4 text-center space-y-1">
          <p className="text-xs text-muted-foreground">AVG DAILY REVENUE</p>
          <p className="text-xl font-bold">₦59,657</p>
          <p className="text-xs text-emerald-500">↑ 5.2% vs last week</p>
        </div>
        <div className="glass rounded-xl p-4 text-center space-y-1">
          <p className="text-xs text-muted-foreground">CONVERSION RATE</p>
          <p className="text-xl font-bold">3.24%</p>
          <p className="text-xs text-orange-500">↓ 0.5% vs last week</p>
        </div>
      </div>
    </div>
  );
}
