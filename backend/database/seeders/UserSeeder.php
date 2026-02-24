<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@pos.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '08123456789',
            'is_active' => true,
        ]);

        // Create Kasir users
        User::create([
            'name' => 'Kasir 1',
            'email' => 'kasir1@pos.com',
            'password' => Hash::make('password'),
            'role' => 'kasir',
            'phone' => '08123456780',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Kasir 2',
            'email' => 'kasir2@pos.com',
            'password' => Hash::make('password'),
            'role' => 'kasir',
            'phone' => '08123456781',
            'is_active' => true,
        ]);

        // Create Pelayan users
        User::create([
            'name' => 'Pelayan 1',
            'email' => 'pelayan1@pos.com',
            'password' => Hash::make('password'),
            'role' => 'pelayan',
            'phone' => '08123456782',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Pelayan 2',
            'email' => 'pelayan2@pos.com',
            'password' => Hash::make('password'),
            'role' => 'pelayan',
            'phone' => '08123456783',
            'is_active' => true,
        ]);

        // Create inactive user for testing
        User::create([
            'name' => 'Inactive User',
            'email' => 'inactive@pos.com',
            'password' => Hash::make('password'),
            'role' => 'pelayan',
            'phone' => '08123456784',
            'is_active' => false,
        ]);

        $this->command->info('Users created successfully!');
        $this->command->info('Login credentials:');
        $this->command->info('Admin: admin@pos.com / password');
        $this->command->info('Kasir: kasir1@pos.com / password');
        $this->command->info('Pelayan: pelayan1@pos.com / password');
    }
}
