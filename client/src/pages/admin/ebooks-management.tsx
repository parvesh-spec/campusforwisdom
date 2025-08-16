import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Plus, Edit, Trash2, Download, Star, Calendar, FileText, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Ebook, Expert, InsertEbook } from "@shared/schema";

export default function EbooksManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [deletingEbook, setDeletingEbook] = useState<Ebook | null>(null);
  const [newEbook, setNewEbook] = useState<Partial<InsertEbook>>({
    title: "",
    description: "",
    shortDescription: "",
    authorId: "",
    category: "",
    tags: [],
    coverImage: "",
    fileUrl: "",
    fileSize: "",
    pageCount: 0,
    language: "English",
    price: "0",
    isActive: true,
    isFeatured: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ebooks
  const { data: ebooks = [], isLoading: ebooksLoading } = useQuery<Ebook[]>({
    queryKey: ["/api/admin/ebooks"],
  });

  // Fetch experts for author selection
  const { data: experts = [], isLoading: expertsLoading } = useQuery<Expert[]>({
    queryKey: ["/api/admin/experts"],
  });

  // Create ebook mutation
  const createEbookMutation = useMutation({
    mutationFn: async (ebookData: InsertEbook) => {
      return await apiRequest("/api/admin/ebooks", "POST", ebookData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "eBook created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ebooks"] });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create eBook",
        variant: "destructive",
      });
    },
  });

  // Update ebook mutation
  const updateEbookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertEbook> }) => {
      return await apiRequest(`/api/admin/ebooks/${id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "eBook updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ebooks"] });
      setEditingEbook(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update eBook",
        variant: "destructive",
      });
    },
  });

  // Delete ebook mutation
  const deleteEbookMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/ebooks/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "eBook deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ebooks"] });
      setDeletingEbook(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete eBook",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewEbook({
      title: "",
      description: "",
      shortDescription: "",
      authorId: "",
      category: "",
      tags: [],
      coverImage: "",
      fileUrl: "",
      fileSize: "",
      pageCount: 0,
      language: "English",
      price: "0",
      isActive: true,
      isFeatured: false,
    });
  };

  const handleSubmit = () => {
    if (editingEbook) {
      updateEbookMutation.mutate({ 
        id: editingEbook.id, 
        data: newEbook as Partial<InsertEbook> 
      });
    } else {
      createEbookMutation.mutate(newEbook as InsertEbook);
    }
  };

  const handleEdit = (ebook: Ebook) => {
    setEditingEbook(ebook);
    setNewEbook({
      title: ebook.title,
      description: ebook.description,
      shortDescription: ebook.shortDescription || "",
      authorId: ebook.authorId,
      category: ebook.category,
      tags: ebook.tags || [],
      coverImage: ebook.coverImage || "",
      fileUrl: ebook.fileUrl,
      fileSize: ebook.fileSize || "",
      pageCount: ebook.pageCount || 0,
      language: ebook.language || "English",
      price: ebook.price || "0",
      isActive: ebook.isActive,
      isFeatured: ebook.isFeatured || false,
    });
    setShowCreateModal(true);
  };

  const handleTagChange = (tagString: string) => {
    const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setNewEbook({ ...newEbook, tags });
  };

  if (ebooksLoading || expertsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">eBooks Management</h1>
          <p className="text-gray-600 mt-1">Manage and publish expert eBooks</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add eBook
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total eBooks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ebooks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ebooks.filter(e => e.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ebooks.filter(e => e.isFeatured).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ebooks.reduce((sum, e) => sum + (e.downloadCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* eBooks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {ebooks.map((ebook) => (
          <Card key={ebook.id} className="group relative">
            <CardHeader className="p-0">
              {ebook.coverImage ? (
                <div className="aspect-[3/4] bg-gray-100 rounded-t-lg overflow-hidden">
                  <img 
                    src={ebook.coverImage} 
                    alt={ebook.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-blue-400" />
                </div>
              )}
              
              {/* Status badges */}
              <div className="absolute top-2 left-2 space-y-1">
                {!ebook.isActive && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Draft
                  </Badge>
                )}
                {ebook.isFeatured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{ebook.title}</h3>
                  <Badge variant="outline" className="text-xs mt-1">
                    {ebook.category}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {ebook.shortDescription || ebook.description}
                </p>

                {/* Author */}
                {ebook.author && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={ebook.author.avatar} />
                      <AvatarFallback className="text-xs">
                        {ebook.author.firstName?.charAt(0)}{ebook.author.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-500">
                      {ebook.author.firstName} {ebook.author.lastName}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Download className="h-3 w-3 mr-1" />
                      {ebook.downloadCount || 0}
                    </div>
                    {ebook.pageCount && (
                      <div className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {ebook.pageCount}p
                      </div>
                    )}
                  </div>
                  <div>
                    {ebook.price === "0" ? "FREE" : `₹${ebook.price}`}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(ebook)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDeletingEbook(ebook)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEbook ? "Edit eBook" : "Create New eBook"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the eBook
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newEbook.title}
                onChange={(e) => setNewEbook({ ...newEbook, title: e.target.value })}
                placeholder="Enter eBook title"
              />
            </div>

            {/* Author */}
            <div className="grid gap-2">
              <Label htmlFor="author">Author (Expert)</Label>
              <Select 
                value={newEbook.authorId} 
                onValueChange={(value) => setNewEbook({ ...newEbook, authorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an expert" />
                </SelectTrigger>
                <SelectContent>
                  {experts.map((expert) => (
                    <SelectItem key={expert.id} value={expert.id}>
                      {expert.firstName} {expert.lastName} - {expert.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category and Language */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newEbook.category}
                  onChange={(e) => setNewEbook({ ...newEbook, category: e.target.value })}
                  placeholder="e.g., AI Development"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={newEbook.language} 
                  onValueChange={(value) => setNewEbook({ ...newEbook, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Short Description */}
            <div className="grid gap-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={newEbook.shortDescription}
                onChange={(e) => setNewEbook({ ...newEbook, shortDescription: e.target.value })}
                placeholder="Brief description for cards"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={newEbook.description}
                onChange={(e) => setNewEbook({ ...newEbook, description: e.target.value })}
                placeholder="Detailed description"
                rows={4}
              />
            </div>

            {/* File URL and Cover Image */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fileUrl">File URL</Label>
                <Input
                  id="fileUrl"
                  value={newEbook.fileUrl}
                  onChange={(e) => setNewEbook({ ...newEbook, fileUrl: e.target.value })}
                  placeholder="PDF download link"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  value={newEbook.coverImage}
                  onChange={(e) => setNewEbook({ ...newEbook, coverImage: e.target.value })}
                  placeholder="Cover image URL"
                />
              </div>
            </div>

            {/* Page Count, File Size, Price */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pageCount">Page Count</Label>
                <Input
                  id="pageCount"
                  type="number"
                  value={newEbook.pageCount}
                  onChange={(e) => setNewEbook({ ...newEbook, pageCount: parseInt(e.target.value) || 0 })}
                  placeholder="Number of pages"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fileSize">File Size</Label>
                <Input
                  id="fileSize"
                  value={newEbook.fileSize}
                  onChange={(e) => setNewEbook({ ...newEbook, fileSize: e.target.value })}
                  placeholder="e.g., 5MB"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  value={newEbook.price}
                  onChange={(e) => setNewEbook({ ...newEbook, price: e.target.value })}
                  placeholder="0 for free"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={newEbook.tags?.join(', ') || ''}
                onChange={(e) => handleTagChange(e.target.value)}
                placeholder="AI, Development, Programming"
              />
            </div>

            {/* Status toggles */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newEbook.isActive}
                  onCheckedChange={(checked) => setNewEbook({ ...newEbook, isActive: checked })}
                />
                <Label htmlFor="isActive">Published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={newEbook.isFeatured}
                  onCheckedChange={(checked) => setNewEbook({ ...newEbook, isFeatured: checked })}
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!newEbook.title || !newEbook.authorId || !newEbook.fileUrl || createEbookMutation.isPending || updateEbookMutation.isPending}
            >
              {createEbookMutation.isPending || updateEbookMutation.isPending ? "Saving..." : editingEbook ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingEbook} onOpenChange={() => setDeletingEbook(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete eBook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingEbook?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingEbook && deleteEbookMutation.mutate(deletingEbook.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}