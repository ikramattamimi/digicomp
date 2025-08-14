import { supabase, supabaseAdmin } from "./SupabaseClient";

import ProfileService from "./ProfileService";
import { use } from "react";

class AuthService {
  async register({ email, password, profile }) {
    // Register user in Supabase Auth
    const { data: signUpData, error: signUpError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    console.log("User registered:", signUpData);
    if (signUpError) throw signUpError;
    const userId = signUpData.user?.id;
    if (!userId) throw new Error("User ID not found after registration");
    // Insert profile data into profiles table
    const profilePayload = {
      ...profile,
      id: userId,
      email,
      is_active: true,
      deleted_at: null,
    };
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert([profilePayload])
      .select();
    if (profileError) throw profileError;
    return { user: signUpData.user, profile: profileData[0] };
  }

  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    window.location.assign("/");
    if (error) throw error;
    return data;
  }

  async registerStaff({ email, password, profile }) {
    // Register staff user
    return await this.register({ email, password, profile });
  }

  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Error updating password:", error.message);
        return { success: false, error: error.message };
      } else {
        console.log("Password updated successfully:", data.user);
        return { success: true, user: data.user };
      }
    } catch (err) {
      console.error("An unexpected error occurred:", err.message);
      return { success: false, error: err.message };
    }
  }

  async changeUserPasswordAsAdmin(userId, newPassword) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (error) {
        console.error("Error updating user password:", error.message);
        return null;
      }

      console.log("User password updated successfully:", data);
      return data;
    } catch (err) {
      console.error("An unexpected error occurred:", err);
      return null;
    }
  }

  async checkUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      // console.error("Error getting user:", error);
      return null;
    }

    if (user) {
      const data = ProfileService.getMyAccount(user.id);
      return data;
    } else {
      console.log("User is not logged in");
      return null;
    }
  }

  async signUserOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
    } else {
      console.log("User signed out successfully");
    }

    window.location.assign("/");
  }
}

export default new AuthService();
