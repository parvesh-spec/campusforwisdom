import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings as SettingsIcon, 
  Globe, 
  Mail, 
  Shield, 
  Palette, 
  Database,
  Bell,
  CreditCard,
  Users,
  Save,
  Upload,
  Eye,
  EyeOff
} from "lucide-react";

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  supportEmail: string;
  defaultLanguage: string;
  timezone: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maintenanceMode: boolean;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableEmailNotifications: boolean;
}

interface PaymentSettings {
  currency: string;
  paymentProvider: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  enablePayments: boolean;
  taxRate: string;
}

interface SecuritySettings {
  sessionTimeout: string;
  maxLoginAttempts: string;
  passwordMinLength: string;
  requireStrongPasswords: boolean;
  enableTwoFactor: boolean;
  allowedFileTypes: string;
  maxFileSize: string;
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPasswords, setShowPasswords] = useState(false);

  const { data: platformSettings } = useQuery<PlatformSettings>({
    queryKey: ["/api/admin/settings/platform"],
  });

  const { data: emailSettings } = useQuery<EmailSettings>({
    queryKey: ["/api/admin/settings/email"],
  });

  const { data: paymentSettings } = useQuery<PaymentSettings>({
    queryKey: ["/api/admin/settings/payment"],
  });

  const { data: securitySettings } = useQuery<SecuritySettings>({
    queryKey: ["/api/admin/settings/security"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ category, data }: { category: string; data: any }) => 
      apiRequest("PUT", `/api/admin/settings/${category}`, data),
    onSuccess: () => {
      toast({ title: "Settings updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: () => {
      toast({ title: "Error updating settings", variant: "destructive" });
    },
  });

  const [platformForm, setPlatformForm] = useState<PlatformSettings>({
    siteName: "",
    siteDescription: "",
    siteUrl: "",
    logoUrl: "",
    faviconUrl: "",
    supportEmail: "",
    defaultLanguage: "en",
    timezone: "Asia/Kolkata",
    allowRegistration: true,
    requireEmailVerification: true,
    maintenanceMode: false,
  });

  const [emailForm, setEmailForm] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
    enableEmailNotifications: true,
  });

  const [paymentForm, setPaymentForm] = useState<PaymentSettings>({
    currency: "INR",
    paymentProvider: "razorpay",
    stripePublicKey: "",
    stripeSecretKey: "",
    razorpayKeyId: "",
    razorpayKeySecret: "",
    enablePayments: true,
    taxRate: "18",
  });

  const [securityForm, setSecurityForm] = useState<SecuritySettings>({
    sessionTimeout: "24",
    maxLoginAttempts: "5",
    passwordMinLength: "8",
    requireStrongPasswords: true,
    enableTwoFactor: false,
    allowedFileTypes: "jpg,jpeg,png,pdf,docx,mp4",
    maxFileSize: "10",
  });

  // Initialize forms when data loads
  React.useEffect(() => {
    if (platformSettings) setPlatformForm(platformSettings);
    if (emailSettings) setEmailForm(emailSettings);
    if (paymentSettings) setPaymentForm(paymentSettings);
    if (securitySettings) setSecurityForm(securitySettings);
  }, [platformSettings, emailSettings, paymentSettings, securitySettings]);

  const handleSavePlatform = () => {
    updateSettingsMutation.mutate({ category: "platform", data: platformForm });
  };

  const handleSaveEmail = () => {
    updateSettingsMutation.mutate({ category: "email", data: emailForm });
  };

  const handleSavePayment = () => {
    updateSettingsMutation.mutate({ category: "payment", data: paymentForm });
  };

  const handleSaveSecurity = () => {
    updateSettingsMutation.mutate({ category: "security", data: securityForm });
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
            <p className="text-gray-600 mt-1">Configure your coaching institute platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Backup Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="platform" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="platform" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Platform</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Payment</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={platformForm.siteName}
                      onChange={(e) => setPlatformForm({ ...platformForm, siteName: e.target.value })}
                      placeholder="CampusForWisdom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={platformForm.siteDescription}
                      onChange={(e) => setPlatformForm({ ...platformForm, siteDescription: e.target.value })}
                      placeholder="AI coaching institute empowering the next generation..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      value={platformForm.siteUrl}
                      onChange={(e) => setPlatformForm({ ...platformForm, siteUrl: e.target.value })}
                      placeholder="https://campusforwisdom.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={platformForm.supportEmail}
                      onChange={(e) => setPlatformForm({ ...platformForm, supportEmail: e.target.value })}
                      placeholder="support@campusforwisdom.com"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Localization & Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <Select
                      value={platformForm.defaultLanguage}
                      onValueChange={(value) => setPlatformForm({ ...platformForm, defaultLanguage: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={platformForm.timezone}
                      onValueChange={(value) => setPlatformForm({ ...platformForm, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowRegistration">Allow User Registration</Label>
                      <p className="text-sm text-gray-500">Enable public user registration</p>
                    </div>
                    <Switch
                      id="allowRegistration"
                      checked={platformForm.allowRegistration}
                      onCheckedChange={(checked) => setPlatformForm({ ...platformForm, allowRegistration: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireEmailVerification">Email Verification</Label>
                      <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                    </div>
                    <Switch
                      id="requireEmailVerification"
                      checked={platformForm.requireEmailVerification}
                      onCheckedChange={(checked) => setPlatformForm({ ...platformForm, requireEmailVerification: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">Temporarily disable public access</p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={platformForm.maintenanceMode}
                      onCheckedChange={(checked) => setPlatformForm({ ...platformForm, maintenanceMode: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSavePlatform}
                disabled={updateSettingsMutation.isPending}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Platform Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">SMTP Settings</h3>
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={emailForm.smtpHost}
                        onChange={(e) => setEmailForm({ ...emailForm, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        value={emailForm.smtpPort}
                        onChange={(e) => setEmailForm({ ...emailForm, smtpPort: e.target.value })}
                        placeholder="587"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input
                        id="smtpUsername"
                        value={emailForm.smtpUsername}
                        onChange={(e) => setEmailForm({ ...emailForm, smtpUsername: e.target.value })}
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <div className="relative">
                        <Input
                          id="smtpPassword"
                          type={showPasswords ? "text" : "password"}
                          value={emailForm.smtpPassword}
                          onChange={(e) => setEmailForm({ ...emailForm, smtpPassword: e.target.value })}
                          placeholder="Your app password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Defaults</h3>
                    <div>
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={emailForm.fromEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })}
                        placeholder="noreply@campusforwisdom.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={emailForm.fromName}
                        onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })}
                        placeholder="CampusForWisdom"
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Send automated emails to users</p>
                      </div>
                      <Switch
                        id="enableEmailNotifications"
                        checked={emailForm.enableEmailNotifications}
                        onCheckedChange={(checked) => setEmailForm({ ...emailForm, enableEmailNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleSaveEmail}
                    disabled={updateSettingsMutation.isPending}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Email Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">General Settings</h3>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={paymentForm.currency}
                        onValueChange={(value) => setPaymentForm({ ...paymentForm, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                          <SelectItem value="USD">US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="paymentProvider">Payment Provider</Label>
                      <Select
                        value={paymentForm.paymentProvider}
                        onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentProvider: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="razorpay">Razorpay</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        value={paymentForm.taxRate}
                        onChange={(e) => setPaymentForm({ ...paymentForm, taxRate: e.target.value })}
                        placeholder="18"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">API Keys</h3>
                    {paymentForm.paymentProvider === "razorpay" && (
                      <>
                        <div>
                          <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                          <Input
                            id="razorpayKeyId"
                            value={paymentForm.razorpayKeyId}
                            onChange={(e) => setPaymentForm({ ...paymentForm, razorpayKeyId: e.target.value })}
                            placeholder="rzp_test_..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                          <Input
                            id="razorpayKeySecret"
                            type={showPasswords ? "text" : "password"}
                            value={paymentForm.razorpayKeySecret}
                            onChange={(e) => setPaymentForm({ ...paymentForm, razorpayKeySecret: e.target.value })}
                            placeholder="Your secret key"
                          />
                        </div>
                      </>
                    )}
                    
                    {paymentForm.paymentProvider === "stripe" && (
                      <>
                        <div>
                          <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                          <Input
                            id="stripePublicKey"
                            value={paymentForm.stripePublicKey}
                            onChange={(e) => setPaymentForm({ ...paymentForm, stripePublicKey: e.target.value })}
                            placeholder="pk_test_..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                          <Input
                            id="stripeSecretKey"
                            type={showPasswords ? "text" : "password"}
                            value={paymentForm.stripeSecretKey}
                            onChange={(e) => setPaymentForm({ ...paymentForm, stripeSecretKey: e.target.value })}
                            placeholder="sk_test_..."
                          />
                        </div>
                      </>
                    )}
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enablePayments">Enable Payments</Label>
                        <p className="text-sm text-gray-500">Accept payments from students</p>
                      </div>
                      <Switch
                        id="enablePayments"
                        checked={paymentForm.enablePayments}
                        onCheckedChange={(checked) => setPaymentForm({ ...paymentForm, enablePayments: checked })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleSavePayment}
                    disabled={updateSettingsMutation.isPending}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Payment Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Authentication</h3>
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                      <Input
                        id="sessionTimeout"
                        value={securityForm.sessionTimeout}
                        onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeout: e.target.value })}
                        placeholder="24"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        value={securityForm.maxLoginAttempts}
                        onChange={(e) => setSecurityForm({ ...securityForm, maxLoginAttempts: e.target.value })}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="passwordMinLength">Password Minimum Length</Label>
                      <Input
                        id="passwordMinLength"
                        value={securityForm.passwordMinLength}
                        onChange={(e) => setSecurityForm({ ...securityForm, passwordMinLength: e.target.value })}
                        placeholder="8"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requireStrongPasswords">Strong Passwords</Label>
                        <p className="text-sm text-gray-500">Require uppercase, numbers, symbols</p>
                      </div>
                      <Switch
                        id="requireStrongPasswords"
                        checked={securityForm.requireStrongPasswords}
                        onCheckedChange={(checked) => setSecurityForm({ ...securityForm, requireStrongPasswords: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enableTwoFactor">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">Enable 2FA for admin accounts</p>
                      </div>
                      <Switch
                        id="enableTwoFactor"
                        checked={securityForm.enableTwoFactor}
                        onCheckedChange={(checked) => setSecurityForm({ ...securityForm, enableTwoFactor: checked })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">File Upload Security</h3>
                    <div>
                      <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                      <Input
                        id="allowedFileTypes"
                        value={securityForm.allowedFileTypes}
                        onChange={(e) => setSecurityForm({ ...securityForm, allowedFileTypes: e.target.value })}
                        placeholder="jpg,jpeg,png,pdf,docx,mp4"
                      />
                      <p className="text-sm text-gray-500 mt-1">Comma-separated file extensions</p>
                    </div>
                    <div>
                      <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                      <Input
                        id="maxFileSize"
                        value={securityForm.maxFileSize}
                        onChange={(e) => setSecurityForm({ ...securityForm, maxFileSize: e.target.value })}
                        placeholder="10"
                      />
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">Security Recommendations</h4>
                          <div className="mt-1 text-sm text-yellow-700">
                            <ul className="list-disc list-inside space-y-1">
                              <li>Enable 2FA for all admin accounts</li>
                              <li>Use strong, unique passwords</li>
                              <li>Regularly update API keys</li>
                              <li>Monitor login attempts</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleSaveSecurity}
                    disabled={updateSettingsMutation.isPending}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
