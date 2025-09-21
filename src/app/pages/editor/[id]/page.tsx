"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
  const params = useParams();
  const { id } = params;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("News");
  const [date, setDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [storageImages, setStorageImages] = useState<
    { name: string; url: string }[]
  >([]);

  useEffect(() => {
    const fetchArticle = async () => {
      if (id) {
        const docRef = doc(db, "news-events", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const article = docSnap.data();
          setTitle(article.title);
          setDescription(article.description);
          setAuthor(article.author);
          setCategory(article.category);
          setDate(article.date);
          setImageUrl(article.imageUrl);
          if (article.content) {
            const contentState = convertFromRaw(JSON.parse(article.content));
            setEditorState(EditorState.createWithContent(contentState));
          }
        }
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

    fetchArticle();
    fetchStorageImages();
  }, [id]);

  const handleSave = async () => {
    const contentState = editorState.getCurrentContent();
    const content = JSON.stringify(convertToRaw(contentState));

    if (id) {
      const docRef = doc(db, "news-events", id as string);
      await updateDoc(docRef, {
        content,
      });
    }

    router.push("/pages/news-events");
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
                <BreadcrumbLink href="/pages/news-events">
                  News & Events
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Content</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Edit Article
              </h1>
              <div className="flex gap-2">
                <Link href="/pages/news-events">
                  <Button variant="outline">Back</Button>
                </Link>
                <Button onClick={handleSave}>Save Content</Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <Input placeholder="Article Title" value={title} disabled />
                <Textarea
                  placeholder="Short Description"
                  value={description}
                  disabled
                />
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
                  <Input value={author} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} disabled>
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
                  <Input type="date" value={date} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  <Select value={imageUrl} disabled>
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
