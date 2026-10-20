"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Nama field sama dengan kolom tabel "produk".
const aksiKosong = async (state) => state;

export default function FormProduk({ produk = {}, labelTombol, aksi }) {
  const [state, formAction, pending] = useActionState(aksi ?? aksiKosong, null);

  const nilai = (nama) => state?.values?.[nama] ?? produk[nama] ?? "";
  const galat = (nama) => state?.errors?.[nama];

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <Input
        label="Nama produk"
        name="nama"
        defaultValue={nilai("nama")}
        error={galat("nama")}
        required
      />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="1"
        step="1"
        defaultValue={nilai("harga")}
        error={galat("harga")}
        required
      />
      <Input
        label="Kategori"
        name="kategori"
        defaultValue={nilai("kategori")}
        error={galat("kategori")}
        required
      />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={nilai("foto_url")}
        error={galat("foto_url")}
      />
      <Input
        label="Deskripsi"
        name="deskripsi"
        textarea
        defaultValue={nilai("deskripsi")}
      />
      <div className="flex gap-3">
        <Tombol type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}