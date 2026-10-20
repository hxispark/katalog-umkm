import { createClient } from "@supabase/supabase-js";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";

const UKURAN_HALAMAN = 10;

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const halamanDiminta = Math.max(1, parseInt(params?.halaman, 10) || 1);

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } }
  );

  // US-07: hitung total dulu supaya nomor halaman selalu valid
  const { count, error: errorHitung } = await supabase
    .from("produk")
    .select("*", { count: "exact", head: true });

  const total = count ?? 0;
  const totalHalaman = Math.max(1, Math.ceil(total / UKURAN_HALAMAN));
  const halaman = Math.min(halamanDiminta, totalHalaman);
  const dari = (halaman - 1) * UKURAN_HALAMAN;

  let daftarProduk = [];
  let pesanError = errorHitung?.message ?? null;

  if (!pesanError) {
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, kategori, foto_url")
      .order("created_at", { ascending: false })
      .range(dari, dari + UKURAN_HALAMAN - 1);

    if (error) pesanError = error.message;
    else daftarProduk = data ?? [];
  }

  const gayaMati =
    "rounded-xl border border-garis px-4 py-2 text-sm text-teks-lembut opacity-50";

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Produk</h1>
          {!pesanError && (
            <p className="text-sm text-teks-lembut">{total} produk</p>
          )}
        </div>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {pesanError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal memuat produk: {pesanError}
        </p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}

      {!pesanError && total > 0 && (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label="Paginasi"
        >
          {halaman > 1 ? (
            <Tombol href={`?halaman=${halaman - 1}`} varian="garis">
              Sebelumnya
            </Tombol>
          ) : (
            <span className={gayaMati}>Sebelumnya</span>
          )}

          <span className="text-sm text-teks-lembut">
            Halaman {halaman} dari {totalHalaman}
          </span>

          {halaman < totalHalaman ? (
            <Tombol href={`?halaman=${halaman + 1}`} varian="garis">
              Berikutnya
            </Tombol>
          ) : (
            <span className={gayaMati}>Berikutnya</span>
          )}
        </nav>
      )}
    </div>
  );
}