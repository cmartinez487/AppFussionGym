const styles: Record<string, string> = {
  Activo: 'bg-green-500/15 text-green-400 border-green-500/30',
  EnMora: 'bg-red-500/15 text-red-400 border-red-500/30',
  Inactivo: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

export default function EstadoBadge({ estado }: { estado: string }) {
  const style = styles[estado] ?? styles.Inactivo;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {estado}
    </span>
  );
}
