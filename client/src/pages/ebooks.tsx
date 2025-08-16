import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Download, Star, Search, Filter, FileText, User as UserIcon, Eye, LogIn } from "lucide-react";
import StudentLoginModal from "@/components/StudentLoginModal";
import type { Ebook, User } from "@shared/schema";

export default function EbooksPage() {
  const [viewMode, setViewMode] = useState<"all" | "my">("all");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  // Fetch all ebooks
  const { data: ebooks = [], isLoading } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
  });

  // Check if user is logged in as student
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/student"],
  });

  // Fetch user's downloaded ebooks if logged in
  const { data: userEbooks } = useQuery<Ebook[]>({
    queryKey: ["/api/student/ebooks"],
    enabled: !!user,
  });

  const isLoggedIn = !!user;

  // Filter ebooks based on view mode
  const viewFilteredEbooks = ebooks.filter(ebook => {
    if (viewMode === "my") {
      if (!isLoggedIn) {
        return false; // Hide all ebooks if not logged in
      }
      if (!userEbooks) {
        return false; // Hide all ebooks while loading user data
      }
      // Show only ebooks user has downloaded - userEbooks contains full ebook objects
      const userEbookIds = userEbooks.map(userEbook => userEbook.id);
      return userEbookIds.includes(ebook.id);
    }
    return true; // Show all ebooks for "all" mode
  });

  // Filter ebooks based on search and filters
  const filteredEbooks = viewFilteredEbooks.filter((ebook) => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || ebook.category === selectedCategory;
    const matchesLanguage = selectedLanguage === "all" || ebook.language === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const handleMyEbooksClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      setViewMode("my");
    }
  };

  // Get unique categories and languages for filters
  const categories = Array.from(new Set(ebooks.map(ebook => ebook.category)));
  const languages = Array.from(new Set(ebooks.map(ebook => ebook.language).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading eBooks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Learning eBooks
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover comprehensive eBooks written by AI experts covering software development, 
            video creation, presentation design, and more.
          </p>
        </div>

        {/* View Mode Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md flex">
            <Button
              onClick={() => setViewMode("all")}
              variant={viewMode === "all" ? "default" : "ghost"}
              className="px-6 py-2 mr-1"
            >
              All eBooks
            </Button>
            <Button
              onClick={handleMyEbooksClick}
              variant={viewMode === "my" ? "default" : "ghost"}
              className="px-6 py-2 flex items-center space-x-2"
            >
              {!isLoggedIn && <LogIn className="h-4 w-4" />}
              <span>My eBooks</span>
            </Button>
          </div>
        </div>

        {/* Login prompt for My eBooks when not logged in */}
        {viewMode === "my" && !isLoggedIn && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6">
              Please login to view your downloaded eBooks and track your reading progress.
            </p>
            <Button onClick={() => setShowLoginModal(true)} className="flex items-center space-x-2">
              <LogIn className="h-4 w-4" />
              <span>Login to View My eBooks</span>
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search eBooks, authors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language || ""}>
                      {language || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLanguage("all");
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {viewMode === "my" && isLoggedIn ? (
              filteredEbooks.length === 1 ? "1 eBook in your library" : `${filteredEbooks.length} eBooks in your library`
            ) : (
              filteredEbooks.length === 1 ? "1 eBook found" : `${filteredEbooks.length} eBooks found`
            )}
          </p>
        </div>

        {/* eBooks Grid */}
        {filteredEbooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEbooks.map((ebook) => (
              <Link key={ebook.id} href={`/ebooks/${ebook.id}`}>
                <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardHeader className="p-0">
                    {ebook.coverImage ? (
                      <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg overflow-hidden">
                        <img 
                          src={ebook.coverImage} 
                          alt={ebook.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-blue-400" />
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Title and Category */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                          {ebook.title}
                        </h3>
                        <Badge variant="secondary" className="mb-2">
                          {ebook.category}
                        </Badge>
                      </div>

                      {/* Description */}
                      <CardDescription className="line-clamp-3">
                        {ebook.shortDescription}
                      </CardDescription>

                      {/* Author Info */}
                      {ebook.author && (
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={ebook.author.avatar || undefined} />
                            <AvatarFallback>
                              {ebook.author.name?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {ebook.author.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {ebook.author.specialization}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          {ebook.rating && Number(ebook.rating) > 0 && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span>{Number(ebook.rating).toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Download className="h-4 w-4 mr-1" />
                            <span>{ebook.downloadCount || 0}</span>
                          </div>
                          {ebook.pageCount && (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              <span>{ebook.pageCount} pages</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs">
                          {ebook.language}
                        </div>
                      </div>

                      {/* Price and View Button */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          {ebook.price === "0" || !ebook.price ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              FREE
                            </Badge>
                          ) : (
                            <span className="text-lg font-semibold text-primary">
                              ₹{ebook.price}
                            </span>
                          )}
                        </div>
                        
                        <Button className="bg-primary hover:bg-primary/90" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No eBooks Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new eBooks.
            </p>
          </div>
        )}

        {/* Student Login Modal */}
        <StudentLoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </div>
    </div>
  );
}