"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import AnimatedContainer from "@/components/ui/animated-container";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "editor" | "viewer";
  status: "active" | "inactive" | "pending";
  lastActive: string;
  permissions: {
    canCreateKb: boolean;
    canEditKb: boolean;
    canDeleteKb: boolean;
    canUploadDocs: boolean;
    canDeleteDocs: boolean;
    canManageUsers: boolean;
    canExportData: boolean;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    canCreateKb: boolean;
    canEditKb: boolean;
    canDeleteKb: boolean;
    canUploadDocs: boolean;
    canDeleteDocs: boolean;
    canManageUsers: boolean;
    canExportData: boolean;
  };
}

export default function UserManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useLocalStorage<User[]>("ai-knowledge-users", [
    {
      id: "1",
      name: "管理员",
      email: "admin@example.com",
      role: "admin",
      status: "active",
      lastActive: new Date().toISOString(),
      permissions: {
        canCreateKb: true,
        canEditKb: true,
        canDeleteKb: true,
        canUploadDocs: true,
        canDeleteDocs: true,
        canManageUsers: true,
        canExportData: true,
      },
    },
    {
      id: "2",
      name: "测试用户",
      email: "user@example.com",
      role: "viewer",
      status: "active",
      lastActive: new Date().toISOString(),
      permissions: {
        canCreateKb: false,
        canEditKb: false,
        canDeleteKb: false,
        canUploadDocs: false,
        canDeleteDocs: false,
        canManageUsers: false,
        canExportData: false,
      },
    },
  ]);

  const [roles, setRoles] = useLocalStorage<Role[]>("ai-knowledge-roles", [
    {
      id: "admin",
      name: "管理员",
      description: "拥有所有权限",
      permissions: {
        canCreateKb: true,
        canEditKb: true,
        canDeleteKb: true,
        canUploadDocs: true,
        canDeleteDocs: true,
        canManageUsers: true,
        canExportData: true,
      },
    },
    {
      id: "manager",
      name: "管理者",
      description: "可以管理知识库和文档，但不能管理用户",
      permissions: {
        canCreateKb: true,
        canEditKb: true,
        canDeleteKb: true,
        canUploadDocs: true,
        canDeleteDocs: true,
        canManageUsers: false,
        canExportData: true,
      },
    },
    {
      id: "editor",
      name: "编辑者",
      description: "可以上传和编辑文档，但不能删除",
      permissions: {
        canCreateKb: false,
        canEditKb: true,
        canDeleteKb: false,
        canUploadDocs: true,
        canDeleteDocs: false,
        canManageUsers: false,
        canExportData: true,
      },
    },
    {
      id: "viewer",
      name: "查看者",
      description: "只能查看和搜索",
      permissions: {
        canCreateKb: false,
        canEditKb: false,
        canDeleteKb: false,
        canUploadDocs: false,
        canDeleteDocs: false,
        canManageUsers: false,
        canExportData: false,
      },
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);

  const { accentColor, animationsEnabled } = useTheme();

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (user: Omit<User, "id" | "lastActive">) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      lastActive: new Date().toISOString(),
    };

    setUsers([...users, newUser]);
    setIsAddingUser(false);

    toast.success("用户已添加", {
      description: `用户 ${user.name} 已成功添加`,
    });
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setEditingUser(null);

    toast("用户已更新", {
      description: `用户 ${updatedUser.name} 已成功更新`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((user) => user.id === userId);

    setUsers(users.filter((user) => user.id !== userId));

    toast("用户已删除", {
      description: userToDelete
        ? `用户 ${userToDelete.name} 已成功删除`
        : "用户已删除",
    });
  };

  const handleAddRole = (role: Omit<Role, "id">) => {
    const newRole: Role = {
      ...role,
      id: role.name.toLowerCase().replace(/\s+/g, "-"),
    };

    setRoles([...roles, newRole]);
    setIsAddingRole(false);

    toast("角色已添加", {
      description: `角色 ${role.name} 已成功添加`,
    });
  };

  const handleUpdateRole = (updatedRole: Role) => {
    setRoles(
      roles.map((role) => (role.id === updatedRole.id ? updatedRole : role))
    );
    setEditingRole(null);

    toast("角色已更新", {
      description: `角色 ${updatedRole.name} 已成功更新`,
    });
  };

  const handleDeleteRole = (roleId: string) => {
    const roleToDelete = roles.find((role) => role.id === roleId);

    // Check if any users have this role
    const usersWithRole = users.filter((user) => user.role === roleId);

    if (usersWithRole.length > 0) {
      toast.error("无法删除角色", {
        description: `有 ${usersWithRole.length} 个用户正在使用此角色`,
      });
      return;
    }

    setRoles(roles.filter((role) => role.id !== roleId));

    toast("角色已删除", {
      description: roleToDelete
        ? `角色 ${roleToDelete.name} 已成功删除`
        : "角色已删除",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "manager":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "editor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "viewer":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>用户管理</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            用户与权限管理
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="users"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="border-b px-6">
            <TabsList className="justify-start -mb-px">
              <TabsTrigger
                value="users"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                <Users className="h-4 w-4 mr-2" />
                用户
              </TabsTrigger>
              <TabsTrigger
                value="roles"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                <Shield className="h-4 w-4 mr-2" />
                角色
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                <Key className="h-4 w-4 mr-2" />
                权限
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Users Tab */}
            <TabsContent value="users" className="h-full flex flex-col">
              <div className="p-6 pb-3 flex justify-between items-center">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button onClick={() => setIsAddingUser(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  添加用户
                </Button>
              </div>

              <ScrollArea className="flex-1 px-6 pb-6">
                <AnimatedContainer type="fade" className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>最后活动</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            未找到匹配的用户
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  getRoleBadgeColor(user.role)
                                )}
                              >
                                {roles.find((r) => r.id === user.role)?.name ||
                                  user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  getStatusBadgeColor(user.status)
                                )}
                              >
                                {user.status === "active"
                                  ? "活跃"
                                  : user.status === "inactive"
                                  ? "非活跃"
                                  : "待确认"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.lastActive).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setEditingUser(user)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    编辑
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const newStatus =
                                        user.status === "active"
                                          ? "inactive"
                                          : "active";
                                      handleUpdateUser({
                                        ...user,
                                        status: newStatus,
                                      });
                                    }}
                                  >
                                    {user.status === "active" ? (
                                      <>
                                        <UserX className="h-4 w-4 mr-2" />
                                        停用
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        激活
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 dark:text-red-400"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </AnimatedContainer>
              </ScrollArea>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="h-full flex flex-col">
              <div className="p-6 pb-3 flex justify-between items-center">
                <h3 className="text-lg font-medium">角色管理</h3>
                <Button onClick={() => setIsAddingRole(true)}>
                  <Shield className="h-4 w-4 mr-2" />
                  添加角色
                </Button>
              </div>

              <ScrollArea className="flex-1 px-6 pb-6">
                <AnimatedContainer type="fade" className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>角色名称</TableHead>
                        <TableHead>描述</TableHead>
                        <TableHead>用户数量</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => {
                        const userCount = users.filter(
                          (user) => user.role === role.id
                        ).length;

                        return (
                          <TableRow key={role.id}>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  getRoleBadgeColor(role.id)
                                )}
                              >
                                {role.name}
                              </Badge>
                            </TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell>{userCount}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setEditingRole(role)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    编辑
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 dark:text-red-400"
                                    onClick={() => handleDeleteRole(role.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </AnimatedContainer>
              </ScrollArea>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="p-6">
              <AnimatedContainer type="fade" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">权限矩阵</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>权限</TableHead>
                        {roles.map((role) => (
                          <TableHead key={role.id} className="text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                getRoleBadgeColor(role.id)
                              )}
                            >
                              {role.name}
                            </Badge>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          创建知识库
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            {role.permissions.canCreateKb ? (
                              <span className={`text-${accentColor}-500`}>
                                ✓
                              </span>
                            ) : (
                              <span className="text-muted-foreground">✗</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          编辑知识库
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            {role.permissions.canEditKb ? (
                              <span className={`text-${accentColor}-500`}>
                                ✓
                              </span>
                            ) : (
                              <span className="text-muted-foreground">✗</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          删除知识库
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            {role.permissions.canDeleteKb ? (
                              <span className={`text-${accentColor}-500`}>
                                ✓
                              </span>
                            ) : (
                              <span className="text-muted-foreground">✗</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">上传文档</TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            {role.permissions.canUploadDocs ? (
                              <span className={`text-${accentColor}-500`}>
                                ✓
                              </span>
                            ) : (
                              <span className="text-muted-foreground">✗</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">删除文档</TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            {role.permissions.canDeleteDocs ? (
                              <span className={`text-${accentColor}-500`}>
                                ✓
                              </span>
                            ) : (
                              <span className="text-muted-foreground">✗</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">管理用户</TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            {role.permissions.canManageUsers ? (
                              <span className={`text-${accentColor}-500`}>
                                ✓
                              </span>
                            ) : (
                              <span className="text-muted-foreground">✗</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">导出数据</TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            {role.permissions.canExportData ? (
                              <span className={`text-${accentColor}-500`}>
                                ✓
                              </span>
                            ) : (
                              <span className="text-muted-foreground">✗</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">权限说明</h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <strong>创建知识库</strong>: 允许用户创建新的知识库
                    </li>
                    <li>
                      <strong>编辑知识库</strong>: 允许用户编辑现有知识库的设置
                    </li>
                    <li>
                      <strong>删除知识库</strong>: 允许用户删除知识库
                    </li>
                    <li>
                      <strong>上传文档</strong>: 允许用户上传文档到知识库
                    </li>
                    <li>
                      <strong>删除文档</strong>: 允许用户从知识库中删除文档
                    </li>
                    <li>
                      <strong>管理用户</strong>: 允许用户管理其他用户账户
                    </li>
                    <li>
                      <strong>导出数据</strong>: 允许用户导出知识库数据
                    </li>
                  </ul>
                </div>
              </AnimatedContainer>
            </TabsContent>
          </div>
        </Tabs>

        {/* Add/Edit User Dialog */}
        {(isAddingUser || editingUser) && (
          <Dialog
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                setIsAddingUser(false);
                setEditingUser(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {isAddingUser ? "添加新用户" : "编辑用户"}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    姓名
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={editingUser?.name || ""}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    邮箱
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="col-span-3"
                    value={editingUser?.email || ""}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, email: e.target.value } : null
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    角色
                  </Label>
                  <Select
                    value={editingUser?.role || "viewer"}
                    onValueChange={(value) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, role: value as any } : null
                      )
                    }
                  >
                    <SelectTrigger id="role" className="col-span-3">
                      <SelectValue placeholder="选择角色" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    状态
                  </Label>
                  <Select
                    value={editingUser?.status || "active"}
                    onValueChange={(value) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, status: value as any } : null
                      )
                    }
                  >
                    <SelectTrigger id="status" className="col-span-3">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">活跃</SelectItem>
                      <SelectItem value="inactive">非活跃</SelectItem>
                      <SelectItem value="pending">待确认</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-start gap-4 pt-4">
                  <Label className="text-right pt-2">自定义权限</Label>
                  <div className="col-span-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-permissions" className="text-sm">
                        使用自定义权限覆盖角色默认权限
                      </Label>
                      <Switch
                        id="custom-permissions"
                        checked={false}
                        disabled
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      此功能即将推出。目前用户权限由其角色决定。
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingUser(false);
                    setEditingUser(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  onClick={() => {
                    if (isAddingUser && editingUser) {
                      handleAddUser(editingUser);
                    } else if (editingUser) {
                      handleUpdateUser(editingUser);
                    }
                  }}
                  disabled={!editingUser?.name || !editingUser?.email}
                >
                  {isAddingUser ? "添加" : "保存"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add/Edit Role Dialog */}
        {(isAddingRole || editingRole) && (
          <Dialog
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                setIsAddingRole(false);
                setEditingRole(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {isAddingRole ? "添加新角色" : "编辑角色"}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role-name" className="text-right">
                    角色名称
                  </Label>
                  <Input
                    id="role-name"
                    className="col-span-3"
                    value={editingRole?.name || ""}
                    onChange={(e) =>
                      setEditingRole((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role-description" className="text-right">
                    描述
                  </Label>
                  <Input
                    id="role-description"
                    className="col-span-3"
                    value={editingRole?.description || ""}
                    onChange={(e) =>
                      setEditingRole((prev) =>
                        prev ? { ...prev, description: e.target.value } : null
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-4 items-start gap-4 pt-4">
                  <Label className="text-right pt-2">权限</Label>
                  <div className="col-span-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="perm-create-kb" className="text-sm">
                        创建知识库
                      </Label>
                      <Switch
                        id="perm-create-kb"
                        checked={editingRole?.permissions.canCreateKb || false}
                        onCheckedChange={(checked) =>
                          setEditingRole((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: {
                                    ...prev.permissions,
                                    canCreateKb: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="perm-edit-kb" className="text-sm">
                        编辑知识库
                      </Label>
                      <Switch
                        id="perm-edit-kb"
                        checked={editingRole?.permissions.canEditKb || false}
                        onCheckedChange={(checked) =>
                          setEditingRole((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: {
                                    ...prev.permissions,
                                    canEditKb: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="perm-delete-kb" className="text-sm">
                        删除知识库
                      </Label>
                      <Switch
                        id="perm-delete-kb"
                        checked={editingRole?.permissions.canDeleteKb || false}
                        onCheckedChange={(checked) =>
                          setEditingRole((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: {
                                    ...prev.permissions,
                                    canDeleteKb: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="perm-upload-docs" className="text-sm">
                        上传文档
                      </Label>
                      <Switch
                        id="perm-upload-docs"
                        checked={
                          editingRole?.permissions.canUploadDocs || false
                        }
                        onCheckedChange={(checked) =>
                          setEditingRole((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: {
                                    ...prev.permissions,
                                    canUploadDocs: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="perm-delete-docs" className="text-sm">
                        删除文档
                      </Label>
                      <Switch
                        id="perm-delete-docs"
                        checked={
                          editingRole?.permissions.canDeleteDocs || false
                        }
                        onCheckedChange={(checked) =>
                          setEditingRole((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: {
                                    ...prev.permissions,
                                    canDeleteDocs: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="perm-manage-users" className="text-sm">
                        管理用户
                      </Label>
                      <Switch
                        id="perm-manage-users"
                        checked={
                          editingRole?.permissions.canManageUsers || false
                        }
                        onCheckedChange={(checked) =>
                          setEditingRole((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: {
                                    ...prev.permissions,
                                    canManageUsers: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="perm-export-data" className="text-sm">
                        导出数据
                      </Label>
                      <Switch
                        id="perm-export-data"
                        checked={
                          editingRole?.permissions.canExportData || false
                        }
                        onCheckedChange={(checked) =>
                          setEditingRole((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: {
                                    ...prev.permissions,
                                    canExportData: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingRole(false);
                    setEditingRole(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  onClick={() => {
                    if (isAddingRole && editingRole) {
                      handleAddRole(editingRole);
                    } else if (editingRole) {
                      handleUpdateRole(editingRole);
                    }
                  }}
                  disabled={!editingRole?.name}
                >
                  {isAddingRole ? "添加" : "保存"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
