export default function Checkbox({ label, ...props }) {
  return (
    <label className="check">
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
