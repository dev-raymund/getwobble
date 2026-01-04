<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions
        $permissions = [
            'view users',
            'create users',
            'edit users',
            'delete users',

            'view role/permissions',
            'create role/permissions',
            'edit role/permissions',
            'delete role/permissions',

            'view partners',
            'create partners',
            'edit partners',
            'delete partners',

            'view bookings',
            'create bookings',
            'edit bookings',
            'delete bookings',

            'view products',
            'create products',
            'edit products',
            'delete products',
            
            'view orders',
            'create orders',
            'edit orders',
            'delete orders',
            
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Roles
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $therapist = Role::firstOrCreate(['name' => 'therapist']);
        $customer = Role::firstOrCreate(['name' => 'customer']);

        // Assign permissions
        $admin->givePermissionTo(Permission::all());

        // $therapist->givePermissionTo([
        //     'view bookings',
        //     'create bookings',
        //     'edit bookings',
        //     'delete bookings',

        //     'view products',
        //     'create products',
        //     'edit products',
        //     'delete products',
            
        //     'view orders',
        //     'create orders',
        //     'edit orders',
        //     'delete orders',
        // ]);

        // $customer->givePermissionTo([
        //     'view bookings',
        //     'create bookings',
        //     'edit bookings',
        //     'delete bookings',

        //     'view products',
        //     'create products',
        //     'edit products',
        //     'delete products',
            
        //     'view orders',
        //     'create orders',
        //     'edit orders',
        //     'delete orders',
        // ]);
    }
}
