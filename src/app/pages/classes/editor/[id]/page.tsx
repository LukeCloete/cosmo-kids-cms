"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, PlusCircle } from "lucide-react";
import Image from "next/image";

// Define the structure for class data
interface ClassData {
  classname: string;
  ageRange: string;
  description: string;
  heroImage: string;
  dailyLife: { title: string; description: string }[];
  funActivities: { title: string; description: string }[];
  galleryImages: string[];
}

export default function ClassEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [classData, setClassData] = useState<ClassData>({
    classname: "",
    ageRange: "",
    description: "",
    heroImage: "",
    dailyLife: [],
    funActivities: [],
    galleryImages: [],
  });
  const [storageImages, setStorageImages] = useState<
    { name: string; url: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassData = async () => {
      if (id) {
        const docRef = doc(db, "classes", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setClassData(docSnap.data() as ClassData);
        } else {
          // If the document doesn't exist, initialize with the classname from ID
          setClassData((prev) => ({
            ...prev,
            classname: id
              .toString()
              .replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
          }));
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setClassData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof ClassData, value: string) => {
    setClassData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiImageSelectChange = (url: string) => {
    setClassData((prev) => {
      const galleryImages = prev.galleryImages.includes(url)
        ? prev.galleryImages.filter((img) => img !== url)
        : [...prev.galleryImages, url];
      return { ...prev, galleryImages };
    });
  };

  const handleDynamicListChange = (
    listName: "dailyLife" | "funActivities",
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updatedList = [...classData[listName]];
    updatedList[index][field] = value;
    setClassData((prev) => ({ ...prev, [listName]: updatedList }));
  };

  const addDynamicListItem = (listName: "dailyLife" | "funActivities") => {
    const newItem = { title: "", description: "" };
    setClassData((prev) => ({
      ...prev,
      [listName]: [...prev[listName], newItem],
    }));
  };

  const removeDynamicListItem = (
    listName: "dailyLife" | "funActivities",
    index: number
  ) => {
    const updatedList = classData[listName].filter((_, i) => i !== index);
    setClassData((prev) => ({ ...prev, [listName]: updatedList }));
  };

  const handleSave = async () => {
    if (id) {
      const docRef = doc(db, "classes", id as string);
      await setDoc(docRef, classData, { merge: true });
      router.push("/pages/classes");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Or a proper skeleton loader
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/pages/classes">Classes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Class</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Edit: {classData.classname}
              </h1>
              <div className="flex gap-2">
                <Link href="/pages/classes">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>

            {/* Main Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Main Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Class Name</Label>
                  <Input
                    name="classname"
                    value={classData.classname}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <Input
                    name="ageRange"
                    value={classData.ageRange}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Textarea
                    name="description"
                    value={classData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Image</Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("heroImage", value)
                    }
                    value={classData.heroImage}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an image" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageImages.map((img) => (
                        <SelectItem key={img.url} value={img.url}>
                          {img.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Daily Life Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>A Day in the Life</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addDynamicListItem("dailyLife")}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {classData.dailyLife.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start p-4 border rounded-lg"
                  >
                    <div className="flex-grow space-y-2">
                      <Input
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) =>
                          handleDynamicListChange(
                            "dailyLife",
                            index,
                            "title",
                            e.target.value
                          )
                        }
                      />
                      <Textarea
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          handleDynamicListChange(
                            "dailyLife",
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDynamicListItem("dailyLife", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Fun Activities Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fun Activities</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addDynamicListItem("funActivities")}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {classData.funActivities.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start p-4 border rounded-lg"
                  >
                    <div className="flex-grow space-y-2">
                      <Input
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) =>
                          handleDynamicListChange(
                            "funActivities",
                            index,
                            "title",
                            e.target.value
                          )
                        }
                      />
                      <Textarea
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          handleDynamicListChange(
                            "funActivities",
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        removeDynamicListItem("funActivities", index)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Gallery Images Card */}
            <Card>
              <CardHeader>
                <CardTitle>Image Gallery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label>Select images for the gallery</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto p-2 border rounded-lg">
                  {storageImages.map((img) => (
                    <div
                      key={img.url}
                      className="relative cursor-pointer"
                      onClick={() => handleMultiImageSelectChange(img.url)}
                    >
                      <Image
                        src={img.url}
                        alt={img.name}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      {classData.galleryImages.includes(img.url) && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center rounded-md">
                          <p className="text-white font-bold text-xs">
                            Selected
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
