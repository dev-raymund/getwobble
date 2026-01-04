import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { usePage } from '@inertiajs/react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
    dashboard, 
    users, 
    partners, 
    bookings, 
    products, 
    orders, 
    reports, 
    withdraw, 
    announcement, 
    roles_permissions, 
    chat 
} from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    Archive, 
    Bell, 
    BookOpen, 
    Calendar, 
    ChartLine, 
    Folder, 
    Handshake, 
    LayoutGrid, 
    MessageCircle, 
    ShoppingCart, 
    Unlock, 
    Upload, 
    Users 
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Bookings',
        href: bookings(),
        icon: Calendar,
    },
    {
        title: 'Products',
        href: products(),
        icon: Archive,
    },
    {
        title: 'Orders',
        href: orders(),
        icon: ShoppingCart,
    },
    {
        title: 'Reports',
        href: reports(),
        icon: ChartLine,
    },
    {
        title: 'Withdraw',
        href: withdraw(),
        icon: Upload,
    },
    {
        title: 'Announcement',
        href: announcement(),
        icon: Bell,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Partners',
        href: partners(),
        icon: Handshake,
    },
    {
        title: 'Users',
        href: users(),
        icon: Users,
        permission: [
            'view users', 
            'create users', 
            'edit users', 
            'delete users'
        ], 
    },
    {
        title: 'Roles - Permissions',
        href: roles_permissions(),
        icon: Unlock,
        permission: [
            'view role/permissions', 
            'create role/permissions', 
            'edit role/permissions', 
            'delete role/permissions'
        ], 
    },
    {
        title: 'Live Chat',
        href: chat(),
        icon: MessageCircle,
    },
];

export function AppSidebar() {

    const { auth } = usePage().props as any;
    const userPermissions = auth.user.permissions || [];

    const filterNavItems = (items: NavItem[]) => {
        return items.filter((item) => {
            if (!item.permission) return true;

            // If it's an array, check if user has ANY of them (OR logic)
            if (Array.isArray(item.permission)) {
                return item.permission.some(p => userPermissions.includes(p));
            }

            // If it's a single string, check normally
            return userPermissions.includes(item.permission);
        });
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filterNavItems(mainNavItems)} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={filterNavItems(footerNavItems)} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
