import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/users' }];

type user = { 
    id: number; 
    name: string; 
    email: string; 
    roles: string[] 
};

interface usersPageProps { 
    users: user[]; 
    all_roles: string[] 
};

export default function Index({ users, all_roles }: usersPageProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
    const [isDeleteRoleOpen, setIsDeleteRoleOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<user | null>(null);
    const [selectedRole, setSelectedRole] = useState<{ userId: number; role: string } | null>(null);
    const [isAddingRoleToId, setIsAddingRoleToId] = useState<number | null>(null);

    const addForm = useForm({ 
        name: '', 
        email: '', 
        password: '', 
        password_confirmation: '', 
        role: '' 
    });
    const editForm = useForm({ 
        id: 0, 
        name: '', 
        email: '' 
    });

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(
            route('users.store'), {
                onSuccess: () => { 
                    setIsAddDialogOpen(false); 
                    addForm.reset(); 
                }
            }
        );
    };

    const handleEditClick = (user: user) => {
        editForm.setData({ 
            id: user.id, 
            name: user.name, 
            email: user.email 
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(
            route('users.update', { 
                user: editForm.data.id 
            }), {
                onSuccess: () => setIsEditDialogOpen(false)
            }
        );
    };

    const confirmDeleteUser = () => {
        if (selectedUser) {
            router.delete(
                route('users.destroy', { 
                    user: selectedUser.id 
                }), {
                    onSuccess: () => setIsDeleteUserOpen(false)
                }
            );
        }
    };

    const handleAddRole = (userId: number, roleName: string) => {
        router.post(
            route('users.roles.store', { 
                user: userId 
            }), { 
                role: roleName 
            }, {
                onSuccess: () => setIsAddingRoleToId(null)
            }
        );
    };

    const confirmDeleteRole = () => {
        if (selectedRole) {
            router.delete(
                route('users.roles.remove', { 
                    user: selectedRole.userId, 
                    role: selectedRole.role 
                }), {
                    onSuccess: () => setIsDeleteRoleOpen(false)
                }
            );
        }
    };

    const columns: ColumnDef<user>[] = [
        { accessorKey: 'id', header: 'ID' },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ getValue }) => <span className="font-medium capitalize">{getValue<string>()}</span>,
        },
        { accessorKey: 'email', header: 'Email' },
        {
            accessorKey: 'roles',
            header: 'Roles',
            cell: ({ row, getValue }) => {
                const roles = getValue<string[]>();
                const userId = row.original.id;
                const availableRoles = all_roles.filter(r => !roles.includes(r));
                return (
                    <div className="flex flex-wrap items-center gap-1">
                        {roles?.map((role, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs capitalize">
                                {role}
                                <button 
                                    onClick={() => { 
                                        setSelectedRole({ userId, role }); 
                                        setIsDeleteRoleOpen(true); 
                                    }} 
                                    className="hover:text-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        {availableRoles.length > 0 && (
                            isAddingRoleToId === userId ? (
                                <Select onValueChange={(val) => handleAddRole(userId, val)}>
                                    <SelectTrigger className="h-7 w-[130px] text-xs">
                                        <SelectValue placeholder="Add..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles.map(r => 
                                            <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-full border-dashed" 
                                    onClick={() => setIsAddingRoleToId(userId)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            )
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
                        variant="ghost" 
                        size="icon" 
                        className="text-blue-600" 
                        onClick={() => handleEditClick(row.original)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600" 
                        onClick={() => { 
                            setSelectedUser(row.original); 
                            setIsDeleteUserOpen(true); 
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: users,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Input 
                        placeholder="Search..." 
                        value={globalFilter ?? ""} 
                        onChange={(e) => setGlobalFilter(e.target.value)} 
                        className="max-w-sm" 
                    />
                    <Button 
                        onClick={() => setIsAddDialogOpen(true)} 
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={header.column.getCanSort() ? 'flex items-center cursor-pointer select-none' : ''}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    
                                                    {header.column.getCanSort() && (
                                                        <span className="ml-2">
                                                            {{
                                                                asc: <ArrowUp className="h-4 w-4" />,
                                                                desc: <ArrowDown className="h-4 w-4" />,
                                                            }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="h-4 w-4 opacity-50" />}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell 
                                                key={cell.id}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell 
                                        colSpan={columns.length} 
                                        className="h-24 text-center"
                                    >
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* MODAL: ADD USER */}
                <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Add New User</AlertDialogTitle>
                        </AlertDialogHeader>

                        <form id="add-form" onSubmit={handleAddUser} className="space-y-4 py-2">
                            <div>
                                <Label className="mb-2">Name</Label>
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
                            <div>
                                <Label className="mb-2">Email</Label>
                                <Input 
                                    type="email" 
                                    value={addForm.data.email} 
                                    onChange={e => addForm.setData('email', e.target.value)} 
                                />
                                {addForm.errors.email && 
                                    <p className="text-xs text-red-500 mt-1">
                                        {addForm.errors.email}
                                    </p>
                                }
                            </div>

                            <div>
                                <Label className="mb-2">Password</Label>
                                <Input 
                                    type="password" 
                                    value={addForm.data.password} 
                                    onChange={e => addForm.setData('password', e.target.value)} 
                                />
                                {addForm.errors.password && 
                                    <p className="text-xs text-red-500 mt-1">
                                        {addForm.errors.password}
                                    </p>
                                }
                            </div>
                            <div>
                                <Label className="mb-2">Confirm Password</Label>
                                <Input 
                                    type="password" 
                                    value={addForm.data.password_confirmation} 
                                    onChange={e => addForm.setData('password_confirmation', e.target.value)} 
                                />
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
                                Add User
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* MODAL: EDIT USER */}
                <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Edit User Details</AlertDialogTitle>
                        </AlertDialogHeader>
                        <form id="edit-form" onSubmit={handleUpdateUser} className="space-y-4 py-2">
                            <div>
                                <Label className="mb-2">Name</Label>
                                <Input 
                                    value={editForm.data.name} 
                                    onChange={e => editForm.setData('name', e.target.value)} 
                                />
                                {editForm.errors.name && 
                                    <p className="text-xs text-red-500 mt-1">
                                        {editForm.errors.name}
                                    </p>
                                }
                            </div>
                            <div>
                                <Label className="mb-2">Email</Label>
                                <Input 
                                    type="email" 
                                    value={editForm.data.email} 
                                    onChange={e => editForm.setData('email', e.target.value)} 
                                />
                                {editForm.errors.email && 
                                    <p className="text-xs text-red-500 mt-1">
                                        {editForm.errors.email}
                                    </p>
                                }
                            </div>
                        </form>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button 
                                type="submit" 
                                form="edit-form" 
                                disabled={editForm.processing} 
                                className="bg-blue-600"
                            >
                                {editForm.processing ? "Saving..." : "Save Changes"}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* MODAL: DELETE USER */}
                <AlertDialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the user account for {selectedUser?.name}.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={confirmDeleteUser} 
                                className="bg-red-600"
                            >
                                Delete User
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* MODAL: REMOVE ROLE */}
                <AlertDialog open={isDeleteRoleOpen} onOpenChange={setIsDeleteRoleOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove Role?</AlertDialogTitle>
                            <AlertDialogDescription>Remove the "{selectedRole?.role}" role from this user?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={confirmDeleteRole} 
                                className="bg-red-600"
                            >
                                Remove
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
