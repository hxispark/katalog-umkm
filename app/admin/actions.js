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

