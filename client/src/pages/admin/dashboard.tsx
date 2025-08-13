import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, IndianRupee, Video, TrendingUp, UserPlus, MessageSquare, Upload, Mail, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useQuery<{
    totalStudents: number;
    activeCourses: number;
    totalRevenue: number;
    liveSessions: number;
    newStudentsThisMonth: number;
    revenueGrowth: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: activities } = useQuery<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>>({
    queryKey: ["/api/admin/activities"],
  });

  const { data: popularCourses } = useQuery<Array<{
    id: string;
    title: string;
    studentsCount: number;
    rating: number;
    category: string;
  }>>({
    queryKey: ["/api/admin/popular-courses"],
  });

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at CampusForWisdom today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <span className="text-gray-700 font-medium">Admin User</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={stats?.totalStudents?.toLocaleString() || "0"}
            change={`+${stats?.newStudentsThisMonth || 0} this month`}
            changeType="increase"
            icon={Users}
            iconColor="bg-blue-100 text-primary"
          />
          <StatsCard
            title="Active Courses"
            value={(stats?.activeCourses || 0).toString()}
            change="+2 new courses"
            changeType="increase"
            icon={GraduationCap}
            iconColor="bg-purple-100 text-secondary"
          />
          <StatsCard
            title="Revenue"
            value={`₹${((stats?.totalRevenue || 0) / 100000).toFixed(1)}L`}
            change={`+${stats?.revenueGrowth || 0}% this month`}
            changeType="increase"
            icon={IndianRupee}
            iconColor="bg-green-100 text-green-600"
          />
          <StatsCard
            title="Live Sessions"
            value={(stats?.liveSessions || 0).toString()}
            change="3 happening now"
            changeType="neutral"
            icon={Video}
            iconColor="bg-red-100 text-red-600"
          />
        </div>

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Popular Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {popularCourses ? (
                <div className="space-y-4">
                  {popularCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">{course.studentsCount} students</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900">{course.rating}</div>
                        <TrendingUp className="h-4 w-4 text-yellow-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading course data...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-gray-600">Revenue chart would appear here</p>
                  <p className="text-sm text-gray-500">Integration with Chart.js pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activities ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserPlus className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserPlus className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">System starting up...</p>
                        <p className="text-xs text-gray-500 mt-1">Just now</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-primary text-white hover:bg-primary/90 justify-start">
                <GraduationCap className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
              <Button className="w-full bg-secondary text-white hover:bg-secondary/90 justify-start">
                <Video className="h-4 w-4 mr-2" />
                Schedule Live Session
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload Content
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Announcement
              </Button>

              <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 to-purple/10 rounded-lg border border-accent/20">
                <h4 className="font-semibold text-gray-900 mb-2">System Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Server Status</span>
                    <span className="text-green-600 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Live Sessions</span>
                    <span className="text-green-600 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Gateway</span>
                    <span className="text-green-600 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
