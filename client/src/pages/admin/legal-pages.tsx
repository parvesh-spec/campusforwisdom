import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type LegalPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
  createdAt: string;
};

export default function AdminLegalPages() {
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [editingContent, setEditingContent] = useState<{ title: string; content: string }>({
    title: "",
    content: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: legalPages, isLoading } = useQuery<LegalPage[]>({
    queryKey: ['/api/admin/legal-pages']
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const response = await fetch(`/api/admin/legal-pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/legal-pages'] });
      toast({
        title: "Success",
        description: "Legal page updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update legal page",
        variant: "destructive",
      });
    },
  });

  const handlePageSelect = (page: LegalPage) => {
    setSelectedPage(page.id);
    setEditingContent({
      title: page.title,
      content: page.content
    });
  };

  const handleSave = () => {
    if (!selectedPage || !editingContent.title.trim() || !editingContent.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      id: selectedPage,
      title: editingContent.title,
      content: editingContent.content
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Legal Pages Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage legal documents and policies</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentPage = legalPages?.find(page => page.id === selectedPage);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Legal Pages Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage legal documents and policies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pages List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legal Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {legalPages?.map((page) => (
                <Button
                  key={page.id}
                  variant={selectedPage === page.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handlePageSelect(page)}
                >
                  <div className="text-left">
                    <div className="font-medium">{page.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      /{page.slug}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {currentPage ? `Edit: ${currentPage.title}` : "Select a page to edit"}
              </span>
              {currentPage && (
                <Button 
                  onClick={handleSave} 
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPage ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={editingContent.title}
                    onChange={(e) => setEditingContent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter page title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={editingContent.content}
                    onChange={(e) => setEditingContent(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter page content"
                    className="mt-1 min-h-[400px] font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use double line breaks for paragraphs. Lines ending with ':' will be formatted as headings.
                  </p>
                </div>

                {currentPage.lastUpdated && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <CheckCircle className="h-4 w-4" />
                    Last updated: {new Date(currentPage.lastUpdated).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Select a legal page from the left sidebar to begin editing.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Tab */}
      {currentPage && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h1>{editingContent.title}</h1>
              {editingContent.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.endsWith(':')) {
                  return (
                    <h3 key={index} className="text-lg font-semibold mt-6 mb-3">
                      {paragraph}
                    </h3>
                  );
                }
                return (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}