"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .regex(/@stud\.noroff\.no$/, "Must be a valid stud.noroff.no email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  avatarAlt: z.string().max(120, "Alt text must be less than 120 characters").optional(),
  bannerUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  bannerAlt: z.string().max(120, "Alt text must be less than 120 characters").optional(),
  venueManager: z.boolean().default(false),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      bio: "",
      avatarUrl: "",
      avatarAlt: "",
      bannerUrl: "",
      bannerAlt: "",
      venueManager: false,
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch("https://v2.api.noroff.dev/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          bio: data.bio || undefined,
          avatar: data.avatarUrl
            ? {
                url: data.avatarUrl,
                alt: data.avatarAlt || "",
              }
            : undefined,
          banner: data.bannerUrl
            ? {
                url: data.bannerUrl,
                alt: data.bannerAlt || "",
              }
            : undefined,
          venueManager: data.venueManager,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.errors[0].message || "Registration failed");
      }

      toast.success("Registration successful!", {
        description: "You can now log in with your credentials.",
      });

      router.push("/");
    } catch (error) {
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Register for a new account to start using Holidaze</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormDescription>Only letters, numbers, and underscores allowed</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.name@stud.noroff.no" {...field} />
                    </FormControl>
                    <FormDescription>Must be a valid stud.noroff.no email address</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>Must be at least 8 characters long</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about yourself" {...field} />
                    </FormControl>
                    <FormDescription>Optional - Maximum 160 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile Images (Optional)</h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/avatar.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="avatarAlt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar Alt Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Description of avatar image" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bannerUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/banner.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bannerAlt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Alt Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Description of banner image" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="venueManager"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Venue Manager</FormLabel>
                      <FormDescription>Register as a venue manager to create and manage venues</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
