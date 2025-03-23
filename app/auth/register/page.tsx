"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthNotification } from "@/app/context/auth-notification-context";
import { toast } from "sonner";
import { API_CONFIG } from "@/app/api-config";

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
  const [debugInfo, setDebugInfo] = useState<string>("");
  const { showAuthNotification } = useAuthNotification();

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
    setDebugInfo("Starting registration process...");

    try {
      // Prepare the request body with the correct structure
      const requestBody = {
        name: data.name,
        email: data.email,
        password: data.password,
        venueManager: data.venueManager, // Make sure this is included and not nested
        ...(data.bio ? { bio: data.bio } : {}),
        ...(data.avatarUrl
          ? {
              avatar: {
                url: data.avatarUrl,
                alt: data.avatarAlt || "",
              },
            }
          : {}),
        ...(data.bannerUrl
          ? {
              banner: {
                url: data.bannerUrl,
                alt: data.bannerAlt || "",
              },
            }
          : {}),
      };

      // Log the request body for debugging
      setDebugInfo((prev) => prev + "\nRequest body: " + JSON.stringify(requestBody, null, 2));
      console.log("Registration request:", requestBody);

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      setDebugInfo((prev) => prev + `\nResponse status: ${response.status}`);

      const responseData = await response.json();
      setDebugInfo((prev) => prev + `\nResponse data: ${JSON.stringify(responseData, null, 2)}`);

      if (!response.ok) {
        throw new Error(responseData.errors?.[0]?.message || "Registration failed");
      }

      // Check if venueManager was set correctly in the response
      if (responseData.data) {
        setDebugInfo((prev) => prev + `\nVenue manager in response: ${responseData.data.venueManager}`);
      }

      // Use our auth notification system
      showAuthNotification("register", data.name);

      // After successful registration, automatically log in the user
      await loginUser(data.email, data.password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      setDebugInfo((prev) => prev + `\nError: ${errorMessage}`);

      toast.error("Registration failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Function to automatically log in after registration
  async function loginUser(email: string, password: string) {
    try {
      setDebugInfo((prev) => prev + "\nAttempting automatic login...");

      const loginResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();
      setDebugInfo((prev) => prev + `\nLogin response: ${JSON.stringify(loginData, null, 2)}`);

      if (!loginResponse.ok) {
        throw new Error(loginData.errors?.[0]?.message || "Login failed");
      }

      if (loginData.data?.accessToken) {
        // Store auth data in localStorage
        localStorage.setItem("token", loginData.data.accessToken);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: loginData.data.name,
            email: loginData.data.email,
            avatar: loginData.data.avatar,
            banner: loginData.data.banner,
            venueManager: loginData.data.venueManager,
          })
        );

        setDebugInfo((prev) => prev + `\nVenue manager status after login: ${loginData.data.venueManager}`);

        // Show login notification
        showAuthNotification("login", loginData.data.name);

        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event("authChange"));

        // Redirect to profile
        router.push("/profile");
      }
    } catch (error) {
      setDebugInfo((prev) => prev + `\nAuto-login error: ${error instanceof Error ? error.message : "Unknown error"}`);
      // If auto-login fails, just redirect to login page
      router.push("/auth/login");
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

          {/* Debug information */}
          {debugInfo && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
              <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-60">{debugInfo}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
