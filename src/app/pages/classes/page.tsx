"use client";

import { useState } from "react";

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
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added Select imports
import { MoreHorizontal, Edit } from "lucide-react";

import { db, storage } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"; // Removed addDoc, deleteDoc
import { getDownloadURL, listAll, ref } from "firebase/storage";
import { useEffect } from "react";

interface Class {
  id: string; // Firebase document ID
  classname: string;
  ageRange: string;
  description: string;
  imageUrl: string; // Added imageUrl field
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [storageImages, setStorageImages] = useState<{ name: string; url: string }[]>([]);

  // Define the desired order of class names
  const CLASS_ORDER = [
    "Bouncy Bunnies",
    "Jolly Giraffe",
    "Smart Lions",
    "Clever Cats",
    "Wise Mice",
    "Brainy Elephants",
  ];

  useEffect(() => {
    const fetchClasses = async () => {
      const classesCollectionRef = collection(db, "classes");
      const data = await getDocs(classesCollectionRef);
      const fetchedClasses = data.docs
        .map((doc) => {
          const classData = doc.data() as Omit<Class, "id">;
          // Only include classes that have all required fields
          if (
            classData.classname &&
            classData.ageRange &&
            classData.description
          ) {
            return {
              ...classData,
              id: doc.id,
            };
          }
          return null; // Return null for incomplete data
        })
        .filter(Boolean) as Class[]; // Filter out null values and assert type

      // Sort the fetched classes
      fetchedClasses.sort((a, b) => {
        const indexA = CLASS_ORDER.indexOf(a.classname);
        const indexB = CLASS_ORDER.indexOf(b.classname);
        return indexA - indexB;
      });
      setClasses(fetchedClasses);
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

    fetchClasses();
    fetchStorageImages();
  }, []);

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsEditOpen(true);
  };

  const handleSaveChanges = async () => {
    if (selectedClass) {
      const classRef = doc(db, "classes", selectedClass.id);
      await updateDoc(classRef, {
        classname: selectedClass.classname,
        ageRange: selectedClass.ageRange,
        description: selectedClass.description,
        imageUrl: selectedClass.imageUrl,
      });
      setClasses(
        classes.map((cls) =>
          cls.id === selectedClass.id ? selectedClass : cls
        )
      );
      setIsEditOpen(false);
    }
  };
  return (
    <>
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
                  <BreadcrumbPage>Classes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <section className="py-20 bg-blue-600 relative overflow-hidden">
              <div className="absolute text-white font-bold text-xl">
                {/* <img
                  src="https://tykit.rometheme.pro/terra/wp-content/uploads/sites/96/2022/12/Sky2.png"
                  alt="Child with Creative Learning Elements"
                  className="w-full h-auto opacity-90"
                /> */}
              </div>
              <div className="absolute inset-0">
                <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
                <div className="absolute bottom-10 left-10 w-16 h-16 bg-pink-400 rounded-full opacity-20"></div>
                <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-green-400 rounded-full opacity-30"></div>
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                  <p className="text-orange-400 text-xl">Our Classes</p>
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Happy Childhood Memories Start Here
                  </h2>
                  <p className="text-xl text-blue-100">
                    Discover our comprehensive programs designed for your
                    child&apos;s growth
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {classes.map((classItem) => (
                    <Card
                      key={classItem.id}
                      className={`bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl overflow-hidden shadow-xl`}
                    >
                      <div className="aspect-video bg-transparent">
                        <Image
                          src={classItem.imageUrl || "/placeholder.svg"}
                          alt={classItem.classname}
                          width={300}
                          height={200}
                          className="w-full h-full object-contain scale-110"
                        />
                      </div>
                      <CardContent className="bg-white p-6 space-y-8 h-full">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-800 mb-3">
                            {classItem.classname}
                          </h3>
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
                                onClick={() => handleEditClass(classItem)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-orange-400 text-base">
                          {classItem.ageRange}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {classItem.description}
                        </p>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full rounded-full">
                          Join {classItem.classname}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedClass && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Class</DialogTitle>
                <DialogDescription>Update class information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-image">Image</Label>
                  <Select
                    onValueChange={(url) =>
                      setSelectedClass({
                        ...selectedClass,
                        imageUrl: url,
                      })
                    }
                    value={selectedClass.imageUrl || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an image" />
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
                  <Label htmlFor="edit-title">Class Name</Label>
                  <Input
                    id="edit-title"
                    value={selectedClass.classname}
                    onChange={(e) =>
                      setSelectedClass({
                        ...selectedClass,
                        classname: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-age">Age Range</Label>
                  <Input
                    id="edit-age"
                    value={selectedClass.ageRange}
                    onChange={(e) =>
                      setSelectedClass({
                        ...selectedClass,
                        ageRange: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedClass.description}
                    onChange={(e) =>
                      setSelectedClass({
                        ...selectedClass,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (selectedClass) {
                      const classRef = doc(db, "classes", selectedClass.id);
                      await updateDoc(classRef, {
                        classname: selectedClass.classname,
                        ageRange: selectedClass.ageRange,
                        description: selectedClass.description,
                        imageUrl: selectedClass.imageUrl,
                      });
                      setClasses(
                        classes.map((cls) =>
                          cls.id === selectedClass.id ? selectedClass : cls
                        )
                      );
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
    </>
  );
}
