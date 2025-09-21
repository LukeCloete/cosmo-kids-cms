"use client";

import { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import staffImage from "../../../_images/cosmo-kids-staff.jpg";
import Image from "next/image";

import {
  Upload,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Separator } from "@radix-ui/react-separator";

interface Image {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  uploadDate: string;
  size: string;
  dimensions: string;
}

const categories = ["All", "Activities", "Education", "Daily Life", "Events"];

export default function GalleryManagement() {
  const [images, setImages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [storageImages, setStorageImages] = useState<
    { name: string; url: string }[]
  >([]);

  useEffect(() => {
    const fetchImages = async () => {
      const querySnapshot = await getDocs(collection(db, "gallery"));
      const imagesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setImages(imagesData);
    };

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

    fetchImages();
    fetchStorageImages();
  }, []);

  const filteredImages = images.filter((image) => {
    const matchesSearch =
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some((tag: any) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "All" || image.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteImage = async (id: string) => {
    await deleteDoc(doc(db, "gallery", id));
    setImages(images.filter((img) => img.id !== id));
  };

  const handleEditImage = (image: any) => {
    setSelectedImage(image);
    setIsEditOpen(true);
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
                <BreadcrumbPage>Home</BreadcrumbPage>
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
                  Gallery Management
                </h1>
                <p className="text-muted-foreground">
                  Manage images for your homepage and gallery page
                </p>
              </div>

              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Images
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Upload New Images</DialogTitle>
                    <DialogDescription>
                      Add new images to your gallery. You can upload multiple
                      files at once.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <div className="mt-4">
                        <Button variant="outline">Choose Files</Button>
                        <p className="mt-2 text-sm text-muted-foreground">
                          or drag and drop files here
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="activities">
                              Activities
                            </SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="daily-life">
                              Daily Life
                            </SelectItem>
                            <SelectItem value="events">Events</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input placeholder="playground, outdoor, fun" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setIsUploadOpen(false)}>
                      Upload Images
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            {/* <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{images.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      images.filter((img) => img.category === "Activities")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Most popular category
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      images.filter((img) => img.category === "Education")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Learning focused
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Storage Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.4 MB</div>
                  <p className="text-xs text-muted-foreground">
                    of 1GB available
                  </p>
                </CardContent>
              </Card>
            </div> */}

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search images by title, description, or tags..."
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

            {/* Gallery Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
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
                              setSelectedImage(image);
                              setIsViewDetailsOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditImage(image);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteImage(image.id)}
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
                        <h3 className="font-semibold text-sm">{image.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {image.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {image.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {image.tags.slice(0, 3).map((tag: any) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {image.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{image.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{image.uploadDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Image Details Dialog */}
            <Dialog
              open={isViewDetailsOpen}
              onOpenChange={setIsViewDetailsOpen}
            >
              <DialogContent className="sm:max-w-[700px]">
                {selectedImage && (
                  <>
                    <DialogHeader>
                      <DialogTitle>{selectedImage.title}</DialogTitle>
                      <DialogDescription>
                        Image details and metadata
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="aspect-video overflow-hidden rounded-lg">
                        <img
                          src={selectedImage.url || "/placeholder.svg"}
                          alt={selectedImage.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Description
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedImage.description}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Category
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedImage.category}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Tags</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedImage.tags.map((tag: any) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-sm font-medium">
                              Upload Date
                            </Label>
                            <p className="text-muted-foreground">
                              {selectedImage.uploadDate}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              File Size
                            </Label>
                            <p className="text-muted-foreground">
                              {selectedImage.size}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Dimensions
                            </Label>
                            <p className="text-muted-foreground">
                              {selectedImage.dimensions}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Image Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="sm:max-w-[600px]">
                {selectedImage && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Edit Image</DialogTitle>
                      <DialogDescription>
                        Update image information and metadata
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-image">Image</Label>
                        <Select
                          onValueChange={(url) =>
                            setSelectedImage({ ...selectedImage, url })
                          }
                          defaultValue={selectedImage.url}
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
                          value={selectedImage.title}
                          onChange={(e) =>
                            setSelectedImage({
                              ...selectedImage,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={selectedImage.description}
                          onChange={(e) =>
                            setSelectedImage({
                              ...selectedImage,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-category">Category</Label>
                          <Select
                            onValueChange={(value) =>
                              setSelectedImage({
                                ...selectedImage,
                                category: value,
                              })
                            }
                            defaultValue={selectedImage.category}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="activities">
                                Activities
                              </SelectItem>
                              <SelectItem value="education">
                                Education
                              </SelectItem>
                              <SelectItem value="daily-life">
                                Daily Life
                              </SelectItem>
                              <SelectItem value="events">Events</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-tags">Tags</Label>
                          <Input
                            id="edit-tags"
                            value={selectedImage.tags.join(", ")}
                            onChange={(e) =>
                              setSelectedImage({
                                ...selectedImage,
                                tags: e.target.value
                                  .split(",")
                                  .map((tag) => tag.trim()),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          if (selectedImage) {
                            const imageRef = doc(
                              db,
                              "gallery",
                              selectedImage.id
                            );
                            await updateDoc(imageRef, selectedImage);
                            const updatedImages = images.map((image) =>
                              image.id === selectedImage.id
                                ? selectedImage
                                : image
                            );
                            setImages(updatedImages);
                            setIsEditOpen(false);
                          }
                        }}
                      >
                        Save Changes
                      </Button>
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
