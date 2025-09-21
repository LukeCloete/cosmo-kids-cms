"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, listAll, ref } from "firebase/storage";
import {
  Edit,
  Smile,
  Mic,
  MessageCircle,
  Paintbrush,
  Cpu,
  Puzzle,
} from "lucide-react";

import { CTA } from "@/components/cta";
import { GalleryOverlay } from "@/components/gallery-overlay";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Define the structure for class data
interface ClassData {
  classname: string;
  ageRange: string;
  classSummary: string;
  imageUrl: string;
  dailyLife: { title: string; description: string }[];
  funActivities: { title: string; description: string }[];
  galleryImages: string[];
}

export default function DynamicClassPage() {
  const params = useParams();
  const { id } = params;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedClassData, setEditedClassData] = useState<ClassData | null>(
    null
  );
  const [storageImages, setStorageImages] = useState<
    { name: string; url: string }[]
  >([]);

  useEffect(() => {
    const fetchClassData = async () => {
      if (id) {
        const docRef = doc(db, "classes", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as ClassData;
          data.dailyLife = data.dailyLife || [];
          data.funActivities = data.funActivities || [];
          data.galleryImages = data.galleryImages || [];
          setClassData(data);
          setEditedClassData(data);
        } else {
          console.error("No such document!");
        }
        setLoading(false);
      }
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

    fetchClassData();
    fetchStorageImages();
  }, [id]);

  const handleEdit = () => {
    if (classData) {
      const newDailyLife = [...classData.dailyLife];
      while (newDailyLife.length < 3) {
        newDailyLife.push({ title: "", description: "" });
      }
      setEditedClassData({ ...classData, dailyLife: newDailyLife });
    }
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (editedClassData) {
      if (editedClassData.galleryImages.length === 0) {
        alert("Please select at least one gallery image.");
        return;
      }
      const docRef = doc(db, "classes", id as string);
      await updateDoc(docRef, {
        classname: editedClassData.classname,
        ageRange: editedClassData.ageRange,
        classSummary: editedClassData.classSummary,
        imageUrl: editedClassData.imageUrl,
        dailyLife: editedClassData.dailyLife,
        funActivities: editedClassData.funActivities,
        galleryImages: editedClassData.galleryImages,
      });
      setClassData(editedClassData);
      setIsEditDialogOpen(false);
    }
  };

  // const handleDailyLifeChange = (
  //   index: number,
  //   field: string,
  //   value: string
  // ) => {
  //   if (editedClassData) {
  //     const newDailyLife = [...editedClassData.dailyLife];
  //     newDailyLife[index] = { ...newDailyLife[index], [field]: value };
  //     setEditedClassData({ ...editedClassData, dailyLife: newDailyLife });
  //   }
  // };

  // const handleFunActivitiesChange = (
  //   index: number,
  //   field: string,
  //   value: string
  // ) => {
  //   if (editedClassData) {
  //     const newFunActivities = [...editedClassData.funActivities];
  //     newFunActivities[index] = { ...newFunActivities[index], [field]: value };
  //     setEditedClassData({
  //       ...editedClassData,
  //       funActivities: newFunActivities,
  //     });
  //   }
  // };

  const handleGalleryImageChange = (url: string) => {
    if (editedClassData) {
      const newGalleryImages = [...editedClassData.galleryImages];
      const index = newGalleryImages.indexOf(url);
      if (index > -1) {
        newGalleryImages.splice(index, 1);
      } else {
        newGalleryImages.push(url);
      }
      setEditedClassData({
        ...editedClassData,
        galleryImages: newGalleryImages,
      });
    }
  };

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Skeleton className="w-full h-96" />
          <div className="space-y-8">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return <div>Class not found.</div>;
  }

  const classImages = (classData.galleryImages || []).map((url) => ({
    src: url,
    alt: classData.classname,
  }));

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/pages/classes">Classes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{classData.classname}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </header>
        <main>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-b from-sky-200 to-sky-100 pt-24 pb-16 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-60"></div>
              <div className="absolute top-20 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-60"></div>
              <div className="absolute bottom-20 left-20 w-12 h-12 bg-green-300 rounded-full opacity-60"></div>
              <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-purple-300 rounded-full opacity-60"></div>
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
              <div className="text-center space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                  Meet the{" "}
                  <span className="text-orange-500">{classData.classname}</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  {classData.classSummary}
                </p>
              </div>
            </div>
          </section>

          {/* Daily Life Section */}
          {/* Below is with dynamisism */}
          {/* <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  A Day with the{" "}
                  <span className="text-orange-500">{classData.classname}</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <Image
                    src={classData.imageUrl || "/public/placeholder.svg"}
                    alt={classData.classname}
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-2xl shadow-lg"
                  />
                </div>
                <div className="space-y-6">
                  {(classData.dailyLife || []).map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Hand className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section> */}

          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  A Day with the{" "}
                  <span className="text-orange-500">{classData.classname}</span>
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <Image
                    src={classData.imageUrl}
                    alt={classData.classname}
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-2xl shadow-lg"
                  />
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Smile className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Growing Independence
                      </h3>
                      <p className="text-gray-600">
                        We are already potty trained and can do almost
                        everything on our own.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Mic className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Joyful Expressions
                      </h3>
                      <p className="text-gray-600">
                        We love to laugh and sing and dance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <MessageCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Chatterboxes
                      </h3>
                      <p className="text-gray-600">
                        We can chat and reason and make you laugh.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Activities Section */}
          {/* Below is with it being dynamic */}
          {/* <section className="py-20 bg-gradient-to-b from-sky-50 to-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Our <span className="text-orange-500">Fun Activities</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(classData.funActivities || []).map((activity, index) => (
                  <div
                    key={index}
                    className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden p-8 text-center space-y-4"
                  >
                    <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      {index % 3 === 0 && (
                        <Baby className="w-8 h-8 text-white" />
                      )}
                      {index % 3 === 1 && (
                        <Lightbulb className="w-8 h-8 text-white" />
                      )}
                      {index % 3 === 2 && (
                        <Handshake className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {activity.title}
                    </h3>
                    <p className="text-gray-600">{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section> */}
          <section className="py-20 bg-gradient-to-b from-sky-50 to-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Our <span className="text-orange-500">Fun Activities</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our daily program is filled with activities that are both fun
                  and educational, helping us grow and learn.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden p-8 text-center space-y-4">
                  <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Paintbrush className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Creative Minds
                  </h3>
                  <p className="text-gray-600">
                    We can scribble and paint and cut and mold.
                  </p>
                </div>

                <div className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden p-8 text-center space-y-4">
                  <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Cpu className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Exploring & Building
                  </h3>
                  <p className="text-gray-600">
                    We can build and climb and explore and lots more.
                  </p>
                </div>

                <div className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden p-8 text-center space-y-4">
                  <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Puzzle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Problem Solvers
                  </h3>
                  <p className="text-gray-600">
                    We love to solve puzzles and take on new challenges.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Image Gallery Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  A Glimpse into Our{" "}
                  <span className="text-orange-500">Classroom</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {classImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg cursor-pointer group"
                    onClick={() => openGallery(index)}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <CTA p="Give your child the gift of loving care and structured learning in a safe and happy environment." />

          <GalleryOverlay
            images={classImages.map((img) => ({ url: img.src, alt: img.alt }))}
            initialIndex={selectedImageIndex}
            isOpen={galleryOpen}
            onClose={closeGallery}
          />
        </main>
      </SidebarInset>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Update class information</DialogDescription>
          </DialogHeader>
          {editedClassData && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Class Name</Label>
                <Input
                  id="edit-title"
                  value={editedClassData.classname}
                  onChange={(e) =>
                    setEditedClassData({
                      ...editedClassData,
                      classname: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-class-summary">Class Summary</Label>
                <Textarea
                  id="edit-class-summary"
                  value={editedClassData.classSummary}
                  onChange={(e) =>
                    setEditedClassData({
                      ...editedClassData,
                      classSummary: e.target.value,
                    })
                  }
                />
              </div>

              {/* Daily life section */}
              {/* <div>
                <Label>Daily Life</Label>
                {editedClassData.dailyLife &&
                  editedClassData.dailyLife.map((item, index) => (
                    <div
                      key={index}
                      className="space-y-2 border p-2 rounded-md"
                    >
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          handleDailyLifeChange(index, "title", e.target.value)
                        }
                        placeholder="Title"
                      />
                      <Textarea
                        value={item.description}
                        onChange={(e) =>
                          handleDailyLifeChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Description"
                      />
                    </div>
                  ))}
              </div> */}

              {/* Fun actibities section */}
              {/* <div>
                <Label>Fun Activities</Label>
                {editedClassData.funActivities &&
                  editedClassData.funActivities.map((item, index) => (
                    <div
                      key={index}
                      className="space-y-2 border p-2 rounded-md"
                    >
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          handleFunActivitiesChange(
                            index,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Title"
                      />
                      <Textarea
                        value={item.description}
                        onChange={(e) =>
                          handleFunActivitiesChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Description"
                      />
                    </div>
                  ))}
              </div> */}
              <div>
                <Label>Gallery Images</Label>
                <p
                  className={`text-sm ${
                    editedClassData.galleryImages.length === 0
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  Select at least one image for the gallery.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {storageImages.map((image) => (
                    <div
                      key={image.url}
                      className={`relative border-2 ${
                        editedClassData.galleryImages.includes(image.url)
                          ? "border-blue-500"
                          : ""
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.name}
                        width={150}
                        height={100}
                        className="cursor-pointer"
                        onClick={() => handleGalleryImageChange(image.url)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
