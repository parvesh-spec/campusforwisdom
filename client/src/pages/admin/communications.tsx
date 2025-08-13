import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Users, 
  Plus,
  Eye,
  Reply,
  Megaphone,
  Inbox,
  Clock
} from "lucide-react";
import type { User } from "@shared/schema";

interface Message {
  id: string;
  subject: string;
  content: string;
  sender: User;
  recipients: User[];
  sentAt: string;
  status: "sent" | "delivered" | "read";
  type: "email" | "announcement" | "notification";
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: "active" | "closed";
}

export default function Communications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageData, setMessageData] = useState({
    subject: "",
    content: "",
    type: "email" as "email" | "announcement" | "notification",
    recipientType: "all" as "all" | "students" | "instructors" | "specific",
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/admin/communications/messages"],
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/admin/communications/conversations"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/communications/send", data),
    onSuccess: () => {
      toast({ title: "Message sent successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/communications"] });
      setIsComposeModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error sending message", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setMessageData({
      subject: "",
      content: "",
      type: "email",
      recipientType: "all",
    });
    setSelectedRecipients([]);
  };

  const handleSendMessage = () => {
    const recipients = messageData.recipientType === "specific" 
      ? selectedRecipients 
      : users?.filter(user => 
          messageData.recipientType === "all" || user.role === messageData.recipientType
        )?.map(u => u.id) || [];

    sendMessageMutation.mutate({
      ...messageData,
      recipients,
    });
  };

  const handleRecipientToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipients(prev => [...prev, userId]);
    } else {
      setSelectedRecipients(prev => prev.filter(id => id !== userId));
    }
  };

  const sentMessages = messages?.filter(m => m.type !== "notification") || [];
  const announcements = messages?.filter(m => m.type === "announcement") || [];
  const notifications = messages?.filter(m => m.type === "notification") || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "read": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
            <p className="text-gray-600 mt-1">Send messages, announcements, and manage conversations</p>
          </div>
          <Dialog open={isComposeModalOpen} onOpenChange={setIsComposeModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Type
                    </label>
                    <Select
                      value={messageData.type}
                      onValueChange={(value: any) => setMessageData({ ...messageData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients
                    </label>
                    <Select
                      value={messageData.recipientType}
                      onValueChange={(value: any) => setMessageData({ ...messageData, recipientType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="instructors">Instructors Only</SelectItem>
                        <SelectItem value="specific">Specific Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {messageData.recipientType === "specific" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Users
                    </label>
                    <div className="max-h-40 overflow-y-auto border rounded-lg p-3">
                      {users?.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            checked={selectedRecipients.includes(user.id)}
                            onCheckedChange={(checked) => handleRecipientToggle(user.id, !!checked)}
                          />
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input
                    value={messageData.subject}
                    onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                    placeholder="Message subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content
                  </label>
                  <Textarea
                    value={messageData.content}
                    onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                    placeholder="Type your message here..."
                    rows={6}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsComposeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending || !messageData.subject || !messageData.content}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{sentMessages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Megaphone className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Announcements</p>
                  <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">{conversations?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                  <p className="text-2xl font-bold text-gray-900">{users?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                ) : sentMessages.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sentMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell>
                            <div className="font-medium text-gray-900">{message.subject}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {message.content}
                            </div>
                          </TableCell>
                          <TableCell>{message.recipients.length} recipients</TableCell>
                          <TableCell>
                            <Badge variant="outline">{message.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(message.status)}>
                              {message.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(message.sentAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-16">
                    <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages sent</h3>
                    <p className="text-gray-600 mb-4">Start communicating with your students and instructors.</p>
                    <Button onClick={() => setIsComposeModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Send First Message
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                {conversationsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading conversations...</p>
                  </div>
                ) : conversations && conversations.length > 0 ? (
                  <div className="space-y-4">
                    {conversations.map((conversation) => (
                      <div key={conversation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex -space-x-2">
                                {conversation.participants.slice(0, 3).map((participant) => (
                                  <div
                                    key={participant.id}
                                    className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white"
                                  >
                                    {participant.firstName?.[0] || participant.username[0].toUpperCase()}
                                  </div>
                                ))}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {conversation.participants.map(p => p.firstName || p.username).join(", ")}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {conversation.participants.length} participants
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{conversation.lastMessage}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {new Date(conversation.lastMessageAt).toLocaleString()}
                            </div>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white mt-1">
                                {conversation.unreadCount} new
                              </Badge>
                            )}
                            <div className="flex space-x-2 mt-2">
                              <Button size="sm" variant="ghost">
                                <Reply className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
                    <p className="text-gray-600">Conversations with students and instructors will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Announcements</CardTitle>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setMessageData({ ...messageData, type: "announcement" });
                      setIsComposeModalOpen(true);
                    }}
                  >
                    <Megaphone className="h-4 w-4 mr-2" />
                    New Announcement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border-l-4 border-primary bg-blue-50 p-4 rounded-r-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{announcement.subject}</h3>
                            <p className="text-gray-700 mb-3">{announcement.content}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(announcement.sentAt).toLocaleString()}
                              <span className="mx-2">•</span>
                              <Users className="h-4 w-4 mr-1" />
                              {announcement.recipients.length} recipients
                            </div>
                          </div>
                          <Badge className={getStatusColor(announcement.status)}>
                            {announcement.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements</h3>
                    <p className="text-gray-600 mb-4">Share important updates with your community.</p>
                    <Button 
                      onClick={() => {
                        setMessageData({ ...messageData, type: "announcement" });
                        setIsComposeModalOpen(true);
                      }}
                    >
                      <Megaphone className="h-4 w-4 mr-2" />
                      Create Announcement
                    </Button>
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
