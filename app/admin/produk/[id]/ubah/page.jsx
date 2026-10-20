import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ubah produk | Admin" };

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } }
  );

  const { data: produk, error } = await supabase
    .from("produk")
    .select("id, nama, harga, kategori, foto_url, deskripsi")
    .eq("id", Number(id))
    .maybeSingle();

  if (error) {
    return (
      <div className="flex flex-col gap-6 py-8">
        <NavAdmin />
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal memuat produk: {error.message}
        </p>
      </div>
    );
  }

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Ubah produk</h1>
        <p className="text-sm text-teks-lembut">{produk.nama}</p>
      </div>
      <FormProduk
        produk={produk}
        labelTombol="Simpan perubahan"
        aksi={ubahProduk.bind(null, produk.id)}
      />
    </div>
  );
}