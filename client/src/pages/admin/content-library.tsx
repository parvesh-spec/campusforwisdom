import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  FolderPlus,
  Folder,
  Eye
} from "lucide-react";

interface ContentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  courseId?: string;
  tags: string[];
  uploadedAt: string;
  downloads: number;
}

interface ContentFolder {
  id: string;
  name: string;
  description?: string;
  fileCount: number;
  createdAt: string;
}

export default function ContentLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const { data: files, isLoading: filesLoading } = useQuery<ContentFile[]>({
    queryKey: ["/api/admin/content/files"],
  });

  const { data: folders, isLoading: foldersLoading } = useQuery<ContentFolder[]>({
    queryKey: ["/api/admin/content/folders"],
  });

  const { data: stats } = useQuery<{
    totalFiles: number;
    totalSize: number;
    totalDownloads: number;
    videoFiles: number;
    documentFiles: number;
    imageFiles: number;
  }>({
    queryKey: ["/api/admin/content/stats"],
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => 
      fetch("/api/admin/content/upload", {
        method: "POST",
        body: formData,
      }),
    onSuccess: () => {
      toast({ title: "Files uploaded successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/stats"] });
      setIsUploadModalOpen(false);
      setSelectedFiles(null);
    },
    onError: () => {
      toast({ title: "Error uploading files", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/content/files/${id}`),
    onSuccess: () => {
      toast({ title: "File deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/stats"] });
    },
    onError: () => {
      toast({ title: "Error deleting file", variant: "destructive" });
    },
  });

  const handleFileUpload = () => {
    if (!selectedFiles) return;

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append("files", file);
    });

    uploadMutation.mutate(formData);
  };

  const filteredFiles = files?.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || file.type.startsWith(typeFilter);
    return matchesSearch && matchesType;
  }) || [];

  const getFileIcon = (type: string) => {
    if (type.startsWith("video")) return <Video className="h-5 w-5 text-red-500" />;
    if (type.startsWith("image")) return <Image className="h-5 w-5 text-green-500" />;
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
            <p className="text-gray-600 mt-1">Manage course materials, resources, and media files</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Files</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Files
                    </label>
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      You can select multiple files. Supported formats: PDF, DOCX, MP4, PNG, JPG, etc.
                    </p>
                  </div>
                  {selectedFiles && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Selected Files:</h4>
                      <div className="space-y-1">
                        {Array.from(selectedFiles).map((file, index) => (
                          <div key={index} className="text-sm text-gray-600 flex items-center justify-between">
                            <span>{file.name}</span>
                            <span className="text-gray-400">{formatFileSize(file.size)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleFileUpload}
                      disabled={!selectedFiles || uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? "Uploading..." : "Upload Files"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalFiles || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Video className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Video Files</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.videoFiles || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalDownloads || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Folder className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalSize ? formatFileSize(stats.totalSize) : "0 MB"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="files" className="w-full">
          <TabsList>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Files</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="application">Documents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading files...</p>
                  </div>
                ) : filteredFiles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {getFileIcon(file.type)}
                              <div>
                                <div className="font-medium text-gray-900">{file.name}</div>
                                {file.tags.length > 0 && (
                                  <div className="flex space-x-1 mt-1">
                                    {file.tags.slice(0, 2).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{file.type.split("/")[0]}</Badge>
                          </TableCell>
                          <TableCell>{formatFileSize(file.size)}</TableCell>
                          <TableCell>{file.downloads}</TableCell>
                          <TableCell>
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteMutation.mutate(file.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-16">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || typeFilter !== "all"
                        ? "No files match your search criteria."
                        : "Upload your first file to get started."
                      }
                    </p>
                    {!searchTerm && typeFilter === "all" && (
                      <Button onClick={() => setIsUploadModalOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="folders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Folders</CardTitle>
              </CardHeader>
              <CardContent>
                {foldersLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading folders...</p>
                  </div>
                ) : folders && folders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {folders.map((folder) => (
                      <Card key={folder.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Folder className="h-8 w-8 text-blue-500" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{folder.name}</div>
                              <div className="text-sm text-gray-500">{folder.fileCount} files</div>
                            </div>
                          </div>
                          {folder.description && (
                            <p className="text-sm text-gray-600 mt-2 truncate">{folder.description}</p>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            Created {new Date(folder.createdAt).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
                    <p className="text-gray-600 mb-4">Create folders to organize your content.</p>
                    <Button>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Create Folder
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
