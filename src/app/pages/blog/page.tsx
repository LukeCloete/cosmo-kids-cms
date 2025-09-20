"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  author: string;
}

export default function Page() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchArticles();
  }, []);

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
                <BreadcrumbPage>Blog</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        Our Latest News + Events
                    </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                      {loading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="bg-white border-2 border-orange-300 rounded-2xl overflow-hidden shadow-lg">
                            <Skeleton className="aspect-video w-full" />
                            <div className="p-6 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))
                      ) : articles.length > 0 ? (
                        articles.map((article) => (
                          <Card key={article.id} className="bg-white border-2 border-orange-300 rounded-2xl overflow-hidden shadow-lg">
                              <div className="aspect-video">
                              <img
                                  src={article.imageUrl || '/placeholder.svg'}
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                              />
                              </div>
                              <CardContent className="p-6">
                              <h3 className="text-xl font-bold text-gray-800 mb-3">
                                  {article.title}
                              </h3>
                              <p className="text-gray-500 text-sm">By {article.author}</p>
                              <p className="text-gray-600 mb-4 line-clamp-2 overflow-ellipsis">
                                  {article.description}
                              </p>
                              <p className="text-sm text-gray-500">{article.date}</p>
                              </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-3 text-center text-muted-foreground">
                          No articles have been posted yet.
                        </div>
                      )}
                    </div>
                </div>
                <Button className="mt-10 bg-orange-500 hover:bg-orange-600 font-semibold text-white mx-auto block rounded-full">
                    View All News
                </Button>
            </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}