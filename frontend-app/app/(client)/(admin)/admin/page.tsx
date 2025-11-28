"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface DashboardStats {
  users: {
    total: number;
    online: number;
    offline: number;
    standby: number;
    admins: number;
  };
  documents: {
    total: number;
    online: number;
    pending: number;
    deleted: number;
  };
  tags: {
    total: number;
  };
}

interface RecentDocument {
  id: string;
  title: string;
  status: string;
  uploadedBy: {
    email: string;
  };
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();

      // Fetch documents
      const docsRes = await fetch("/api/admin/documents");
      const docsData = await docsRes.json();

      // Fetch tags
      const tagsRes = await fetch("/api/tags");
      const tagsData = await tagsRes.json();

      // Calculate statistics
      const userStats = {
        total: usersData.counts.total,
        online: usersData.counts.ONLINE,
        offline: usersData.counts.OFFLINE,
        standby: usersData.counts.STANDBY,
        admins: usersData.users.filter((u: any) => u.role === "ADMIN").length,
      };

      const docStats = {
        total: docsData.counts.total,
        online: docsData.counts.ONLINE,
        pending: docsData.counts.PENDING,
        deleted: docsData.counts.DELETED,
      };

      setStats({
        users: userStats,
        documents: docStats,
        tags: { total: tagsData.tags.length },
      });

      // Get 5 most recent documents
      setRecentDocuments(docsData.documents.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the EmployAI admin panel
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-2">{stats?.users.total}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {stats?.users.admins} Admin
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {stats?.users.online} Online
                  </Badge>
                </div>
              </div>
              <div className="text-5xl opacity-20">👥</div>
            </div>
          </CardContent>
        </Card>

        {/* Total Documents */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Total Documents
                </p>
                <p className="text-3xl font-bold mt-2">
                  {stats?.documents.total}
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {stats?.documents.online} Online
                  </Badge>
                </div>
              </div>
              <div className="text-5xl opacity-20">📄</div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">
                  Pending Approvals
                </p>
                <p className="text-3xl font-bold mt-2">
                  {stats?.documents.pending}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/20 text-white mt-3 hover:bg-white/30"
                  onClick={() => router.push("/admin/documents?status=PENDING")}
                >
                  Review Now
                </Button>
              </div>
              <div className="text-5xl opacity-20">⏳</div>
            </div>
          </CardContent>
        </Card>

        {/* Total Tags */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Total Tags
                </p>
                <p className="text-3xl font-bold mt-2">{stats?.tags.total}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/20 text-white mt-3 hover:bg-white/30"
                  onClick={() => router.push("/admin/tags")}
                >
                  Manage Tags
                </Button>
              </div>
              <div className="text-5xl opacity-20">🏷️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/documents")}
              className="h-20 flex-col"
            >
              <div className="text-2xl mb-1">📄</div>
              <div>Manage Documents</div>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/users")}
              className="h-20 flex-col"
            >
              <div className="text-2xl mb-1">👥</div>
              <div>Manage Users</div>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/tags")}
              className="h-20 flex-col"
            >
              <div className="text-2xl mb-1">🏷️</div>
              <div>Manage Tags</div>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="h-20 flex-col"
            >
              <div className="text-2xl mb-1">📱</div>
              <div>User View</div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold">Recent Documents</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push("/admin/documents")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentDocuments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No documents yet</p>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/admin/documents`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl">📄</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {doc.title}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            Uploaded by {doc.uploadedBy.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            doc.status === "ONLINE"
                              ? "default"
                              : doc.status === "PENDING"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {doc.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🟢</div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.users.online}
            </p>
            <p className="text-gray-600 mt-1">Online Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🟠</div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.users.standby}
            </p>
            <p className="text-gray-600 mt-1">Standby Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">⚫</div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.users.offline}
            </p>
            <p className="text-gray-600 mt-1">Offline Users</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
