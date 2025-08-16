import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Download, Star, Search, Filter, FileText, User, Calendar, X } from "lucide-react";
import type { Ebook } from "@shared/schema";

export default function EbooksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);

  // Fetch all ebooks
  const { data: ebooks = [], isLoading } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
  });

  // Filter ebooks based on search and filters
  const filteredEbooks = ebooks.filter((ebook) => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.author?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.author?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || ebook.category === selectedCategory;
    const matchesLanguage = selectedLanguage === "all" || ebook.language === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  // Get unique categories and languages for filters
  const categories = [...new Set(ebooks.map(ebook => ebook.category))];
  const languages = [...new Set(ebooks.map(ebook => ebook.language))];

  const handleDownload = (ebook: Ebook) => {
    if (ebook.fileUrl) {
      window.open(ebook.fileUrl, '_blank');
    }
  };

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

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search eBooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
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

            {/* Language Filter */}
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredEbooks.length} eBook{filteredEbooks.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* eBooks Grid */}
        {filteredEbooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEbooks.map((ebook) => (
              <Card 
                key={ebook.id} 
                className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedEbook(ebook)}
              >
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
                          <AvatarImage src={ebook.author.avatar} />
                          <AvatarFallback>
                            {ebook.author.firstName?.charAt(0)}{ebook.author.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {ebook.author.firstName} {ebook.author.lastName}
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

                    {/* Price and Download */}
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
                      
                      <Button 
                        onClick={() => handleDownload(ebook)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

        {/* Detailed eBook Modal */}
        {selectedEbook && (
          <Dialog open={!!selectedEbook} onOpenChange={() => setSelectedEbook(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedEbook.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">{selectedEbook.category}</Badge>
                      <Badge variant="outline">{selectedEbook.language}</Badge>
                      {selectedEbook.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEbook(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Cover and Info */}
                <div className="space-y-6">
                  {/* Cover Image */}
                  {selectedEbook.coverImage ? (
                    <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden">
                      <img 
                        src={selectedEbook.coverImage} 
                        alt={selectedEbook.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-24 w-24 text-blue-400" />
                    </div>
                  )}

                  {/* Author Info */}
                  {selectedEbook.author && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedEbook.author.avatar} />
                          <AvatarFallback>
                            {selectedEbook.author.firstName?.charAt(0)}{selectedEbook.author.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedEbook.author.firstName} {selectedEbook.author.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedEbook.author.specialization}
                          </p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm text-gray-600">
                              {selectedEbook.author.rating || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* eBook Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">Pages</p>
                      <p className="font-semibold">{selectedEbook.pageCount || 0}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Download className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">Downloads</p>
                      <p className="font-semibold">{selectedEbook.downloadCount || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Short Description */}
                  {selectedEbook.shortDescription && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Overview</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedEbook.shortDescription}
                      </p>
                    </div>
                  )}

                  {/* Index/Table of Contents */}
                  {selectedEbook.indexContent && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Table of Contents</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                          {selectedEbook.indexContent}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {selectedEbook.summary && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedEbook.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedEbook.tags && selectedEbook.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEbook.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span>{selectedEbook.rating || 0}/5</span>
                  </div>
                  <div>
                    Price: <span className="font-semibold">${selectedEbook.price || 0}</span>
                  </div>
                  {selectedEbook.publishedAt && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(selectedEbook.publishedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(selectedEbook);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download eBook
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}