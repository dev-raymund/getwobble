import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowUpDown, Edit, Loader2, Plus, Trash2, X } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Roles - Permissions', href: '/roles-permissions' }];

type rolePermission = {
    id: number;
    name: string;
    permissions: string[];
};

interface rolesPermissionsPageProps {
    roles_permissions: rolePermission[];
    all_permissions: string[];
};

export default function Index({ roles_permissions, all_permissions }: rolesPermissionsPageProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const addForm = useForm({ 
        name: '', 
    });

    const handleAddRole = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(
            route('roles.store'), {
                onSuccess: () => { 
                    setIsAddDialogOpen(false); 
                    addForm.reset(); 
                }
            }
        );
    };

    const [isAddingPermission, setIsAddingPermission] = useState<number | null>(null);
    const [newPermission, setNewPermission] = useState("");

    const handleAddPermission = (roleId: number) => {
        router.post(route('roles.permissions.assign', { role: roleId }), {
            permission: newPermission
        }, {
            onSuccess: () => {
                setIsAddingPermission(null);
                setNewPermission("");
            }
        });
    }

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<{roleId: number, perm: string} | null>(null);
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

    const handleDeleteClick = (roleId: number, permission: string) => {
        setSelectedData({ roleId, perm: permission })
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (selectedData) {
            router.delete(route('roles.permissions.revoke', { 
                role: selectedData.roleId, 
                permission: selectedData.perm 
            }), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false)
                    setSelectedData(null)
                }
            })
        }
    }

    const [editingName, setEditingName] = useState("");
    
    const handleEditToggle = (rolePermission: rolePermission) => {
        if (editingRoleId === rolePermission.id) {
            setEditingRoleId(null);
            setEditingName("");
        } else {
            setEditingRoleId(rolePermission.id);
            setEditingName(rolePermission.name);
        }
    };

    const handleUpdateName = (roleId: number) => {
        router.put(route('roles.update', { role: roleId }), {
            name: editingName
        }, {
            onSuccess: () => setEditingRoleId(null)
        });
    };

    const [isDeleteRoleOpen, setIsDeleteRoleOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<rolePermission | null>(null);

    const confirmDeleteRole = () => {
        if (selectedRole) {
            router.delete(
                route('roles.destroy', { 
                    role: selectedRole.id 
                }), {
                    onSuccess: () => setIsDeleteRoleOpen(false)
                }
            );
        }
    };

    const columns: ColumnDef<rolePermission>[] = [
        { accessorKey: 'id', header: 'ID' },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button variant="ghost" className="-ml-4" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Role <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row, getValue }) => {
                const roleId = row.original.id;
                const isEditing = editingRoleId === roleId;

                if (isEditing) {
                    return (
                        <div className="flex items-center gap-2">
                            <Input 
                                value={editingName} 
                                onChange={(e) => setEditingName(e.target.value)}
                                className="h-8 w-[200px]"
                                autoFocus
                            />
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 px-2 text-green-600 hover:text-green-700"
                                onClick={() => handleUpdateName(roleId)}
                            >
                                Save
                            </Button>
                        </div>
                    );
                }

                return <span className="font-medium capitalize">{getValue<string>()}</span>;
            },
        },
        {
            accessorKey: 'permissions',
            header: 'Permissions',
            cell: ({ row, getValue }) => {

                const permissions = getValue<string[]>();
                const roleId = row.original.id;
                const isAdding = isAddingPermission === roleId;

                return (
                    <div className="flex flex-wrap items-center gap-1">
                        {permissions?.map((permission, index) => (
                            <span key={index} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5 text-xs capitalize">
                                {permission}
                                {editingRoleId === roleId && (
                                    <button onClick={() => handleDeleteClick(roleId, permission)} className="ml-1 hover:text-red-600">
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </span>
                        ))}
                        
                        {/* THE ADD BUTTON / SELECTOR */}
                        {isAdding ? (
                            <div className="flex items-center gap-2">
                                <Select onValueChange={setNewPermission}>
                                    <SelectTrigger className="h-7 w-[150px] text-xs">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {all_permissions
                                            .filter(p => !permissions.includes(p)) // Don't show already owned perms
                                            .map(p => (
                                                <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                                <Button size="sm" className="h-7 px-2" onClick={() => handleAddPermission(roleId)}>Add</Button>
                                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setIsAddingPermission(null)}>Cancel</Button>
                            </div>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6 rounded-full border-dashed"
                                onClick={() => setIsAddingPermission(roleId)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button 
                        variant={editingRoleId === row.original.id ? "default" : "ghost"} 
                        size="icon" 
                        className={editingRoleId === row.original.id ? "" : "text-blue-600"}
                        onClick={() => handleEditToggle(row.original)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600" 
                        onClick={() => { 
                            setSelectedRole(row.original); 
                            setIsDeleteRoleOpen(true); 
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data: roles_permissions,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles - Permissions" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Input
                        placeholder="Search roles..."
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="max-w-sm"
                    />

                     <Button 
                        onClick={() => setIsAddDialogOpen(true)} 
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" /> Add Role
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* MODAL: ADD ROLE */}
                <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Add New Role</AlertDialogTitle>
                        </AlertDialogHeader>

                        <form id="add-form" onSubmit={handleAddRole} className="space-y-4 py-2">
                            <div>
                                <Label className="mb-2">Role Name</Label>
                                <Input 
                                    value={addForm.data.name} 
                                    onChange={e => addForm.setData('name', e.target.value)} 
                                />
                                {addForm.errors.name && 
                                    <p className="text-xs text-red-500 mt-1">
                                        {addForm.errors.name}
                                    </p>
                                }
                            </div>
                        </form>

                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button 
                                type="submit" 
                                form="add-form" 
                                disabled={addForm.processing} 
                                className="bg-blue-600"
                            >
                                {addForm.processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Add Role
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* MODAL: DELETE ROLE */}
                <AlertDialog open={isDeleteRoleOpen} onOpenChange={setIsDeleteRoleOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the role for {selectedRole?.name}.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={confirmDeleteRole} 
                                className="bg-red-600"
                            >
                                Delete Role
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* MODAL: REMOVE PERMISSION */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will remove the <span className="font-bold text-foreground">"{selectedData?.perm}"</span> permission from this role.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setSelectedData(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                                Remove Permission
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                
            </div>
        </AppLayout>
    )
}
