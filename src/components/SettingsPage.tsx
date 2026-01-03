import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isApproved: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface SettingsPageProps {
  familyMembers: FamilyMember[];
  categories: Category[];
}

export function SettingsPage({ familyMembers, categories }: SettingsPageProps) {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="family">Family</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="import">Import/Export</TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Sidharth" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="sidharthansidhu@gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" defaultValue="9894277999" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <select id="currency" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Budget Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when approaching budget limits</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bill Reminders</p>
                <p className="text-sm text-muted-foreground">Receive reminders before bills are due</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Summary</p>
                <p className="text-sm text-muted-foreground">Get a weekly spending summary email</p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Family Tab */}
      <TabsContent value="family" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Family Members</CardTitle>
            <CardDescription>Manage who has access to your family finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.role === "Admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {member.role}
                    </span>
                    {member.role !== "Admin" && (
                      <Button variant="ghost" size="sm">Remove</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button variant="outline">Invite Family Member</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Categories Tab */}
      <TabsContent value="categories" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Customize your spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button variant="outline">Add Category</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Import/Export Tab */}
      <TabsContent value="import" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>Import transactions from CSV files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <div className="space-y-2">
                <p className="text-muted-foreground">Drag and drop your CSV file here, or</p>
                <Button variant="outline">Choose File</Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Supported formats: CSV from HDFC Bank, ICICI Bank, SBI, and more. 
              You can map columns after uploading.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download your financial data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col">
                <span className="text-lg mb-1">📊</span>
                <span>Export as CSV</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col">
                <span className="text-lg mb-1">📄</span>
                <span>Generate PDF Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup</CardTitle>
            <CardDescription>Download a complete backup of your data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Download Full Backup</Button>
            <p className="text-sm text-muted-foreground mt-2">
              This will download all your transactions, budgets, goals, and settings.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
