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
import { MoreHorizontal, Edit } from "lucide-react";

// Import your class images here
import BouncyBunny from "../../public/Bouncy_bunny-removebg-preview.webp";
// import BouncyBunny from "../../../public/Bouncy_bunny-removebg-preview.webp";
import JollyGiraffe from "../../public/jolly-giraffe.webp";
import SmartLions from "../../public/smart-lions.webp";
import CleverCats from "../../public/clever-cats.webp";
import WiseMice from "../../public/wise-mice.webp";
import BrainyElephants from "../../public/brainy-elephant.webp";

interface Class {
  id: number;
  title: string;
  age: string;
  description: string;
  image: any;
  color: string;
}

const mockClasses: Class[] = [
  {
    id: 1,
    title: "Bouncy Bunnies",
    age: "6 - 12 Months Old",
    description:
      "2x Bouncy Bunny Groups - Ages 6 months to 18 months in their own private house, with a kitchen, sleep room, indoor play room and private shaded outside play area.",
    image: BouncyBunny,
    color: "yellow",
  },
  {
    id: 2,
    title: "Jolly Giraffe",
    age: "1 - 2 Years Old",
    description:
      "3x Jolly Giraffe Groups - Ages 1-2 years, each with their own classroom, bathroom and an outside play area.",
    image: JollyGiraffe,
    color: "red",
  },
  {
    id: 3,
    title: "Smart Lions",
    age: "2 - 3 Years Old",
    description:
      "2x Smart Lions Groups - Ages 2-3 years, with 2 lovely big classrooms and their own huge playground and outdoor art areas.",
    image: SmartLions,
    color: "blue",
  },
  {
    id: 4,
    title: "Clever Cats",
    age: "3 - 4 Years Old",
    description:
      "2x Clever Cats Groups - Ages 3-4 years, with a classroom, playroom, bathroom and 2 outdoor play areas.",
    image: CleverCats,
    color: "green",
  },
  {
    id: 5,
    title: "Wise Mice",
    age: "4 - 5 Years Old",
    description:
      "2x Wise Mice Groups - Ages 4-5 years, with their classroom, kiddi lounge and outside play and art areas.",
    image: WiseMice,
    color: "pink",
  },
  {
    id: 6,
    title: "Brainy Elephants",
    age: "Grade 0",
    description:
      "1x Brainy Elephant - Grade 0 group, with their own house. A lovely classroom, fantasy playroom, vegetable garden and outside play area.",
    image: BrainyElephants,
    color: "orange",
  },
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsEditOpen(true);
  };

  const handleSaveChanges = () => {
    if (selectedClass) {
      setClasses(
        classes.map((cls) =>
          cls.id === selectedClass.id ? selectedClass : cls
        )
      );
      setIsEditOpen(false);
    }
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
                    className={`bg-gradient-to-br from-${classItem.color}-100 to-${classItem.color}-300 rounded-2xl overflow-hidden shadow-xl`}
                  >
                    <div className="aspect-video bg-transparent">
                      <Image
                        src={classItem.image}
                        alt={classItem.title}
                        className="w-full h-full object-contain scale-110"
                      />
                    </div>
                    <CardContent className="bg-white p-6 space-y-8 h-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                          {classItem.title}
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
                        {classItem.age}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {classItem.description}
                      </p>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full rounded-full">
                        Join {classItem.title}
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

    // {/* Edit Class Dialog */}
    // <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
    //   <DialogContent className="sm:max-w-[600px]">
    //     {selectedClass && (
    //       <>
    //         <DialogHeader>
    //           <DialogTitle>Edit Class</DialogTitle>
    //           <DialogDescription>
    //             Update class information
    //           </DialogDescription>
    //         </DialogHeader>
    //         <div className="space-y-4">
    //           <div className="space-y-2">
    //             <Label htmlFor="edit-title">Title</Label>
    //             <Input
    //               id="edit-title"
    //               value={selectedClass.title}
    //               onChange={(e) =>
    //                 setSelectedClass({ ...selectedClass, title: e.target.value })
    //               }
    //             />
    //           </div>
    //           <div className="space-y-2">
    //             <Label htmlFor="edit-age">Age</Label>
    //             <Input
    //               id="edit-age"
    //               value={selectedClass.age}
    //               onChange={(e) =>
    //                 setSelectedClass({ ...selectedClass, age: e.target.value })
    //               }
    //             />
    //           </div>
    //           <div className="space-y-2">
    //             <Label htmlFor="edit-description">Description</Label>
    //             <Textarea
    //               id="edit-description"
    //               value={selectedClass.description}
    //               onChange={(e) =>
    //                 setSelectedClass({ ...selectedClass, description: e.target.value })
    //               }
    //             />
    //           </div>
    //         </div>
    //         <DialogFooter>
    //           <Button variant="outline" onClick={() => setIsEditOpen(false)}>
    //             Cancel
    //           </Button>
    //           <Button onClick={handleSaveChanges}>Save Changes</Button>
    //         </DialogFooter>
    //       </>
    //     )}
    //   </DialogContent>
    // </Dialog>
  );
}
