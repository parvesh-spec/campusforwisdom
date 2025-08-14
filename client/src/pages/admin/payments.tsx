import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  IndianRupee, 
  CreditCard, 
  TrendingUp, 
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign
} from "lucide-react";
import type { Payment, User, Course } from "@shared/schema";

interface PaymentWithDetails extends Payment {
  user: User;
  course?: Course;
}

export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");

  const { data: payments, isLoading: paymentsLoading } = useQuery<PaymentWithDetails[]>({
    queryKey: ["/api/admin/payments"],
  });

  const { data: paymentStats } = useQuery<{
    totalRevenue: number;
    totalTransactions: number;
    pendingPayments: number;
    successRate: number;
    monthlyRevenue: number;
    monthlyGrowth: number;
    refundedAmount: number;
    averageOrderValue: number;
  }>({
    queryKey: ["/api/admin/payment-stats", timeRange],
  });

  const { data: revenueByMonth } = useQuery<Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>>({
    queryKey: ["/api/admin/revenue-trends", timeRange],
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest("PUT", `/api/admin/payments/${id}`, { status }),
    onSuccess: () => {
      toast({ title: "Payment status updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-stats"] });
    },
    onError: () => {
      toast({ title: "Error updating payment", variant: "destructive" });
    },
  });

  const processRefundMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/payments/${id}/refund`),
    onSuccess: () => {
      toast({ title: "Refund processed successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-stats"] });
    },
    onError: () => {
      toast({ title: "Error processing refund", variant: "destructive" });
    },
  });

  const filteredPayments = payments?.filter((payment) => {
    const matchesSearch = 
      payment.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "refunded":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount.toString()));
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-1">Monitor transactions, process refunds, and track revenue</p>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(paymentStats?.totalRevenue || 0)}
                  </p>
                  <p className={`text-sm mt-1 ${
                    (paymentStats?.monthlyGrowth || 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    {paymentStats?.monthlyGrowth || 0}% this month
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
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-3xl font-bold text-gray-900">{paymentStats?.totalTransactions || 0}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    {formatCurrency(paymentStats?.averageOrderValue || 0)} avg order
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{paymentStats?.successRate || 0}%</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {paymentStats?.pendingPayments || 0} pending
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Refunds</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(paymentStats?.refundedAmount || 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total refunded</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="refunds">Refund Management</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Transactions</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading transactions...</p>
                  </div>
                ) : filteredPayments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {payment.transactionId || payment.id.slice(0, 8)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.paymentMethod || "Card"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {payment.user.firstName} {payment.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{payment.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {payment.course?.title || "Course enrollment"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {formatCurrency(parseFloat(payment.amount.toString()))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(payment.status)}
                              <Badge className={getStatusColor(payment.status)}>
                                {payment.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(payment.createdAt || "").toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {payment.status === "completed" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => processRefundMutation.mutate(payment.id)}
                                  disabled={processRefundMutation.isPending}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-16">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "No transactions match your search criteria."
                        : "Payment transactions will appear here once students start enrolling."
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-gray-600">Revenue trend chart</p>
                      <p className="text-sm text-gray-500">Chart integration pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueByMonth && revenueByMonth.length > 0 ? (
                    <div className="space-y-4">
                      {revenueByMonth.slice(0, 6).map((month) => (
                        <div key={month.month} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{month.month}</div>
                            <div className="text-sm text-gray-500">{month.transactions} transactions</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(month.revenue)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No revenue data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="refunds" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Refund Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPayments.filter(p => p.status === "refunded").length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Refund Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments
                        .filter(p => p.status === "refunded")
                        .map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div className="font-medium text-gray-900">
                                {payment.transactionId || payment.id.slice(0, 8)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {payment.user.firstName} {payment.user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{payment.user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-gray-900">
                                {formatCurrency(parseFloat(payment.amount.toString()))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(payment.createdAt || "").toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-16">
                    <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No refunds processed</h3>
                    <p className="text-gray-600">Refunded transactions will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
