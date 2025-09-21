"use client";

import { useState } from "react";
import Link from "next/link";

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
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore"; // Removed addDoc, deleteDoc
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

  const handleDeleteAllClasses = async () => {
    if (window.confirm("Are you sure you want to delete all classes? This action cannot be undone.")) {
      const classesCollectionRef = collection(db, "classes");
      const data = await getDocs(classesCollectionRef);
      for (const docSnapshot of data.docs) {
        await deleteDoc(doc(db, "classes", docSnapshot.id));
      }
      fetchClasses(); // Refresh the list of classes
    }
  };

  const handleRepopulateClasses = async () => {
    const classesCollectionRef = collection(db, "classes");
    const sampleClasses = [
      {
        classname: "Bouncy Bunnies",
        ageRange: "2-3 years",
        description: "A fun and engaging class for toddlers, focusing on sensory play and early social skills.",
        imageUrl: "/bouncy-bunny.webp",
        classSummary: "Our Bouncy Bunnies class is a warm and safe environment for our learners, aged 2-3 years. We focus on developing motor skills and social interaction through playful activities.",
        dailyLife: [
          { title: "Morning Circle", description: "Greeting, songs, and story time." },
          { title: "Sensory Play", description: "Exploring textures, sounds, and colors." },
          { title: "Cosmo Diaries", description: "" },
        ],
        funActivities: [
          { title: "Finger Painting", description: "Creative expression with colors." },
          { title: "Building Blocks", description: "Developing fine motor skills." },
        ],
        galleryImages: [],
      },
      {
        classname: "Jolly Giraffe",
        ageRange: "3-4 years",
        description: "An exciting class for preschoolers, introducing basic concepts and fostering creativity.",
        imageUrl: "/jolly-giraffe.webp",
        classSummary: "The Jolly Giraffe class is designed for children aged 3-4 years, offering a blend of structured learning and creative exploration. We encourage curiosity and independent thinking.",
        dailyLife: [
          { title: "Learning Centers", description: "Exploring various educational stations." },
          { title: "Outdoor Play", description: "Gross motor skill development and fresh air." },
        ],
        funActivities: [
          { title: "Storytelling", description: "Developing imagination and language skills." },
          { title: "Music & Movement", description: "Rhythm, coordination, and self-expression." },
        ],
        galleryImages: [],
      },
      {
        classname: "Smart Lions",
        ageRange: "4-5 years",
        description: "A stimulating class for pre-kindergarteners, preparing them for school with advanced learning.",
        imageUrl: "/smart-lions.webp",
        classSummary: "Our Smart Lions class caters to 4-5 year olds, providing a strong foundation for kindergarten. We focus on literacy, numeracy, and problem-solving skills in a supportive environment.",
        dailyLife: [
          { title: "Literacy Focus", description: "Phonics, early reading, and writing." },
          { title: "Math & Science", description: "Hands-on experiments and number concepts." },
        ],
        funActivities: [
          { title: "Art Projects", description: "Encouraging creativity and fine motor skills." },
          { title: "Group Games", description: "Teamwork, sportsmanship, and social development." },
        ],
        galleryImages: [],
      },
      {
        classname: "Clever Cats",
        ageRange: "5-6 years",
        description: "An advanced class for kindergarteners, fostering critical thinking and independent learning.",
        imageUrl: "/clever-cats.webp",
        classSummary: "The Clever Cats class is for children aged 5-6 years, focusing on advanced academic concepts and critical thinking. We prepare them for elementary school with a strong emphasis on problem-solving and creativity.",
        dailyLife: [
          { title: "Advanced Reading", description: "Reading comprehension and fluency." },
          { title: "Creative Writing", description: "Developing storytelling and writing skills." },
        ],
        funActivities: [
          { title: "Science Experiments", description: "Exploring scientific principles through hands-on activities." },
          { title: "Debate Club", description: "Developing public speaking and critical thinking skills." },
        ],
        galleryImages: [],
      },
      {
        classname: "Wise Mice",
        ageRange: "6-7 years",
        description: "A specialized class for early elementary students, focusing on STEM and collaborative projects.",
        imageUrl: "/wise-mice.webp",
        classSummary: "Our Wise Mice class is designed for 6-7 year olds, with a strong focus on STEM education and collaborative projects. We encourage innovation and teamwork to solve real-world problems.",
        dailyLife: [
          { title: "Robotics Club", description: "Introduction to robotics and coding." },
          { title: "Environmental Studies", description: "Learning about nature and sustainability." },
        ],
        funActivities: [
          { title: "Coding Challenges", description: "Developing logical thinking and problem-solving skills." },
          { title: "Gardening Project", description: "Learning about plant life and ecosystems." },
        ],
        galleryImages: [],
      },
      {
        classname: "Brainy Elephants",
        ageRange: "7-8 years",
        description: "A comprehensive class for elementary students, focusing on advanced academics and leadership skills.",
        imageUrl: "/brainy-elephant.webp",
        classSummary: "The Brainy Elephants class is for children aged 7-8 years, offering an advanced curriculum and leadership development. We foster independent research, critical analysis, and effective communication.",
        dailyLife: [
          { title: "Research Projects", description: "Developing research and presentation skills." },
          { title: "Leadership Workshops", description: "Building confidence and leadership qualities." },
        ],
        funActivities: [
          { title: "Debate and Public Speaking", description: "Enhancing communication and persuasive skills." },
          { title: "Community Service", description: "Promoting social responsibility and empathy." },
        ],
        galleryImages: [],
      },
    ];

    for (const classData of sampleClasses) {
      await addDoc(classesCollectionRef, classData);
    }
    fetchClasses(); // Refresh the list of classes
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
            <div className="ml-auto flex gap-2">
              <Button onClick={handleDeleteAllClasses} variant="destructive">Delete All</Button>
              <Button onClick={handleRepopulateClasses} variant="default">Repopulate</Button>
            </div>
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
                        <Link href={`/pages/classes/${classItem.id}`} passHref>
                          <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full rounded-full">
                            Join {classItem.classname}
                          </Button>
                        </Link>
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
              <div className="space-y-4 max-h-[80vh] overflow-y-auto">
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
                <div className="space-y-2">
                  <Label htmlFor="edit-image">Image</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {storageImages.map((image) => (
                      <div key={image.url} className={`relative border-2 ${selectedClass?.imageUrl === image.url ? 'border-blue-500' : ''}`}>
                        <Image
                          src={image.url}
                          alt={image.name}
                          width={150}
                          height={100}
                          className="cursor-pointer"
                          onClick={() =>
                            setSelectedClass({
                              ...selectedClass,
                              imageUrl: image.url,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
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
