<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

use Illuminate\Validation\Rule;

class RolesPermissionsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $data = Role::with('permissions')
            ->get()
            ->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ]);

        return Inertia::render('rolePermissions/index', [
            'roles_permissions' => $data,
            'all_permissions' => Permission::pluck('name'), 
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web'
        ]);

        return back()->with('success', 'Role created successfully.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Role $role)
    {
        //
    }

    /**
     * Store a newly added permission of a role.
     */
    public function assignPermissions(Request $request, Role $role)
    {
        $request->validate([
            'permission' => 'required|string|exists:permissions,name',
        ]);

        $role->givePermissionTo($request->permission);

        return back()->with('success', 'Permission assigned successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(RolePermissions $rolePermissions)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RolePermissions $rolePermissions)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RolePermissions $rolePermissions)
    {
        //
    }

    /**
     * Update the Role Name.
     */
    public function updateRoleName(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($role->id),
            ],
        ]);

        $role->update([
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Role name updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */

    public function destroy(Role $role)
    {
        $role->delete();

        // Clear the Spatie cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with('success', 'Role deleted successfully');
    }

    public function revokePermissions(Role $role, string $permission)
    {
        $role->revokePermissionTo($permission);
        return back()->with('success', 'Permission removed successfully');
    }

}
