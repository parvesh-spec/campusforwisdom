import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  GraduationCap, 
  IndianRupee, 
  Calendar,
  Download,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import { useState } from "react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: overviewStats } = useQuery<{
    totalRevenue: number;
    totalStudents: number;
    totalEnrollments: number;
    completionRate: number;
    revenueGrowth: number;
    studentGrowth: number;
    enrollmentGrowth: number;
    completionGrowth: number;
  }>({
    queryKey: ["/api/admin/analytics/overview", timeRange],
  });

  const { data: courseAnalytics } = useQuery<Array<{
    courseId: string;
    title: string;
    enrollments: number;
    completions: number;
    revenue: number;
    avgRating: number;
    completionRate: number;
  }>>({
    queryKey: ["/api/admin/analytics/courses", timeRange],
  });

  const { data: studentAnalytics } = useQuery<{
    activeStudents: number;
    newStudents: number;
    churnRate: number;
    avgSessionDuration: number;
    topPerformers: Array<{
      id: string;
      name: string;
      completedCourses: number;
      totalProgress: number;
    }>;
  }>({
    queryKey: ["/api/admin/analytics/students", timeRange],
  });

  const { data: revenueAnalytics } = useQuery<{
    totalRevenue: number;
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
      enrollments: number;
    }>;
    revenueByCategory: Array<{
      category: string;
      revenue: number;
      percentage: number;
    }>;
  }>({
    queryKey: ["/api/admin/analytics/revenue", timeRange],
  });

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track performance, monitor growth, and analyze trends</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{((overviewStats?.totalRevenue || 0) / 100000).toFixed(1)}L
                  </p>
                  <p className={`text-sm mt-1 ${
                    (overviewStats?.revenueGrowth || 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    {overviewStats?.revenueGrowth || 0}% from last period
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{overviewStats?.totalStudents || 0}</p>
                  <p className={`text-sm mt-1 ${
                    (overviewStats?.studentGrowth || 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    {overviewStats?.studentGrowth || 0}% growth
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-3xl font-bold text-gray-900">{overviewStats?.totalEnrollments || 0}</p>
                  <p className={`text-sm mt-1 ${
                    (overviewStats?.enrollmentGrowth || 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    {overviewStats?.enrollmentGrowth || 0}% growth
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{overviewStats?.completionRate || 0}%</p>
                  <p className={`text-sm mt-1 ${
                    (overviewStats?.completionGrowth || 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    {overviewStats?.completionGrowth || 0}% improvement
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">Course Performance</TabsTrigger>
            <TabsTrigger value="students">Student Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="trends">Growth Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {courseAnalytics && courseAnalytics.length > 0 ? (
                  <div className="space-y-4">
                    {courseAnalytics.map((course) => (
                      <div key={course.courseId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>{course.enrollments} enrollments</span>
                            <span>{course.completions} completions</span>
                            <span>₹{course.revenue.toLocaleString()} revenue</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{course.completionRate}%</div>
                            <div className="text-xs text-gray-500">Completion</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center text-sm font-medium text-gray-900">
                              {course.avgRating}
                              <BarChart3 className="h-3 w-3 text-yellow-400 ml-1" />
                            </div>
                            <div className="text-xs text-gray-500">Rating</div>
                          </div>
                          <Badge variant={course.completionRate > 70 ? "default" : "secondary"}>
                            {course.completionRate > 70 ? "High Performance" : "Needs Attention"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No course data available</h3>
                    <p className="text-gray-600">Course analytics will appear here once you have enrollments.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Students</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {studentAnalytics?.activeStudents || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">New Students</span>
                      <span className="text-2xl font-bold text-green-600">
                        {studentAnalytics?.newStudents || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Churn Rate</span>
                      <span className="text-2xl font-bold text-red-600">
                        {studentAnalytics?.churnRate || 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg Session Duration</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {studentAnalytics?.avgSessionDuration || 0}min
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  {studentAnalytics?.topPerformers && studentAnalytics.topPerformers.length > 0 ? (
                    <div className="space-y-3">
                      {studentAnalytics.topPerformers.map((student, index) => (
                        <div key={student.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">
                                {student.completedCourses} courses completed
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {student.totalProgress}%
                            </div>
                            <div className="text-xs text-gray-500">Overall Progress</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No top performers data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueAnalytics?.revenueByCategory && revenueAnalytics.revenueByCategory.length > 0 ? (
                    <div className="space-y-4">
                      {revenueAnalytics.revenueByCategory.map((category) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-primary rounded"></div>
                            <span className="text-gray-900">{category.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              ₹{category.revenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">{category.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <PieChart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No revenue data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-gray-600">Revenue trend chart would appear here</p>
                      <p className="text-sm text-gray-500">Integration with Chart.js pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Comprehensive Growth Analytics</h3>
                    <p className="text-gray-600 mb-2">Advanced charts showing:</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Student enrollment trends over time</li>
                      <li>• Revenue growth patterns</li>
                      <li>• Course completion rates</li>
                      <li>• User engagement metrics</li>
                      <li>• Seasonal performance analysis</li>
                    </ul>
                    <p className="text-sm text-gray-500 mt-4">Chart library integration pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
