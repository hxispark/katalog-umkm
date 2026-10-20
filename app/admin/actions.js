"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState instanceof FormData ? prevState : null;

  if (!data) {
    return { error: "Data form tidak valid." };
  }

  const email = data.get("email");
  const password = data.get("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let errorMsg = null;

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password),
    });

    if (error) {
      errorMsg =
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : (error.message || "Gagal masuk. Silakan periksa kembali data Anda.");
    }
  } catch (err) {
    errorMsg = err.message || "Terjadi kesalahan pada server saat proses masuk.";
  }

  if (errorMsg) {
    return { error: errorMsg };
  }

  redirect("/admin");
}

export async function logout() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika sudah tidak ada sesi aktif
  }

  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState instanceof FormData ? prevState : null;

  if (!data) {
    return { error: "Data form tidak valid." };
  }

  const passwordBaru = data.get("password_baru") ? String(data.get("password_baru")) : "";
  const konfirmasiPassword = data.get("konfirmasi_password") ? String(data.get("konfirmasi_password")) : "";

  if (!passwordBaru || passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  try {
    const supabase = await createSessionClient();

    // Verifikasi sesi admin login (Aturan keamanan #3)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Sesi login tidak valid atau sudah kedaluwarsa. Silakan masuk kembali." };
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return { error: error.message || "Gagal mengganti password." };
    }

    return { success: "Password berhasil diganti." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan pada server saat mengganti password." };
  }
}
