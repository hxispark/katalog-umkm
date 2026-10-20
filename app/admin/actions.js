"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
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

// US-08: tambah produk
function bacaTeks(data, nama) {
  const nilai = data.get(nama);
  return nilai ? String(nilai).trim() : "";
}

export async function tambahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState instanceof FormData ? prevState : null;

  if (!data) {
    return { error: "Data form tidak valid." };
  }

  const values = {
    nama: bacaTeks(data, "nama"),
    harga: bacaTeks(data, "harga"),
    kategori: bacaTeks(data, "kategori"),
    foto_url: bacaTeks(data, "foto_url"),
    deskripsi: bacaTeks(data, "deskripsi"),
  };

  const errors = {};

  if (!values.nama) {
    errors.nama = "Nama produk wajib diisi.";
  } else if (values.nama.length > 120) {
    errors.nama = "Nama produk maksimal 120 karakter.";
  }

  const harga = Number(values.harga);
  if (!values.harga) {
    errors.harga = "Harga wajib diisi.";
  } else if (!/^\d+$/.test(values.harga) || harga <= 0) {
    errors.harga = "Harga harus berupa angka bulat lebih dari 0.";
  } else if (harga > 2147483647) {
    errors.harga = "Harga terlalu besar.";
  }

  if (!values.kategori) {
    errors.kategori = "Kategori wajib diisi.";
  }

  if (values.foto_url && !/^(\/|https?:\/\/)/i.test(values.foto_url)) {
    errors.foto_url = "Link foto harus diawali / atau https://";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  let pesanError = null;

  try {
    // Pastikan yang menambah produk adalah admin yang sedang login
    const sesi = await createSessionClient();
    const {
      data: { user },
      error: userError,
    } = await sesi.auth.getUser();

    if (userError || !user) {
      pesanError = "Sesi login tidak valid atau sudah kedaluwarsa. Silakan masuk kembali.";
    } else {
      const admin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY,
        { auth: { persistSession: false } }
      );

      const { error } = await admin.from("produk").insert({
        nama: values.nama,
        harga,
        kategori: values.kategori,
        foto_url: values.foto_url || null,
        deskripsi: values.deskripsi || null,
      });

      if (error) {
        pesanError = `Gagal menyimpan produk: ${error.message}`;
      }
    }
  } catch (err) {
    pesanError = err.message || "Terjadi kesalahan pada server saat menyimpan produk.";
  }

  if (pesanError) {
    return { error: pesanError, values };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}