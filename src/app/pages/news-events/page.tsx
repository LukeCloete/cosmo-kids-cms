"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
import Image from "next/image";

import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  category: string;
  date: string;
  author: string;
}

const categories = ["All", "News", "Events"];

export default function NewsEventsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [storageImages, setStorageImages] = useState<
    { name: string; url: string }[]
  >([]);

  const fetchArticles = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "news-events"));
    const articlesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Article[];
    setArticles(articlesData);
    setLoading(false);
  };

  useEffect(() => {
    const fetchStorageImages = async () => {
      const listRef = ref(storage);
      const res = await listAll(listRef);
      const images = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        })
      );
      setStorageImages(images);
    };

    fetchArticles();
    fetchStorageImages();
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.description &&
        article.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteArticle = async (id: string) => {
    await deleteDoc(doc(db, "news-events", id));
    fetchArticles();
  };

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setIsEditOpen(true);
  };

  const handleDeleteAllArticles = async () => {
    const querySnapshot = await getDocs(collection(db, "news-events"));
    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    fetchArticles();
  };

  const handlePopulateDatabase = async () => {
    const fakeArticles: Omit<Article, "id">[] = [
      {
        title: "Story Night 2021",
        description:
          "Join us for an evening of storytelling, fun activities, and community bonding.",
        content:
          '{"blocks":[{"key":"bu2d","text":"This is the full content for Story Night 2021.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        date: "2021-03-15",
        imageUrl: "/news1.jpg",
        category: "Events",
        author: "Jane Doe",
      },
      {
        title: "Cosmo Holiday Fun",
        description:
          "Fun and educational activities to keep your children engaged throughout the changing seasons.",
        content:
          '{"blocks":[{"key":"bu2d","text":"This is the full content for Cosmo Holiday Fun.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        date: "2021-02-17",
        imageUrl: "/news2.jpg",
        category: "News",
        author: "John Smith",
      },
      {
        title: "Sleepover Coming Soon!",
        description:
          "Get ready for a night of fun, games, and learning with our upcoming sleepover event.",
        content:
          '{"blocks":[{"key":"bu2d","text":"This is the full content for the Sleepover.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        date: "2021-01-05",
        imageUrl: "/news3.jpg",
        category: "Events",
        author: "Peter Pan",
      },
    ];

    for (const article of fakeArticles) {
      await addDoc(collection(db, "news-events"), article);
    }
    fetchArticles();
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink>Pages</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>News & Events</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  News & Events Management
                </h1>
                <p className="text-muted-foreground">
                  Manage articles for your news and events page
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handlePopulateDatabase}>
                  Populate Database
                </Button>
                <Button variant="destructive" onClick={handleDeleteAllArticles}>
                  Delete All Articles
                </Button>
                <Link href="/pages/editor">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Article
                  </Button>
                </Link>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search articles by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Articles Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg border"
                  >
                    <Skeleton className="aspect-video w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden">
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={article.imageUrl || "/placeholder.svg"}
                        alt={article.title}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
                        width={1920}
                        height={1080}
                      />
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedArticle(article);
                                setIsViewDetailsOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditArticle(article)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteArticle(article.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">
                            {article.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          By {article.author}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {article.description}
                        </p>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{article.date}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center text-muted-foreground">
                  No articles found. Click &apos;Add Article&apos; to create
                  one.
                </div>
              )}
            </div>

            {/* Article Details Dialog */}
            <Dialog
              open={isViewDetailsOpen}
              onOpenChange={setIsViewDetailsOpen}
            >
              <DialogContent className="sm:max-w-[700px]">
                {selectedArticle && (
                  <>
                    <DialogHeader>
                      <DialogTitle>{selectedArticle.title}</DialogTitle>
                      <DialogDescription>Article details</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="aspect-video overflow-hidden rounded-lg">
                        <Image
                          src={selectedArticle.imageUrl || "/placeholder.svg"}
                          alt={selectedArticle.title}
                          width={1920}
                          height={1080}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Description
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedArticle.description}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Content</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedArticle.content &&
                            typeof selectedArticle.content === "string" &&
                            selectedArticle.content.startsWith("{")
                              ? JSON.parse(selectedArticle.content)
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  .blocks.map((block: any) => block.text)
                                  .join("\n")
                              : selectedArticle.content}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Author</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedArticle.author}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Category
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedArticle.category}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-sm font-medium">Date</Label>
                            <p className="text-muted-foreground">
                              {selectedArticle.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Article Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="sm:max-w-[600px]">
                {selectedArticle && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Edit Article</DialogTitle>
                      <DialogDescription>
                        Update article information
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-image">Image</Label>
                        <Select
                          onValueChange={(url) =>
                            setSelectedArticle({
                              ...selectedArticle,
                              imageUrl: url,
                            })
                          }
                          defaultValue={selectedArticle.imageUrl}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {storageImages.map((image) => (
                              <SelectItem key={image.url} value={image.url}>
                                {image.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          value={selectedArticle.title}
                          onChange={(e) =>
                            setSelectedArticle({
                              ...selectedArticle,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={selectedArticle.description}
                          onChange={(e) =>
                            setSelectedArticle({
                              ...selectedArticle,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-author">Author</Label>
                        <Input
                          id="edit-author"
                          value={selectedArticle.author}
                          onChange={(e) =>
                            setSelectedArticle({
                              ...selectedArticle,
                              author: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-category">Category</Label>
                          <Select
                            onValueChange={(value) =>
                              setSelectedArticle({
                                ...selectedArticle,
                                category: value,
                              })
                            }
                            defaultValue={selectedArticle.category}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="News">News</SelectItem>
                              <SelectItem value="Events">Events</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-date">Date</Label>
                          <Input
                            id="edit-date"
                            type="date"
                            value={selectedArticle.date}
                            onChange={(e) =>
                              setSelectedArticle({
                                ...selectedArticle,
                                date: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="justify-between">
                      <Link
                        href={`/pages/editor/${selectedArticle.id}`}
                        passHref
                      >
                        <Button variant="outline">Edit Full Content</Button>
                      </Link>
                      <div>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={async () => {
                            if (selectedArticle) {
                              const articleRef = doc(
                                db,
                                "news-events",
                                selectedArticle.id
                              );
                              await updateDoc(articleRef, {
                                title: selectedArticle.title,
                                description: selectedArticle.description,
                                author: selectedArticle.author,
                                category: selectedArticle.category,
                                date: selectedArticle.date,
                                imageUrl: selectedArticle.imageUrl,
                              });
                              fetchArticles();
                              setIsEditOpen(false);
                            }
                          }}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
