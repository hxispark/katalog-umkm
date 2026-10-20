"use client";

import { useActionState, useState } from "react";
import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

// US-10: konfirmasi dua langkah sebelum produk dihapus.
export default function TombolHapus({ id, nama }) {
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [state, formAction, pending] = useActionState(hapusProduk, null);

  if (!konfirmasi) {
    return (
      <Tombol type="button" varian="bahaya" onClick={() => setKonfirmasi(true)}>
        Hapus
      </Tombol>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <div className="flex items-center gap-2">
        <span className="text-xs text-teks-lembut">Hapus &quot;{nama}&quot;?</span>
        <Tombol type="submit" varian="bahaya" disabled={pending}>
          {pending ? "Menghapus..." : "Ya, hapus"}
        </Tombol>
        <Tombol
          type="button"
          varian="garis"
          disabled={pending}
          onClick={() => setKonfirmasi(false)}
        >
          Batal
        </Tombol>
      </div>
      {state?.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}