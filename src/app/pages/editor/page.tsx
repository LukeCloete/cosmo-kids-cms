"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { EditorState, convertToRaw } from 'draft-js';
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  {
    ssr: false,
  }
);
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { db, storage } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
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

export default function ArticleEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("News");
  const [date, setDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [storageImages, setStorageImages] = useState<{ name: string; url: string }[]>([]);

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

    fetchStorageImages();
  }, []);

  const handleSave = async () => {
    const contentState = editorState.getCurrentContent();
    const content = JSON.stringify(convertToRaw(contentState));

    await addDoc(collection(db, "news-events"), {
      title,
      description,
      content,
      author,
      category,
      date,
      imageUrl,
    });

    router.push('/pages/news-events');
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
              <BreadcrumbItem>
                <BreadcrumbLink href="/pages/news-events">News & Events</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Article</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">New Article</h1>
                <Button onClick={handleSave}>Save Article</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <Input placeholder="Article Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Textarea placeholder="Short Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <Editor
                        editorState={editorState}
                        onEditorStateChange={setEditorState}
                        wrapperClassName="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring"
                        editorClassName="min-h-[200px]"
                    />
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Author</Label>
                        <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
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
                        <Label>Date</Label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Featured Image</Label>
                        <Select value={imageUrl} onValueChange={setImageUrl}>
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
                </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}