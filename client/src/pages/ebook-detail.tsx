import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Download, Star, Calendar, FileText, User, ArrowLeft, Eye, LogIn } from "lucide-react";
import { Link } from "wouter";
import StudentLoginModal from "@/components/StudentLoginModal";
import type { Ebook, User as UserType } from "@shared/schema";

export default function EbookDetail() {
  const { id } = useParams<{ id: string }>();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Check if user is logged in as student
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/student"],
  });

  const isLoggedIn = !!user;
  
  // Fetch specific ebook
  const { data: ebook, isLoading, error } = useQuery<Ebook>({
    queryKey: ["/api/ebooks", id],
    queryFn: async () => {
      const response = await fetch(`/api/ebooks/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("eBook not found");
        }
        throw new Error("Failed to fetch eBook");
      }
      return response.json();
    },
    enabled: !!id,
  });

  const handleDownload = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    if (ebook?.fileUrl) {
      window.open(ebook.fileUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading eBook...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">eBook Not Found</h1>
            <p className="text-gray-600 mb-4">The eBook you're looking for doesn't exist or has been removed.</p>
            <Link href="/ebooks">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to eBooks
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/ebooks">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to eBooks
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* eBook Cover and Quick Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                {/* Cover Image */}
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-6 overflow-hidden">
                  {ebook.coverImage ? (
                    <img
                      src={ebook.coverImage}
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Pages</span>
                    <span className="font-medium">{ebook.pageCount || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Downloads</span>
                    <span className="font-medium">{ebook.downloadCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Language</span>
                    <span className="font-medium">{ebook.language}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Price</span>
                    <span className="font-bold text-lg text-primary">
                      {ebook.price === "0" ? "FREE" : `₹${ebook.price}`}
                    </span>
                  </div>
                </div>

                {/* Download Button */}
                <Button 
                  onClick={handleDownload}
                  className="w-full mt-6"
                  size="lg"
                  variant={isLoggedIn ? "default" : "outline"}
                >
                  {isLoggedIn ? (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download eBook
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Login to Download
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title and Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold mb-2">{ebook.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">{ebook.category}</Badge>
                      <Badge variant="outline">{ebook.language}</Badge>
                      {ebook.isFeatured && (
                        <Badge variant="default" className="bg-yellow-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Author Info */}
                {ebook.author && (
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={ebook.author.avatar || undefined} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{ebook.author.name}</p>
                      <p className="text-sm text-gray-500">{ebook.author.specialization}</p>
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {/* Short Description */}
                {ebook.shortDescription && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Overview</h3>
                    <p className="text-gray-600">{ebook.shortDescription}</p>
                  </div>
                )}

                {/* Tags */}
                {ebook.tags && ebook.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {ebook.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Table of Contents / Index */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Table of Contents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ebook.indexContent ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div 
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: ebook.indexContent }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Table of Contents not available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ebook.summary ? (
                  <div className="prose prose-gray max-w-none">
                    <div 
                      className="text-gray-700 leading-relaxed text-base"
                      dangerouslySetInnerHTML={{ __html: ebook.summary }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Summary not available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">File Size:</span>
                    <span className="ml-2 font-medium">{ebook.fileSize || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 font-medium">
                      {ebook.createdAt ? new Date(ebook.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rating:</span>
                    <div className="ml-2 inline-flex items-center">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span className="ml-1 font-medium">{ebook.rating || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Downloads:</span>
                    <span className="ml-2 font-medium">{ebook.downloadCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Student Login Modal */}
        <StudentLoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </div>
    </div>
  );
}