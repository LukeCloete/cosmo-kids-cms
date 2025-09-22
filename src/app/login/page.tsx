"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import COMPANY_LOGO from "../public/cosmo-kids-logo.png";

const formSchema = z.object({
  emailAddress: z.string().email({ message: "Email address is not valid." }),
  password: z.string().min(3, "Please enter a password."),
});

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  let user = null;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isLoading) return;
    toast.info("Logging in...");

    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.emailAddress,
        values.password
      );

      user = userCredential.user;
      if (user) {
        toast.success("Login successful!");
        router.push("/pages/gallery");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
      console.error("error ", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    router.push("/pages/gallery");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="relative items-center justify-center  max-w-md  mb-10">
        <Image
          src={COMPANY_LOGO}
          alt="Company Logo"
          className="w-full h-auto object-contain"
          width={400}
          // height={150}
        />
        {/* <Image
          src={COMPANY_IMAGE}
          alt="Company Image"
          className="w-full h-auto object-contain"
        /> */}
      </div>
      <div className="flex flex-col items-center justify-center w-full max-w-md h-fit">
        <div className="w-full h-full flex flex-col gap-8 items-center justify-center ">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-8 w-full"
            >
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 "
                disabled={isLoading}
              >
                Log In
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
