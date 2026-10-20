export default function Input({ label, name, type = "text", textarea = false, error, ...props }) {
  const kelas = `w-full rounded-lg border ${
    error ? "border-red-500" : "border-garis"
  } bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none`;

  const idGalat = error ? `${name}-galat` : undefined;

  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      {label}
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          className={kelas}
          aria-invalid={error ? true : undefined}
          aria-describedby={idGalat}
          {...props}
        />
      ) : (
        <input
          name={name}
          type={type}
          className={kelas}
          aria-invalid={error ? true : undefined}
          aria-describedby={idGalat}
          {...props}
        />
      )}
      {error && (
        <span id={idGalat} className="text-sm font-normal text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}