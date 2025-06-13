<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
<<<<<<< HEAD
            //
=======
            if (!Schema::hasColumn('users', 'google_id')) {
                $table->string('google_id')->nullable()->unique()->after('email');
            }
>>>>>>> 7d292ad
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
<<<<<<< HEAD
            //
=======
            if (Schema::hasColumn('users', 'google_id')) {
                $table->dropColumn('google_id');
            }
>>>>>>> 7d292ad
        });
    }
};
